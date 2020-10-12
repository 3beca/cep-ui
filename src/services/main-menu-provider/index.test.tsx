import * as React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import { useMainMenuState, useMainMenuToggle, MainMenuProvider } from './index';

const TestComponent: React.FC<{}> = props => {
    const isOpen = useMainMenuState();
    const utils = useMainMenuToggle();
    return (
        <>
            <div data-testid='state'>{isOpen ? 'true' : 'false'}</div>
            <button onClick={utils.toggle}>toggle</button>
            <button onClick={utils.open}>open</button>
            <button onClick={utils.close}>close</button>
        </>
    );
};

test('Main Menu Provider should start as false and open, close and toggle swith its value', async () => {
    const { getByTestId, getByText } = render(<TestComponent />, {
        wrapper: MainMenuProvider
    });

    getByTestId(/state/i);
    const toggle = getByText(/toggle/i);
    const open = getByText(/open/i);
    const close = getByText(/close/i);

    expect(getByTestId(/state/i)).toHaveTextContent('false');

    fireEvent.click(open);
    await waitFor(() => expect(getByTestId(/state/i)).toHaveTextContent('true'));

    fireEvent.click(close);
    await waitFor(() => expect(getByTestId(/state/i)).toHaveTextContent('false'));

    fireEvent.click(toggle);
    await waitFor(() => expect(getByTestId(/state/i)).toHaveTextContent('true'));

    fireEvent.click(toggle);
    await waitFor(() => expect(getByTestId(/state/i)).toHaveTextContent('false'));
});
