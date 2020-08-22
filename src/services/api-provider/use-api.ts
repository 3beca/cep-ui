import React from 'react';
import {
    useFetchApi,
    APIError,
    APIResponseData
} from '../../utils/fetch-api';
import {
    ServiceList,
    Entity,
    GetListRequestOptions,
} from '../api';
import {
    EVENT_TYPES_URL,
    TARGETS_URL,
    RULES_URL,
    EVENTS_URL,
    VERSION_URL
} from '../config';

const ENTITIES = [EVENT_TYPES_URL, TARGETS_URL, RULES_URL, EVENTS_URL, VERSION_URL];
export enum ENTITY {
    EVENT_TYPES = 0,
    TARGETS = 1,
    RULES = 2,
    EVENTS_LOG = 3,
    VERSION = 4
};


export type useGetListApi<R, E> = {
    request: () => void;
    isLoading: boolean;
    response: APIResponseData<ServiceList<R>> | undefined;
    error: APIError<E> | undefined;
};
export const useGetList = <T extends Entity>(entity: ENTITY, page: number, size: number, filter: string|GetListRequestOptions = '', runOnRender: boolean = true) => {
    const prevRequest = React.useRef< () => void>();
    const req = React.useCallback(
        () => api.getListRequest<T>(ENTITIES[entity], page, size, filter),
        [page, size, filter, entity],
    );
    const {request, ...state} = useFetchApi(req);
    React.useEffect(
        () => {
            if (runOnRender && (prevRequest.current !== request)) {
                request();
                prevRequest.current = request;
            }
        },
        [request, runOnRender, prevRequest]
    );
    return {...state, request};
};

export const useDelete = (entity: ENTITY, eventIds: string[]|string) => {
    const req = React.useCallback(
        () => api.deleteRequest(ENTITIES[entity], eventIds),
        [eventIds, entity]
    );
    return useFetchApi(req);
};

export const useCreate = <T extends Entity>(entity: ENTITY, body: Partial<T>, runOnRender: boolean = false) => {
    const req = React.useCallback(
        () => api.createRequest<T>(ENTITIES[entity], body),
        [body, entity]
    );
    const {request, ...state} = useFetchApi(req);
    React.useEffect(
        () => {
            runOnRender && request();
        },
        [request, runOnRender]
    );
    return {...state, request};
};