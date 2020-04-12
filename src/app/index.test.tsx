import React from 'react';
import { render } from '@testing-library/react';
import App from './index';

test('renders App without crash', () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/CEP UI/i);
    expect(linkElement).toBeInTheDocument();
});

test('App snapshot', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
});