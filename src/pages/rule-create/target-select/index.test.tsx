import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    renderWithAPI as render,
    screen,
    setupNock,
    generateTarget,
    generateTargetListWith,
    serverGetTargetList,
    act
} from '../../../test-utils';
import { BASE_URL } from '../../../services/config';

import TargetSelector, { emptyTarget, TargetSelected } from './';
import { serverCreateTarget } from '../../../test-utils/api';
import { Target, TargetError } from '../../../services/api';

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

const nockServer = setupNock(BASE_URL);
test('TargetSelector should render a filtered by element options when type element and close keep selection', async () => {
    const result = generateTargetListWith(10, false, false);
    serverGetTargetList(nockServer, 1, 10, '', 200, result);
    const onSelected = jest.fn();
    render(<TargetSelector selected={null} onSelected={onSelected} />);

    await screen.findByLabelText(/target selector$/i);
    await screen.findByLabelText('target name');
    screen.getByLabelText(/loading targets/i);
    await screen.findByLabelText(/search a target/i);

    // Open options when click in input
    const prefix = 'test';
    const filteredResult = generateTargetListWith(5, false, false, '', prefix + ' ');
    serverGetTargetList(nockServer, 1, 10, prefix, 200, filteredResult);
    const input = await screen.findByLabelText(/search a target/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());

    await screen.findByLabelText(/loading targets/i);
    await screen.findAllByLabelText(/search a target/i);
    expect(await screen.findAllByRole('option')).toHaveLength(5);

    // Close options from icon button
    userEvent.click(await screen.findByLabelText(/close/i));
    expect(screen.queryAllByRole('option')).toHaveLength(0);

    // Open options from icon button
    userEvent.click(await screen.findByLabelText(/open/i));
    expect(await screen.findAllByRole('option')).toHaveLength(5);
    expect(onSelected).toHaveBeenCalledTimes(0);
});

test('TargetSelector should select the third element from the options and change to details view, clear selection and back to search view', async () => {
    serverGetTargetList(nockServer, 1, 10, '', 200, generateTargetListWith(10, false, false));
    const onSelected = jest.fn();
    const { rerender } = render(<TargetSelector selected={null} onSelected={onSelected} />);

    await screen.findByLabelText('target name');
    await screen.findByLabelText(/loading targets/i);
    await screen.findAllByLabelText(/search a target/i);

    // Open options when click in input
    const prefix = 'test2';
    const filteredResult = generateTargetListWith(5, false, false, '', prefix + ' ');
    serverGetTargetList(nockServer, 1, 10, prefix, 200, filteredResult);
    const input = await screen.findByLabelText(/search a target/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading targets/i);
    await screen.findAllByLabelText(/search a target/i);
    const elements = await screen.findAllByRole('option');
    expect(elements).toHaveLength(5);

    // Select thrid element
    serverGetTargetList(nockServer, 1, 10, filteredResult.results[2].name, 200, generateTargetListWith(10, false, false));
    const fakeTarget = filteredResult.results[2];
    userEvent.click(elements[2]);
    act(() => void jest.runOnlyPendingTimers());
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    expect(input).toHaveAttribute('value', 'test2 Target2');
    await screen.findByLabelText(/loading targets/i);
    expect(await screen.findByLabelText(/search a target/i)).toHaveAttribute('value', 'test2 Target2');
    expect(onSelected).toHaveBeenCalledTimes(1);
    expect(onSelected).toHaveBeenNthCalledWith(1, fakeTarget);

    rerender(<TargetSelector selected={fakeTarget} onSelected={onSelected} />);
    expect(await screen.findByLabelText(/target selected name/i)).toHaveTextContent(fakeTarget.name);
    expect(await screen.findByLabelText(/target selected url/i)).toHaveTextContent(fakeTarget.url);
    expect(onSelected).toHaveBeenCalledTimes(2);
    expect(onSelected).toHaveBeenNthCalledWith(2, fakeTarget);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(onSelected).toHaveBeenCalledTimes(3);
    expect(onSelected).toHaveBeenNthCalledWith(3, null);

    rerender(<TargetSelector selected={null} onSelected={onSelected} />);
    serverGetTargetList(nockServer, 1, 10, '', 200, generateTargetListWith(10, false, false));
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading targets/i);
    await screen.findByLabelText(/search a target/i);
});

