import React from 'react';
import { render, waitFor } from '@testing-library/react';
import App from './index';
import {setupNock, serverGetEventTypeList} from '../test-utils';
import {BASE_URL} from '../services/config';


test('App snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    const { container, getAllByLabelText } = render(<App />);
    await waitFor(() => expect(getAllByLabelText('event name')).toHaveLength(10));
    expect(container).toMatchSnapshot();
});
