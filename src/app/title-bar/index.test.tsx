import React from 'react';
import {render, fireEvent} from '@testing-library/react';
import TitleBar from './index';
import {useMainMenuToggle} from '../../services/main-menu-provider';


jest.mock('../../services/main-menu-provider', () => {
    const toggle = jest.fn();
    return {
        useMainMenuToggle: () => ({
            toggle
        })
    };
});

test('renders TitleBar withou crash and create snapshot', () => {
    const mainMenuToggle = useMainMenuToggle();
    const {container, getByLabelText} = render(<TitleBar />);
    const showMenuButton = getByLabelText(/toggle show menu/i);
    expect(showMenuButton).toBeInTheDocument();

    expect(container).toMatchSnapshot();
    fireEvent.click(showMenuButton);
    expect(mainMenuToggle.toggle).toHaveBeenCalledTimes(1);
});
