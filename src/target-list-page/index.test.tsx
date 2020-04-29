import * as React from 'react';
import {render} from '@testing-library/react';

import TargetListPage from './index';

test('Snapshot TargetListPage', () => {
    const {container, getByLabelText} = render(<TargetListPage/>);

    getByLabelText(/target list page/i);
    expect(container).toMatchSnapshot();
});
