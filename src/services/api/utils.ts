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
    isRuleFilterComparatorLocation
} from './models';

export type ExpressionBase = {
    model: 'EXPRESSION';
    field: string;
};
export type EPassthrow = {
    type: 'PASSTHROW'
} & ExpressionBase;
export type EDefault = {
    type: 'DEFAULT';
    value: string|number;
} & ExpressionBase;
export type EComparator = {
    type: 'COMPARATOR';
    operator: 'EQ'|'GT'|'GTE'|'LT'|'LTE';
    value: string|number;
} & ExpressionBase;
export type EComparatorLocation = {
    type: 'GEO';
    operator: 'NEAR';
    value: Geometry;
} & ExpressionBase;

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
export const processValues = (field: RuleFilterField, value: RuleFilterFieldValue): EComparator|EDefault|EComparatorLocation => {
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
export type Expression = EPassthrow|EDefault|EComparator|EComparatorLocation;
export type ContainerType = 'OR'|'AND'|'DEFAULT';
export type ContainerBase = {
    model: 'CONTAINER';
    field: string;
    values: (Expression|Container)[];
};
export type ContainerAND = {
    type: 'AND';
} & ContainerBase;
export type ContainerOR = {
    type: 'OR';
} & ContainerBase;
export type ContainerDefault = {
    type: 'DEFAULT';
} & ContainerBase;
export type Container = ContainerAND|ContainerOR|ContainerDefault;
export type RuleFilterContainer = (Expression|Container)[];

export const isContainer = (value: Expression|Container): value is Container => {
    return value.model === MODELS.CONTAINER;
}
export const isContainerAND = (value: Expression|Container): value is ContainerAND => {
    return isContainer(value) && value.type === 'AND';
}
export const isContainerOR = (value: Expression|Container): value is ContainerOR => {
    return isContainer(value) && value.type === 'OR';
}
export const isContainerDefault = (value: Expression|Container): value is ContainerDefault => {
    return isContainer(value) && value.type === 'DEFAULT';
}
export const isExpressionPassthrow = (value: Expression): value is EPassthrow => {
    return value.type === EXPRESSION_TYPES.PASSTHROW;
};
export const isExpressionDefault = (value: Expression): value is EDefault => {
    return value.type === EXPRESSION_TYPES.DEFAULT;
};
export const isExpressionComparator = (value: Expression): value is EComparator => {
    return value.type === EXPRESSION_TYPES.COMPARATOR;
};
export const isExpressionLocation = (value: Expression): value is EComparatorLocation => {
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
export const RULE_OPERATORS = {
    'EQ': '_eq', 'GT': '_gt', 'GTE': '_gte', 'LT': '_lt', 'LTE': '_lte', 'NEAR': '_near'
};
export const parseRuleFilter = (filter: RuleFilter): RuleFilterContainer => {
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
                    const results: RuleFilterContainer = [];
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

export const createANDContainer = (): Container => {
    return {
        type: 'AND',
        model: 'CONTAINER',
        field: '_and',
        values: []
    };
};
export const createORContainer = (): Container => {
    return {
        type: 'OR',
        model: 'CONTAINER',
        field: '_or',
        values: []
    };
};
export const createExpresion = (fieldName = 'root', value?: RuleFilterValue): Expression => {
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

export const parseContainerValue = (value: Expression|Container) : RuleFilter => {
    if (value.model === 'EXPRESSION') {
        if (isExpressionDefault(value)) {
            return {[value.field]: value.value};
        }
        if (isExpressionComparator(value)) {
            return {[value.field]: {[RULE_OPERATORS[value.operator]]: value.value}};
        }
        if (isExpressionLocation(value)) {
            return {[value.field]: { _near: value.value }};
        }
        return {};
    }
    return {[value.field]: value.values.map(parseContainerValue)};
};
const emptyFilter: RuleFilter = {};
export const parseFilterContainer = (container: RuleFilterContainer) : RuleFilter => {
    if (!Array.isArray(container)) return {};
    return container.reduce<RuleFilter>((filter, container) => {
        return {...filter, ...parseContainerValue(container)};
    }, emptyFilter);
};