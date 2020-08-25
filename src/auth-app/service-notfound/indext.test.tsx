import * as React from 'react';
import {render, screen} from '@testing-library/react';
import ServiceNotFoundPage from './index';

test('NotFoundPage snapshot', () => {
    const {container} = render(<ServiceNotFoundPage/>);
    screen.getByLabelText(/authapp no cep service/i);
    expect(container).toMatchSnapshot();
});