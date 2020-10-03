import * as React from 'react';
import { Api } from '../api';
import { NOOP } from '../../utils';

export enum ValidationState {
    VALIDATED = 0,
    PENDING = 1,
    NOT_FOUND = 2
}
export type APIContextState = {
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
    version: string;
};
export type APIContextActionSetKey = {
    type: 'SET_APIKEY';
    apiKey: string;
    version: string;
};

export type ApiContextActions =
    | APIContextActionValidating
    | APIContextActionRequireKey
    | APIContextActionNoRequireKey
    | APIContextActionSetKey
    | APIContextActionServerNotFound;

export type APIUtilsContext = {
    invalidateApiKey: (required: boolean) => void;
    setApiKey: (apiKey: string) => void;
};

export const initialContext = {
    isValidating: false,
    isValidated: ValidationState.PENDING,
    isValid: false
};
export const initialUtils = {
    invalidateApiKey: NOOP,
    setApiKey: NOOP
};
export const APIContext = React.createContext<APIContextState>(initialContext);
export const UpdateAPIContext = React.createContext<APIUtilsContext>(
    initialUtils
);
