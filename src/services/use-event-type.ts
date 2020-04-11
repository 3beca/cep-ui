import React from 'react';
import { useFetchApi } from '../fetch-api';
import {
    EventTypeApi
} from './event-type';

const api = EventTypeApi();

export const useGetEventList = (page: number, size: number) => {
    const req = React.useCallback(
        () => api.getEventTypeList(page, size),
        [page, size],
    );
    const {request, ...state} = useFetchApi(req);
    React.useEffect(
        () => {
            request();
        },
        [request]
    );
    return {...state, request};
};