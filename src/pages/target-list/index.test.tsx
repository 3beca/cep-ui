import * as React from 'react';
import { render, screen } from '@testing-library/react';

import {
    setupNock,
    serverGetTargetList
} from '../../test-utils';
import TargetListPage from './index';
import { BASE_URL } from '../../services/config';

test('Snapshot TargetListPage', async () => {
    serverGetTargetList(setupNock(BASE_URL), 1, 10);
    render(<TargetListPage/>);

    expect(await screen.findAllByLabelText(/element row/i)).toHaveLength(10);
});
