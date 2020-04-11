import nock from 'nock';
import {renderHook, act} from '@testing-library/react-hooks'
import {
    useGetEventList
} from './use-event-type';
import {
    BASE_URL,
    EVENT_TYPE_URL
} from './config';
import {
    EventTypeList
} from './event-type';

describe(
    'useFetchData',
    () => {
        const url = BASE_URL;
        const server = nock(url).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
        // Skip Preflight CORS OPTION request
        nock(url).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();

        it(
            'should receive a valid response and a error and keep last good response',
            async () => {
                let page = 1;
                let size = 10;
                const expectedResult: EventTypeList = {
                    results: [
                        {id: 'id1', name: 'name1', url: 'url1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
                        {id: 'id2', name: 'name2', url: 'url2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
                    ]
                };
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(200, expectedResult);

                const {result} = renderHook(() => useGetEventList(page, size));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.data).toBe(undefined);

                
            }
        );
    }
);