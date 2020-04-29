import * as React from 'react';
import {render} from '@testing-library/react';
import {NotFoundPage} from './index';

test('NotFoundPage snapshot', () => {
    const {container, getByLabelText} = render(<NotFoundPage/>);
    getByLabelText(/page not found/i);
    expect(container).toMatchSnapshot();
});