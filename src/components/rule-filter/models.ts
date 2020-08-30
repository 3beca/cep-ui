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
export type GeometryPoint = {
    type: 'Point';
    coordinates: [number, number];
};
export type Geometry = {
    _geometry: GeometryPoint;
    _minDistance?: number;
    _maxDistance?: number;
};
export type EComparatorLocation = {
    type: 'GEO';
    operator: 'NEAR';
    value: Geometry;
} & ExpressionBase;

export type ComparatorValue = {
    name: 'EQ'|'GT'|'GTE'|'LT'|'LTE';
    value: number|string;
};
export type ComparatorLocation = {
    name: 'NEAR';
    value: Geometry;
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
