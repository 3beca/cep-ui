import nock from 'nock';
import {
    fetchData,
    RequestGetData,
    RequestData,
    isErrorApi,
    ResponseEmptyData,
    ResponseData,
    ErrorAPI
} from './fetch-data';

describe(
    'FetchData should',
    () => {
        const url = 'https://testserver';
        const server = nock(url).defaultReplyHeaders({ 'access-control-allow-origin': '*' });
        // Skip Preflight CORS OPTION request
        nock(url).intercept(/./, 'OPTIONS').reply(200, undefined, { 'access-control-allow-origin': '*' }).persist();

        it(
            'return an ResponseData when GET request works fine with empty response',
            async () => {
                server.get('/okget').reply(200);
                const req: RequestGetData = {
                    url: 'https://testserver/okget',
                    method: 'GET',
                    headers: {'content-type': 'application/json'}
                }; 

                const response = await fetchData<undefined, undefined>(req);

                expect(isErrorApi(response)).toBe(false);
                expect(response.status).toBe(200);
                const data = response as unknown as ResponseEmptyData;
                expect(data.data).toBe(undefined);
            }
        );

        it(
            'return an ResponseData when GET request works fine with json response',
            async () => {
                server.get('/okget').reply(200, {test: 'ok'});
                const req: RequestGetData = {
                    url: 'https://testserver/okget',
                    method: 'GET',
                    headers: {'content-type': 'application/json'}
                }; 

                const response = await fetchData<undefined, undefined>(req);

                expect(isErrorApi(response)).toBe(false);
                expect(response.status).toBe(200);
                const data = response as unknown as ResponseEmptyData;
                expect(data.data).toEqual({test: 'ok'});
            }
        );

        it(
            'return an ResponseData when POST request works fine',
            async () => {
                server.post('/okpost', {}).reply(200, {test: 'ok'});
                const req: RequestData<{}> = {
                    url: 'https://testserver/okpost',
                    method: 'POST',
                    headers: {'content-type': 'application/json'},
                    body: {}
                }; 

                const response = await fetchData<{}, {}>(req);

                expect(isErrorApi(response)).toBe(false);
                expect(response.status).toBe(200);
                const data = response as unknown as ResponseData<{}>;
                expect(data.data).toEqual({test: 'ok'});
            }
        );

        it(
            'return an ResponseData when PUT request works fine',
            async () => {
                server.put('/okput', {}).reply(200, {test: 'ok'});
                const req: RequestData<{}> = {
                    url: 'https://testserver/okput',
                    method: 'PUT',
                    headers: {'content-type': 'application/json'},
                    body: {}
                }; 

                const response = await fetchData<{}, {}>(req);
                expect(isErrorApi(response)).toBe(false);
                expect(response.status).toBe(200);
                const data = response as unknown as ResponseData<{}>;
                expect(data.data).toEqual({test: 'ok'});
            }
        );

        it(
            'return an ResponseData when DELETE request works fine',
            async () => {
                server.delete('/okdelete', {}).reply(200, {test: 'ok'});
                const req: RequestData<{}> = {
                    url: 'https://testserver/okdelete',
                    method: 'DELETE',
                    headers: {'content-type': 'application/json'},
                    body: {}
                }; 

                const response = await fetchData<{}, {}>(req);
                expect(isErrorApi(response)).toBe(false);
                expect(response.status).toBe(200);
                const data = response as unknown as ResponseData<{}>;
                expect(data.data).toEqual({test: 'ok'});
            }
        );

        it(
            'return an ErrorAPI when request return 400',
            async () => {
                server.get('/error400').reply(400, {status: 400, error: 'Error400', message: 'Message Error 400'});
                const req: RequestGetData = {
                    url: 'https://testserver/error400',
                    method: 'GET',
                    headers: {'content-type': 'application/json'}
                }; 

                const response = await fetchData<{}, {}>(req);
                expect(isErrorApi(response)).toBe(true);
                expect(response.status).toBe(400);
                const data = response as unknown as ErrorAPI;
                expect(data).toEqual({
                    status: 400,
                    error: 'Error400',
                    message: 'Message Error 400'
                });
            }
        );

        it(
            'return an ErrorAPI when request return 500',
            async () => {
                server.get('/error400').reply(500, {status: 500, error: 'Error500', message: 'Message Error 500'});
                const req: RequestGetData = {
                    url: 'https://testserver/error400',
                    method: 'GET',
                    headers: {'content-type': 'application/json'}
                }; 

                const response = await fetchData<{}, {}>(req);
                expect(isErrorApi(response)).toBe(true);
                expect(response.status).toBe(500);
                const data = response as unknown as ErrorAPI;
                expect(data).toEqual({
                    status: 500,
                    error: 'Error500',
                    message: 'Message Error 500'
                });
            }
        );

        it(
            'return an ErrorAPI when server do not respond',
            async () => {
                // server.get('/unregisterendpoint').reply(500, {status: 500, error: 'Error500', message: 'Message Error 500'});
                const req: RequestGetData = {
                    url: 'https://testserver2/unregisterendpoint',
                    method: 'GET',
                    headers: {'content-type': 'application/json'}
                }; 

                const response = await fetchData<{}, {}>(req);
                expect(isErrorApi(response)).toBe(true);
                expect(response.status).toBe(500);
                const data = response as unknown as ErrorAPI;
                expect(data).toEqual({
                    status: 500,
                    error: 'Invalid request https://testserver2/unregisterendpoint',
                    message: 'Network request failed'
                });
            }
        );
    }
);