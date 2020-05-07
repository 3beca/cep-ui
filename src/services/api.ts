import {
    fetchApi,
    APIRequestInfo,
    APIResponseData,
    APIError,
    isAPIError
} from '../utils/fetch-api';

export type ServiceList<T> = {
    results: T[];
    next?: string | undefined;
    prev?: string | undefined;
};
export type ServiceError = {
    statusCode: number,
    error: string,
    message: string
};
export type Entity = {
    id: string;
};
export type WithDate = {
    createdAt: string;
    updatedAt: string;
};
export type ServiceDeleted = {
    state: 'DELETED'|'REJECTED';
    error?: ServiceError;
} & Entity;
export type EventType = {
    name: string;
    url: string;
} & Entity & WithDate;
export type EventTypeList = ServiceList<EventType>;
export type EventTypeError = ServiceError;
export type EventTypeDeleted = ServiceDeleted;

export type Target = {
    name: string;
    url: string;
} & Entity & WithDate;
export type TargetList = ServiceList<Target>;
export type TargetError = ServiceError;
export type TargetDeleted = ServiceDeleted;

export type RuleTypes = 'sliding'|'hopping'|'tumbling'|'none';
export type Rule = {
    name: string;
    type: RuleTypes;
    targetId: string;
    eventTypeId: string;
    skipOnConsecutivesMatches?: boolean;
    filters: any;
} & Entity & WithDate;
export type RuleList = ServiceList<Rule>;
export type RuleError = ServiceError;
export type RuleDeleted = ServiceDeleted;

export type EventLog = {
    eventTypeId: string;
    eventTypeName: string;
    payload: {[key: string]: any;};
    requestId: string;
    createdAt: string;
    rules: {
        id: string;
        name: string;
        targetId: string;
    }[];
    targets: {
        id: string;
        name: string;
        response: {
            statusCode: number;
            body: {[key: string]: any;};
        };
    }[];
} & Entity;

export const getListRequest = (baseURL: string, config: APIRequestInfo) => async <T>(path: string, page: number = 1, size: number = 10, filter: string = ''): Promise<APIResponseData<ServiceList<T>>|APIError<ServiceError>> => {
    const url = `${baseURL}${path}/?page=${page}&pageSize=${size}${filter ? `&search=${filter}` : ''}`;
    return fetchApi<undefined, ServiceList<T>, ServiceError>(url, {...config, method: 'GET'});
};
export const deleteRequest = (baseURL: string, config: APIRequestInfo) => async (path: string, eventTypeIds: string|string[]): Promise<(APIResponseData<ServiceDeleted[]>|APIError<ServiceError>)> => {
    const eventTypesArray = ((Array.isArray(eventTypeIds)) ? eventTypeIds : [eventTypeIds]).filter(id => !!id);

    if(!eventTypeIds || eventTypesArray.length < 1) {
        return {
            errorCode: 500,
            errorMessage: '',
            error: {
                statusCode: 500,
                error: 'Missing id',
                message: 'id is an invalid id value or array'
            }
        };
    }
    const requests = [];
    for (const eventTypeId of eventTypesArray) {
        const url = `${baseURL}${path}/${eventTypeId}`;
        requests.push(fetchApi<undefined, undefined, ServiceError>(url, {...config, method: 'DELETE'}));
    }
    const responses = await Promise.all(requests);
    const data: ServiceDeleted[] = responses.map((response, idx) => {
        const deletedResponse: ServiceDeleted = {
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
export type Api = {
    getListRequest<T>(path: string, page?: number, size?: number, filter?: string): Promise<APIResponseData<ServiceList<T>>|APIError<ServiceError>>;
    deleteRequest(path: string, ids: string|string[]): Promise<(APIResponseData<ServiceDeleted[]>|APIError<ServiceError>)>;
};
export const buildApiService = (server: string): Api => {
    const config: APIRequestInfo = {
        method: 'GET',
        headers: {}
    };
    return {
        getListRequest: getListRequest(server, config),
        deleteRequest: deleteRequest(server, config)
    };
};
