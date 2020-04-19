import {renderHook, act} from '@testing-library/react-hooks'
import {
    useGetEventList,
    useDeleteEventList
} from './use-event-type';
import {
    BASE_URL
} from './config';
import {EventTypeError} from './event-type';
import {
    setupNock,
    generateEventTypeListWith,
    serverGetEventTypeList,
    serverDeleteEventType
} from '../test-utils';

const url = BASE_URL;
const server = setupNock(url);

describe(
    'useGetEventList',
    () => {
        it(
            'should receive a valid response and a error and keep last good response',
            async () => {
                let page = 1;
                let size = 3;
                const expectedResult = generateEventTypeListWith(3, true, false);
                serverGetEventTypeList(server, page, size, 200, expectedResult);

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
                serverGetEventTypeList(server, page, size, 200, expectedResultPage2);

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
                serverGetEventTypeList(server, page, size, 500, expectedResultPageError);

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

        it(
            'should force a reload when fire request',
            async () => {
                let page = 1;
                let size = 3;
                const expectedResult = generateEventTypeListWith(3, true, false);
                serverGetEventTypeList(server, page, size, 200, expectedResult);

                const {result, waitForNextUpdate} = renderHook(() => useGetEventList(page, size));

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

                serverGetEventTypeList(server, page, size, 200, expectedResult);
                act(() => result.current.request());

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
                    data: expectedResult
                });
            }
        );
    }
);

describe(
    'useDeleteEventList',
    () => {

        it(
            'shuold delete one EventType and return OK',
            async () => {
                const eventTypeId = '123456789098';
                serverDeleteEventType(server, eventTypeId);

                const {result, waitForNextUpdate} = renderHook(() => useDeleteEventList(eventTypeId));
                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);

                act(() => result.current.request());

                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();

                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response).toEqual({
                    status: 200,
                    data: [
                        {id: eventTypeId, state: 'DELETED'},
                    ]
                });
            }
        );

        it(
            'shuold try to delete one invalid EventType and return Error',
            async () => {
                const eventTypeId = undefined as unknown as string;
                serverDeleteEventType(server, eventTypeId);

                const {result, waitForNextUpdate} = renderHook(() => useDeleteEventList(eventTypeId));
                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);

                act(() => result.current.request());

                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();

                expect(result.current.response).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toEqual({
                    errorCode: 500,
                    errorMessage: '',
                    error: {
                        error: 'Missing EventType id',
                        message: 'eventTypeIds is an invalid EventTypeId value or array',
                        statusCode: 500,
                    }
                });
            }
        );

        it(
            'shuold delete a list of EventTypes and return its response',
            async () => {
                const eventTypeIds = [
                    '123456789098',
                    '123456456789',
                    '153478904567'
                ];
                const errorResponse: EventTypeError = {statusCode: 500, error: 'eventId can not be deleted', message: 'Error deleteing eventId'};
                serverDeleteEventType(server, eventTypeIds[0]);
                serverDeleteEventType(server, eventTypeIds[1], 500, errorResponse);
                serverDeleteEventType(server, eventTypeIds[2]);

                const {result, waitForNextUpdate} = renderHook(() => useDeleteEventList(eventTypeIds));
                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);

                act(() => result.current.request());

                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();

                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response).toEqual({
                    status: 200,
                    data: [
                        {id: eventTypeIds[0], state: 'DELETED'},
                        {id: eventTypeIds[1], state: 'REJECTED', error: {error: 'eventId can not be deleted', message: 'Error deleteing eventId', statusCode: 500}},
                        {id: eventTypeIds[2], state: 'DELETED'}
                    ]
                });
            }
        );
    }
);