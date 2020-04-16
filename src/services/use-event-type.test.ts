import {renderHook} from '@testing-library/react-hooks'
import {
    useGetEventList
} from './use-event-type';
import {
    BASE_URL,
    EVENT_TYPE_URL
} from './config';
import {EventTypeError} from './event-type';
import {setupNock, generateEventTypeListWith} from '../test-utils';

describe(
    'useFetchData',
    () => {
        const url = BASE_URL;
        const server = setupNock(url);

        it(
            'should receive a valid response and a error and keep last good response',
            async () => {
                let page = 1;
                let size = 3;
                const expectedResult = generateEventTypeListWith(3, true, false);
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(200, expectedResult);

                const {result, waitForNextUpdate, rerender} = renderHook(() => useGetEventList(page, size));

                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toEqual({
                    status: 200,
                    data: expectedResult
                });

                page = 2;
                size = 3;
                const expectedResultPage2 = generateEventTypeListWith(3, true, true);
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(200, expectedResultPage2);

                rerender();

                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toEqual({
                    status: 200,
                    data: expectedResult
                });

                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toEqual({
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
                expect(result.current.response).toEqual({
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
                expect(result.current.response).toEqual({
                    status: 200,
                    data: expectedResultPage2
                });
            }
        );
    }
);