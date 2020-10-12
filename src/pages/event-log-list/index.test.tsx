import React from 'react';
import { setupNock, serverGetRuleList, generateRuleListWith, renderInsideApp } from '../../test-utils';
import EventLogListPage from './index';
import { BASE_URL } from '../../services/config';

test('App render / and navigate to Events Log with route /event-logs and snapshot', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(20, false, false));
    const { container, getAllByLabelText } = renderInsideApp(<EventLogListPage />);

    expect(getAllByLabelText(/^element row event logs$/i)).toHaveLength(10);
    expect(container).toMatchSnapshot();
});
