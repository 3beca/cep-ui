import * as React from 'react';
import {renderInsideApp, fireEvent} from '../../test-utils';
import MenuDrawer from './index';
import {useMainMenuToggle, useMainMenuState} from '../../services/main-menu-provider';

const mockMainMenuStatus = useMainMenuState as unknown as jest.Mock;
const mockClose = useMainMenuToggle().close as unknown as jest.Mock;
jest.mock('../../services/main-menu-provider', () => {
    const close = jest.fn();
    return {
        useMainMenuToggle: () => ({
            close
        }),
        useMainMenuState: jest.fn(),
        MainMenuProvider: (props: any) => <div {...props}/>
    };
});

afterEach(() => {
    mockMainMenuStatus.mockClear();
    mockClose.mockClear();
})

export const renderMenuOpenedInRoute = (route = '/') => {
    mockMainMenuStatus.mockReturnValueOnce(true);
    const utils = renderInsideApp(<MenuDrawer/>, {route});
    utils.getByLabelText(/drawer menu/i);
    const menuEventTypes = utils.getByLabelText(/menu event type list page/);
    const menuTargets = utils.getByLabelText(/menu target list page/);

    return {
        ...utils,
        menuEventTypes,
        menuTargets
    };
};

test('MenuDrawer should not render menu when is closed', () => {
    const {queryByLabelText, rerender} = renderInsideApp(<MenuDrawer/>);
    expect(queryByLabelText(/drawer menu/i)).not.toBeInTheDocument();
    mockMainMenuStatus.mockReturnValueOnce(true);
    rerender(<MenuDrawer/>);
    expect(queryByLabelText(/drawer menu/i)).toBeInTheDocument();
});

test('MenuDrawer should render menu when open in / with EventTypes selected and snapshot', () => {
    const {container, history} = renderMenuOpenedInRoute();
    expect(history.location.pathname).toEqual('/');
    expect(container).toMatchSnapshot();
});

test('MenuDrawer should render menu when open in / and navigate to targets, snapshot and back', () => {
    const {container, history, menuTargets, menuEventTypes, queryByLabelText} = renderMenuOpenedInRoute();
    mockMainMenuStatus.mockReturnValueOnce(true);
    fireEvent.click(menuTargets);
    expect(history.location.pathname).toEqual('/targets');
    expect(mockClose).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();

    mockMainMenuStatus.mockReturnValueOnce(false);
    fireEvent.click(menuEventTypes);
    expect(history.location.pathname).toEqual('/');
    expect(mockClose).toHaveBeenCalledTimes(2);
    expect(queryByLabelText(/drawer menu/i)).not.toBeInTheDocument();
});