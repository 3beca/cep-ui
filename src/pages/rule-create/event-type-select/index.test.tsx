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
import {EventTypeSelector} from './index';


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

const nockServer = setupNock(BASE_URL);
test('EventTypeSelector should render a filtered by element options when type element and close keep selection', async () => {
    const result = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(nockServer, 1, 10, '', 200, result);
    render(<EventTypeSelector/>);

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
});

test('EventTypeSelector should select the third element from the options and change to details view, copy url and clear selection', async () => {
    serverGetEventTypeList(nockServer, 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    render(<EventTypeSelector/>);

    await screen.findByLabelText('eventtype name');

    // Open options when click in input
    const prefix = 'test';
    const filteredResult = generateEventTypeListWith(5, false, false, '', prefix + ' ');
    serverGetEventTypeList(nockServer, 1, 10, prefix, 200, filteredResult);
    // screen.getByLabelText(/loading eventtypes/i);
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
    expect(input).toHaveAttribute('value', 'test');

    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(fakeEventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(fakeEventType.url);

    // Copy url to clipboard
    const copyButton = await screen.findByLabelText(/eventtype selected copy/i);
    userEvent.click(copyButton);
    expect(await screen.findByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(fakeEventType.url);
    act(() => void jest.runOnlyPendingTimers());
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());

    // Cancel selection
    serverGetEventTypeList(nockServer, 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/search a eventtype/i);

});

test('EventTypeSelector should create new element when no options found', async () => {
    serverGetEventTypeList(nockServer, 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    render(<EventTypeSelector/>);

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
    await screen.findByLabelText(/eventtype creating block/i);
    await screen.findByLabelText(/eventtype creating name/i);
    await screen.findByLabelText(/eventtype creating action/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating loading/i)).toHaveTextContent(/creating event type/i);

    act(() => void jest.runOnlyPendingTimers());
    expect(await screen.findByLabelText(/eventtype creating url/i)).toHaveTextContent(eventType.url);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);
});