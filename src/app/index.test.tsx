import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react';
import App from './index';
import {
    setupNock,
    serverGetEventTypeList,
    renderInsideApp
} from '../test-utils';
import {BASE_URL} from '../services/config';

export const renderAppWithMenuOpenedInRoute = (route = '/') => {
    const utils = renderInsideApp(<App/>, {route});
    const showMenuButton = utils.getByLabelText(/^toggle show menu$/i);

    // Open menu
    fireEvent.click(showMenuButton);

    utils.getByLabelText(/^drawer menu$/i);
    const menuEventTypes = utils.getByLabelText(/^menu event type list page$/i);
    const menuTargets = utils.getByLabelText(/^menu target list page$/i);

    return {
        ...utils,
        showMenuButton,
        menuEventTypes,
        menuTargets
    };
};

test('App render with menu closed and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    const { container, getAllByLabelText, queryByLabelText } = renderInsideApp(<App/>, {route: '/'});
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    expect(container).toMatchSnapshot();

    // Menu starts closed
    expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument();
});

test('App render EventTypeListPage with route / and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    const { container, getAllByLabelText, showMenuButton, queryByLabelText } = renderAppWithMenuOpenedInRoute('/');
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));
    expect(queryByLabelText(/^drawer menu$/i)).toBeInTheDocument();
    expect(container).toMatchSnapshot();

    // Close Menu
    fireEvent.click(showMenuButton);
    waitFor(() => expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render NotFoundPage with route /unknown and snapshot', async () => {
    const {container, getByLabelText} = renderAppWithMenuOpenedInRoute('/unknown');

    getByLabelText(/page not found/i);
    expect(container).toMatchSnapshot();
});

test('App render / and navigate to TargetListPage with route /targets and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    const { container, getByLabelText, getAllByLabelText, queryByLabelText, menuTargets} = renderAppWithMenuOpenedInRoute('/');
    await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(10));

    fireEvent.click(menuTargets);
    getByLabelText(/^target list page$/i);
    expect(container).toMatchSnapshot();
    // expect drawer will be closed after navigate to page
    waitFor(() => expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});
