import * as React from 'react';
import { BASE_URL } from '../../../../services/config';
import {render, generateEventType, screen, act, waitFor, serverCreateEventType, setupNock} from '../../../../test-utils';
import userEvent from '@testing-library/user-event';

import EventTypeCreate from './index';
import { EventType, EventTypeError } from '../../../../services/api';


jest.mock('@material-ui/core/Snackbar', () => {
    return ({open, onClose}: {open: boolean, onClose: () => void}): React.ReactElement|null => {
        if(open) setTimeout(onClose, 0);
        return open ?
        (
            <div aria-label='snackbar-message'>Snackbar Message</div>
        ) : null;
    }
});

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());
afterEach(() => {
    (navigator.clipboard.writeText as jest.Mock).mockClear();
    (navigator.clipboard.readText as jest.Mock).mockClear()
});

test('EventTypeCreate should show a eventtype, copy its url and close', async () => {
    const eventType = generateEventType(1, 'test', 'test');
    const clearEventType = jest.fn();
    const setEventType = jest.fn();
    render(<EventTypeCreate eventType={eventType} clearEventType={clearEventType} setEventType={setEventType}/>);

    // Copy url to clipboard
    const copyButton = await screen.findByLabelText(/eventtype selected copy/i);
    userEvent.click(copyButton);
    expect(await screen.findByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(eventType.url);
    act(() => void jest.runOnlyPendingTimers());
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());
    expect(setEventType).toHaveBeenCalledTimes(1);
    expect(setEventType).toHaveBeenNthCalledWith(1, eventType);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);
    expect(clearEventType).toHaveBeenCalledTimes(1);
});

test('EventTypeCreate should create a new EventType', async () => {
    const eventType = generateEventType(1, 'newEV', 'testNewEv');
    const clearEventType = jest.fn();
    const setEventType = jest.fn();
    const eventTypeEmpty: EventType = {
        id: '',
        name: eventType.name,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    serverCreateEventType(setupNock(BASE_URL), {name: eventType.name}, 201, eventType);
    render(<EventTypeCreate eventType={eventTypeEmpty} clearEventType={clearEventType} setEventType={setEventType}/>);

    await screen.findByLabelText(/eventtype creating block/i);
    await screen.findByLabelText(/eventtype creating name/i);
    await screen.findByLabelText(/eventtype creating action/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating loading/i)).toHaveTextContent(/creating event type/i);
    expect(screen.getByLabelText(/eventtype creating clear/i)).toBeDisabled();

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating url/i)).toHaveTextContent(eventType.url);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);
    expect(setEventType).toHaveBeenCalledTimes(1);
    expect(setEventType).toHaveBeenNthCalledWith(1, eventType);
});

test('EventTypeCreate should show error when cannot create the event type', async () => {
    const eventType = generateEventType(1, 'newEV', 'testNewEv');
    const clearEventType = jest.fn();
    const setEventType = jest.fn();
    const eventTypeEmpty: EventType = {
        id: '',
        name: eventType.name,
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const eventTypeError: EventTypeError = {
        statusCode: 409,
        error: 'Bad request',
        message: 'Event type name must be unique and is already taken by event type with id 5ec39c6f118b4dbbe07b1cbb'
    };
    serverCreateEventType(setupNock(BASE_URL), {name: eventType.name}, 409, eventTypeError);
    render(<EventTypeCreate eventType={eventTypeEmpty} clearEventType={clearEventType} setEventType={setEventType}/>);

    await screen.findByLabelText(/eventtype creating block/i);
    expect(await screen.findByLabelText(/eventtype creating name/i)).toHaveTextContent(eventType.name);
    await screen.findByLabelText(/eventtype creating action/i);
    expect(await screen.findByLabelText(/eventtype creating clear/i)).toBeDisabled();

    act(() => void jest.runOnlyPendingTimers());
    expect(screen.getByLabelText(/eventtype creating clear/i)).toBeDisabled();
    expect(await screen.findByLabelText(/eventtype creating loading/i)).toHaveTextContent(/creating event type/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype creating error/i)).toHaveTextContent('Event type name must be unique and is already taken by event type with id 5ec39c6f118b4dbbe07b1cbb');
    expect(await screen.findByLabelText(/eventtype creating clear/i)).not.toBeDisabled();

    // Cancel selection
    userEvent.click(await screen.findByLabelText(/eventtype creating clear/i));
    expect(clearEventType).toHaveBeenCalledTimes(1);
    expect(setEventType).toHaveBeenCalledTimes(0);
});

test('EventTypeCreate should show a eventtype disabled', async () => {
    const eventType = generateEventType(1, 'test', 'test');
    const clearEventType = jest.fn();
    const setEventType = jest.fn();
    render(<EventTypeCreate eventType={eventType} clearEventType={clearEventType} setEventType={setEventType} disabled={true}/>);

    // Copy url to clipboard
    const copyButton = await screen.findByLabelText(/eventtype selected copy/i);
    userEvent.click(copyButton);
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(0);
    act(() => void jest.runOnlyPendingTimers());
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());
    expect(setEventType).toHaveBeenCalledTimes(1);
    expect(setEventType).toHaveBeenNthCalledWith(1, eventType);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);
    expect(clearEventType).toHaveBeenCalledTimes(0);
});

test('EventTypeCreate should show a eventtype disabled even when its not created', async () => {
    const eventTypeEmpty: EventType = {
        id: '',
        name: 'Empty event type',
        url: '',
        createdAt: '',
        updatedAt: ''
    };
    const clearEventType = jest.fn();
    const setEventType = jest.fn();
    render(<EventTypeCreate eventType={eventTypeEmpty} clearEventType={clearEventType} setEventType={setEventType} disabled={true}/>);

    // Copy url to clipboard
    const copyButton = await screen.findByLabelText(/eventtype selected copy/i);
    userEvent.click(copyButton);
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(0);
    act(() => void jest.runOnlyPendingTimers());
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());
    expect(setEventType).toHaveBeenCalledTimes(0);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);
    expect(clearEventType).toHaveBeenCalledTimes(0);
});