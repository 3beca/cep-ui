import React from 'react';
import { render } from '@testing-library/react';
import TitleBar from './index';

test('renders TitleBar withou crash', () => {
    const { getByText } = render(<TitleBar />);
    const linkElement = getByText(/CEP Service/i);
    expect(linkElement).toBeInTheDocument();
});

test('TitleBar snapshot', () => {
    const { container } = render(<TitleBar />);
    expect(container).toMatchSnapshot();
});