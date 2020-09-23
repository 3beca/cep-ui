import { RuleGroup } from '../../services/api';
import { EventPayload, EventPayloadField } from '../event-payload-creator/models';
import { RuleGroupPayload } from './models';

export const buildEventPayloadFromGroupPayload = (group?: RuleGroupPayload) => {
    if (!Array.isArray(group) || group.length < 1) return null;
    return group.map<EventPayloadField>((field) => ({name: field.name, type: 'number'}));
};

export const syncEventPayloadAndGroupPayload = (payload: EventPayload|null, group?: RuleGroupPayload): [boolean, RuleGroupPayload|undefined] => {
    if (!Array.isArray(group) || group.length === 0) return [false, group];
    let itNeedsUpdate = false;
    const payloadNames = Array.isArray(payload) ? payload.map(field => field.name) : [];
    const newGroup = [];
    for(const groupField of group) {
        if (
            payloadNames.includes(groupField.field + '') ||
            (groupField.operator === '_sum' && Number.isInteger(groupField.field))
        ) {
            newGroup.push(groupField);
        }
        else {
            itNeedsUpdate = true;
        }
    }
    return [itNeedsUpdate, newGroup.length > 0 ? newGroup : undefined];
};

export const parseRuleGroupPayloadToRuleGroup = (group: RuleGroupPayload|undefined): RuleGroup|undefined => {
    if (!Array.isArray(group)) return undefined;
    const ruleGroup: RuleGroup = group.reduce<RuleGroup>(
        (newGroup, payloadField) => {
            if (payloadField.name) return {...newGroup, [payloadField.name]: {[payloadField.operator]: typeof payloadField.field === 'number' ? payloadField.field : '_' + payloadField.field}} as RuleGroup;
            return newGroup;
        },
        Object.create(null)
    );

    return Object.keys(ruleGroup).length > 0 ? ruleGroup : undefined;
};