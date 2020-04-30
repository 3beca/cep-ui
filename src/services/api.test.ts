import { APIResponseData, APIError, isAPIError } from '../utils/fetch-api';
import {
    setupNock,
    generateListWith,
    serverGetList,
    serverDelete
} from '../test-utils';

import {Api, buildApiService, ServiceList, ServiceError, ServiceDeleted, Entity} from './api';

describe(
    'CEP API',
    () => {
        let api: Api;
        const BASE_URL = 'https://localhost:123';
        const PATH = '/anypath';
        const server = setupNock(BASE_URL);

        beforeAll(() => api = buildApiService(BASE_URL));

        it(
            'getListRequest should return a list of Elements',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult = generateListWith();
                serverGetList(server, PATH, page, size, 200, expectedResult);

                const result = await api.getListRequest<Entity>(PATH, page, size);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceList<Entity>>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
                expect(1).toBe(1);
            }
        );

        it(
            'getListRequest should return a list of Elements without pagination info',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult = generateListWith();
                serverGetList(server, PATH, page, size, 200, expectedResult);

                const result = await api.getListRequest(PATH);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceList<Entity>>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
            }
        );

        it(
            'getListRequest should return an APIError when it fails',
            async () => {
                const page = 1;
                const size = 'ten' as unknown as number;
                const expectedResult = {statusCode: 400, error: 'Bad Request', message: 'querystring.pageSize should be integer'};
                serverGetList(server, PATH, page, size, 400, expectedResult);

                const result = await api.getListRequest(PATH, page, size);

                expect(isAPIError(result)).toBe(true);
                const error = result as APIError<ServiceError>;
                expect(error).toEqual({
                    errorCode: 400,
                    errorMessage: 'Error from https://localhost:123/anypath/?page=1&pageSize=ten',
                    error: {
                        statusCode: 400,
                        error: 'Bad Request',
                        message: 'querystring.pageSize should be integer'
                    }
                });
            }
        );

        it(
            'deleteRequest should return one APIError when id is not valid',
            async () => {
                const id = 'invalidid';
                const response = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
                serverDelete(server, PATH, id, 500, response);

                const results = await api.deleteRequest(PATH, id);

                expect(isAPIError(results)).toBe(false);
                const deleted = results as APIResponseData<ServiceDeleted[]>;
                expect(deleted.status).toBe(200);
                expect(deleted.data.length).toBe(1);
                expect(deleted.data[0]).toEqual({
                    id,
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
            'deleteRequest should return an APIError when id is undefined',
            async () => {
                const id = undefined as unknown as string;

                const result = await api.deleteRequest(PATH, id);

                expect(isAPIError(result)).toBe(true);
                const error = result as APIError<ServiceError>;
                expect(error).toEqual({
                    errorCode: 500,
                    errorMessage: '',
                    error: {
                        statusCode: 500,
                        error: 'Missing id',
                        message: 'id is an invalid id value or array'
                    }
                });
            }
        );

        it(
            'deleteEvent should return two APIError when ids are not valid',
            async () => {
                const ids = ['invalidid1', 'invalid2'];
                const response = {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'};
                serverDelete(server, PATH, ids[0], 500, response);
                serverDelete(server, PATH, ids[1], 500, response);

                const result = await api.deleteRequest(PATH, ids);

                expect(isAPIError(result)).toBe(false);
                const deleted = result as APIResponseData<ServiceDeleted[]>;
                expect(deleted.status).toBe(200);
                expect(deleted.data.length).toBe(2);

                const error = deleted.data[0];
                expect(error).toEqual({
                    id: ids[0],
                    state: 'REJECTED',
                    error: {
                        statusCode: 500,
                        error: 'Internal Server Error',
                        message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                    }
                });

                const error2 = deleted.data[1];
                expect(error2).toEqual({
                    id: ids[1],
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
                serverDelete(server, PATH, eventTypeId, 204);

                const result = await api.deleteRequest(PATH, eventTypeId);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceDeleted[]>;
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
                serverDelete(server, PATH, eventTypeIds[0], 204);
                serverDelete(server, PATH, eventTypeIds[1], 204);

                const result = await api.deleteRequest(PATH, eventTypeIds);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceDeleted[]>;
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
                serverDelete(server, PATH, eventTypeIds[0], 204);
                serverDelete(server, PATH, eventTypeIds[1], 500, responseError);

                const result = await api.deleteRequest(PATH, eventTypeIds);

                expect(isAPIError(result)).toBe(false);
                const response = result as APIResponseData<ServiceDeleted[]>;
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
