import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    setupNock,
    generateTarget,
    generateTargetListWith,
    serverGetTargetList,
    act
} from '../../../test-utils';
import { BASE_URL } from '../../../services/config';

import TargetSelector from './index';
import { serverCreateTarget } from '../../../test-utils/api';


beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

const nockServer = setupNock(BASE_URL);
test('TargetSelector should render a filtered by element options when type element and close keep selection', async () => {
    const result = generateTargetListWith(10, false, false);
    serverGetTargetList(nockServer, 1, 10, '', 200, result);
    render(<TargetSelector/>);

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
});

test('Target should select the third element from the options and change to details view, clear selection and back to search view', async () => {
    serverGetTargetList(nockServer, 1, 10, '', 200, generateTargetListWith(10, false, false));
    render(<TargetSelector/>);

    await screen.findByLabelText('target name');

    // Open options when click in input
    const prefix = 'test';
    const filteredResult = generateTargetListWith(5, false, false, '', prefix + ' ');
    serverGetTargetList(nockServer, 1, 10, prefix, 200, filteredResult);
    // screen.getByLabelText(/loading eventtypes/i);
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
    expect(input).toHaveAttribute('value', 'test');

    expect(await screen.findByLabelText(/target selected name/i)).toHaveTextContent(fakeTarget.name);
    expect(await screen.findByLabelText(/target selected url/i)).toHaveTextContent(fakeTarget.url);

    // Cancel selection
    serverGetTargetList(nockServer, 1, 10, '', 200, generateTargetListWith(10, false, false));
    const clearButton = await screen.findByLabelText(/target selected clear/i);
    userEvent.click(clearButton);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading targets/i);
    await screen.findByLabelText(/search a target/i);
});

test('TargetSelector should create new element when no options found', async () => {
    serverGetTargetList(nockServer, 1, 10, '', 200, generateTargetListWith(10, false, false));
    render(<TargetSelector/>);

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
    serverCreateTarget(setupNock(BASE_URL), {name: target.name, url: target.url}, 201, target);
    userEvent.click(newElement);
    expect(input).toHaveAttribute('value', prefix);
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
});