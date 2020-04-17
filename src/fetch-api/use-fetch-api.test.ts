import {renderHook, act} from '@testing-library/react-hooks'
import { fetchApi } from './fetch-api';
import { useFetchApi, APIFetchQuery } from './use-fetch-api';
import { nextTick } from 'process';
import {setupNock} from '../test-utils';

describe(
    'useFetchData',
    () => {
        const url = 'https://use-fetch-api';
        const server = setupNock(url);

        it(
            'should receive a valid response and a error and keep last good response',
            async () => {
                const req: APIFetchQuery<{response: string}, {message: string}> = () => fetchApi<undefined, {response: string}, {message: string}>('https://use-fetch-api/hooktest', { method: 'GET' });
                const {result, waitForNextUpdate} = renderHook(() => useFetchApi(req));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                // Run query
                server.get('/hooktest').reply(200, {response: 'Query received'});
                act(() => {
                    result.current.request();
                });

                // Start Query
                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                // Wait to response Query
                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toEqual({status: 200, data: {response: 'Query received'}});

                // Run query
                server.get('/hooktest').reply(400, {message: 'Error received'});
                act(() => {
                    result.current.request();
                });

                // Start Query
                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toEqual({status: 200, data: {response: 'Query received'}});

                // Wait to response Query
                await waitForNextUpdate();

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toEqual({
                    errorCode: 400,
                    errorMessage: 'Error from https://use-fetch-api/hooktest',
                    error: { message: 'Error received'}
                });
                expect(result.current.response).toEqual({status: 200, data: {response: 'Query received'}});
            }
        );

        it(
            'should return an error when query fails to fetch api',
            async () => {
                const req: APIFetchQuery<{response: string}, {message: string}> = () => fetchApi<undefined, {response: string}, {message: string}>('https://unknownserver', { method: 'GET' })
                const {result, waitForNextUpdate} = renderHook(() => useFetchApi(req));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                jest.spyOn(console, 'error').mockImplementation(() => {});
                act(() => {
                    result.current.request();
                });

                // Start Query
                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                 // Wait to response Query
                 await waitForNextUpdate();

                 expect(result.current.isLoading).toBe(false);
                 expect(result.current.error).toEqual({
                    errorCode: 500,
                    errorMessage: 'Error in query Network request failed: https://unknownserver'
                });
                 expect(result.current.response).toBe(undefined);
                 expect(console.error).toHaveBeenCalledTimes(1);
                (console.error as jest.Mock).mockRestore();
            }
        );

        it(
            'should not update when receive a query function that return undefined',
            async () => {
                const req: APIFetchQuery<{response: string}, {message: string}> = () => undefined;
                const {result} = renderHook(() => useFetchApi(req));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                act(() => {
                    result.current.request();
                });

                // Start Query
                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);
            }
        );

        it(
            'should not update when receive a query function that return null',
            async () => {
                const req: APIFetchQuery<{response: string}, {message: string}> = () => null;
                const {result} = renderHook(() => useFetchApi(req));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                act(() => {
                    result.current.request();
                });

                // Start Query
                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);
            }
        );

        const fakeFetch = async () => {
            await new Promise((resolve) => nextTick(resolve));
            return undefined;
        };

        it(
            'should update to same state when receive a query thar resolve in undefined',
            async () => {
                const req: APIFetchQuery<{response: string}, {message: string}> = () => fakeFetch();
                const {result, waitForNextUpdate} = renderHook(() => useFetchApi(req));

                expect(result.current.isLoading).toBe(false);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                act(() => {
                    result.current.request();
                });

                // Start Query
                expect(result.current.isLoading).toBe(true);
                expect(result.current.error).toBe(undefined);
                expect(result.current.response).toBe(undefined);

                 // Wait to response Query
                 await waitForNextUpdate();

                 expect(result.current.isLoading).toBe(false);
                 expect(result.current.error).toBe(undefined);
                 expect(result.current.response).toEqual(undefined);
            }
        );
    }
);
