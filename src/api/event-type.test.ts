import nock from 'nock';
import {
    EventTypeApi,
    EventTypeList,
    isErrorApi
} from './event-type';
import { ResponseData, ErrorAPI, ResponseEmptyData } from './fetch-data';
import { BASE_URL, EVENT_TYPE_URL } from './config';

describe(
    'EventType API',
    () => {
        let api: EventTypeApi;
        const server = nock(BASE_URL).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
        // Skip Preflight CORS OPTION request
        nock(BASE_URL).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();

        beforeAll(() => api = EventTypeApi());

        it(
            'getEventList should return a list of EventTypes',
            async () => {
                const page = 1;
                const size = 10;
                const expectedResult: EventTypeList = {
                    results: [
                        {id: 'id1', name: 'name1', url: 'url1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
                        {id: 'id2', name: 'name2', url: 'url2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
                    ]
                };
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(200, expectedResult);

                const result = await api.getEventTypeList(page, size);

                expect(isErrorApi(result)).toBe(false);
                const response = result as ResponseData<EventTypeList>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
                expect(1).toBe(1);
            }
        );

        it(
            'getEventList should return a list of EventTypes without pagination info',
            async () => {
                const expectedResult: EventTypeList = {
                    results: [
                        {id: 'id1', name: 'name1', url: 'url1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
                        {id: 'id2', name: 'name2', url: 'url2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()},
                        {id: 'id2', name: 'name2', url: 'url2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}
                    ]
                };
                server.get(EVENT_TYPE_URL + `/?page=1&pageSize=10`).reply(200, expectedResult);

                const result = await api.getEventTypeList();

                expect(isErrorApi(result)).toBe(false);
                const response = result as ResponseData<EventTypeList>;
                expect(response.status).toBe(200);
                expect(response.data).toEqual(expectedResult);
                expect(1).toBe(1);
            }
        );

        it(
            'getEventList should return an ErrorAPI when it fails',
            async () => {
                const page = 1;
                const size = 'ten' as unknown as number;
                server.get(EVENT_TYPE_URL + `/?page=${page}&pageSize=${size}`).reply(400, {statusCode: 400, error: 'Bad Request', message: 'querystring.pageSize should be integer'});

                const result = await api.getEventTypeList(page, size);

                expect(isErrorApi(result)).toBe(true);
                const error = result as ErrorAPI;
                expect(error).toEqual({
                    status: 400,
                    error: 'Bad Request',
                    message: 'querystring.pageSize should be integer'
                });
            }
        );

        it(
            'deleteEvent should return one ErrorAPI when eventTypeId is not valid',
            async () => {
                const eventTypeId = 'invalidid';
                server.delete(EVENT_TYPE_URL + `/${eventTypeId}`).reply(500, {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'});

                const results = await api.deleteEventType(eventTypeId);

                expect(results.length).toBe(1);
                const result = results[0];
                expect(isErrorApi(result)).toBe(true);
                const error = result as ErrorAPI;
                expect(error).toEqual({
                    status: 500,
                    error: 'Internal Server Error',
                    message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                });
            }
        );

        it(
            'deleteEvent should return an ErrorAPI when eventTypeId is undefined',
            async () => {
                const eventTypeId = undefined as unknown as string;

                const results = await api.deleteEventType(eventTypeId);

                expect(results.length).toBe(1);

                const result = results[0];
                expect(isErrorApi(result)).toBe(true);
                const error = result as ErrorAPI;
                expect(error).toEqual({
                    status: 500,
                    error: 'Missing EventType id',
                    message: 'eventTypeIds is an invalid EventTypeId value or array'
                });
            }
        );

        it(
            'deleteEvent should return two ErrorAPI when eventTypeIds are not valid',
            async () => {
                const eventTypeIds = ['invalidid1', 'invalid2'];
                server.delete(EVENT_TYPE_URL + `/${eventTypeIds[0]}`).reply(500, {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'});
                server.delete(EVENT_TYPE_URL + `/${eventTypeIds[1]}`).reply(500, {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'});


                const results = await api.deleteEventType(eventTypeIds);

                expect(results.length).toBe(2);

                const result = results[0];
                expect(isErrorApi(result)).toBe(true);
                const error = result as ErrorAPI;
                expect(error).toEqual({
                    status: 500,
                    error: 'Internal Server Error',
                    message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                });

                const result2 = results[1];
                expect(isErrorApi(result2)).toBe(true);
                const error2 = result as ErrorAPI;
                expect(error2).toEqual({
                    status: 500,
                    error: 'Internal Server Error',
                    message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                });
            }
        );

        it(
            'deleteEvent should return one 204 empty response when eventTypeId is valid ',
            async () => {
                const eventTypeId = '5e8dffc9c906fefd9e7b2486';
                server.delete(EVENT_TYPE_URL + `/${eventTypeId}`).reply(204);

                const results = await api.deleteEventType(eventTypeId);

                expect(results.length).toBe(1);
                
                const result = results[0];
                expect(isErrorApi(result)).toBe(false);
                const response = result as ResponseEmptyData;
                expect(response.status).toBe(204);
                expect(response.data).toBe(undefined);
            }
        );

        it(
            'deleteEvent should return two 204 empty response when eventTypeIds are valid ',
            async () => {
                const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', '5e8dffd0c906fe54737b2487'];
                server.delete(EVENT_TYPE_URL + `/${eventTypeIds[0]}`).reply(204);
                server.delete(EVENT_TYPE_URL + `/${eventTypeIds[1]}`).reply(204);

                const results = await api.deleteEventType(eventTypeIds);

                expect(results.length).toBe(2);
                
                const result = results[0];
                expect(isErrorApi(result)).toBe(false);
                const response = result as ResponseEmptyData;
                expect(response.status).toBe(204);
                expect(response.data).toBe(undefined);
                
                const result2 = results[0];
                expect(isErrorApi(result2)).toBe(false);
                const response2 = result as ResponseEmptyData;
                expect(response2.status).toBe(204);
                expect(response2.data).toBe(undefined);
            }
        );

        it(
            'deleteEvent should return one 204 empty response and one ErrorAPI when eventTypeIds are valid e invalid ',
            async () => {
                const eventTypeIds = ['5e8dffc9c906fefd9e7b2486', 'invalidid'];
                server.delete(EVENT_TYPE_URL + `/${eventTypeIds[0]}`).reply(204);
                server.delete(EVENT_TYPE_URL + `/${eventTypeIds[1]}`).reply(500, {statusCode: 500, error: 'Internal Server Error', message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'});

                const results = await api.deleteEventType(eventTypeIds);

                expect(results.length).toBe(2);

                const result = results[0];
                expect(isErrorApi(result)).toBe(false);
                const response = result as ResponseEmptyData;
                expect(response.status).toBe(204);
                expect(response.data).toBe(undefined);

                const result2 = results[1];
                expect(isErrorApi(result2)).toBe(true);
                const error2 = result2 as ErrorAPI;
                expect(error2).toEqual({
                    status: 500,
                    error: 'Internal Server Error',
                    message: 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
                });
            }
        );
    }
);

/*
results: [
    {
    name: 'waterot-cieza',
    id: '5e2da76f66983926c343dbbf',
    url: 'https://cep.tribeca.ovh:443/events/5e2da76f66983926c343dbbf',
    createdAt: '2020-01-26T14:51:27.071Z',
    updatedAt: '2020-01-26T14:51:27.071Z'
    },
    {
    name: 'waterot-caravaca-2',
    id: '5e4aa7370c20ff3faab7c7d2',
    url: 'https://cep.tribeca.ovh:443/events/5e4aa7370c20ff3faab7c7d2',
    createdAt: '2020-02-17T14:46:15.530Z',
    updatedAt: '2020-02-17T14:46:15.530Z'
    }
]

Response {
status: 500,
error: 'Invalid request https://cep2.tribeca.ovh/admin/event-types?page=1&pageSize=10',
message: 'Network request failed'
}

Response {
status: 400,
error: 'Bad Request',
message: 'querystring.pageSize should be integer'
}

Response {
status: 201,
data: {
    name: 'testtesttest',
    id: '5e8dde21c906fe81e27b235c',
    url: 'https://cep.tribeca.ovh:443/events/5e8dde21c906fe81e27b235c',
    createdAt: '2020-04-08T14:22:25.311Z',
    updatedAt: '2020-04-08T14:22:25.311Z'
}
}

*/