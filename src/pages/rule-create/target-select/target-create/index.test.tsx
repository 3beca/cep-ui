import * as React from 'react';
import { BASE_URL } from '../../../../services/config';
import {
    renderWithAPI as render,
    generateTarget,
    screen,
    serverCreateTarget,
    setupNock
} from '../../../../test-utils';
import userEvent from '@testing-library/user-event';

import TargetCreate from './index';
import { Target, TargetError } from '../../../../services/api';

test('TargetCreate should show a target, and close', async () => {
    const target = generateTarget(1, 'test', 'test');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetCreate target={target} clearTarget={clearTarget} setTarget={setTarget}/>);

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
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget}/>);

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
    serverCreateTarget(setupNock(BASE_URL), {name: target.name, url: target.url}, 201, target);
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget}/>);

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
    serverCreateTarget(setupNock(BASE_URL), {name: target.name, url: target.url}, 409, targetError);
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget}/>);

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
    render(<TargetCreate target={target} clearTarget={clearTarget} setTarget={setTarget} disabled={true}/>);

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
    render(<TargetCreate target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={true}/>);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(0);
});
