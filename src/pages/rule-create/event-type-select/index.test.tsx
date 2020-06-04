import * as React from 'react';
import { BASE_URL } from '../../../services/config';
import {
    render,
    screen,
    generateEventTypeListWith,
    generateEventType,
    setupNock,
    serverGetEventTypeList,
    serverCreateEventType,
    act,
    waitFor
} from '../../../test-utils';
import userEvent from '@testing-library/user-event';
import {EventTypeSelector, emptyEventType} from './index';


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
afterEach(() => (navigator.clipboard.writeText as jest.Mock).mockClear());

const nockServer = setupNock(BASE_URL);
test('EventTypeSelector should render a filtered by element options when type element and close keep selection', async () => {
    const result = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(nockServer, 1, 10, '', 200, result);
    const setSelected = jest.fn();
    render(<EventTypeSelector selected={null} onSelected={setSelected}/>);

    await screen.findByLabelText(/eventtype selector$/i);
    await screen.findByLabelText('eventtype name');
    screen.getByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/search a eventtype/i);

    // Open options when click in input
    const prefix = 'test';
    const filteredResult = generateEventTypeListWith(5, false, false, '', prefix + ' ');
    serverGetEventTypeList(nockServer, 1, 10, prefix, 200, filteredResult);
    const input = await screen.findByLabelText(/search a eventtype/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findAllByLabelText(/search a eventtype/i);
    expect(await screen.findAllByRole('option')).toHaveLength(5);

    // Close options from icon button
    userEvent.click(await screen.findByLabelText(/close/i));
    expect(screen.queryAllByRole('option')).toHaveLength(0);

    // Open options from icon button
    userEvent.click(await screen.findByLabelText(/open/i));
    expect(await screen.findAllByRole('option')).toHaveLength(5);
    expect(setSelected).toHaveBeenCalledTimes(0);
});

test('EventTypeSelector should select the third element from the options and change to details view, copy url and clear selection', async () => {
    serverGetEventTypeList(nockServer, 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    const setSelected = jest.fn();
    const {rerender} = render(<EventTypeSelector selected={null} onSelected={setSelected}/>);

    await screen.findByLabelText('eventtype name');
    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/search a eventtype/i);

    // Open options when click in input
    const prefix = 'test2';
    const filteredResult = generateEventTypeListWith(5, false, false, '', prefix + ' ');
    serverGetEventTypeList(nockServer, 1, 10, prefix, 200, filteredResult);
    const input = await screen.findByLabelText(/search a eventtype/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findAllByLabelText(/search a eventtype/i);
    const elements = await screen.findAllByRole('option');
    expect(elements).toHaveLength(5);

    // Select thrid element
    serverGetEventTypeList(nockServer, 1, 10, filteredResult.results[2].name, 200, generateEventTypeListWith(10, false, false));
    const fakeEventType = filteredResult.results[2];
    userEvent.click(elements[2]);
    act(() => void jest.runOnlyPendingTimers());
    expect(screen.queryAllByRole('option')).toHaveLength(0);
    await screen.findByLabelText(/loading eventtypes/i);
    expect( await screen.findByLabelText(/search a eventtype/i)).toHaveAttribute('value', 'test2 EventType2');
    expect(setSelected).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenNthCalledWith(1, fakeEventType);

    rerender(<EventTypeSelector selected={fakeEventType} onSelected={setSelected}/>);
    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(fakeEventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(fakeEventType.url);
    expect(setSelected).toHaveBeenCalledTimes(2);
    expect(setSelected).toHaveBeenNthCalledWith(2, fakeEventType);

    // Copy url to clipboard
    const copyButton = await screen.findByLabelText(/eventtype selected copy/i);
    userEvent.click(copyButton);
    expect(await screen.findByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(fakeEventType.url);
    act(() => void jest.runOnlyPendingTimers());
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());

    // Cancel selection
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);
    expect(setSelected).toHaveBeenCalledTimes(3);
    expect(setSelected).toHaveBeenNthCalledWith(3, null);

    rerender(<EventTypeSelector selected={null} onSelected={setSelected}/>);
    serverGetEventTypeList(nockServer, 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/search a eventtype/i);
});

test('EventTypeSelector should create new element when no options found', async () => {
    serverGetEventTypeList(nockServer, 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    const setSelected = jest.fn();
    const {rerender} = render(<EventTypeSelector selected={null} onSelected={setSelected}/>);

    await screen.findByLabelText('eventtype name');

    // Open options when click in input
    const prefix = 'test-new-elements';
    const filteredResult = generateEventTypeListWith(0, false, false, '', prefix + ' ');
    serverGetEventTypeList(nockServer, 1, 10, prefix, 200, filteredResult);
    const input = await screen.findByLabelText(/search a eventtype/i);
    await userEvent.type(input, prefix);
    screen.getByText(/no options/i);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findAllByLabelText(/search a eventtype/i);
    const newElement = await screen.findByRole('option');
    expect(newElement).toHaveTextContent('Create ' + prefix);
    expect(input).toHaveAttribute('value', prefix);

    const eventType = generateEventType(1, 'newEV', 'testNewEv');
    eventType.name = prefix;
    serverCreateEventType(setupNock(BASE_URL), {name: eventType.name}, 201, eventType);
    userEvent.click(newElement);
    expect(input).toHaveAttribute('value', prefix);

    expect(setSelected).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenNthCalledWith(1, {...emptyEventType, name: prefix});
    rerender(<EventTypeSelector selected={{...emptyEventType, name: prefix}} onSelected={setSelected}/>);

    await screen.findByLabelText(/eventtype creating block/i);
    await screen.findByLabelText(/eventtype creating name/i);
    await screen.findByLabelText(/eventtype creating action/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating loading/i)).toHaveTextContent(/creating event type/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating url/i)).toHaveTextContent(eventType.url);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);
    expect(setSelected).toHaveBeenCalledTimes(2);
    expect(setSelected).toHaveBeenNthCalledWith(2, eventType);
});

test('EventTypeSelector should not be interactive when disabled without EventType', async () => {
    const setSelected = jest.fn();
    render(<EventTypeSelector selected={null} onSelected={setSelected} disabled={true}/>);

    await screen.findByLabelText(/eventtype selector disabled/i);
    await screen.findByLabelText('eventtype name');
    await screen.findByLabelText(/search a eventtype/i);

    // Open options when click in input
    const prefix = 'test';
    const input = await screen.findByLabelText(/search a eventtype/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).not.toHaveValue();
});

test('EventTypeSelector should not be interactive when disabled wit EventType', async () => {
    const setSelected = jest.fn();
    const eventType = generateEventType(1, '', '');
    render(<EventTypeSelector selected={eventType} onSelected={setSelected} disabled={true}/>);

    await screen.findByLabelText(/eventtype selector disabled/i);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);

    // Copy url to clipboard
    const copyButton = await screen.findByLabelText(/eventtype selected copy/i);
    userEvent.click(copyButton);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(0);
    act(() => void jest.runOnlyPendingTimers());

    // Cancel selection
    setSelected.mockClear();
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);
    expect(setSelected).toHaveBeenCalledTimes(0);
});