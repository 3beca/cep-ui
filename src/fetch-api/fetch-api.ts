export type APIRequestInfo = {
    method: 'GET'|'POST'|'PUT'|'DELETE';
} & Omit<RequestInit, 'body'>;
export type APIBody = object | undefined;
export type APIRequestData<T extends APIBody> = {
    body?: T;
} & APIRequestInfo;
export type APIRequestGetData = APIRequestData<undefined>;
export type APIError<E> = {
    errorCode: number;
    errorMessage: string;
    error?: E
};
export type APIResponseData<T> = {
    status: number;
    data: T;
};
export type APIResponseEmptyData = APIResponseData<undefined>;
export const fetchApi = async <B extends APIBody, R extends APIBody, E extends APIBody>(url: string, config: APIRequestData<B>): Promise<APIResponseData<R> | APIError<E>> => {
    const {method, body, ...rest} = config;
    const options: RequestInit = {
        method,
        body: (method !== 'GET' && body) ? JSON.stringify(body) : undefined,
        ...rest
    };
    
    try {
        const response = await fetch(url, options);
        const status = response.status;
        let data = undefined;
        try {
            data = await response.json();
        }
        catch (error) {}
        if(response.ok) {
            return {
                status,
                data
            };
        }
        else {
            return {
                errorCode: status,
                errorMessage: `Error from ${url}`,
                error: data
            };
        }
    }
    catch(e) {
        return {
            errorCode: 500,
            errorMessage: `Error in query ${e.message}: ${url}`
        };
    }
};

export const isAPIError = <T, E>(error: APIResponseData<T>|APIError<E>): error is APIError<E> => {
    return (error as APIError<E>).errorCode !== undefined;
}

export default fetchApi;

