import React from 'react';
import { render, screen } from '@testing-library/react';
import {setupNock, serverGetEventTypeList} from '../../test-utils';
import EventTypeListPage from './index';
import {BASE_URL} from '../../services/config';

test('EventTypeList snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200);
    render(<EventTypeListPage />);
    expect(await screen.findAllByLabelText('element name')).toHaveLength(10);
});
