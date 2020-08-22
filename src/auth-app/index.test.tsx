import * as React from 'react';
import {
    renderInsideApp,
    screen,
    setupNock,
    serverGetRuleList,
    generateRuleListWith
} from '../test-utils';
import { BASE_URL } from '../services/config';
import {
    AuthApp
} from './index';
import {
    APIContextState,
    ValidationState
} from '../services/api-provider/api-context';

test('AuthApp render App', async () => {
    let apiState: APIContextState = {
        isValidating: true,
        isValidated: ValidationState.PENDING,
        isValid: false
    };
    const {rerender} = renderInsideApp(<AuthApp/>, {route: '/', apiState});
    await screen.findAllByLabelText(/validating/);

    apiState.isValidating = false;
    apiState.isValidated = ValidationState.NOT_FOUND;
    rerender(<AuthApp/>);
    await screen.findAllByLabelText(/no cep service/);

    apiState.isValidating = false;
    apiState.isValidated = ValidationState.VALIDATED;
    apiState.requireKey = true;
    apiState.invalidReason = 'apiKey not found';
    rerender(<AuthApp/>);
    await screen.findAllByLabelText(/apikey/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/apikey not found/i);
});

test('AuthApp render App', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderInsideApp(<AuthApp/>, {route: '/'});
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    // Menu starts closed
    expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument();
});