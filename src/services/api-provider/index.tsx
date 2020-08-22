import * as React from 'react';
import { APIRequestInfo, isAPIError } from '../../utils/fetch-api';
import {
    Api,
    buildApiService
} from '../api';
import { VersionInfo } from '../api/models';
import { BASE_URL, VERSION_URL } from '../config';
import {
    NOOP,
    loadApikey,
    saveApikey,
    clearApikey
} from '../../utils';

export enum ValidationState {
    VALIDATED = 0,
    PENDING = 1,
    NOT_FOUND = 2
};
export type APIContext = {
    isValidating: boolean;
    isValidated: ValidationState;
    isValid: boolean;
    invalidReason?: string;
    requireKey?: boolean;
    apiKey?: string;
    api?: Api;
    version?: string;
};
export type APIContextActionValidating = {
    type: 'VALIDATING';
};
export type APIContextActionServerNotFound = {
    type: 'SERVER_NOT_FOUND';
    url: string;
};
export type APIContextActionRequireKey = {
    type: 'REQUIRE_APIKEY';
    reason: string;
};
export type APIContextActionNoRequireKey = {
    type: 'NO_REQUIRE_APIKEY';
    version: string
};
export type APIContextActionSetKey = {
    type: 'SET_APIKEY';
    apiKey: string;
    version: string;
};

export type ApiContextActions = APIContextActionValidating|APIContextActionRequireKey|APIContextActionNoRequireKey|APIContextActionSetKey|APIContextActionServerNotFound;

export type APIUtilsContext = {
    invalidateApiKey: (required: boolean) => void;
    setApiKey: (apiKey: string) => void;
};

const initialContext = {
    isValidating: false,
    isValidated: ValidationState.PENDING,
    isValid: false
};
const APIContext = React.createContext<APIContext>(initialContext);
const UpdateAPIContext = React.createContext<APIUtilsContext>({
    invalidateApiKey: NOOP,
    setApiKey: NOOP
});

// config = {method: 'GET', headers: {'authorization': 'apiKey ' + apiKey}};
export const apiReducer = (state: APIContext, action: ApiContextActions) => {
    switch(action.type) {
        case 'VALIDATING': {
            return {
                isValidating: true,
                isValidated: ValidationState.PENDING,
                isValid: false
            };
        }
        case 'SERVER_NOT_FOUND': {
            return {
                isValidating: false,
                isValidated: ValidationState.NOT_FOUND,
                isValid: false,
                invalidReason: `${action.url} not found`
            };
        }
        case 'NO_REQUIRE_APIKEY': {
            return {
                isValidating: false,
                isValidated: ValidationState.VALIDATED,
                isValid: true,
                requireKey: false,
                api: buildApiService(BASE_URL),
                version: action.version
            };
        }
        case 'REQUIRE_APIKEY': {
            return {
                isValidating: false,
                isValidated: ValidationState.VALIDATED,
                isValid: false,
                requireKey: true,
                invalidReason: action.reason
            };
        }
        case 'SET_APIKEY': {
            const apiKey = action.apiKey;
            const version = action.version;
            const apiInfo: APIRequestInfo = {headers: {Authorization: 'apiKey ' + apiKey}, method: 'GET'};
            return {
                isValidating: false,
                isValidated: ValidationState.VALIDATED,
                isValid: true,
                requireKey: true,
                apiKey,
                api: buildApiService(BASE_URL, apiInfo),
                version
            };
        }
        default: return state;
    }
};
export const APIProvider: React.FC<{}> = (props) => {
    const [state, dispatch] = React.useReducer(apiReducer, initialContext);

    const checkApikey = React.useCallback(async (apiKey: string) => {
        dispatch({type: 'VALIDATING'});
        const apiInfo: APIRequestInfo = {headers: {Authorization: 'apiKey ' + apiKey}, method: 'GET'};
        const api = buildApiService(BASE_URL, apiInfo);
        const responseWithtoken = await api.getRequest<VersionInfo>(VERSION_URL);
        if (isAPIError(responseWithtoken)) {
            clearApikey();
            dispatch({type: 'REQUIRE_APIKEY', reason: `ApiKey ${apiKey} in NOT valid`});
            return;
        }
        else {
            saveApikey(apiKey);
            dispatch({type: 'SET_APIKEY', apiKey, version: responseWithtoken.data.version});
            return;
        }
    }, []);

    const fireValidation = React.useCallback(
        async () => {
            dispatch({type: 'VALIDATING'});
            let api = buildApiService(BASE_URL);
            const response = await api.getRequest<VersionInfo>(VERSION_URL);
            if (isAPIError(response)) {
                if (response.errorCode === 500) {
                    dispatch({type: 'SERVER_NOT_FOUND', url: BASE_URL});
                    return;
                }
                const apiKey = loadApikey();
                if (!apiKey) {
                    dispatch({type: 'REQUIRE_APIKEY', reason: 'apiKey not found'});
                    return;
                }
                checkApikey(apiKey);
            }
            else {
                dispatch({type: 'NO_REQUIRE_APIKEY', version: response.data.version});
            }
        }, [checkApikey]
    );

    const invalidateApiKey = React.useCallback(
        () => {
            clearApikey();
            fireValidation();
        }, [fireValidation]
    );

    const setApiKey = React.useCallback(
        (apiKey: string) => {
            checkApikey(apiKey);
        }, [checkApikey]
    );

    const utils = React.useMemo(() => ({
        invalidateApiKey,
        setApiKey
    }), [invalidateApiKey, setApiKey]);

    React.useEffect(() => {
        fireValidation();
    }, [fireValidation]);


    return (
        <APIContext.Provider value={state}>
            <UpdateAPIContext.Provider value={utils} {...props}/>
        </APIContext.Provider>
    );
};

export const useAPIStatus = () => {
    const api = React.useContext(APIContext);
    return {
        showLoading: api.isValidating || api.isValidated === ValidationState.PENDING,
        showNoService: !api.isValidating && api.isValidated === ValidationState.NOT_FOUND,
        showLogin: !api.isValidating && api.requireKey && api.isValidated === ValidationState.VALIDATED && !api.isValid,
        requireApikey: api.requireKey,
        invalidReason: api.invalidReason,
        apiKey: api.apiKey,
        version: api.version
    };
};

export const useUpdateAPI = () => {
    return React.useContext(UpdateAPIContext);
};

export const useAPI = () => {
    const api = React.useContext(APIContext);
    if (!api.api) throw Error('no API available');
    return {
        api: api.api,
        apiKey: api.apiKey,
        version: api.version
    };
};
