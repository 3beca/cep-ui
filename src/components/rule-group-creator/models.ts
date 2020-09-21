export type RuleGroupBase = {
    name: string;
    field: string;
};
export type RuleGroupOperator = '_max'|'_min'|'_avg'|'_sum'|'_stdDevPop'|'_stdDevSamp';
export type RuleGroupFieldMax = {
    operator:'_max';
} & RuleGroupBase;
export type RuleGroupFieldMin = {
    operator:'_min';
} & RuleGroupBase;
export type RuleGroupFieldAvg = {
    operator:'_avg';
} & RuleGroupBase;
export type RuleGroupFieldSum = {
    name: string;
    operator:'_sum';
    field: string|number;
};
export type RuleGroupFieldStdDevPop = {
    operator:'_stdDevPop';
} & RuleGroupBase;
export type RuleGroupFieldStdDevSamp = {
    operator:'_stdDevSamp';
} & RuleGroupBase;
export type RuleGroupField = RuleGroupFieldMax|RuleGroupFieldMin|RuleGroupFieldAvg|RuleGroupFieldSum|RuleGroupFieldStdDevPop|RuleGroupFieldStdDevSamp;
export type RuleGroupPayload = RuleGroupField[];