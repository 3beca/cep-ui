import {
    RuleFilter,
    RuleFilterComparator,
    RuleFilterField,
    RuleFilterFieldValue,
    Geometry,
    RuleFilterValue,
    getRuleFilters,
    isRuleFilter,
    isRuleFilterArray,
    isRuleFilterOR,
    isRuleFilterAND,
    isRuleFilterFieldValue,
    isRuleFilterComparator,
    isRuleFilterComparatorGT,
    isRuleFilterComparatorGTE,
    isRuleFilterComparatorLT,
    isRuleFilterComparatorLTE,
    isRuleFilterComparatorLocation,
} from './models';

export type EXPRESSIONBASE = {
    model: 'EXPRESSION';
    field: string;
};
export type EPASSTHROW = {
    type: 'PASSTHROW'
} & EXPRESSIONBASE;
export type EDEFAULT = {
    type: 'DEFAULT';
    value: string|number;
} & EXPRESSIONBASE;
export type ECOMPARATOR = {
    type: 'COMPARATOR';
    operator: 'EQ'|'GT'|'GTE'|'LT'|'LTE';
    value: string|number;
} & EXPRESSIONBASE;
export type ECOMPARATORLOCATION = {
    type: 'GEO';
    operator: 'NEAR';
    value: Geometry;
} & EXPRESSIONBASE;

type ComparatorValue = {
    name: 'EQ'|'GT'|'GTE'|'LT'|'LTE';
    value: number|string;
};
type ComparatorLocation = {
    name: 'NEAR';
    value: Geometry;
};
export const getComparatorValue = (comparator: RuleFilterComparator): ComparatorValue|ComparatorLocation => {
    if (isRuleFilterComparatorGT(comparator)) return {name: 'GT', value: comparator._gt};
    if (isRuleFilterComparatorGTE(comparator)) return {name: 'GTE', value: comparator._gte};
    if (isRuleFilterComparatorLT(comparator)) return {name: 'LT', value: comparator._lt};
    if (isRuleFilterComparatorLTE(comparator)) return {name: 'LTE', value: comparator._lte};
    if (isRuleFilterComparatorLocation(comparator)) return {name: 'NEAR', value: comparator._near};
    return {name: 'EQ', value: comparator._eq || ''}
};
export const processValues = (field: RuleFilterField, value: RuleFilterFieldValue): ECOMPARATOR|EDEFAULT|ECOMPARATORLOCATION => {
    if (isRuleFilterComparator(value)){
        const comparator = value;
        const operator = getComparatorValue(comparator);
        if(operator.name === 'NEAR') {
            return ({
                model: 'EXPRESSION',
                type: 'GEO',
                operator: 'NEAR',
                field: field.field,
                value: operator.value
            });
        }
        return ({
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: operator.name,
            field: field.field,
            value: operator.value
        });
    }
    else {
        return ({
            model: 'EXPRESSION',
            type: 'DEFAULT',
            field: field.field,
            value: value
        });
    }
};
export type EXPRESSION = EPASSTHROW|EDEFAULT|ECOMPARATOR|ECOMPARATORLOCATION;
export type CONTAINERTYPE = 'OR'|'AND'|'DEFAULT';
export type CONTAINERBASE = {
    model: 'CONTAINER';
    field: string;
    values: (EXPRESSION|CONTAINER)[];
};
export type CONTAINERAND = {
    type: 'AND';
} & CONTAINERBASE;
export type CONTAINEROR = {
    type: 'OR';
} & CONTAINERBASE;
export type CONTAINERDEFAULT = {
    type: 'DEFAULT';
} & CONTAINERBASE;
export type CONTAINER = CONTAINERAND|CONTAINEROR|CONTAINERDEFAULT;
export type RULEFILTERCONTAINER = (EXPRESSION|CONTAINER)[];

