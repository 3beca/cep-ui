import * as React from 'react';
import { render, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import Login from './index';
import { useUpdateAPIProvider } from '../../services/api-provider';

const { setApiKey } = useUpdateAPIProvider();
const setApiKeyFake = (setApiKey as unknown) as jest.Mock;
jest.mock('../../services/api-provider', () => {
    const setApiKey = jest.fn();
    const useUpdateAPIProvider = () => ({ setApiKey });
    return { useUpdateAPIProvider };
});

beforeEach(() => {
    setApiKeyFake.mockClear();
});

test('Login should render correctly with NO Reason', async () => {
    render(<Login />);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent('');
    expect(setApiKeyFake).toHaveBeenCalledTimes(0);
});

test('Login should render correctly with no apikey reason', async () => {
    const reason = 'apikey not found';
    render(<Login invalidReason={reason} />);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(reason);
    expect(setApiKeyFake).toHaveBeenCalledTimes(0);
});

test('Login should render correctly with server response reason', async () => {
    const reason = 'ApiKey 12345 in NOT valid';
    render(<Login invalidReason={reason} />);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(reason);
    expect(setApiKeyFake).toHaveBeenCalledTimes(0);
});

test('Login should send a new Apikey', async () => {
    const reason = 'apikey not found';
    render(<Login invalidReason={reason} />);
    expect(await screen.findByLabelText(/login reason/)).toHaveTextContent(reason);
    expect(await screen.findByLabelText(/login submit/i)).toBeDisabled();

    const apikey = '1234567891';
    await userEvent.type(await screen.findByTestId(/login input/i), apikey);
    const inputApikey = (await screen.findByTestId(/login input/)) as HTMLInputElement;
    expect(inputApikey.value).toEqual(apikey);
    userEvent.click(await screen.findByLabelText(/login submit/i));

    expect(setApiKeyFake).toHaveBeenCalledTimes(1);
    expect(setApiKeyFake).toHaveBeenCalledWith(apikey);
});
