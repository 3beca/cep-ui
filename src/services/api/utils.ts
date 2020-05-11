import {
    RuleFilter,
    RuleFilterComparator,
    RuleFilterField,
    RuleFilterFieldValue,
    Geometry,
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
export type CONTAINER = {
    model: 'CONTAINER',
    type: 'OR'|'AND'|'DEFAULT';
    field: string;
    values: (EXPRESSION|CONTAINER)[]
};
export type RULEFILTERCONTAINER = (EXPRESSION|CONTAINER)[];
export const isContainer = (value: EXPRESSION|CONTAINER): value is CONTAINER => {
    return value.model === MODELS.CONTAINER;
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