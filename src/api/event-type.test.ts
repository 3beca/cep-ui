import {
    EventTypeApi,
    EventTypeList,
    isErrorApi,
    EventType
} from './event-type';
import { ResponseData, ErrorAPI, ResponseEmptyData } from './fetch-data';

describe(
    'EventType API',
    () => {
        let api: EventTypeApi;
        // const url = 'https://testserver';
        // const server = nock(url).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
        // // Skip Preflight CORS OPTION request
        // nock(url).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();

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

                const result = await api.getEventTypeList(page, size);

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
            'deleteEvent should return 204 when it works',
            async () => {
                const eventType = {id: '5e8dffc9c906fefd9e7b2486'} as EventType;

                const result = await api.deleteEventType(eventType);

                expect(isErrorApi(result)).toBe(false);
                const response = result as ResponseEmptyData;
                expect(response.status).toBe(204);
                expect(response.data).toBe(undefined);
            }
        );

        it(
            'deleteEvent should return 204 when it works',
            async () => {
                const eventType = {id: 'invalidid'} as EventType;

                const result = await api.deleteEventType(eventType);

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
            'deleteEvent should return 204 when it works',
            async () => {
                const eventType = {} as EventType;

                const result = await api.deleteEventType(eventType);

                expect(isErrorApi(result)).toBe(true);
                const error = result as ErrorAPI;
                expect(error).toEqual({
                    status: 500,
                    error: 'Missing EventType id',
                    message: expect.stringContaining('is an invalid EventType')
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