import React from 'react';
import { APIError, APIResponseData, isAPIError } from './fetch-api';

export type ApiActionStart = { type: 'START' };
export type ApiActionCancel = { type: 'CANCEL' };
export type ApiActionRestart = { type: 'RESTART' };
export type ApiActionSuccess<R> = { type: 'SUCCESS'; data: APIResponseData<R> };
export type ApiActionError<E> = { type: 'ERROR'; error: APIError<E> };
export type ApiActions<R, E> = ApiActionStart | ApiActionCancel | ApiActionSuccess<R> | ApiActionError<E> | ApiActionRestart;
export type ApiState<R, E> = {
    status: 'IDLE' | 'PENDING' | 'RESOLVED' | 'REJECTED';
    data: APIResponseData<R> | undefined;
    error: APIError<E> | undefined;
};
export const neverForgetAnAction = (action: never): never => {
    throw new Error(`Forget implement action ${action}`);
};
export type ApiReducer<R, E> = (state: ApiState<R, E>, action: ApiActions<R, E>) => ApiState<R, E>;
export const apiReducer = <R, E>(state: ApiState<R, E>, action: ApiActions<R, E>): ApiState<R, E> => {
    switch (action.type) {
        case 'START': {
            return {
                ...state,
                status: 'PENDING'
            };
        }
        case 'CANCEL': {
            return {
                ...state,
                status: 'IDLE'
            };
        }
        case 'SUCCESS': {
            return {
                ...state,
                error: undefined,
                data: action.data,
                status: 'RESOLVED'
            };
        }
        case 'ERROR': {
            return {
                ...state,
                error: action.error,
                status: 'REJECTED'
            };
        }
        case 'RESTART': {
            return {
                ...state,
                error: undefined,
                data: undefined,
                status: 'IDLE'
            };
        }
        default: {
            return neverForgetAnAction(action);
        }
    }
};
export type APIFetchQuery<R, E> = () => Promise<APIResponseData<R> | APIError<E> | null | undefined> | undefined | null;
export const requester = async <R, E>(query: APIFetchQuery<R, E>, dispatch: React.Dispatch<ApiActions<R, E>>) => {
    const promiseResponse = query();
    if (!promiseResponse) {
        return null;
    }
    dispatch({ type: 'START' });
    const response = await promiseResponse;
    if (!response) {
        dispatch({ type: 'CANCEL' });
    } else if (isAPIError(response)) {
        dispatch({ type: 'ERROR', error: response });
    } else {
        dispatch({ type: 'SUCCESS', data: response });
    }
};
export const useFetchApi = <R, E>(query: APIFetchQuery<R, E>) => {
    const [response, dispatch] = React.useReducer<ApiReducer<R, E>>(apiReducer, { status: 'IDLE', data: undefined, error: undefined });
    const request = React.useCallback(() => {
        requester(query, dispatch);
    }, [query]);
    const reset = React.useCallback(() => dispatch({ type: 'RESTART' }), []);
    const isLoading = response.status === 'PENDING';
    return {
        isLoading,
        response: response.data,
        error: response.error,
        request,
        reset
    };
};

export default useFetchApi;
