import {
    RuleFilter,
    RuleFilterComparator,
    RuleFilterField,
    RuleFilterFieldValue,
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
} from '../../services/api/models';
import { EventPayload } from '../event-payload-creator/models';
import {
    ComparatorLocation,
    ComparatorValue,
    Container,
    isContainer,
    EComparator,
    EComparatorLocation,
    EDefault,
    Expression,
    isExpressionComparator,
    RuleFilterContainer,
    RULE_OPERATORS,
    isExpressionDefault,
    isExpressionLocation,
    DEFAULT_RULEFILTERCONTAINER
} from './models';

export const getComparatorValue = (comparator: RuleFilterComparator): ComparatorValue | ComparatorLocation => {
    if (isRuleFilterComparatorGT(comparator)) return { name: 'GT', value: comparator._gt };
    if (isRuleFilterComparatorGTE(comparator)) return { name: 'GTE', value: comparator._gte };
    if (isRuleFilterComparatorLT(comparator)) return { name: 'LT', value: comparator._lt };
    if (isRuleFilterComparatorLTE(comparator)) return { name: 'LTE', value: comparator._lte };
    if (isRuleFilterComparatorLocation(comparator)) return { name: 'NEAR', value: comparator._near };
    return { name: 'EQ', value: comparator._eq || '' };
};
export const processValues = (field: RuleFilterField, value: RuleFilterFieldValue): EComparator | EDefault | EComparatorLocation => {
    if (isRuleFilterComparator(value)) {
        const comparator = value;
        const operator = getComparatorValue(comparator);
        if (operator.name === 'NEAR') {
            return {
                model: 'EXPRESSION',
                type: 'GEO',
                operator: 'NEAR',
                field: field.field,
                value: operator.value
            };
        }
        return {
            model: 'EXPRESSION',
            type: 'COMPARATOR',
            operator: operator.name,
            field: field.field,
            value: operator.value
        };
    } else {
        return {
            model: 'EXPRESSION',
            type: 'DEFAULT',
            field: field.field,
            value: value
        };
    }
};

export const parseRuleFilter = (filter: RuleFilter): RuleFilterContainer => {
    const fields = getRuleFilters(filter);
    if (fields) {
        return fields.map(field => {
            if (isRuleFilter(field.value)) {
                return {
                    model: 'CONTAINER',
                    type: 'DEFAULT',
                    field: field.field,
                    values: parseRuleFilter(field.value)
                };
            } else if (isRuleFilterArray(field.value)) {
                const results: RuleFilterContainer = [];
                field.value.forEach(rulefilter => results.push(...parseRuleFilter(rulefilter)));
                return {
                    model: 'CONTAINER',
                    type: isRuleFilterOR(field) ? 'OR' : isRuleFilterAND(field) ? 'AND' : 'DEFAULT',
                    field: field.field,
                    values: results
                };
            } else if (isRuleFilterFieldValue(field.value)) {
                return processValues(field, field.value);
            } else {
                return {
                    model: 'EXPRESSION',
                    type: 'PASSTHROW',
                    field: field.field
                };
            }
        });
    }
    return DEFAULT_RULEFILTERCONTAINER;
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

export const parseContainerValue = (value: Expression | Container): RuleFilter => {
    if (value.model === 'EXPRESSION') {
        if (isExpressionDefault(value)) {
            return { [value.field]: value.value };
        }
        if (isExpressionComparator(value)) {
            return {
                [value.field]: { [RULE_OPERATORS[value.operator]]: value.value }
            };
        }
        if (isExpressionLocation(value)) {
            return { [value.field]: { _near: value.value } };
        }
        return {};
    }
    return { [value.field]: value.values.map(parseContainerValue) };
};
const emptyFilter: RuleFilter = {};
export const parseFilterContainer = (container: RuleFilterContainer): RuleFilter => {
    if (!Array.isArray(container)) return {};
    return container.reduce<RuleFilter>((filter, container) => {
        return { ...filter, ...parseContainerValue(container) };
    }, emptyFilter);
};

const synchronizeExpression = (payloadNames: string[], expression: Expression): Expression | null => {
    return payloadNames.includes(expression.field) ? expression : null;
};
const synchronizeContainer = (payloadNames: string[], container: Container): Container | null => {
    const syncedContainerValues: (Expression | Container)[] = [];
    for (const containerElement of container.values) {
        if (isContainer(containerElement)) {
            const container = synchronizeContainer(payloadNames, containerElement);
            container && syncedContainerValues.push(container);
        } else {
            const expression = synchronizeExpression(payloadNames, containerElement);
            expression && syncedContainerValues.push(expression);
        }
    }
    return { ...container, values: syncedContainerValues };
};
export const synchronizeRuleFilterContainerAndEventPayload = (payload: EventPayload | null, ruleFilter: RuleFilterContainer) => {
    if (!Array.isArray(payload) || payload.length < 1 || !Array.isArray(ruleFilter)) return DEFAULT_RULEFILTERCONTAINER;
    const syncedRuleFilterContainer: RuleFilterContainer = [];
    const payloadNames = payload.map(payloadItem => payloadItem.name);
    for (const ruleFilterElement of ruleFilter) {
        if (isContainer(ruleFilterElement)) {
            const container = synchronizeContainer(payloadNames, ruleFilterElement);
            container && syncedRuleFilterContainer.push(container);
        } else {
            const expression = synchronizeExpression(payloadNames, ruleFilterElement);
            expression && syncedRuleFilterContainer.push(expression);
        }
    }
    return syncedRuleFilterContainer.length > 0 ? syncedRuleFilterContainer : DEFAULT_RULEFILTERCONTAINER;
};
