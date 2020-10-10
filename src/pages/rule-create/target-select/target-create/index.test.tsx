import * as React from 'react';
import { BASE_URL } from '../../../../services/config';
import {
    renderWithAPI as render,
    generateTarget,
    screen,
    serverCreateTarget,
    setupNock,
    generateTargetWithHeaders
} from '../../../../test-utils';
import userEvent from '@testing-library/user-event';

import TargetCreate from './index';
import { Target, TargetError } from '../../../../services/api';

test('TargetCreate should show a target, and close', async () => {
    const target = generateTarget(1, 'test', 'test');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={target} clearTarget={clearTarget} setTarget={setTarget} />);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, target);
});

test('TargetCreate can be cancelled before create a new target', async () => {
    const target = generateTarget(1, 'newEV', 'testNewEv');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    const targetEmpty: Target = {
        id: '',
        name: target.name,
        url: target.url,
        createdAt: '',
        updatedAt: ''
    };
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} />);

    await screen.findByLabelText(/target creating block/i);
    await screen.findByLabelText(/target creating name/i);
    await screen.findByLabelText(/target creating action/i);
    userEvent.click(await screen.findByLabelText(/target creating clear/i));

    expect(clearTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenCalledTimes(0);
});

test('TargetCreate should create a new Target', async () => {
    const target = generateTarget(1, 'newEV', 'testNewEv');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    const targetEmpty: Target = {
        id: '',
        name: target.name,
        url: target.url,
        createdAt: '',
        updatedAt: ''
    };
    serverCreateTarget(setupNock(BASE_URL), { name: target.name, url: target.url }, 201, target);
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} />);

    await screen.findByLabelText(/target creating block/i);
    await screen.findByLabelText(/target creating name/i);
    await screen.findByLabelText(/target creating action/i);
    const inputUrl = await screen.findByLabelText(/target creating input url/);
    const createButton = await screen.findByLabelText(/target creating button url/);
    expect(inputUrl).toHaveValue('');
    expect(createButton).toBeDisabled();

    await userEvent.type(inputUrl, 'nohttpschema');
    expect(inputUrl).toHaveValue('nohttpschema');
    expect(createButton).toBeDisabled();

    const validUrl = target.url;
    userEvent.clear(inputUrl);
    await userEvent.type(inputUrl, validUrl);
    expect(inputUrl).toHaveValue(validUrl);
    expect(createButton).not.toBeDisabled();

    userEvent.click(createButton);
    await screen.findByLabelText(/target creating loading/i);
    await screen.findByLabelText(/target selected block/i);
    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, target);
    expect(await screen.findByLabelText(/target selected name/i)).toHaveTextContent(target.name);
    expect(await screen.findByLabelText(/target selected url/i)).toHaveTextContent(target.url);
});

test('TargetCreate should show error when cannot create the target', async () => {
    const target = generateTarget(1, 'newEV', 'testNewEv');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    const targetEmpty: Target = {
        id: '',
        name: target.name,
        url: target.url,
        createdAt: '',
        updatedAt: ''
    };
    const targetError: TargetError = {
        statusCode: 409,
        error: 'Bad request',
        message: 'Target name must be unique and is already taken by target with id 5ec39c6f118b4dbbe07b1cbb'
    };
    serverCreateTarget(setupNock(BASE_URL), { name: target.name, url: target.url }, 409, targetError);
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} />);

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
    expect(setTarget).toHaveBeenCalledTimes(0);
});

test('TargetCreate should show a Target disabled', async () => {
    const target = generateTarget(1, 'test', 'test');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={target} clearTarget={clearTarget} setTarget={setTarget} disabled={true} />);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(0);
});

test('TargetCreate should show a Target disabled even when its not created', async () => {
    const targetEmpty: Target = {
        id: '',
        name: 'Empty event type',
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={true} />);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(0);
});

