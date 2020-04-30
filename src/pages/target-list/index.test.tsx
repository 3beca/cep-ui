import * as React from 'react';
import { render, waitFor } from '@testing-library/react';

import {
    setupNock,
    serverGetTargetList
} from '../../test-utils';
import TargetListPage from './index';
import { BASE_URL } from '../../services/config';

test('Snapshot TargetListPage', async () => {
    serverGetTargetList(setupNock(BASE_URL), 1, 10);
    const {container, getAllByLabelText} = render(<TargetListPage/>);

    await waitFor(() => expect(getAllByLabelText(/element row/i)).toHaveLength(10));
    expect(container).toMatchSnapshot();
});
