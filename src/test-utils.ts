import nock from 'nock';
import { EventTypeList, EventTypeError } from './services/event-type';
import { EVENT_TYPE_URL } from './services/config';

export const setupNock = (url: string) => {
    const server = nock(url).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
    // Skip Preflight CORS OPTION request
    nock(url).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();
    return server;
}

export const generateEventTypeListWith = (many: number = 5, next = false, prev = false) => {
    const list: EventTypeList = {
        results: Array.from({length: many},
            (_, idx) => ({
                id: idx + '',
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

export const serverGetEventTypeList = (server: nock.Scope, page: number = 1, size: number = 10, status: number = 200, response: EventTypeList|EventTypeError = generateEventTypeListWith(10, false, false)) => {
    return server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(status, response);
};
export const serverDeleteEventType = (server: nock.Scope, eventTypeId: string, status: number = 204, response?: undefined|EventTypeError) => {
    return server.delete(EVENT_TYPE_URL + `/${eventTypeId}`).reply(status, response);
};