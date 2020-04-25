import React from 'react';
import {render, fireEvent, waitFor, within} from '@testing-library/react';
import EventTypeTable from './index';
import {generateEventTypeListWith} from '../../test-utils';
import {runPaginatedTableTest} from '../../test-utils/paginated-table-components';
import {serverGetEventTypeList, serverDeleteEventType, setupNock} from '../../test-utils';
import {BASE_URL} from '../../services/config';
import {EventTypeList, EventTypeError} from '../../services/event-type';
import { runSelectableTableTest } from '../../test-utils/selectable-table-components';

jest.mock('@material-ui/core/Snackbar', () => {
    return ({open, onClose}: {open: boolean, onClose: () => void}): React.ReactElement|null => {
        if(open) setTimeout(onClose, 0);
        return open ?
        (
            <div aria-label='snackbar-message'>Snackbar Message</div>
        ) : null;
    }
});

test('EventTypeList snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200);
    const { container, getAllByLabelText } = render(<EventTypeTable />);
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    expect(container).toMatchSnapshot();
});

runPaginatedTableTest(
    'EventTypeTable',
    EventTypeTable,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, status, response)
);

runSelectableTableTest(
    'EventTypeTable',
    EventTypeTable,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, status, response),
    true
);

test('EventTypeTable should copy url of element to clipboard when click in edit icon', async () => {
    const response = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, response);
    const {getAllByLabelText, getByLabelText} = render(
        <EventTypeTable/>
    );
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    const elements = getAllByLabelText('copy-icon');
    expect(elements.length).toBe(10);
    fireEvent.click(elements[0]);
    await waitFor(() => expect(getByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(response.results[0].url);
});

test('EventTypeTable should show delete dialog when click in its delete icon', async () => {
    const response = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, response);
    const {getAllByLabelText, getByTestId, queryByTestId} = render(
        <EventTypeTable/>
    );
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    const elements = getAllByLabelText('delete one dialog');
    expect(elements.length).toBe(10);
    fireEvent.click(elements[0]);

    const dialog = within(document.getElementById('icon-dialog')!);
    dialog.getByLabelText(/title/i);
    dialog.getByLabelText(/eventtypes to delete/i);
    expect(dialog.getAllByLabelText(/eventtype to delete/i)).toHaveLength(1);
    const closeButton = dialog.getByText(/^close$/i);
    const deleteButton = dialog.getByText(/^delete$/i);

    // First eventType should be deleted and reload list
    serverDeleteEventType(setupNock(BASE_URL), response.results[0].id, 200);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, generateEventTypeListWith(5, false, false));

    fireEvent.click(deleteButton);

    await waitFor(() => expect(dialog.getAllByLabelText(/deleted element/)).toHaveLength(1));
    expect(deleteButton).toBeDisabled();
    await waitFor(() => getByTestId(/loading-view-row/));
    await waitFor(() => expect(queryByTestId(/loading-view-row/)).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(5));
    // Close dialog
    fireEvent.click(closeButton);
    expect(document.getElementById('icon-dialog')).toBe(null);
});

test('EventTypeTable should show a delete icon button when have some elements selected', async () => {
    const response = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, response);
    const {container, getAllByLabelText, getAllByRole, getByLabelText, queryByLabelText, getByTestId, queryByTestId} = render(
        <EventTypeTable/>
    );
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    const elements = getAllByRole(/element-selector$/);
    expect(queryByLabelText('delete selecteds icon')).not.toBeInTheDocument();

    // Select second and third element
    fireEvent.click(elements[1], {target: {value: true}});
    fireEvent.click(elements[2], {target: {value: true}});
    expect(getByLabelText('delete selecteds icon')).toBeInTheDocument();

    // snapshot with delete icon visible
    expect(container).toMatchSnapshot();

    // Click on delete icon should open a delete dialog
    fireEvent.click(getByLabelText('delete selecteds dialog'));
    const dialog = within(document.getElementById('icon-dialog')!);
    dialog.getByLabelText(/title/i);
    dialog.getByLabelText(/eventtypes to delete/i);
    expect(dialog.getAllByLabelText(/eventtype to delete/i)).toHaveLength(2);
    const closeButton = dialog.getByText(/^close$/i);
    const deleteButton = dialog.getByText(/^delete$/i);

    // First eventType should be deleted and second rejected
    serverDeleteEventType(setupNock(BASE_URL), response.results[1].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), response.results[2].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, generateEventTypeListWith(5, false, false));

    fireEvent.click(deleteButton);

    await waitFor(() => expect(dialog.getAllByLabelText(/deleted element/)).toHaveLength(2));
    getByLabelText(/error message/i);
    expect(deleteButton).toBeDisabled();
    await waitFor(() => getByTestId(/loading-view-row/));
    await waitFor(() => expect(queryByTestId(/loading-view-row/)).not.toBeInTheDocument());
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(5));
    // Close dialog
    fireEvent.click(closeButton);
    expect(document.getElementById('icon-dialog')).toBe(null);
});
