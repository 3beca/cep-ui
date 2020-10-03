import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { NotFoundPage } from './index';

test('NotFoundPage snapshot', () => {
    const { container } = render(<NotFoundPage />);
    screen.getByLabelText(/page not found/i);
    expect(container).toMatchSnapshot();
});
