import * as React from 'react';
import nock from 'nock';
import {Router} from 'react-router-dom';
import {createMemoryHistory, History} from 'history';
import {render} from '@testing-library/react';
import {MainMenuProvider} from '../services/main-menu-provider';
import {
    EVENT_TYPES_URL,
    TARGETS_URL,
    RULES_URL
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
    RuleError
} from '../services/api';
export * from '@testing-library/react';

type OptionsRenderRouter = {
    route?: string;
    history?: History
};
export function renderInsideApp(
    ui: React.ReactElement,
    {
        route = '/',
        history = createMemoryHistory({initialEntries: [route]}),
        ...renderOptions
    }: OptionsRenderRouter = {}
) {
    const Wrapper: React.FC<{}> = function Wrapper(props) {
        return (
            <Router history={history}>
                <MainMenuProvider {...props} />
            </Router>
        );
    }
    return {
        ...render(ui, {wrapper: Wrapper, ...renderOptions}),
        history
    };
}

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
                id: idx + '_' + key,
            })
        )
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

export const generateEventTypeListWith = (many: number = 5, next = false, prev = false, key: string = '_' + many): EventTypeList => {
    const list: EventTypeList = {
        results: Array.from({length: many},
            (_, idx) => ({
                id: idx + '_' + key,
                name: 'Elemento ' + idx,
                url: 'http://cep/elemento' + idx,
                createdAt: '2020-01-01T10:10:10.123Z',
                updatedAt: '2020-01-01T10:10:10.123Z'
            })
        )
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

export const generateTargetListWith = (many: number = 5, next = false, prev = false, key: string = '_' + many): TargetList => {
    const list: TargetList = {
        results: Array.from({length: many},
            (_, idx) => ({
                id: idx + '_' + key,
                name: 'Elemento Target' + idx,
                url: 'http://target/elemento' + idx,
                createdAt: '2020-01-01T10:10:10.123Z',
                updatedAt: '2020-01-01T10:10:10.123Z'
            })
        )
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

const randomType = (index: number): RuleTypes => {
    const types: RuleTypes[] = ['sliding', 'hopping', 'tumbling', 'none'];
    const rand = index % 4;
    return types[rand];
};
export const generateRule = (key: string, idx: number, filters: any = {temperature: 10}) => ({
    id: idx + '_' + key,
    name: 'Rule ' + idx,
    type: randomType(idx),
    eventTypeId: 'eventtypeid',
    targetId: 'targetid',
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

export const serverGetList = function serverGetList<T>(server: nock.Scope, path: string, page: number = 1, size: number = 10, filter: string = '', status: number = 200, response: ServiceList<T>|ServiceError) {
    return server.get(path + `/?page=${page}&pageSize=${size}${filter ? `&search=${filter}` : ''}`).reply(status, response);
};
export const serverDelete = (server: nock.Scope, path: string, id: string, status: number = 204, response: undefined|ServiceError = undefined) => {
    return server.delete(path + `/${id}`).reply(status, response);
};

export const serverGetEventTypeList = (server: nock.Scope, page: number = 1, size: number = 10, filter= '', status: number = 200, response: EventTypeList|EventTypeError = generateEventTypeListWith(10, false, false)) => {
    return serverGetList(server, EVENT_TYPES_URL, page, size, filter, status, response);
};
export const serverDeleteEventType = (server: nock.Scope, eventTypeId: string, status: number = 204, response: undefined|EventTypeError = undefined) => {
    return serverDelete(server, EVENT_TYPES_URL, eventTypeId, status, response);
};

export const serverGetTargetList = (server: nock.Scope, page: number = 1, size: number = 10, filter= '', status: number = 200, response: TargetList|TargetError = generateTargetListWith(10, false, false)) => {
    return serverGetList(server, TARGETS_URL, page, size, filter, status, response);
};
export const serverDeleteTarget = (server: nock.Scope, targetId: string, status: number = 204, response: undefined|TargetError = undefined) => {
    return serverDelete(server, TARGETS_URL, targetId, status, response);
};

export const serverGetRuleList = (server: nock.Scope, page: number = 1, size: number = 10, filter= '', status: number = 200, response: RuleList|RuleError = generateRuleListWith(10, false, false)) => {
    return serverGetList(server, RULES_URL, page, size, filter, status, response);
};
export const serverDeleteRule = (server: nock.Scope, ruleId: string, status: number = 204, response: undefined|RuleError = undefined) => {
    return serverDelete(server, RULES_URL, ruleId, status, response);
};