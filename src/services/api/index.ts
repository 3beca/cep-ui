import QS from 'query-string';
import { fetchApi, APIRequestInfo, APIResponseData, APIError, isAPIError, APIBody } from '../../utils/fetch-api';
import { ServiceList, ServiceError, ServiceDeleted } from './models';
export * from './models';

export type GetListRequestOptions = { [key: string]: string } | string;
export const parseFilters = (filters: GetListRequestOptions) =>
    !filters ? null : QS.stringify(typeof filters === 'string' ? { search: filters } : filters);
export const getListRequest = (baseURL: string, config: APIRequestInfo) => async <T>(
    path: string,
    page: number = 1,
    size: number = 10,
    filters: GetListRequestOptions = ''
): Promise<APIResponseData<ServiceList<T>> | APIError<ServiceError>> => {
    const filterString = parseFilters(filters);
    const url = `${baseURL}${path}/?page=${page}&pageSize=${size}${!!filterString ? `&${filterString}` : ''}`;
    return fetchApi<undefined, ServiceList<T>, ServiceError>(url, {
        ...config,
        method: 'GET'
    });
};
export const deleteRequest = (baseURL: string, config: APIRequestInfo) => async (
    path: string,
    entityIds: string | string[]
): Promise<APIResponseData<ServiceDeleted[]> | APIError<ServiceError>> => {
    const entityArray = (Array.isArray(entityIds) ? entityIds : [entityIds]).filter(id => !!id);

    if (!entityIds || entityArray.length < 1) {
        return {
            errorCode: 500,
            errorMessage: 'id is an invalid id value or array',
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
        requests.push(
            fetchApi<undefined, undefined, ServiceError>(url, {
                ...config,
                method: 'DELETE'
            })
        );
    }
    const responses = await Promise.all(requests);

    try {
        const data: ServiceDeleted[] = responses.map((response, idx) => {
            const deletedResponse: ServiceDeleted = {
                id: entityArray[idx],
                state: 'DELETED'
            };
            if (isAPIError(response)) {
                if (response.errorCode === 401) throw new Error();
                deletedResponse.state = 'REJECTED';
                deletedResponse.error = response.error;
            }
            return deletedResponse;
        });

        return {
            status: 200,
            data
        };
    } catch (error) {
        return {
            errorCode: 401,
            errorMessage: 'missing authorization header',
            error: {
                statusCode: 401,
                error: 'missing authorization header',
                message: 'missing authorization header'
            }
        };
    }
};
export const createRequest = (baseURL: string, config: APIRequestInfo) => async <T extends APIBody>(
    path: string,
    body: Partial<T>
): Promise<APIResponseData<T> | APIError<ServiceError>> => {
    const url = `${baseURL}${path}`;
    return fetchApi<Partial<T>, T, ServiceError>(url, {
        ...config,
        method: 'POST',
        headers: { ...config.headers, 'content-type': 'application/json' },
        body
    });
};
export const getRequest = (baseURL: string, config: APIRequestInfo) => async <T extends APIBody>(
    path: string
): Promise<APIResponseData<T> | APIError<ServiceError>> => {
    const url = `${baseURL}${path}`;
    return fetchApi<undefined, T, ServiceError>(url, {
        ...config,
        method: 'GET'
    });
};
export type Api = {
    getListRequest<T>(
        path: string,
        page?: number,
        size?: number,
        filter?: GetListRequestOptions
    ): Promise<APIResponseData<ServiceList<T>> | APIError<ServiceError>>;
    deleteRequest(path: string, ids: string | string[]): Promise<APIResponseData<ServiceDeleted[]> | APIError<ServiceError>>;
    createRequest<T extends APIBody>(path: string, body: Partial<T>): Promise<APIResponseData<T> | APIError<ServiceError>>;
    getRequest<T extends APIBody>(path: string): Promise<APIResponseData<T> | APIError<ServiceError>>;
};
export const buildApiService = (server: string, baseConfig?: APIRequestInfo): Api => {
    const config: APIRequestInfo = {
        method: 'GET',
        headers: {},
        ...baseConfig
    };
    return {
        getListRequest: getListRequest(server, config),
        deleteRequest: deleteRequest(server, config),
        createRequest: createRequest(server, config),
        getRequest: getRequest(server, config)
    };
};
