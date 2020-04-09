export type APIHeaders = {[key:string]: string;}; // TODO: restrict to valid headers for CEP
export type RequestInfo = {
    url: string,
    method: 'GET'|'POST'|'PUT'|'DELETE';
    headers: APIHeaders;
};
export type Body = object | undefined;
export type RequestData<T extends Body> = {
    body?: T;
} & RequestInfo;
export type RequestGetData = RequestData<undefined>;
export type ErrorAPI = {
    status: number;
    error: string;
    message: string;
};
export type ResponseData<T> = {
    status: number;
    data: T;
};
export type ResponseEmptyData = ResponseData<undefined>;
export const fetchData = async <B extends Body, R extends Body>(config: RequestData<B>): Promise<ResponseData<R> | ErrorAPI> => {
    const {url, method, body, ...rest} = config;
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
        catch (error) {

        }
        if(response.ok) {
            return {
                status,
                data
            };
        }
        else {
            return {
                status: data.statusCode || status,
                error: data.error || `Error from ${url}`,
                message: data.message
            };
        }
    }
    catch(error) {
        return {
            status: 500,
            error: 'Invalid request ' + url,
            message: error.message
        };
    }
};

export const isErrorApi = <T>(error: ResponseData<T>|ErrorAPI): error is ErrorAPI => {
    return (error as ErrorAPI).error !== undefined;
}
