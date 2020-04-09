import {
    fetchData,
    RequestInfo,
    ResponseData,
    ErrorAPI,
    ResponseEmptyData
} from './fetch-data';
import { BASE_URL } from './config';
export * from './fetch-data';

export const EventTypeList = '/admin/event-types';

export type EventType = {
    name: string;
    id: string;
    url: string;
    createdAt: string;
    updatedAt: string;
};
export type EventTypeList = {
    results: EventType[];
    next?: string | undefined;
    prev?: string | undefined;
};
export const getEventTypeList = (config: RequestInfo) => async (page: number = 1, size: number = 10): Promise<ResponseData<EventTypeList>|ErrorAPI> => {
    const url = `${config.url}${EventTypeList}/?page=${page}&pageSize=${size}`;
    console.log('getEventTypeList URL', url);
    return await fetchData<undefined, EventTypeList>({...config, url, method: 'GET'});
};
export const deleteEventType = (config: RequestInfo) => async (eventType: EventType): Promise<ResponseEmptyData|ErrorAPI> => {
    if(!eventType || typeof eventType.id !== 'string') {
        return {
            status: 500,
            error: 'Missing EventType id',
            message: `${eventType} is an invalid EventType`
        };
    }
    const url = `${config.url}${EventTypeList}/${eventType.id}`;
    console.log('deleteEventType URL', url);
    return await fetchData<undefined, undefined>({...config, url, method: 'DELETE', headers: {}});
};
export type EventTypeApi = {
    getEventTypeList(page: number, size: number): Promise<ResponseData<EventTypeList>|ErrorAPI>;
    deleteEventType(eventType: EventType): Promise<ResponseEmptyData|ErrorAPI>;
};
export const EventTypeApi = (): EventTypeApi => {
    const config: RequestInfo = {
        url: BASE_URL,
        method: 'GET',
        headers: {'content-type': 'application/json'}
    };
    return {
        getEventTypeList: getEventTypeList(config),
        deleteEventType: deleteEventType(config)
    };
};
