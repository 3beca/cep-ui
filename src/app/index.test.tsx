import React from 'react';
import userEvent from '@testing-library/user-event';
import { waitFor, screen } from '@testing-library/react';
import App from './index';
import {
    setupNock,
    serverGetEventTypeList,
    serverGetTargetList,
    serverGetRuleList,
    generateRuleListWith,
    renderInsideApp,
    generateEventTypeListWith,
    generateTargetListWith
} from '../test-utils';
import {BASE_URL} from '../services/config';

export const selectCreateRule = async (ariaLabel: 'real time'|'hopping'|'sliding'|'tumbling') => {
    const addButton = await screen.findByLabelText(/add rule/i);
    userEvent.click(addButton);
    await screen.findByLabelText(/title create rule/i);
    await screen.findByLabelText(/kind of rules description/i);
    const realTimeCard =  await screen.findByLabelText(`create rule ${ariaLabel} card`);
    const selectButton = await screen.findByText(/^select$/i);
    userEvent.click(realTimeCard);
    userEvent.click(selectButton);
    await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
};

export const renderAppWithMenuOpenedInRoute = (route = '/') => {
    const utils = renderInsideApp(<App/>, {route});
    const showMenuButton = utils.getByLabelText(/^toggle show menu$/i);

    // Open menu
    userEvent.click(showMenuButton);

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
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderInsideApp(<App/>, {route: '/'});
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    // Menu starts closed
    expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument();
});

test('App render RulesPage with route / and snapshot', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    const {showMenuButton} = renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);
    expect(await screen.findByLabelText(/^drawer menu$/i)).toBeInTheDocument();

    // Close Menu
    userEvent.click(showMenuButton);
    await waitFor(() => expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render NotFoundPage with route /unknown and snapshot', async () => {
    renderAppWithMenuOpenedInRoute('/unknown');
    await screen.findByLabelText(/page not found/i);
});

test('App render / and navigate to Event Types Page with route /event-types and snapshot', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    const {menuEventTypes} = renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    serverGetEventTypeList(setupNock(BASE_URL), 1, 10);
    userEvent.click(menuEventTypes);
    expect(await screen.findAllByLabelText(/element row eventtype/i)).toHaveLength(10);
    // expect drawer will be closed after navigate to page
    await waitFor(() => expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render / and navigate to TargetListPage with route /targets and snapshot', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    const {menuTargets} = renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    serverGetTargetList(setupNock(BASE_URL), 1, 10);
    userEvent.click(menuTargets);
    expect(await screen.findAllByLabelText(/element row target/i)).toHaveLength(10);
    // expect drawer will be closed after navigate to page
    await waitFor(() => expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render / and navigate to Events Log with route /event-logs and snapshot', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    const {menuEvents} = renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);
    expect(await screen.findByLabelText(/^drawer menu$/i)).toBeInTheDocument();

    userEvent.click(menuEvents);
    expect(await screen.findAllByLabelText(/^element row event logs$/i)).toHaveLength(10);
    // expect drawer will be closed after navigate to page
    await waitFor(() => expect(screen.queryByLabelText(/^drawer menu$/i)).not.toBeInTheDocument());
});

test('App render / and navigate to create real time rule', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    await selectCreateRule('real time');
    // Expect to navigate to create real tiem rule
    await screen.findByLabelText(/create realtime rule page/);
    await screen.findByLabelText(/search a eventtype/i);
    await screen.findByLabelText(/search a target/i);
});

test('App render / and navigate to create sliding rule', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    await selectCreateRule('sliding');
    // Expect to navigate to create real tiem rule
    await screen.findByLabelText(/create sliding rule page/);
    await screen.findByLabelText(/search a eventtype/i);
    await screen.findByLabelText(/search a target/i);
});

test('App render / and navigate to create hopping rule', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    await selectCreateRule('hopping');
    // Expect to navigate to create real tiem rule
    await screen.findByLabelText(/create hopping rule page/);
    await screen.findByLabelText(/search a eventtype/i);
    await screen.findByLabelText(/search a target/i);
});

test('App render / and navigate to create tumbling rule', async () => {
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, generateRuleListWith(10, false, false));
    renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/)).toHaveLength(10);

    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    await selectCreateRule('tumbling');
    // Expect to navigate to create real tiem rule
    await screen.findByLabelText(/create tumbling rule page/);
    await screen.findByLabelText(/search a eventtype/i);
    await screen.findByLabelText(/search a target/i);
});

test('App render / and navigate to rule details', async () => {
    const ruleList = generateRuleListWith(10, false, false);
    serverGetRuleList(setupNock(BASE_URL), 1, 10, '', 200, ruleList);
    renderAppWithMenuOpenedInRoute('/');
    expect(await screen.findAllByLabelText(/element card rule/i)).toHaveLength(10);
    const rule = ruleList.results[0];
    const firstRuleCardSettings = (await screen.findAllByLabelText(/settings card rule/i))[0];
    userEvent.click(firstRuleCardSettings);

    expect(await screen.findAllByLabelText(/setting dialog card rule/i)).toHaveLength(10);
    const detailsCardButtons = await screen.findAllByLabelText(/setting dialog details card rule/i);
    expect(detailsCardButtons).toHaveLength(10);
    userEvent.click(detailsCardButtons[0]);

    // Expect to navigate to details rule
    await screen.findByLabelText(`details rule ${rule.id} page`);
});