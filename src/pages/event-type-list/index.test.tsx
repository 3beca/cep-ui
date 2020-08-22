import React from 'react';
import { renderWithAPI, screen } from '../../test-utils';
import {setupNock, serverGetEventTypeList} from '../../test-utils';
import EventTypeListPage from './index';
import {BASE_URL} from '../../services/config';

test('EventTypeList snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200);
    renderWithAPI(<EventTypeListPage />);
    expect(await screen.findAllByLabelText('element name')).toHaveLength(10);
});
