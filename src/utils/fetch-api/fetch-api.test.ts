import { setupNock } from '../../test-utils';
import {
    fetchApi,
    APIRequestGetData,
    APIRequestData,
    isAPIError,
    APIResponseEmptyData,
    APIResponseData,
    APIError
} from './fetch-api';

describe('fetchApi should', () => {
    const url = 'https://testserver';
    const server = setupNock(url);

    it('should return APIError when RequestInfo is invalid', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const url = (undefined as unknown) as string;
        const req: APIRequestGetData = ({} as unknown) as APIRequestGetData;

        const response = await fetchApi<undefined, undefined, undefined>(
            url,
            req
        );

        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<undefined>;
        expect(error.errorCode).toBe(500);
        expect(error.errorMessage).toEqual(
            'Error in query Network request failed: undefined'
        );
        expect(error.error).toBe(undefined);
        expect(console.error).toHaveBeenCalledTimes(1);
        (console.error as jest.Mock).mockRestore();
    });

    it('should return APIError when RequestInfo is a invalid string', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const url = 'invalidurl';
        const req: APIRequestGetData = ({} as unknown) as APIRequestGetData;

        const response = await fetchApi<undefined, undefined, undefined>(
            url,
            req
        );

        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<undefined>;
        expect(error.errorCode).toBe(500);
        expect(error.errorMessage).toEqual(
            'Error in query Network request failed: invalidurl'
        );
        expect(error.error).toBe(undefined);
        expect(console.error).toHaveBeenCalledTimes(1);
        (console.error as jest.Mock).mockRestore();
    });

    it('should use GET method when RequestInfo has not method', async () => {
        server.get('/oknomethod').reply(200);
        const url = 'https://testserver/oknomethod';
        const req: APIRequestGetData = ({} as unknown) as APIRequestGetData;

        const response = await fetchApi<undefined, undefined, undefined>(
            url,
            req
        );

        expect(isAPIError(response)).toBe(false);
        const data = (response as unknown) as APIResponseEmptyData;
        expect(data.status).toBe(200);
        expect(data.data).toBe(undefined);
    });

    it('return an APIResponseData when GET request works fine with empty response', async () => {
        server.get('/okget').reply(200);
        const url = 'https://testserver/okget';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<undefined, undefined, undefined>(
            url,
            req
        );

        expect(isAPIError(response)).toBe(false);
        const data = (response as unknown) as APIResponseEmptyData;
        expect(data.status).toBe(200);
        expect(data.data).toBe(undefined);
    });

    it('return an APIResponseData when GET request works fine with json response', async () => {
        server.get('/okget').reply(200, { test: 'ok' });
        const url = 'https://testserver/okget';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<undefined, undefined, undefined>(
            url,
            req
        );

        expect(isAPIError(response)).toBe(false);
        const data = (response as unknown) as APIResponseData<{ test: string }>;
        expect(data.status).toBe(200);
        expect(data.data).toEqual({ test: 'ok' });
    });

    it('return an APIResponseData when POST request works fine', async () => {
        server.post('/okpost', {}).reply(200, { test: 'ok' });
        const url = 'https://testserver/okpost';
        const req: APIRequestData<{}> = {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: {}
        };

        const response = await fetchApi<{}, {}, undefined>(url, req);

        expect(isAPIError(response)).toBe(false);
        const data = (response as unknown) as APIResponseData<{}>;
        expect(data.status).toBe(200);
        expect(data.data).toEqual({ test: 'ok' });
    });

    it('return an APIResponseData when PUT request works fine', async () => {
        server.put('/okput', {}).reply(200, { test: 'ok' });
        const url = 'https://testserver/okput';
        const req: APIRequestData<{}> = {
            method: 'PUT',
            headers: { 'content-type': 'application/json' },
            body: {}
        };

        const response = await fetchApi<{}, {}, undefined>(url, req);
        expect(isAPIError(response)).toBe(false);
        const data = (response as unknown) as APIResponseData<{}>;
        expect(data.status).toBe(200);
        expect(data.data).toEqual({ test: 'ok' });
    });

    it('return an APIResponseData when DELETE request works fine', async () => {
        server.delete('/okdelete', {}).reply(200, { test: 'ok' });
        const url = 'https://testserver/okdelete';
        const req: APIRequestData<{}> = {
            method: 'DELETE',
            headers: { 'content-type': 'application/json' },
            body: {}
        };

        const response = await fetchApi<{}, {}, undefined>(url, req);
        expect(isAPIError(response)).toBe(false);
        const data = (response as unknown) as APIResponseData<{}>;
        expect(data.status).toBe(200);
        expect(data.data).toEqual({ test: 'ok' });
    });

    it('return an APIError when request return 400', async () => {
        const serverResponse = {
            status: 400,
            error: 'Error400',
            message: 'Message Error 400'
        };
        server.get('/error400').reply(400, serverResponse);
        const url = 'https://testserver/error400';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<{}, {}, typeof serverResponse>(
            url,
            req
        );
        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<typeof serverResponse>;
        expect(error.errorCode).toBe(400);
        expect(error.errorMessage).toEqual(
            'Error from https://testserver/error400'
        );
        expect(error.error).toEqual({
            status: 400,
            error: 'Error400',
            message: 'Message Error 400'
        });
    });

    it('return an APIError when request return 400 without body', async () => {
        server.get('/error400').reply(400);
        const url = 'https://testserver/error400';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<{}, {}, undefined>(url, req);

        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<undefined>;
        expect(error.errorCode).toBe(400);
        expect(error.errorMessage).toEqual(
            'Error from https://testserver/error400'
        );
        expect(error.error).toBe(undefined);
    });

    it('return an APIError when request return 500 with body', async () => {
        const serverResponse = {
            status: 500,
            error: 'Error500',
            message: 'Message Error 500'
        };
        server.get('/error500').reply(500, serverResponse);
        const url = 'https://testserver/error500';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<{}, {}, typeof serverResponse>(
            url,
            req
        );
        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<typeof serverResponse>;
        expect(error.errorCode).toBe(500);
        expect(error.errorMessage).toEqual(
            'Error from https://testserver/error500'
        );
        expect(error.error).toEqual({
            status: 500,
            error: 'Error500',
            message: 'Message Error 500'
        });
    });

    it('return an APIError when request return 500 without body', async () => {
        server.get('/error500').reply(500);
        const url = 'https://testserver/error500';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<{}, {}, undefined>(url, req);
        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<undefined>;
        expect(error.errorCode).toBe(500);
        expect(error.errorMessage).toEqual(
            'Error from https://testserver/error500'
        );
        expect(error.error).toEqual(undefined);
    });

    it('return an APIError when server do not respond', async () => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        const url = 'https://testserver2/unregisterendpoint';
        const req: APIRequestGetData = {
            method: 'GET',
            headers: { 'content-type': 'application/json' }
        };

        const response = await fetchApi<{}, {}, undefined>(url, req);
        expect(isAPIError(response)).toBe(true);
        const error = (response as unknown) as APIError<undefined>;
        expect(error.errorCode).toBe(500);
        expect(error.errorMessage).toEqual(
            'Error in query Network request failed: https://testserver2/unregisterendpoint'
        );
        expect(error.error).toBe(undefined);
        expect(console.error).toHaveBeenCalledTimes(1);
        (console.error as jest.Mock).mockRestore();
    });
});
