import * as React from 'react';
import { buildApiService } from '../services/api';
import {
    APIContext,
    UpdateAPIContext,
    APIUtilsContext,
    ValidationState,
    APIContextState
} from '../services/api-provider/api-context';
import { BASE_URL } from '../services/config';
import { NOOP } from '../utils';

export const initialContext: APIContextState = {
    isValidating: false,
    isValidated: ValidationState.VALIDATED,
    isValid: true,
    requireKey: false,
    api: buildApiService(BASE_URL),
    version: 'MOCK CEP V1'
};
export const initialUtils: APIUtilsContext = {
    invalidateApiKey: NOOP,
    setApiKey: NOOP
};

export type APIProviderMockProps = {
    state?: APIContextState;
    utils?: APIUtilsContext;
};
export const APIProviderMock: React.FC<APIProviderMockProps> = ({
    state = initialContext,
    utils = initialUtils,
    ...props
}) => {
    return (
        <APIContext.Provider value={state}>
            <UpdateAPIContext.Provider value={utils} {...props} />
        </APIContext.Provider>
    );
};
