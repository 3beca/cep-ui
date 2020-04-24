import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react';
import EventTypeTable from './index';
import {generateEventTypeListWith} from '../../test-utils';
import {runPaginatedTableTest} from '../../test-utils/paginated-table-components';
import {serverGetEventTypeList, setupNock} from '../../test-utils';
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