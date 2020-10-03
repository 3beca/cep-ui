import * as React from 'react';
import { renderWithAPI, screen } from '../../test-utils';

import { setupNock, serverGetTargetList } from '../../test-utils';
import TargetListPage from './index';
import { BASE_URL } from '../../services/config';

test('Snapshot TargetListPage', async () => {
    serverGetTargetList(setupNock(BASE_URL), 1, 10);
    renderWithAPI(<TargetListPage />);

    expect(await screen.findAllByLabelText(/element row/i)).toHaveLength(10);
});
