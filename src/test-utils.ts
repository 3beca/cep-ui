import nock from 'nock';
import { EventTypeList } from './services/event-type';

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