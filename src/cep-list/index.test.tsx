import React from 'react';
import { render } from '@testing-library/react';
import CEPList from './index';

test('CEPList mount without crash', () => {
    const { getByText } = render(<CEPList />);
    const linkElement = getByText(/Listado de Reglas CEP/i);
    expect(linkElement).toBeInTheDocument();
});
