export type ServiceList<T> = {
    results: T[];
    next?: string | undefined;
    prev?: string | undefined;
};
export type ServiceError = {
    statusCode: number,
    error: string,
    message: string
};
export type Entity = {
    id: string;
};
export type EntityWithName = {
    name: string;
} & Entity;
export type WithDate = {
    createdAt: string;
    updatedAt: string;
};
export type ServiceDeleted = {
    state: 'DELETED'|'REJECTED';
    error?: ServiceError;
} & Entity;
export type EventType = {
    url: string;
} & EntityWithName & WithDate;
export type EventTypeList = ServiceList<EventType>;
export type EventTypeError = ServiceError;
export type EventTypeDeleted = ServiceDeleted;

export type Target = {
    url: string;
} & EntityWithName & WithDate;
export type TargetList = ServiceList<Target>;
export type TargetError = ServiceError;
export type TargetDeleted = ServiceDeleted;

export type RuleFilterValue = number|string;
export type RulefilterPoint = {
    type: 'Point';
    coordinates: [number, number];
};
export type Geometry = {
    _geometry: RulefilterPoint;
    _minDistance?: number;
    _maxDistance?: number;
};
export type RuleFilterComparatorLocation = {
    '_near': Geometry;
}
export type RuleFilterComparatorEQ = {'_eq': RuleFilterValue};
export type RuleFilterComparatorGT = {'_gt': RuleFilterValue};
export type RuleFilterComparatorGTE = {'_gte': RuleFilterValue};
export type RuleFilterComparatorLT = {'_lt': RuleFilterValue};
export type RuleFilterComparatorLTE = {'_lte': RuleFilterValue};
export type RuleFilterComparator =  RuleFilterComparatorLocation|
                                    RuleFilterComparatorEQ|
                                    RuleFilterComparatorGT|
                                    RuleFilterComparatorGTE|
                                    RuleFilterComparatorLT|
                                    RuleFilterComparatorLTE;
export type RuleFilterFieldValue = RuleFilterComparator|RuleFilterValue;
export type RuleFilterField = {
    field: string;
    value: RuleFilterFieldValue|RuleFilter|RuleFilter[];
};
export type RuleFilter = {
    [key: string]:  RuleFilterFieldValue|RuleFilter|RuleFilter[];
};
export type RuleTypes = 'sliding'|'hopping'|'tumbling'|'realtime';
export type Rule = {
    type: RuleTypes;
    targetId: string;
    targetName: string;
    eventTypeId: string;
    eventTypeName: string;
    skipOnConsecutivesMatches?: boolean;
    filters: RuleFilter;
} & EntityWithName & WithDate;
export type RuleList = ServiceList<Rule>;
export type RuleError = ServiceError;
export type RuleDeleted = ServiceDeleted;

type NullOrUndefinde = null|undefined;

export const getRuleFilters = (value: RuleFilter|NullOrUndefinde): RuleFilterField[]|null => {
    if(!!value && typeof value === 'object') {
        const filters = Object.keys(value).map(key => ({field: key, value: value[key]}));
        return filters.length > 0 ? filters : null;
    }
    return null;

};
export const isRuleFilterOR = (rff: RuleFilterField|NullOrUndefinde): boolean => {
    return (!!rff && Array.isArray(rff.value) && rff.field === '_or');
};
export const isRuleFilterAND = (rff: RuleFilterField|NullOrUndefinde): boolean => {
    return (!!rff && Array.isArray(rff.value) && rff.field === '_and');
};
export const isRuleFilterValue = (value: RuleFilterFieldValue|RuleFilter|RuleFilter[]|NullOrUndefinde): value is RuleFilterValue => {
    return (typeof value === 'number' || typeof value === 'string');
};
export const isRuleFilterComparatorLocation = (value: RuleFilterComparator): value is RuleFilterComparatorLocation => {
    return (value as RuleFilterComparatorLocation)._near !== undefined;
};
export const isRuleFilterComparatorEQ = (value: RuleFilterComparator): value is RuleFilterComparatorEQ => {
    return (value as RuleFilterComparatorEQ)._eq !== undefined;
};
export const isRuleFilterComparatorGT = (value: RuleFilterComparator): value is RuleFilterComparatorGT => {
    return (value as RuleFilterComparatorGT)._gt !== undefined;
};
export const isRuleFilterComparatorGTE = (value: RuleFilterComparator): value is RuleFilterComparatorGTE => {
    return (value as RuleFilterComparatorGTE)._gte !== undefined;
};
export const isRuleFilterComparatorLT = (value: RuleFilterComparator): value is RuleFilterComparatorLT => {
    return (value as RuleFilterComparatorLT)._lt !== undefined;
};
export const isRuleFilterComparatorLTE = (value: RuleFilterComparator): value is RuleFilterComparatorLTE => {
    return (value as RuleFilterComparatorLTE)._lte !== undefined;
};
export const isRuleFilterComparator = (value: RuleFilterFieldValue|RuleFilter|RuleFilter[]|NullOrUndefinde): value is RuleFilterComparator => {
    if (!!value && !isRuleFilterValue(value) && typeof value === 'object') {
        const keys = Object.keys(value);
        return (keys.length === 1 && ['_eq', '_gt', '_gte', '_lt', '_lte', '_near'].includes(keys[0]));
    }
    return false;
};
export const isRuleFilterFieldValue = (value: RuleFilterFieldValue|RuleFilter|RuleFilter[]|NullOrUndefinde): value is RuleFilterFieldValue => {
    return isRuleFilterValue(value) || isRuleFilterComparator(value);
};
export const isRuleFilter = (value: RuleFilterFieldValue|RuleFilter|RuleFilter[]|NullOrUndefinde): value is RuleFilter => {
    return (!!value && !Array.isArray(value) && !isRuleFilterFieldValue(value) && typeof value === 'object' && Object.keys(value).length > 0);
};
export const isRuleFilterArray = (value: RuleFilterFieldValue|RuleFilter|RuleFilter[]|NullOrUndefinde): value is RuleFilter[] => {
    return (Array.isArray(value));
};
export type EventLog = {
    eventTypeId: string;
    eventTypeName: string;
    payload: {[key: string]: any;};
    requestId: string;
    createdAt: string;
} & Entity;
export type EventLogList = ServiceList<EventLog>;
export type EventLogError = ServiceError;