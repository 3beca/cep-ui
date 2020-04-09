import {
    fetchData,
    RequestInfo,
    ResponseData,
    ErrorAPI,
    ResponseEmptyData
} from './fetch-data';
import {
    BASE_URL,
    EVENT_TYPE_URL
} from './config';
export * from './fetch-data';

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
    const url = `${config.url}${EVENT_TYPE_URL}/?page=${page}&pageSize=${size}`;
    return await fetchData<undefined, EventTypeList>({...config, url, method: 'GET'});
};
export const deleteEventType = (config: RequestInfo) => async (eventTypeIds: string|string[]): Promise<(ResponseEmptyData|ErrorAPI)[]> => {
    const eventTypesArray = (Array.isArray(eventTypeIds)) ? eventTypeIds : [eventTypeIds];
    if(!eventTypeIds || eventTypesArray.length < 1) {
        return [{
            status: 500,
            error: 'Missing EventType id',
            message: 'eventTypeIds is an invalid EventTypeId value or array'
        }];
    }
    const requests = [];
    for (const eventTypeId of eventTypesArray) {
        const url = `${config.url}${EVENT_TYPE_URL}/${eventTypeId}`;
        requests.push(fetchData<undefined, undefined>({...config, url, method: 'DELETE'}));
    }
    return Promise.all(requests);
};
export type EventTypeApi = {
    getEventTypeList(page?: number, size?: number): Promise<ResponseData<EventTypeList>|ErrorAPI>;
    deleteEventType(eventTypeIds: string|string[]): Promise<(ResponseEmptyData|ErrorAPI)[]>;
};
export const EventTypeApi = (): EventTypeApi => {
    const config: RequestInfo = {
        url: BASE_URL,
        method: 'GET',
        headers: {}
    };
    return {
        getEventTypeList: getEventTypeList(config),
        deleteEventType: deleteEventType(config)
    };
};