export const isContainer = (value: EXPRESSION|CONTAINER): value is CONTAINER => {
    return value.model === MODELS.CONTAINER;
}
export const isContainerAND = (value: EXPRESSION|CONTAINER): value is CONTAINERAND => {
    return isContainer(value) && value.type === 'AND';
}
export const isContainerOR = (value: EXPRESSION|CONTAINER): value is CONTAINEROR => {
    return isContainer(value) && value.type === 'OR';
}
export const isContainerDefault = (value: EXPRESSION|CONTAINER): value is CONTAINERDEFAULT => {
    return isContainer(value) && value.type === 'DEFAULT';
}
export const isExpressionPassthrow = (value: EXPRESSION): value is EPASSTHROW => {
    return value.type === EXPRESSION_TYPES.PASSTHROW;
};
export const isExpressionDefault = (value: EXPRESSION): value is EDEFAULT => {
    return value.type === EXPRESSION_TYPES.DEFAULT;
};
export const isExpressionComparator = (value: EXPRESSION): value is ECOMPARATOR => {
    return value.type === EXPRESSION_TYPES.COMPARATOR;
};
export const isExpressionLocation = (value: EXPRESSION): value is ECOMPARATORLOCATION => {
    return value.type === EXPRESSION_TYPES.GEO;
};
export const MODELS = {
    CONTAINER: 'CONTAINER',
    EXPRESSION: 'EXPRESSION'
};
export const CONTAINER_TYPES = {
    OR: 'OR',
    AND: 'AND',
    DEFAULT: 'DEFAULT'
};
export const EXPRESSION_TYPES = {
    DEFAULT: 'DEFAULT',
    PASSTHROW: 'PASSTHROW',
    COMPARATOR: 'COMPARATOR',
    GEO: 'GEO'
};
export const EXPRESSION_OPERATORS = {
    EQ: 'EQ',
    GT: 'GT',
    GTE: 'GTE',
    LT: 'LT',
    LTE: 'LTE',
    NEAR: 'NEAR'
};
export const parseRuleFilter = (filter: RuleFilter): RULEFILTERCONTAINER => {
    const fields = getRuleFilters(filter);
    if (fields) {
        return fields.map(
            (field) => {
                if (isRuleFilter(field.value)) {
                    return {
                        model: 'CONTAINER',
                        type: 'DEFAULT',
                        field: field.field,
                        values: parseRuleFilter(field.value)
                    };
                }
                else if (isRuleFilterArray(field.value)) {
                    const results: RULEFILTERCONTAINER = [];
                    field.value.forEach(
                        (rulefilter) => results.push(...parseRuleFilter(rulefilter))
                    );
                    return {
                        model: 'CONTAINER',
                        type: isRuleFilterOR(field) ? 'OR' : isRuleFilterAND(field) ? 'AND' : 'DEFAULT',
                        field: field.field,
                        values: results
                    };;
                }
                else if (isRuleFilterFieldValue(field.value)) {
                    return processValues(field, field.value);
                }
                else {
                    return ({
                        model: 'EXPRESSION',
                        type: 'PASSTHROW',
                        field: field.field
                    });
                }
            }
        );
    }
    return [{
        model: 'EXPRESSION',
        type: 'PASSTHROW',
        field: 'root'
    }];
};

export type PayloadTypes = 'number'|'string'|'location';
export type PayloadField = {type: PayloadTypes, name: string};
export type Payload = PayloadField[];

const isValidPayloadField = (field: any): PayloadTypes|null => {
    if (typeof field === 'number') return 'number';
    if (typeof field === 'string') return 'string';
    if (Array.isArray(field) && field.length === 2 && typeof field[0] === 'number' && typeof field[1] === 'number') return 'location';
    return null;
};
const filterEmptyPayloads = (payload: PayloadField|null): payload is PayloadField => !!payload;
export const buildPayloadFromEventLogPayload = (eventLogPayload: any): Payload|null => {
    if (!eventLogPayload) return null;
    if (typeof eventLogPayload !== 'object') return null;
    if (Array.isArray(eventLogPayload)) return null;

    const keys = Object.keys(eventLogPayload);
    if (keys.length === 0) return null;
    const validPayload: Payload = keys.map((key) => {
        const value = eventLogPayload[key];
        const type = isValidPayloadField(value);
        if (type) return {name: key, type};
        return null;
    }).filter(filterEmptyPayloads);
    return validPayload.length > 0 ? validPayload : null;
};

export const createANDContainer = (): CONTAINER => {
    return {
        type: 'AND',
        model: 'CONTAINER',
        field: '_and',
        values: []
    };
};
export const createORContainer = (): CONTAINER => {
    return {
        type: 'OR',
        model: 'CONTAINER',
        field: '_or',
        values: []
    };
};
export const createExpresion = (fieldName = 'root', value?: RuleFilterValue): EXPRESSION => {
    if (value === undefined) {
        return {
            model: 'EXPRESSION',
            type: 'PASSTHROW',
            field: fieldName
        };
    }
    return {
        type: 'DEFAULT',
        model: 'EXPRESSION',
        field: fieldName,
        value
    };
};