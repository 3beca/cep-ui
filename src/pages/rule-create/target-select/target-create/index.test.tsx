import * as React from 'react';
import { BASE_URL } from '../../../../services/config';
import {
    renderWithAPI as render,
    act,
    generateTarget,
    screen,
    serverCreateTarget,
    setupNock,
    generateTargetWithHeaders
} from '../../../../test-utils';
import userEvent from '@testing-library/user-event';

import TargetCreate from './';
import { TargetError, TargetHeader } from '../../../../services/api';

beforeEach(() => {
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
});

test.only('TargetCreate should create a passthrow target', async () => {
    const headers: TargetHeader = {
        Authorization: 'Bearer 1234567890987654',
        'X-APPID': '123456789'
    };
    const target = generateTargetWithHeaders('newEV', 'testNewEv', 'https://notifier.tribeca.ovh/email', headers);
    const close = jest.fn();
    const onCreate = jest.fn();
    serverCreateTarget(setupNock(BASE_URL), { name: target.name, url: target.url }, 201, target);
    const { unmount } = render(<TargetCreate targetName={target.name} close={close} onCreate={onCreate} />);

    // Select a Passthrow target
    await screen.findByTestId('target-create-wizzard');
    expect(await screen.findByTestId('target-create-button-next')).toBeDisabled();
    await screen.findByTestId('target-create-type-selector');
    await screen.findByTestId('target-create-type--details');
    expect(screen.queryByTestId('target-template-container')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-create-type-passthrow'));
    await screen.findByTestId('target-create-type-passthrow-details');
    userEvent.click(await screen.findByTestId('target-create-button-next'));
    expect(screen.queryByTestId('target-create-type-selector')).not.toBeInTheDocument();
    await screen.findByTestId('target-template-container');

    // Add invalid URL
    expect(await screen.findByTestId('target-create-button-next')).toBeDisabled();
    const urlInput = (await screen.findByTestId('target-edit-url-input')) as HTMLInputElement;
    userEvent.type(urlInput, 'juanjo');
    expect(urlInput).toHaveValue('juanjo');
    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByTestId('target-create-button-next')).toBeDisabled();
    // Add valid URL
    urlInput.setSelectionRange(0, 6);
    userEvent.type(urlInput, target.url);
    expect(urlInput).toHaveValue(target.url);
    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByTestId('target-create-button-next')).not.toBeDisabled();

    // Add headers
    // Open dialog add headers
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByTestId('target-edit-headers-button-add'));
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByTestId('target-edit-headers-dialog-input-key');
    await screen.findByTestId('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), authHeaderKey);
    userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), authHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    // Dialog do not close when add new header, only clean fields
    await screen.findByTestId('target-edit-headers-dialog');
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-key'), appidHeaderKey);
    userEvent.type(await screen.findByTestId('target-edit-headers-dialog-input-value'), appidHeaderValue);
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-add'));
    expect(await screen.findByTestId('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByTestId('target-edit-headers-dialog-button-close'));
    expect(screen.queryByTestId('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Go to resume screen
    expect(await screen.findByTestId('target-create-button-next')).not.toBeDisabled();
    userEvent.click(await screen.findByTestId('target-create-button-next'));
    await screen.findByTestId('target-resume-container');

    // Create Target
    expect(await screen.findByTestId('target-create-button-next')).toHaveTextContent(/create/i);
    userEvent.click(await screen.findByTestId('target-create-button-next'));
    await screen.findByTestId(/target creating loading/i);
    await screen.findByTestId(/target creating url/i);
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenNthCalledWith(1, target);

    unmount();
});

test('TargetCreate should show error when cannot create the target', async () => {
    const target = generateTarget(1, 'newEV', 'testNewEv');
    const close = jest.fn();
    const onCreate = jest.fn();
    const targetError: TargetError = {
        statusCode: 409,
        error: 'Bad request',
        message: 'Target name must be unique and is already taken by target with id 5ec39c6f118b4dbbe07b1cbb'
    };
    serverCreateTarget(setupNock(BASE_URL), { name: target.name, url: target.url }, 409, targetError);
    render(<TargetCreate targetName={target.name} close={close} onCreate={onCreate} />);

    await screen.findByLabelText(/target creating block/i);
    await screen.findByLabelText(/target creating name/i);
    await screen.findByLabelText(/target creating action/i);
    const inputUrl = await screen.findByLabelText(/target creating input url/);
    const createButton = await screen.findByLabelText(/target creating button url/);
    expect(inputUrl).toHaveValue('');
    expect(createButton).toBeDisabled();

    const validUrl = target.url;
    userEvent.clear(inputUrl);
    await userEvent.type(inputUrl, validUrl);
    expect(inputUrl).toHaveValue(validUrl);
    expect(createButton).not.toBeDisabled();

    userEvent.click(createButton);
    await screen.findByLabelText(/target creating loading/i);
    await screen.findByLabelText(/target creating block/i);
    await screen.findByLabelText(/target creating action/i);
    expect(await screen.findByLabelText(/target creating name/i)).toHaveTextContent(target.name);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveValue(target.url);
    expect(await screen.findByLabelText(/target creating error/i)).toHaveTextContent(targetError.message);
    expect(onCreate).toHaveBeenCalledTimes(0);
});

test('TargetCreate should disable create headers and url', async () => {
    const target = generateTarget(1, 'test', 'test');
    const close = jest.fn();
    const onCreate = jest.fn();
    const { unmount } = render(<TargetCreate targetName={target.name} close={close} onCreate={onCreate} disabled={true} />);

    // Disable cannot create headers
    expect(await screen.findByLabelText(/open dialog/i)).toBeDisabled();
    // Disabled cannot create target
    await userEvent.type(await screen.findByLabelText(/target creating input url/), 'http://myurlevent.io');
    const createButton = await screen.findByLabelText(/target creating button url/);
    expect(createButton).toBeDisabled();
    userEvent.click(createButton);
    expect(screen.queryByLabelText(/target creating loading/i)).not.toBeInTheDocument();
    const clearButton = await screen.findByLabelText(/target creating clear/i);
    userEvent.click(clearButton);
    expect(onCreate).toHaveBeenCalledTimes(0);

    unmount();
});

test('TargetCreate should show and close add headers dialog', async () => {
    const targetName = 'Empty event type';
    const close = jest.fn();
    const onCreate = jest.fn();
    render(<TargetCreate targetName={targetName} close={close} onCreate={onCreate} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText('target-edit-headers-dialog');

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
});

test('TargetCreate can add two headers to the target', async () => {
    const targetName = 'My new target with headers';
    const close = jest.fn();
    const onCreate = jest.fn();
    render(<TargetCreate targetName={targetName} close={close} onCreate={onCreate} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByLabelText('target-edit-headers-dialog-input-key');
    await screen.findByLabelText('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), authHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), appidHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), appidHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Create Target
    const headers = { [authHeaderKey]: authHeaderValue, [appidHeaderKey]: appidHeaderValue };
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, headers);
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target creating url/i);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate can create target without headers', async () => {
    const targetName = 'My new target with headers';
    const close = jest.fn();
    const onCreate = jest.fn();
    render(<TargetCreate targetName={targetName} close={close} onCreate={onCreate} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Create Target
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, undefined);
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target creating url/i);
    expect(screen.queryByLabelText(/target creating headers list/i)).not.toBeInTheDocument();

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate do not accept content-type nor content-length nor spaces as headers', async () => {
    const targetName = 'My new target with headers';
    const close = jest.fn();
    const onCreate = jest.fn();
    render(<TargetCreate targetName={targetName} close={close} onCreate={onCreate} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByLabelText('target-edit-headers-dialog-input-key');
    await screen.findByLabelText('target-edit-headers-dialog-input-value');

    // Set header Content-Type
    const typeHeaderKey = 'Content-Type';
    const typeHeaderValue = 'application/json';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), typeHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), typeHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));

    // Set headers Content-Length
    const lengthHeaderKey = 'Content-Length';
    const lengthHeaderValue = '123';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), lengthHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), lengthHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));

    // Set headers Content-Length
    const spacesHeaderKey = 'header with spaces';
    const spacesHeaderValue = '123';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), spacesHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), spacesHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Create Target
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, { headerwithspaces: '123' });
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers: { headerwithspaces: '123' } }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target creating url/i);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate can delete a header before create target', async () => {
    const targetName = 'My new target with headers';
    const close = jest.fn();
    const onCreate = jest.fn();
    render(<TargetCreate targetName={targetName} close={close} onCreate={onCreate} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByLabelText('target-edit-headers-dialog-input-key');
    await screen.findByLabelText('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), authHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), appidHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), appidHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Delete header X-APPID
    const deleteButtons = await screen.findAllByLabelText(/target creating headers delete buttom/i);
    expect(deleteButtons).toHaveLength(2);
    userEvent.click(deleteButtons[1]);
    expect(await screen.findAllByLabelText(/target creating headers delete buttom/i)).toHaveLength(1);

    // Create Target
    const headers = { [authHeaderKey]: authHeaderValue };
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, headers);
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target creating url/i);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate merge duplicate headers', async () => {
    const targetName = 'My new target with headers';
    const close = jest.fn();
    const onCreate = jest.fn();
    render(<TargetCreate targetName={targetName} close={close} onCreate={onCreate} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();
    await screen.findByLabelText('target-edit-headers-dialog-input-key');
    await screen.findByLabelText('target-edit-headers-dialog-input-value');

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), authHeaderValue);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Set header Authorization to bearer 123456
    const authHeaderValue2 = 'Bearer 654321';
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-key'), authHeaderKey);
    await userEvent.type(await screen.findByLabelText('target-edit-headers-dialog-input-value'), authHeaderValue2);
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-add'));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText('target-edit-headers-dialog');
    expect(await screen.findByLabelText('target-edit-headers-dialog-button-add')).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText('target-edit-headers-dialog-button-close'));
    expect(screen.queryByLabelText('target-edit-headers-dialog')).not.toBeInTheDocument();

    // Create Target
    const headers = { [authHeaderKey]: authHeaderValue2 };
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, headers);
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target creating url/i);

    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenNthCalledWith(1, newTarget);
});
