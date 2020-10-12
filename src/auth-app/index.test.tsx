import * as React from 'react';
import {
    renderInsideApp,
    renderInsideRealApp,
    screen,
    setupNock,
    serverGetRuleList,
    generateRuleListWith,
    serverGet,
    serverGet401,
    serverGetAuth
} from '../test-utils';
import userEvent from '@testing-library/user-event';
import { BASE_URL, VERSION_URL } from '../services/config';
import { AuthApp } from './index';
import { APIContextState, ValidationState } from '../services/api-provider/api-context';
import { VersionInfo } from '../services/api';
import { clearApikey, saveApikey } from '../utils';

const versionInfo: VersionInfo = { version: 'CEP 1' };

test('AuthApp render App', async () => {
    let apiState: APIContextState = {
        isValidating: true,
        isValidated: ValidationState.PENDING,
        isValid: false
    };
    const { rerender } = renderInsideApp(<AuthApp />, { route: '/', apiState });
    await screen.findByLabelText(/authapp validating/);

    apiState.isValidating = false;
    apiState.isValidated = ValidationState.NOT_FOUND;
    rerender(<AuthApp />);
    await screen.findByLabelText(/authapp no cep service/);

    apiState.isValidating = false;
    apiState.isValidated = ValidationState.VALIDATED;
    apiState.requireKey = true;
    apiState.invalidReason = 'apiKey not found';
    rerender(<AuthApp />);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/apikey not found/i);
});

test('AuthApp render App', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderInsideApp(<AuthApp />, { route: '/' });
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    // Menu starts closed
    expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument();
});

test('AuthApp should start checking and show App when server NO require apikey', async () => {
    serverGet(setupNock(BASE_URL), VERSION_URL, 200, versionInfo);
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);
});

test('AuthApp should start checking and show app when apiKey is stored and valid', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);
});

test('AuthApp should start checking and show login when apiKey is stored and invalid', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey 1234567890 is NOT valid/i);
});

test('AuthApp should login with new apikey', async () => {
    clearApikey();
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey not found/i);

    const apikey = '1234567891';
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    await userEvent.type(await screen.findByTestId(/login input/i), apikey);
    const inputApikey = (await screen.findByTestId(/login input/)) as HTMLInputElement;
    expect(inputApikey.value).toEqual(apikey);
    userEvent.click(await screen.findByLabelText(/login submit/i));

    await screen.findByLabelText(/authapp validating/);
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);
});

test('ApiProvider should fails login with invalid apikey', async () => {
    clearApikey();
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey not found/i);

    const apikey = '1234567891';
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    await userEvent.type(await screen.findByTestId(/login input/i), apikey);
    const inputApikey = (await screen.findByTestId(/login input/)) as HTMLInputElement;
    expect(inputApikey.value).toEqual(apikey);
    userEvent.click(await screen.findByLabelText(/login submit/i));

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey 1234567891 is NOT valid/i);
});

test('ApiProvider should fails login with invalid apikey stored and login with a valid one', async () => {
    clearApikey();
    const badApikey = '1234567890';
    saveApikey(badApikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey 1234567890 is NOT valid/i);

    const apikey = '1234567891';
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    await userEvent.type(await screen.findByTestId(/login input/i), apikey);
    const inputApikey = (await screen.findByTestId(/login input/)) as HTMLInputElement;
    expect(inputApikey.value).toEqual(apikey);
    userEvent.click(await screen.findByLabelText(/login submit/i));

    await screen.findByLabelText(/authapp validating/);
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);
});

test('ApiProvider should fails login with invalid apikey stored and login fails again with a invalid one', async () => {
    clearApikey();
    const badApikey = '1234567890';
    saveApikey(badApikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    renderInsideRealApp(<AuthApp />);

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey 1234567890 is NOT valid/i);

    const apikey = '1234567891';
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    await userEvent.type(await screen.findByTestId(/login input/i), apikey);
    const inputApikey = (await screen.findByTestId(/login input/)) as HTMLInputElement;
    expect(inputApikey.value).toEqual(apikey);
    userEvent.click(await screen.findByLabelText(/login submit/i));

    await screen.findByLabelText(/authapp validating/);
    await screen.findByLabelText(/login container/);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(/ApiKey 1234567891 is NOT valid/i);
});