test('TargetCreate should show and close add headers dialog', async () => {
    const targetEmpty: Target = {
        id: '',
        name: 'Empty event type',
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText(/target creating headers add dialog/);

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
});

test('TargetCreate can add two headers to the target', async () => {
    const targetName = 'My new target with headers';
    const targetEmpty: Target = {
        id: '',
        name: targetName,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();
    await screen.findByLabelText(/target creating headers key input dialog/);
    await screen.findByLabelText(/target creating headers value input dialog/);

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), authHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), authHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), appidHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), appidHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();

    // Create Target
    const headers = { [authHeaderKey]: authHeaderValue, [appidHeaderKey]: appidHeaderValue };
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, headers);
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target selected block/i);
    await screen.findByLabelText(/target selected headers list/i);
    const headersKeyInTarget = await screen.findAllByLabelText(/target selected key header/i);
    expect(headersKeyInTarget).toHaveLength(2);
    expect(headersKeyInTarget[0]).toHaveTextContent(authHeaderKey);
    expect(headersKeyInTarget[1]).toHaveTextContent(appidHeaderKey);
    const headersValueInTarget = await screen.findAllByLabelText(/target selected value header/i);
    expect(headersValueInTarget).toHaveLength(2);
    expect(headersValueInTarget[0]).toHaveTextContent(authHeaderValue);
    expect(headersValueInTarget[1]).toHaveTextContent(appidHeaderValue);

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate can create target without headers', async () => {
    const targetName = 'My new target with headers';
    const targetEmpty: Target = {
        id: '',
        name: targetName,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

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
    await screen.findByLabelText(/target selected block/i);
    expect(screen.queryByLabelText(/target selected headers/i)).not.toBeInTheDocument();

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate do not accept content-type nor content-length nor spaces as headers', async () => {
    const targetName = 'My new target with headers';
    const targetEmpty: Target = {
        id: '',
        name: targetName,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();
    await screen.findByLabelText(/target creating headers key input dialog/);
    await screen.findByLabelText(/target creating headers value input dialog/);

    // Set header Content-Type
    const typeHeaderKey = 'Content-Type';
    const typeHeaderValue = 'application/json';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), typeHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), typeHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));

    // Set headers Content-Length
    const lengthHeaderKey = 'Content-Length';
    const lengthHeaderValue = '123';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), lengthHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), lengthHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));

    // Set headers Content-Length
    const spacesHeaderKey = 'header with spaces';
    const spacesHeaderValue = '123';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), spacesHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), spacesHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();

    // Create Target
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, { headerwithspaces: '123' });
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers: { headerwithspaces: '123' } }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target selected block/i);

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate can delete a header before create target', async () => {
    const targetName = 'My new target with headers';
    const targetEmpty: Target = {
        id: '',
        name: targetName,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();
    await screen.findByLabelText(/target creating headers key input dialog/);
    await screen.findByLabelText(/target creating headers value input dialog/);

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), authHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), authHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();

    // Set headers X-APPID
    const appidHeaderKey = 'X-APPID';
    const appidHeaderValue = '123456';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), appidHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), appidHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();

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
    await screen.findByLabelText(/target selected block/i);

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate merge duplicate headers', async () => {
    const targetName = 'My new target with headers';
    const targetEmpty: Target = {
        id: '',
        name: targetName,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    // Create target
    const targetURL = 'https://somewhere.io';
    await userEvent.type(await screen.findByLabelText(/target creating input url/), targetURL);
    expect(await screen.findByLabelText(/target creating input url/)).toHaveAttribute('value');
    await screen.findByLabelText(/target creating headers block/);
    await screen.findByLabelText(/target creating headers add button/);

    // Open dialog add headers
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/target creating headers add button/));
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();
    await screen.findByLabelText(/target creating headers key input dialog/);
    await screen.findByLabelText(/target creating headers value input dialog/);

    // Set header Authorization to bearer 123456
    const authHeaderKey = 'Authorization';
    const authHeaderValue = 'Bearer 123456';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), authHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), authHeaderValue);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();

    // Set header Authorization to bearer 123456
    const authHeaderValue2 = 'Bearer 654321';
    await userEvent.type(await screen.findByLabelText(/target creating headers key input dialog/), authHeaderKey);
    await userEvent.type(await screen.findByLabelText(/target creating headers value input dialog/), authHeaderValue2);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/target creating headers add button dialog/));
    // Dialog do not close when add new header, only clean fields
    await screen.findByLabelText(/target creating headers add dialog/);
    expect(await screen.findByLabelText(/target creating headers add button dialog/)).toBeDisabled();

    // Close dialog add headers
    userEvent.click(await screen.findByLabelText(/target creating headers close dialog/));
    expect(screen.queryByLabelText(/target creating headers add dialog/)).not.toBeInTheDocument();

    // Create Target
    const headers = { [authHeaderKey]: authHeaderValue2 };
    const newTarget = generateTargetWithHeaders('mynewtargetid', targetName, targetURL, headers);
    serverCreateTarget(setupNock(BASE_URL), { name: targetName, url: targetURL, headers }, 201, newTarget);
    userEvent.click(await screen.findByLabelText(/target creating button url/i));
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);
    await screen.findByLabelText(/target selected block/i);

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, newTarget);
});

test('TargetCreate do not show invalid headers', async () => {
    const targetName = 'My new target with headers';
    const target: Target = {
        id: 'mynewtarget',
        name: targetName,
        headers: {},
        url: 'https://myurl.io/123456',
        createdAt: '2020-01-01T10:10:00.000Z',
        updatedAt: '2020-01-01T10:15:00.000Z'
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={target} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    await screen.findByLabelText(/target selected block/i);
    expect(screen.queryByLabelText(/target selected headers/i)).not.toBeInTheDocument();

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, target);
});
