import * as React from 'react';
import {render, fireEvent, waitFor, screen} from '@testing-library/react';
import EventTypeTable from './index';
import {generateEventTypeListWith} from '../../../test-utils';
import {runPaginatedTableTest} from '../../../test-utils/paginated-table-components';
import {serverGetEventTypeList, serverDeleteEventType, setupNock} from '../../../test-utils';
import {BASE_URL} from '../../../services/config';
import {EventTypeList, EventTypeError} from '../../../services/api';
import {runSelectableTableTest} from '../../../test-utils/selectable-table-components';
import {runDeletableTableTest} from '../../../test-utils/deletable-table-component';

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
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    render(<EventTypeTable />);
    expect(await screen.findAllByLabelText(/element row eventtype/)).toHaveLength(10);
});

runPaginatedTableTest(
    'EventTypeTable',
    EventTypeTable,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, '', status, response)
);

runSelectableTableTest(
    'EventTypeTable',
    EventTypeTable,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, '', status, response),
    true
);

runDeletableTableTest(
    'EventTypeTable',
    EventTypeTable,
    /element row eventtype/,
    generateEventTypeListWith,
    (page: number = 1, pageSize: number = 10, status: number = 200, response: EventTypeList|EventTypeError) => serverGetEventTypeList(setupNock(BASE_URL), page, pageSize, '', status, response),
    (id: string, status: number = 200, response?: EventTypeError) => serverDeleteEventType(setupNock(BASE_URL), id, status, response)
);

test('EventTypeTable should copy url of element to clipboard when click in edit icon', async () => {
    const response = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, response);
    render(
        <EventTypeTable/>
    );
    expect(await screen.findAllByLabelText(/element row eventtype/)).toHaveLength(10);
    const elements = await screen.findAllByLabelText('copy-icon');
    expect(elements.length).toBe(10);
    fireEvent.click(elements[0]);
    expect(await screen.findByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(response.results[0].url);
    await waitFor(() => expect(screen.queryByLabelText('snackbar-message')).not.toBeInTheDocument());
});