test('TargetSelector should create new element when no options found', async () => {
    serverGetTargetList(nockServer, 1, 10, '', 200, generateTargetListWith(10, false, false));
    const onSelected = jest.fn();
    const { rerender } = render(<TargetSelector selected={null} onSelected={onSelected} />);

    await screen.findByLabelText('target name');

    // Open options when click in input
    const prefix = 'test-new-elements';
    const filteredResult = generateTargetListWith(0, false, false, '', prefix + ' ');
    serverGetTargetList(nockServer, 1, 10, prefix, 200, filteredResult);
    const input = await screen.findByLabelText(/search a target/i);
    await userEvent.type(input, prefix);
    screen.getByText(/no options/i);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading targets/i);
    await screen.findAllByLabelText(/search a target/i);
    const newElement = await screen.findByRole('option');
    expect(newElement).toHaveTextContent('Create ' + prefix);
    expect(input).toHaveAttribute('value', prefix);

    const target = generateTarget(1, 'newEV', 'testNewEv');
    target.name = prefix;
    serverCreateTarget(setupNock(BASE_URL), { name: target.name, url: target.url }, 201, target);
    userEvent.click(newElement);
    expect(input).toHaveAttribute('value', prefix);

    expect(onSelected).toHaveBeenCalledTimes(1);
    expect(onSelected).toHaveBeenNthCalledWith(1, {
        ...emptyTarget,
        name: prefix
    });
    rerender(<TargetSelector selected={{ ...emptyTarget, name: prefix }} onSelected={onSelected} />);

    await screen.findByLabelText(/target creating block/i);
    await screen.findByLabelText(/target creating name/i);
    await screen.findByLabelText(/target creating action/i);
    const inputUrl = await screen.findByLabelText(/target creating input url/);
    const createButton = await screen.findByLabelText(/target creating button url/);

    const validUrl = target.url;
    await userEvent.type(inputUrl, validUrl);
    expect(inputUrl).toHaveValue(validUrl);
    expect(createButton).not.toBeDisabled();
    userEvent.click(createButton);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/target creating loading/i)).toHaveTextContent(/creating target/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/target selected name/i)).toHaveTextContent(target.name);
    expect(await screen.findByLabelText(/target selected url/i)).toHaveTextContent(target.url);
    expect(onSelected).toHaveBeenCalledTimes(2);
    expect(onSelected).toHaveBeenNthCalledWith(2, target);
});

test('TargetSelector should not be interactive when disabled without TArget', async () => {
    const setSelected = jest.fn();
    render(<TargetSelector selected={null} onSelected={setSelected} disabled={true} />);

    await screen.findByLabelText(/target selector disabled/i);
    await screen.findByLabelText('target name');
    await screen.findByLabelText(/search a target/i);

    // Open options when click in input
    const prefix = 'test';
    const input = await screen.findByLabelText(/search a target/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).not.toHaveValue();
});

test('TargetSelector should not be interactive when disabled with Target', async () => {
    const setSelected = jest.fn();
    const target = generateTarget(1, '', '');
    render(<TargetSelector selected={target} onSelected={setSelected} disabled={true} />);

    await screen.findByLabelText(/target selector disabled/i);
    expect(await screen.findByLabelText(/target selected name/i)).toHaveTextContent(target.name);
    expect(await screen.findByLabelText(/target selected url/i)).toHaveTextContent(target.url);

    // Cancel selection
    setSelected.mockClear();
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(setSelected).toHaveBeenCalledTimes(0);
});

test('TargetSelected should show a target, and close', async () => {
    const target = generateTarget(1, 'test', 'test');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetSelected target={target} clearTarget={clearTarget} setTarget={setTarget} />);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, target);
});

test('TargetSelected can be cancelled before create a new target', async () => {
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
    render(<TargetSelected target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} />);

    await screen.findByLabelText(/target creating block/i);
    await screen.findByLabelText(/target creating name/i);
    await screen.findByLabelText(/target creating action/i);
    userEvent.click(await screen.findByLabelText(/target creating clear/i));

    expect(clearTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenCalledTimes(0);
});

test('TargetSelected should create a new Target', async () => {
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
    render(<TargetSelected target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} />);

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

test('TargetSelected should show error when cannot create the target', async () => {
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
    render(<TargetSelected target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} />);

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

test('TargetSelected should show a Target disabled', async () => {
    const target = generateTarget(1, 'test', 'test');
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetSelected target={target} clearTarget={clearTarget} setTarget={setTarget} disabled={true} />);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(0);
});

test('TargetSelected should show a Target disabled even when its not created', async () => {
    const targetEmpty: Target = {
        id: '',
        name: 'Empty event type',
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearTarget = jest.fn();
    const setTarget = jest.fn();
    render(<TargetSelected target={targetEmpty} clearTarget={clearTarget} setTarget={setTarget} disabled={true} />);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    expect(clearTarget).toHaveBeenCalledTimes(0);
});

test('TargetSelected do not show invalid headers', async () => {
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
    render(<TargetSelected target={target} clearTarget={clearTarget} setTarget={setTarget} disabled={false} />);

    await screen.findByLabelText(/target selected block/i);
    expect(screen.queryByLabelText(/target selected headers/i)).not.toBeInTheDocument();

    expect(setTarget).toHaveBeenCalledTimes(1);
    expect(setTarget).toHaveBeenNthCalledWith(1, target);
});
