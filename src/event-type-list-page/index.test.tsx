import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {setupNock, serverGetEventTypeList} from '../test-utils';
import EventTypeListPage from './index';
import {BASE_URL} from '../services/config';

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

