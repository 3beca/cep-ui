import React from 'react';
import { render, waitFor } from '@testing-library/react';
import {setupNock, serverGetEventTypeList} from '../test-utils';
import EventTypeList from './index';
import {BASE_URL} from '../services/config';


test('EventTypeList snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, 200);
    const { container, getAllByLabelText } = render(<EventTypeList />);
    await waitFor(() => expect(getAllByLabelText('event name')).toHaveLength(10));
    expect(container).toMatchSnapshot();
});
