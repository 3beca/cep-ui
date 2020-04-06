import React from 'react';
import { render } from '@testing-library/react';
import AppBar from './index';

test('renders learn react link', () => {
    const { getByText } = render(<AppBar />);
    const linkElement = getByText(/CEP Service by 3beca/i);
    expect(linkElement).toBeInTheDocument();
});