import React from 'react';
import { render, waitFor, fireEvent, within } from '@testing-library/react';
import {setupNock, serverGetEventTypeList, generateEventTypeListWith} from '../test-utils';
import EventTypeListPage from './index';
import {BASE_URL} from '../services/config';
import { runPaginatedTableTest } from '../test-utils/paginated-table-components';
import { EventTypeList, EventTypeError } from '../services/event-type';
import { runSelectableTableTest } from '../test-utils/selectable-table-components';

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
    const { container, getAllByLabelText } = render(<EventTypeListPage />);
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    expect(container).toMatchSnapshot();
});

runPaginatedTableTest(
    'EventTypeListPage',
    EventTypeListPage,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, status, response)
);

runSelectableTableTest(
    'EventTypeListPage',
    EventTypeListPage,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, status, response)
);

test('EventTypeList should copy url of element to clipboard when click in edit icon', async () => {
    const response = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, response);
    const {getAllByLabelText, getByLabelText} = render(
        <EventTypeListPage/>
    );
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    const elements = getAllByLabelText('copy-icon');
    expect(elements.length).toBe(10);
    fireEvent.click(elements[0]);
    await waitFor(() => expect(getByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(response.results[0].url);
});

test('EventTypeTable should show a delete icon button when have some elements selected', async () => {
    const response = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200, response);
    const {container, getAllByLabelText, getAllByRole, getByLabelText, queryByLabelText} = render(
        <EventTypeListPage/>
    );
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    const elements = getAllByRole(/element-selector$/);
    expect(queryByLabelText('delete-icon')).not.toBeInTheDocument();

    // Select second and third element
    fireEvent.click(elements[1], {target: {value: true}});
    fireEvent.click(elements[2], {target: {value: true}});
    expect(getByLabelText('delete-icon')).toBeInTheDocument();

    // snapshot with delete icon visible
    expect(container).toMatchSnapshot();

    // Click on delete icon should open a delete dialog
    fireEvent.click(getByLabelText('open dialog'));
    const dialog = within(document.getElementById('icon-dialog')!);
    dialog.getByLabelText(/title/i);
    dialog.getByLabelText(/eventtypes to delete/i);
    expect(dialog.getAllByLabelText(/eventtype to delete/i)).toHaveLength(2);
    dialog.getByText(/close/i);
    dialog.getByText(/delete/i);
});

