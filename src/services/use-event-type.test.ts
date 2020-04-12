import {renderHook} from '@testing-library/react-hooks'
import {
    useGetEventList
} from './use-event-type';
import {
    BASE_URL,
    EVENT_TYPE_URL
} from './config';
import {
    EventTypeList, EventTypeError
} from './event-type';
import {setupNock} from '../test-utils';

describe(
    'useFetchData',
    () => {
        const url = BASE_URL;
        const server = setupNock(url);

        it(
            'should receive a valid response and a error and keep last good response',
            async () => {
                let page = 1;
                let size = 10;
                const expectedResult: EventTypeList = {
                    results: [
                        {id: 'id1', name: 'name1', url: 'url1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
                        {id: 'id2', name: 'name2', url: 'url2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
                    ],
                    next: EVENT_TYPE_URL + `/?page=${page + 1}&pageSize=${size}`
                };
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(200, expectedResult);

                const {result, waitForNextUpdate, rerender} = renderHook(() => useGetEventList(page, size));

                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.data).toBe(undefined);

                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.data).toEqual({
                    status: 200,
                    data: expectedResult
                });

                page = 2;
                size = 10;
                const expectedResultPage2: EventTypeList = {
                    results: [
                        {id: 'id1', name: 'name1', url: 'url1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
                        {id: 'id2', name: 'name2', url: 'url2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
                    ],
                    prev: EVENT_TYPE_URL + `/?page=${page - 1}&pageSize=${size}`
                };
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(200, expectedResultPage2);

                rerender();

                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.data).toEqual({
                    status: 200,
                    data: expectedResult
                });

                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.data).toEqual({
                    status: 200,
                    data: expectedResultPage2
                });

                page = 'one' as unknown as number;
                size = 10;
                const expectedResultPageError: EventTypeError = {
                    statusCode: 500,
                    error: 'Error query',
                    message: 'Error message'
                };
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(500, expectedResultPageError);

                rerender();

                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.data).toEqual({
                    status: 200,
                    data: expectedResultPage2
                });

                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toEqual({
                    errorCode: 500,
                    errorMessage: 'Error from http://localhost:123/admin/event-types/?page=one&pageSize=10',
                    error: expectedResultPageError
                });
                expect(result.current.data).toEqual({
                    status: 200,
                    data: expectedResultPage2
                });
            }
        );
    }
);