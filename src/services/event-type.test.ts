import {
    EventTypeApi,
    EventTypeList,
    EventTypeError,
    EventTypeDeleted,
} from './event-type';
import { APIResponseData, APIError, isAPIError } from '../fetch-api';
import { BASE_URL } from './config';
import {setupNock, generateEventTypeListWith, serverGetEventTypeList, serverDeleteEventType} from '../test-utils';

describe(
    'EventType API',
    () => {
        let api: EventTypeApi;
        const server = setupNock(BASE_URL);

        beforeAll(() => api = EventTypeApi());

        it(
            'getEventList should return a list of EventTypes',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult = generateEventTypeListWith();
                serverGetEventTypeList(server, page, size, 200, expectedResult);

                const result = await api.getEventTypeList(page, size);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<EventTypeList>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
                expect(1).toBe(1);
            }
        );

        it(
            'getEventList should return a list of EventTypes without pagination info',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult = generateEventTypeListWith();
                serverGetEventTypeList(server, page, size, 200, expectedResult);

                const result = await api.getEventTypeList();

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<EventTypeList>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
                expect(1).toBe(1);
            }
        );

        it(
            'getEventList should return an APIError when it fails',
            async () => {
                const page = 1;
                const size = 'ten' as unknown as number;
                const expectedResult = {statusCode: 400, error: 'Bad Request', message: 'querystring.pageSize should be integer'};
                serverGetEventTypeList(server, page, size, 400, expectedResult);

                const result = await api.getEventTypeList(page, size);

                expect(isAPIError(result)).toBe(true);
                const error = result as APIError<EventTypeError>;
                expect(error).toEqual({
                    errorCode: 400,
                    errorMessage: 'Error from http://localhost:123/admin/event-types/?page=1&pageSize=ten',
                    error: {
                        statusCode: 400,
                        error: 'Bad Request',
                        message: 'querystring.pageSize should be integer'
                    }
                });
            }
        );

        it(
            'deleteEvent should return one APIError when eventTypeId is not valid',
            async () => {
                const eventTypeId = 'invalidid';
                const response = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
                serverDeleteEventType(server, eventTypeId, 500, response);

                const results = await api.deleteEventType(eventTypeId);

                expect(isAPIError(results)).toBe(false);
                const deleted = results as APIResponseData<EventTypeDeleted[]>;
                expect(deleted.status).toBe(200);
                expect(deleted.data.length).toBe(1);
                expect(deleted.data[0]).toEqual({
                    id: eventTypeId,
                    state: 'REJECTED',
                    error: {
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });
            }
        );

        it(
            'deleteEvent should return an APIError when eventTypeId is undefined',
            async () => {
                const eventTypeId = undefined as unknown as string;

                const result = await api.deleteEventType(eventTypeId);

                expect(isAPIError(result)).toBe(true);
                const error = result as APIError<EventTypeError>;
                expect(error).toEqual({
                    errorCode: 500,
                    errorMessage: '',
                    error: {
                        statusCode: 500,
                        error: 'Missing EventType id',
                        message: 'eventTypeIds is an invalid EventTypeId value or array'
                    }
                });
            }
        );

        it(
            'deleteEvent should return two APIError when eventTypeIds are not valid',
            async () => {
                const eventTypeIds = ['invalidid1', 'invalid2'];
                const response = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
                serverDeleteEventType(server, eventTypeIds[0], 500, response);
                serverDeleteEventType(server, eventTypeIds[1], 500, response);

                const result = await api.deleteEventType(eventTypeIds);

                expect(isAPIError(result)).toBe(false);
                const deleted = result as APIResponseData<EventTypeDeleted[]>;
                expect(deleted.status).toBe(200);
                expect(deleted.data.length).toBe(2);

                const error = deleted.data[0];
                expect(error).toEqual({
                    id: eventTypeIds[0],
                    state: 'REJECTED',
                    error: {
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });

                const error2 = deleted.data[1];
                expect(error2).toEqual({
                    id: eventTypeIds[1],
                    state: 'REJECTED',
                    error: {
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });
            }
        );

        it(
            'deleteEvent should return one 204 empty response when eventTypeId is valid ',
            async () => {
                const eventTypeId = '5e8dffc9c906fefd9e7b2486';
                serverDeleteEventType(server, eventTypeId, 204);

                const result = await api.deleteEventType(eventTypeId);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<EventTypeDeleted[]>;
                expect(response.status).toBe(200);
                expect(response.data.length).toBe(1);
                expect(response.data[0]).toEqual({
                    id: eventTypeId,
                    state: 'DELETED'
                });
            }
        );

        it(
            'deleteEvent should return two 204 empty response when eventTypeIds are valid ',
            async () => {
                const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', '5e8dffd0c906fe54737b2487'];
                serverDeleteEventType(server, eventTypeIds[0], 204);
                serverDeleteEventType(server, eventTypeIds[1], 204);

                const result = await api.deleteEventType(eventTypeIds);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<EventTypeDeleted[]>;
                expect(response.status).toBe(200);
                expect(response.data.length).toBe(2);

                const deleted1 = response.data[0];
                expect(deleted1).toEqual({
                    id: eventTypeIds[0],
                    state: 'DELETED'
                });

                const deleted2 = response.data[1];
                expect(deleted2).toEqual({
                    id: eventTypeIds[1],
                    state: 'DELETED'
                });
            }
        );

        it(
            'deleteEvent should return one 204 empty response and one APIError when eventTypeIds are valid e invalid ',
            async () => {
                const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', 'invalidid'];
                const responseError = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
                serverDeleteEventType(server, eventTypeIds[0], 204);
                serverDeleteEventType(server, eventTypeIds[1], 500, responseError);

                const result = await api.deleteEventType(eventTypeIds);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<EventTypeDeleted[]>;
                expect(response.status).toBe(200);
                expect(response.data.length).toBe(2);

                const deleted1 = response.data[0];
                expect(deleted1).toEqual({
                    id: eventTypeIds[0],
                    state: 'DELETED'
                });

                const errorDeleted = response.data[1];
                expect(errorDeleted).toEqual({
                    id: eventTypeIds[1],
                    state: 'REJECTED',
                    error: {
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });
            }
        );
    }
);
