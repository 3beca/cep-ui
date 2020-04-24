import React from 'react';
import { render } from '@testing-library/react';
import TitleBar from './index';

test('renders TitleBar withou crash and create snapshot', () => {
    const {container, getByText} = render(<TitleBar />);
    const linkElement = getByText(/CEP Service/i);
    expect(linkElement).toBeInTheDocument();
    expect(container).toMatchSnapshot();
});
