import {
    fetchApi,
    APIRequestInfo,
    APIResponseData,
    APIError,
    isAPIError,
    APIBody
} from '../../utils/fetch-api';
import {
    ServiceList,
    ServiceError,
    ServiceDeleted,
} from './models';
export * from './models';

export const getListRequest = (baseURL: string, config: APIRequestInfo) => async <T>(path: string, page: number = 1, size: number = 10, filter: string = ''): Promise<APIResponseData<ServiceList<T>>|APIError<ServiceError>> => {
    const url = `${baseURL}${path}/?page=${page}&pageSize=${size}${filter ? `&search=${filter}` : ''}`;
    return fetchApi<undefined, ServiceList<T>, ServiceError>(url, {...config, method: 'GET'});
};
export const deleteRequest = (baseURL: string, config: APIRequestInfo) => async (path: string, entityIds: string|string[]): Promise<(APIResponseData<ServiceDeleted[]>|APIError<ServiceError>)> => {
    const entityArray = ((Array.isArray(entityIds)) ? entityIds : [entityIds]).filter(id => !!id);

    if(!entityIds || entityArray.length < 1) {
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
    for (const entityId of entityArray) {
        const url = `${baseURL}${path}/${entityId}`;
        requests.push(fetchApi<undefined, undefined, ServiceError>(url, {...config, method: 'DELETE'}));
    }
    const responses = await Promise.all(requests);
    const data: ServiceDeleted[] = responses.map((response, idx) => {
        const deletedResponse: ServiceDeleted = {
            id: entityArray[idx],
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
export const createRequest = (baseURL: string, config: APIRequestInfo) => async <T extends APIBody>(path: string, body: Partial<T>): Promise<APIResponseData<T>|APIError<ServiceError>> => {
    const url = `${baseURL}${path}`;
    return fetchApi<Partial<T>, T, ServiceError>(url, {...config, method: 'POST', headers: {...config.headers, 'content-type': 'application/json'}, body});
};
export type Api = {
    getListRequest<T>(path: string, page?: number, size?: number, filter?: string): Promise<APIResponseData<ServiceList<T>>|APIError<ServiceError>>;
    deleteRequest(path: string, ids: string|string[]): Promise<(APIResponseData<ServiceDeleted[]>|APIError<ServiceError>)>;
    createRequest<T extends APIBody>(path: string, body: Partial<T>): Promise<APIResponseData<T>|APIError<ServiceError>>;
};
export const buildApiService = (server: string): Api => {
    const config: APIRequestInfo = {
        method: 'GET',
        headers: {}
    };
    return {
        getListRequest: getListRequest(server, config),
        deleteRequest: deleteRequest(server, config),
        createRequest: createRequest(server, config)
    };
};
