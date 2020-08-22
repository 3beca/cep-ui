import {renderHook, act} from '@testing-library/react-hooks'
import {
    useGetList,
    useDelete,
    useCreate,
    ENTITY
} from './use-api';
import {
    BASE_URL
} from '../config';
import {
    ServiceError,
    EventType,
    Target,
    TargetError
} from '../api';
import {
    setupNock,
    generateEventType,
    generateEventTypeListWith,
    serverGetEventTypeList,
    serverDeleteEventType,
    serverCreateEventType,
    generateTarget,
    serverCreateTarget,
    generateEventLogListWith,
    serverGetEventLogList
} from '../../test-utils';

const url = BASE_URL;
const server = setupNock(url);

jest.mock('./index', () => {
    const apiService = require('../api');
    const config = require('../config');
    const api = {api: apiService.buildApiService(config.BASE_URL)};
    return {
        useAPIProvider: () => api
    };
});

describe(
    'useGetList',
    () => {
        it(
            'should receive a valid response and a error and keep last good response',
            async () => {
                let page = 1;
                let size = 3;
                const expectedResult = generateEventTypeListWith(3, true, false);
                serverGetEventTypeList(server, page, size, '', 200, expectedResult);

                const {result, waitForNextUpdate, rerender} = renderHook(() => useGetList(ENTITY.EVENT_TYPES, page, size));

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
                serverGetEventTypeList(server, page, size, '', 200, expectedResultPage2);

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
                const expectedResultPageError: ServiceError = {
                    statusCode: 500,
                    error: 'Error query',
                    message: 'Error message'
                };
                serverGetEventTypeList(server, page, size, '', 500, expectedResultPageError);

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
                    errorMessage: `Error from ${url}/event-types/?page=one&pageSize=10`,
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
                serverGetEventTypeList(server, page, size, '', 200, expectedResult);

                const {result, waitForNextUpdate} = renderHook(() => useGetList(ENTITY.EVENT_TYPES, page, size));

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

                serverGetEventTypeList(server, page, size, '', 200, expectedResult);
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

        it(
            'should force a reload when change filter',
            async () => {
                let page = 1;
                let size = 3;
                let filter = '';
                const expectedResult = generateEventTypeListWith(3, true, false);
                serverGetEventTypeList(server, page, size, filter, 200, expectedResult);

                const {result, rerender, waitForNextUpdate} = renderHook(() => useGetList(ENTITY.EVENT_TYPES, page, size, filter));

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

                filter = 'newfilter'
                serverGetEventTypeList(server, page, size, filter, 200, expectedResult);
                rerender(() => useGetList(ENTITY.EVENT_TYPES, page, size, filter));

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

        it(
            'should NOT fire request when load is false',
            async () => {
                let page = 1;
                let size = 3;
                const expectedResult = generateEventTypeListWith(3, true, false);
                serverGetEventTypeList(server, page, size, '', 200, expectedResult);

                const {result, waitForNextUpdate} = renderHook(() => useGetList(ENTITY.EVENT_TYPES, page, size, '', false));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                act(() => result.current.request());

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

                serverGetEventTypeList(server, page, size, '', 200, expectedResult);
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

        it(
            'should receive a a list of one element when using fiter eventTypeId',
            async () => {
                const page = 1;
                const size = 1;
                const eventTypeId = 'eventtypeid';
                const expectedResult = generateEventLogListWith(3, true, false);
                serverGetEventLogList(server, page, size, eventTypeId, 200, expectedResult);
                const filter = {eventTypeId};
                const {result, waitForNextUpdate} = renderHook(() => useGetList(ENTITY.EVENTS_LOG, page, size, filter));

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
            }
        );
    }
);

describe(
    'useDelete',
    () => {

        it(
            'shuold delete one EventType and return OK',
            async () => {
                const eventTypeId = '123456789098';
                serverDeleteEventType(server, eventTypeId);

                const {result, waitForNextUpdate} = renderHook(() => useDelete(ENTITY.EVENT_TYPES, eventTypeId));
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
            'should try to delete one invalid EventType and return Error',
            async () => {
                const eventTypeId = undefined as unknown as string;
                serverDeleteEventType(server, eventTypeId);

                const {result, waitForNextUpdate} = renderHook(() => useDelete(ENTITY.EVENT_TYPES, eventTypeId));
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
                    errorMessage: 'id is an invalid id value or array',
                    error: {
                        error: 'Missing id',
                        message: 'id is an invalid id value or array',
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
                const errorResponse: ServiceError = {statusCode: 500, error: 'eventId can not be deleted', message: 'Error deleteing eventId'};
                serverDeleteEventType(server, eventTypeIds[0]);
                serverDeleteEventType(server, eventTypeIds[1], 500, errorResponse);
                serverDeleteEventType(server, eventTypeIds[2]);

                const {result, waitForNextUpdate} = renderHook(() => useDelete(ENTITY.EVENT_TYPES, eventTypeIds));
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

describe(
    'useCreate',
    () => {
        it(
            'should create a new EventType',
            async () => {
                const eventType = generateEventType(1, 'usetCreateTest', 'evtest');
                const eventBody: Partial<EventType> = {name: eventType.name};
                serverCreateEventType(server, eventBody, 201, eventType);

                const {result, waitForNextUpdate} = renderHook(() => useCreate(ENTITY.EVENT_TYPES, eventBody));

                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response).toBe(undefined);

                act(() => result.current.request());
                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response?.status).toBe(201);
                expect(result.current.response?.data).toEqual(eventType);
            }
        );

        it(
            'should create a new Target',
            async () => {
                const target = generateTarget(1, 'usetCreateTest', 'ttest');
                const targetBody: Partial<Target> = {name: target.name, url: target.url};
                serverCreateTarget(server, targetBody, 201, target);

                const {result, waitForNextUpdate} = renderHook(() => useCreate(ENTITY.TARGETS, targetBody));

                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response).toBe(undefined);

                act(() => result.current.request());
                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response?.status).toBe(201);
                expect(result.current.response?.data).toEqual(target);
            }
        );

        it(
            'should fails to create new Target',
            async () => {
                const targetBody: Partial<Target> = {name: 'existing name', url: 'http://anywhere'};
                const targetError: TargetError = {
                    statusCode: 409,
                    error: 'Bad request',
                    message: 'Target name must be unique and is already taken by target with id 5ec39c6f118b4dbbe07b1cbb'
                };
                serverCreateTarget(server, targetBody, 409, targetError);

                const {result, waitForNextUpdate} = renderHook(() => useCreate(ENTITY.TARGETS, targetBody));

                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response).toBe(undefined);

                act(() => result.current.request());
                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();

                expect(result.current.response).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toEqual({
                    errorCode: 409,
                    errorMessage: `Error from ${url}/targets`,
                    error: targetError
                });
            }
        );

        it(
            'should create a new Target on Render',
            async () => {
                let target = generateTarget(1, 'usetCreateTest', 'ttest');
                let targetBody: Partial<Target> = {name: target.name, url: target.url};
                serverCreateTarget(server, targetBody, 201, target);

                const {result, waitForNextUpdate, rerender} = renderHook(() => useCreate(ENTITY.TARGETS, targetBody, true));

                expect(result.current.response).toBe(undefined);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response?.status).toBe(201);
                expect(result.current.response?.data).toEqual(target);

                rerender();
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response?.status).toBe(201);
                expect(result.current.response?.data).toEqual(target);

                // Change values should create a new target
                const oldTarget = target;
                target = generateTarget(2, 'usetCreateTest', 'ttest');
                targetBody = {name: target.name, url: target.url};
                serverCreateTarget(server, targetBody, 201, target);

                rerender();
                expect(result.current.response?.status).toBe(201);
                expect(result.current.response?.data).toEqual(oldTarget);
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(true);

                await waitForNextUpdate();
                expect(result.current.error).toBe(undefined);
                expect(result.current.isLoading).toBe(false);
                expect(result.current.response?.status).toBe(201);
                expect(result.current.response?.data).toEqual(target);
            }
        );
    }
);