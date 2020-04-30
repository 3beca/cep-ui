import React from 'react';
import { waitFor, fireEvent } from '@testing-library/react';
import App from './index';
import {
    setupNock,
    serverGetEventTypeList,
    serverGetTargetList,
    renderInsideApp
} from '../test-utils';
import {BASE_URL} from '../services/config';

export const renderAppWithMenuOpenedInRoute = (route = '/') => {
    const utils = renderInsideApp(<App/>, {route});
    const showMenuButton = utils.getByLabelText(/^toggle show menu$/i);

    // Open menu
    fireEvent.click(showMenuButton);

    utils.getByLabelText(/^drawer menu$/i);
    const menuRules = utils.getByLabelText(/^menu rules list page$/i);
    const menuEventTypes = utils.getByLabelText(/^menu event type list page$/i);
    const menuTargets = utils.getByLabelText(/^menu target list page$/i);
    const menuEvents = utils.getByLabelText(/^menu event logs list page$/i);

    return {
        ...utils,
        showMenuButton,
        menuRules,
        menuEventTypes,
        menuTargets,
        menuEvents
    };
};

test('App render with menu closed and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    const { container, getAllByLabelText, queryByLabelText } = renderInsideApp(<App/>, {route: '/'});
    await waitFor(() => expect(getAllByLabelText(/element row rules/)).toHaveLength(10));
    expect(container).toMatchSnapshot();

    // Menu starts closed
    expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument();
});

test('App render RulesPage with route / and snapshot', async () => {
    const { container, getAllByLabelText, showMenuButton, queryByLabelText } = renderAppWithMenuOpenedInRoute('/');
    await waitFor(() => expect(getAllByLabelText(/element row rules/)).toHaveLength(10));
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

test('App render / and navigate to Event Types Page with route /event-types and snapshot', async () => {
    const { container, getAllByLabelText, queryByLabelText, menuEventTypes} = renderAppWithMenuOpenedInRoute('/');
    await waitFor(() => expect(getAllByLabelText(/element row rules/)).toHaveLength(10));

    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    fireEvent.click(menuEventTypes);
    await waitFor(() => expect(getAllByLabelText(/element row eventtype/i)).toHaveLength(10));
    expect(container).toMatchSnapshot();
    // expect drawer will be closed after navigate to page
    await waitFor(() => expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render / and navigate to TargetListPage with route /targets and snapshot', async () => {
    const { container, getAllByLabelText, queryByLabelText, menuTargets} = renderAppWithMenuOpenedInRoute('/');
    await waitFor(() => expect(getAllByLabelText(/element row rules/)).toHaveLength(10));

    serverGetTargetList(setupNock(BASE_URL), 1, 10);
    fireEvent.click(menuTargets);
    await waitFor(() => expect(getAllByLabelText(/element row target/i)).toHaveLength(10));
    expect(container).toMatchSnapshot();
    // expect drawer will be closed after navigate to page
    await waitFor(() => expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render / and navigate to Events Log with route /event-logs and snapshot', async () => {
    const { container, getAllByLabelText, queryByLabelText, menuEvents} = renderAppWithMenuOpenedInRoute('/');
    await waitFor(() => expect(getAllByLabelText(/element row rules/)).toHaveLength(10));
    expect(queryByLabelText(/^drawer menu$/i)).toBeInTheDocument();

    fireEvent.click(menuEvents);
    expect(getAllByLabelText(/^element row event logs$/i)).toHaveLength(10);
    expect(container).toMatchSnapshot();
    // expect drawer will be closed after navigate to page

    await waitFor(() => expect(queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});