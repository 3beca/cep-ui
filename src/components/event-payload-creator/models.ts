export type EventPayloadFieldTypes = 'number'|'string'|'location';
export type EventPayloadField = {type: EventPayloadFieldTypes, name: string};
export type EventPayload = EventPayloadField[];

const isValidPayloadField = (field: any): EventPayloadFieldTypes|null => {
    if (typeof field === 'number') return 'number';
    if (typeof field === 'string') return 'string';
    if (Array.isArray(field) && field.length === 2 && typeof field[0] === 'number' && typeof field[1] === 'number') return 'location';
    return null;
};
const filterEmptyPayloads = (payload: EventPayloadField|null): payload is EventPayloadField => !!payload;
export const buildPayloadFromEventLogPayload = (eventLogPayload: any): EventPayload|null => {
    if (!eventLogPayload) return null;
    if (typeof eventLogPayload !== 'object') return null;
    if (Array.isArray(eventLogPayload)) return null;

    const keys = Object.keys(eventLogPayload);
    if (keys.length === 0) return null;
    const validPayload: EventPayload = keys.map((key) => {
        const value = eventLogPayload[key];
        const type = isValidPayloadField(value);
        if (type) return {name: key, type};
        return null;
    }).filter(filterEmptyPayloads);
    return validPayload.length > 0 ? validPayload : null;
};
