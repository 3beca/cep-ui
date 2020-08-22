import * as React from 'react';
import {
    render,
    waitFor,
    screen
} from '@testing-library/react';
import {
    setupNock,
    serverGet401,
    serverGet,
    serverGetAuth
} from '../../test-utils';
import {
    APIContextActionNoRequireKey,
    APIContextState
} from './api-context';
import {
    APIProvider,
    useAPIProviderStatus,
    useUpdateAPIProvider,
    useAPIProvider,
    apiReducer
} from './index';
import {
    BASE_URL,
    VERSION_URL
} from '../config';
import { VersionInfo } from '../api/models';
import {
    clearApikey,
    saveApikey
} from '../../utils';
import userEvent from '@testing-library/user-event';

const versionInfo: VersionInfo = {version: 'CEP 1'};

const TestComponent: React.FC<{}> = (props) => {
    const {showLoading, showNoService, showLogin, requireApikey, invalidReason, apiKey, version} = useAPIProviderStatus();
    const {setApiKey, invalidateApiKey} = useUpdateAPIProvider();
    const inputApiKey = React.createRef<HTMLInputElement>();
    const inputRequiredToken = React.createRef<HTMLInputElement>();

    const invalidate = React.useCallback(() => {
        const reqApikey = !!inputRequiredToken.current?.checked;
        invalidateApiKey(reqApikey);
    }, [inputRequiredToken, invalidateApiKey]);
    const setApikey = React.useCallback(() => {
        const apiKeyString = inputApiKey.current?.value;
        apiKeyString && setApiKey(apiKeyString);
    }, [inputApiKey, setApiKey]);
    return (
        <>
            <div data-testid='loading'>{showLoading ? 'true' : 'false'}</div>
            <div data-testid='noservice'>{showNoService ? 'true' : 'false'}</div>
            <div data-testid='login'>{showLogin ? 'true' : 'false'}</div>
            <div data-testid='apikey'>{requireApikey === undefined ? 'undefined' : (requireApikey === false) ? 'false' : 'true'}</div>
            <div data-testid='invalidkey'>{invalidReason}</div>
            <div data-testid='version'>{version && `${apiKey}-${version}`}</div>

            <div>
                <input type='text' ref={inputApiKey} data-testid='inputkey'/>
                <button onClick={setApikey}>setApiKey</button>
            </div>

            <div>
                <button onClick={invalidate}>invalidate</button>
            </div>
        </>
    );
};

test('ApiProvider should start checking and show login when server do not response', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('undefined'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(BASE_URL + ' not found'));
    spy.mockRestore();
});

test('ApiProvider should start checking and show login when server require apikey and no apikey stored', async () => {
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('apiKey not found'));
});

test('ApiProvider should start checking and show app when server NO require apikey', async () => {
    serverGet(setupNock(BASE_URL), VERSION_URL, 200, versionInfo);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(''));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent('-' + versionInfo.version));
});

test('ApiProvider should start checking and show app when apiKey is stored and valid', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(''));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent(apikey + '-' + versionInfo.version));
});

test('ApiProvider should start checking and show login when apiKey is stored and invalid', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('ApiKey 1234567890 in NOT valid'));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent(''));
});

test('ApiProvider should login with new apikey', async () => {
    clearApikey();
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('apiKey not found'));

    const apikey = '1234567891';
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    await userEvent.type(await screen.findByTestId(/inputkey/), apikey);
    const inputApikey = await screen.findByTestId(/inputkey/) as HTMLInputElement;
    expect(inputApikey.value).toEqual(apikey);
    userEvent.click(await screen.findByText(/setapikey/i));

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(''));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent(apikey + '-' + versionInfo.version));
});

test('ApiProvider should fails login with invalid apikey', async () => {
    clearApikey();
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('apiKey not found'));

    const invalidApikey = '12w345t6';
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    await userEvent.type(await screen.findByTestId(/inputkey/), invalidApikey);
    const inputApikey = await screen.findByTestId(/inputkey/) as HTMLInputElement;
    expect(inputApikey.value).toEqual(invalidApikey);
    userEvent.click(await screen.findByText(/setapikey/i));

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('ApiKey ' + invalidApikey + ' in NOT valid'));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent(''));
});

test('ApiProvider should invalidate an apikey and show login', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(''));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent(apikey + '-' + versionInfo.version));

    serverGet401(setupNock(BASE_URL), VERSION_URL);
    userEvent.click(await screen.findByText(/invalidate/i));
    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('true'));

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('apiKey not found'));
});

test('ApiProvider should invalidate an apikey and show App', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    render(<TestComponent/>, {wrapper: APIProvider});

    expect(screen.getByTestId(/loading/i)).toHaveTextContent('true');
    expect(screen.getByTestId(/login/i)).toHaveTextContent('false');
    expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent('');

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('true'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(''));
    await waitFor(() => expect(screen.getByTestId(/version/i)).toHaveTextContent(apikey + '-' + versionInfo.version));

    serverGet(setupNock(BASE_URL), VERSION_URL, 200, versionInfo);
    userEvent.click(await screen.findByText(/invalidate/i));
    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('true'));

    await waitFor(() => expect(screen.getByTestId(/loading/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/noservice/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/login/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/apikey/i)).toHaveTextContent('false'));
    await waitFor(() => expect(screen.getByTestId(/invalidkey/i)).toHaveTextContent(''));
});

const TestUseAPIComponent: React.FC<{}> = (props) => {
    const {api, apiKey, version} = useAPIProvider();
    return (
        <>
            <div data-testid='version'>{version && `${apiKey}-${version}`}</div>
            <div data-testid='api'>{!!api ? 'true' : 'false'}</div>
        </>
    );
};

const TestProviderComponent: React.FC<{}> = (props) => {
    const {showLoading, showNoService, showLogin} = useAPIProviderStatus();

    if (showLoading || showNoService || showLogin) {
        return (
            <div data-testid='provider'></div>
        );
    }
    return (<TestUseAPIComponent/>);
};

test('ApiProvider should load api when it is loaded correctly without apikey', async () => {
    serverGet(setupNock(BASE_URL), VERSION_URL, 200, versionInfo);
    render(<TestProviderComponent/>, {wrapper: APIProvider});

    await screen.findByTestId(/provider/);
    expect(await screen.findByTestId(/version/)).toHaveTextContent('-' + versionInfo.version);
    expect(await screen.findByTestId(/api/)).toHaveTextContent('true');
});

test('ApiProvider should load api when it is loaded correctly with apikey', async () => {
    clearApikey();
    const apikey = '1234567890';
    saveApikey(apikey);
    serverGet401(setupNock(BASE_URL), VERSION_URL);
    serverGetAuth(setupNock(BASE_URL), VERSION_URL, apikey, 200, versionInfo);
    render(<TestProviderComponent/>, {wrapper: APIProvider});

    await screen.findByTestId(/provider/);
    expect(await screen.findByTestId(/version/)).toHaveTextContent(apikey + '-' + versionInfo.version);
    expect(await screen.findByTestId(/api/)).toHaveTextContent('true');
});

test('ApiProvider should throw an error when no api available', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    clearApikey();
    serverGet401(setupNock(BASE_URL), VERSION_URL);

    expect(() => render(<TestUseAPIComponent/>, {wrapper: APIProvider})).toThrow('no API available');
    spy.mockRestore();
});

test('apiReducer return current state when receive an invalid action', () => {
    const state = {} as APIContextState;
    const action = {type: 'UNSUPPORTED'} as unknown as APIContextActionNoRequireKey;
    expect(apiReducer(state, action)).toEqual(state);
});