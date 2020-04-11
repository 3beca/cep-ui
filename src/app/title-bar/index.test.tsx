import React from 'react';
import { render } from '@testing-library/react';
import AppBar from './index';

test('renders TitleBar withou crash', () => {
    const { getByText } = render(<AppBar />);
    const linkElement = getByText(/CEP Service/i);
    expect(linkElement).toBeInTheDocument();
});