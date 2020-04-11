import React from 'react';
import { render } from '@testing-library/react';
import EventTypeTable from './index';

test('EventTypeTable mount without crash', () => {
    const { getByText } = render(<EventTypeTable />);
    const linkElement = getByText(/Table of Event Types/i);
    expect(linkElement).toBeInTheDocument();
});