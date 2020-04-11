import React from 'react';
import { render } from '@testing-library/react';
import EventTypeList from './index';

test('EventTypeList mount without crash', () => {
    const { getByText } = render(<EventTypeList />);
    const linkElement = getByText(/Listado de Reglas CEP/i);
    expect(linkElement).toBeInTheDocument();
});
