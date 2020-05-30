import {
    EVENT_TYPES_URL,
    TARGETS_URL,
    RULES_URL,
    EVENTS_URL
} from '../services/config';
import {
    ServiceList,
    ServiceError,
    TargetList,
    TargetError,
    EventTypeList,
    EventTypeError,
    Entity,
    Rule,
    RuleTypes,
    RuleList,
    RuleError,
    RuleFilter,
    EventType,
    Target,
    EventLog,
    EventLogList,
    EventLogError
} from '../services/api';
import nock from 'nock';

export const setupNock = (url: string) => {
    const server = nock(url).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
    // Skip Preflight CORS OPTION request
    nock(url).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();
    return server;
}

export const generateListWith = function generateListWith(many: number = 5, next = false, prev = false, key: string = '_' + many): ServiceList<Entity> {
    const list: ServiceList<Entity> = {
        results: Array.from({length: many},
            (_, idx) => ({
                id: idx + '_' + key
            })
        )
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

export const generateEventType = (idx: number, key: string, namePrefix: string) => {
    return ({
        id: idx + '_' + key,
        name: namePrefix + 'EventType' + idx,
        url: 'http://cep/elemento' + idx,
        createdAt: '2020-01-01T10:10:10.123Z',
        updatedAt: '2020-01-01T10:10:10.123Z'
    });
};
export const generateEventTypeListWith = (many: number = 5, next = false, prev = false, key: string = '_' + many, namePrefix: string = 'Elemento '): EventTypeList => {
    const list: EventTypeList = {
        results: Array.from({length: many},
            (_, idx) => generateEventType(idx, key, namePrefix)
        )
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};
export const generateTarget = (idx: number, key: string, namePrefix: string) => {
    return (
        {
            id: idx + '_' + key,
            name: namePrefix + 'Target' + idx,
            url: 'http://target/elemento' + idx,
            createdAt: '2020-01-01T10:10:10.123Z',
            updatedAt: '2020-01-01T10:10:10.123Z'
        }
    );
};
export const generateTargetListWith = (many: number = 5, next = false, prev = false, key: string = '_' + many, namePrefix: string = 'Elemento '): TargetList => {
    const list: TargetList = {
        results: Array.from({length: many},
            (_, idx) => generateTarget(idx, key, namePrefix)
        )
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

const randomType = (index: number): RuleTypes => {
    const types: RuleTypes[] = ['sliding', 'hopping', 'tumbling', 'realtime'];
    const rand = index % 4;
    return types[rand];
};
export const generateRule = (key: string, idx: number, filters: RuleFilter = {temperature: {_eq: 10}, humidity: '45'}): Rule => ({
    id: idx + '_' + key,
    name: 'Rule ' + idx,
    type: randomType(idx),
    eventTypeId: 'eventtypeid',
    eventTypeName: 'EventType ' + idx + '-' + key,
    targetId: 'targetid',
    targetName: 'Target ' + idx + '-' + key,
    skipOnConsecutivesMatches: idx % 2 === 0 ? true : false,
    filters,
    createdAt: '2020-01-01T10:10:10.123Z',
    updatedAt: '2020-01-01T10:10:10.123Z'
});
export const generateRuleListWith = function generateListWith(many: number = 5, next = false, prev = false, key: string = '_' + many): ServiceList<Rule> {
    const list: ServiceList<Rule> = {
        results: Array.from({length: many}, (_, idx) => generateRule(key, idx))
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

const samplePayload = {
    dateTime: '2020-05-27T18:04:34.182Z',
    device: 'UCAM-01-G-AI00',
    id: '15267:UCAM-01-G-AI00:HUMIDITY',
    type: 'humidity',
    value: 36.58125
};
export const generateEventLog = (key: string, idx: number, payload: any = samplePayload): EventLog => ({
    id: idx + '_' + key,
    eventTypeId: 'eventtypeid',
    eventTypeName: 'EventType ' + idx + '-' + key,
    payload,
    requestId: "53960",
    createdAt: '2020-01-01T10:10:10.123Z'
});
export const generateEventLogListWith = function generateListWith(many: number = 5, next = false, prev = false, key: string = '_' + many): ServiceList<EventLog> {
    const list: ServiceList<EventLog> = {
        results: Array.from({length: many}, (_, idx) => generateEventLog(key, idx))
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

export const serverGetList = function serverGetList<T>(server: nock.Scope, path: string, page: number = 1, size: number = 10, filter: string = '', status: number = 200, response: ServiceList<T>|ServiceError) {
    return server.get(path + `/?page=${page}&pageSize=${size}${filter ? `&search=${filter}` : ''}`).reply(status, response);
};
export const serverDelete = (server: nock.Scope, path: string, id: string, status: number = 204, response: undefined|ServiceError = undefined) => {
    return server.delete(path + `/${id}`).reply(status, response);
};
export const serverCreate = <T>(server: nock.Scope, path: string, body: string, status: number = 204, response: T|ServiceError) => {
    return server.post(path, body).reply(status, response);
};

export const serverGetEventTypeList = (server: nock.Scope, page: number = 1, size: number = 10, filter= '', status: number = 200, response: EventTypeList|EventTypeError = generateEventTypeListWith(10, false, false)) => {
    return serverGetList(server, EVENT_TYPES_URL, page, size, filter, status, response);
};
export const serverDeleteEventType = (server: nock.Scope, eventTypeId: string, status: number = 204, response: undefined|EventTypeError = undefined) => {
    return serverDelete(server, EVENT_TYPES_URL, eventTypeId, status, response);
};
export const serverCreateEventType = (server: nock.Scope, body: Partial<EventType>, status: number = 200, response: EventType|ServiceError) => {
    return serverCreate(server, EVENT_TYPES_URL, JSON.stringify(body), status, response);
};

export const serverGetTargetList = (server: nock.Scope, page: number = 1, size: number = 10, filter= '', status: number = 200, response: TargetList|TargetError = generateTargetListWith(10, false, false)) => {
    return serverGetList(server, TARGETS_URL, page, size, filter, status, response);
};
export const serverDeleteTarget = (server: nock.Scope, targetId: string, status: number = 204, response: undefined|TargetError = undefined) => {
    return serverDelete(server, TARGETS_URL, targetId, status, response);
};
export const serverCreateTarget = (server: nock.Scope, body: Partial<Target>, status: number = 200, response: Target|ServiceError) => {
    return serverCreate(server, TARGETS_URL, JSON.stringify(body), status, response);
};

export const serverGetRuleList = (server: nock.Scope, page: number = 1, size: number = 10, filter= '', status: number = 200, response: RuleList|RuleError = generateRuleListWith(10, false, false)) => {
    return serverGetList(server, RULES_URL, page, size, filter, status, response);
};
export const serverDeleteRule = (server: nock.Scope, ruleId: string, status: number = 204, response: undefined|RuleError = undefined) => {
    return serverDelete(server, RULES_URL, ruleId, status, response);
};
export const serverCreateRule = (server: nock.Scope, body: Partial<Rule>, status: number = 200, response: Rule|ServiceError) => {
    return serverCreate(server, RULES_URL, JSON.stringify(body), status, response);
};

export const serverGetEventLogList = (server: nock.Scope, page: number = 1, size: number = 10, eventTypeId= '', status: number = 200, response: EventLogList|EventLogError = generateEventLogListWith(10, false, false)) => {
    return server.get(EVENTS_URL + `/?page=${page}&pageSize=${size}${eventTypeId ? `&eventTypeId=${eventTypeId}` : ''}`).reply(status, response);
};
