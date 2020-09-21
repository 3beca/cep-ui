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