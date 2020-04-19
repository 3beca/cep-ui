import {
    fetchApi,
    APIRequestInfo,
    APIResponseData,
    APIError,
    isAPIError
} from '../fetch-api';
import {
    BASE_URL,
    EVENT_TYPE_URL
} from './config';

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
export type EventTypeError = {
    statusCode: number,
    error: string,
    message: string
};
export type EventTypeDeleted = {
    id: string;
    state: 'DELETED'|'REJECTED';
    error?: EventTypeError;
};
export const getEventTypeList = (baseURL: string, config: APIRequestInfo) => async (page: number = 1, size: number = 10): Promise<APIResponseData<EventTypeList>|APIError<EventTypeError>> => {
    const url = `${baseURL}${EVENT_TYPE_URL}/?page=${page}&pageSize=${size}`;
    return fetchApi<undefined, EventTypeList, EventTypeError>(url, {...config, method: 'GET'});
};
export const deleteEventType = (baseURL: string, config: APIRequestInfo) => async (eventTypeIds: string|string[]): Promise<(APIResponseData<EventTypeDeleted[]>|APIError<EventTypeError>)> => {
    const eventTypesArray = (Array.isArray(eventTypeIds)) ? eventTypeIds : [eventTypeIds];
    if(!eventTypeIds || eventTypesArray.length < 1) {
        return {
            errorCode: 500,
            errorMessage: '',
            error: {
                statusCode: 500,
                error: 'Missing EventType id',
                message: 'eventTypeIds is an invalid EventTypeId value or array'
            }
        };
    }
    const requests = [];
    for (const eventTypeId of eventTypesArray) {
        const url = `${baseURL}${EVENT_TYPE_URL}/${eventTypeId}`;
        requests.push(fetchApi<undefined, undefined, EventTypeError>(url, {...config, method: 'DELETE'}));
    }
    const responses = await Promise.all(requests);
    const data: EventTypeDeleted[] = responses.map((response, idx) => {
        const deletedResponse: EventTypeDeleted = {
            id: eventTypesArray[idx],
            state: 'DELETED'
        };
        if(isAPIError(response)) {
            deletedResponse.state = 'REJECTED';
            deletedResponse.error = response.error;
        }
        return deletedResponse;
    });
    return {
        status: 200,
        data
    };
};
export type EventTypeApi = {
    getEventTypeList(page?: number, size?: number): Promise<APIResponseData<EventTypeList>|APIError<EventTypeError>>;
    deleteEventType(eventTypeIds: string|string[]): Promise<(APIResponseData<EventTypeDeleted[]>|APIError<EventTypeError>)>;
};
export const EventTypeApi = (): EventTypeApi => {
    const config: APIRequestInfo = {
        method: 'GET',
        headers: {}
    };
    return {
        getEventTypeList: getEventTypeList(BASE_URL, config),
        deleteEventType: deleteEventType(BASE_URL, config)
    };
};
