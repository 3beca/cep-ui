import * as React from 'react';
import {
    renderInsideApp,
    waitFor,
    setupNock,
    serverGetRuleList,
    generateRuleListWith,
    screen,
    act,
    within,
    waitForElementToBeRemoved,
    serverDeleteRule
} from '../../test-utils';
import userEvent from '@testing-library/user-event';
import RuleListPage from './index';
import { BASE_URL } from '../../services/config';
import { Rule, ServiceError, ServiceList } from '../../services/api';

export const selectCreateRule = async (ariaLabel: 'real time' | 'hopping' | 'sliding' | 'tumbling') => {
    const addButton = await screen.findByLabelText(/add rule/i);
    userEvent.click(addButton);
    await screen.findByLabelText(/title create rule/i);
    await screen.findByLabelText(/kind of rules description/i);
    const realTimeCard = await screen.findByLabelText(`create rule ${ariaLabel} card`);
    const selectButton = await screen.findByText(/^select$/i);
    userEvent.click(realTimeCard);
    userEvent.click(selectButton);
    await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
};

const initialPage = 1;
const initialPageSize = 10;
const filter = '';

test('RuleListPage should render loading component', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
    const { container } = renderInsideApp(<RuleListPage />);

    await screen.findByTestId(/loading-view-row/i);
    await screen.findByLabelText(/add rule/i);

    expect(container).toMatchSnapshot();

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
});

test('RuleListPage should render Empty List when no elements and snap', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(0, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findByTestId(/empty-view-row/i)).toBeInTheDocument();
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/there are no rules created yet/i);
    await screen.findByLabelText(/add rule/i);
});

test('RuleListPage should render End List message when no more elements to load and snap', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(10, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(10);
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
    await screen.findByLabelText(/add rule/i);
});

test('RuleListPage should render 20 cards and a create button and snapshot', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(initialPageSize);
    await screen.findByLabelText(/add rule/i);
});

test('RuleListPage should render a create rule dialog when click on add button and close when press close button', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
    const addButton = await screen.findByLabelText(/add rule/i);

    userEvent.click(addButton);
    await screen.findByLabelText(/title create rule/i);
    await screen.findByLabelText(/kind of rules description/i);
    const closeButton = await screen.findByText(/^close$/i);

    userEvent.click(closeButton);
    await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
});

test('RuleListPage should render a create rule dialog when click on add button and close when press select button', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    await selectCreateRule('real time');
});

test('RuleListPage should render a searchbar  and find rules that contains rule', async () => {
    jest.useFakeTimers();
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
    renderInsideApp(<RuleListPage />);

    await screen.findByLabelText(/rule search bar/i);
    const input = (await screen.findByLabelText(/search input/i)) as HTMLInputElement;
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    await screen.findByLabelText(/add rule/i);

    const searchText = 'rule-name';
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, searchText, 200, generateRuleListWith(5, false, false));
    await userEvent.type(input, searchText);
    act(() => void jest.runOnlyPendingTimers());
    await screen.findByTestId(/loading-view-row/i);
    await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(5);
    jest.useRealTimers();
});

test('RuleListPage should render Empty List whith filter when no elements and snap', async () => {
    jest.useFakeTimers();
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(0, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findByTestId(/empty-view-row/i)).toBeInTheDocument();
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/there are no rules created yet/i);
    await screen.findByLabelText(/add rule/i);

    const searchText = 'rule-name';
    const input = (await screen.findByLabelText(/search input/i)) as HTMLInputElement;
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, searchText, 200, generateRuleListWith(0, false, false));
    await userEvent.type(input, searchText);
    act(() => void jest.runOnlyPendingTimers());
    await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
    expect(await screen.findByTestId(/empty-view-row/i)).toBeInTheDocument();
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/There are no elements for "rule-name"/i);
    jest.useRealTimers();
});

test('RuleListPage should not render load button when there are NO MORE elements', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(10, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(10);
    expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
});

test('RuleListPage should render load button when there are more elements and load next set of elelments when click', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, true, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    const loadMore = await screen.findByLabelText(/load more rules/i);

    serverGetRuleList(setupNock(BASE_URL), initialPage + 1, initialPageSize, filter, 200, generateRuleListWith(5, false, true));
    userEvent.click(loadMore);
    expect(await screen.findByTestId(/loading-view-row/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(15);
    expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
});

test('RuleListPage should render 10 RuleCards with header eventType, target, filters and status', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, true, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/element card rule/i)).toHaveLength(10);
    expect(await screen.findAllByLabelText(/eventType name card rule/i)).toHaveLength(10);
    expect(await screen.findAllByLabelText(/target name card rule/i)).toHaveLength(10);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(10);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(10);
});

test('RuleListPage should render a create rule dialog when click on add button and navigate to create realtime rule when select', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
    await selectCreateRule('real time');
});

test('RuleListPage should render a create rule dialog when click on add button and navigate to create sliding rule when select', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
    await selectCreateRule('sliding');
});

test('RuleListPage should render a create rule dialog when click on add button and navigate to create hopping rule when select', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
    await selectCreateRule('hopping');
});

test('RuleListPage should render a create rule dialog when click on add button and navigate to create tumbling rule when select', async () => {
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
    await selectCreateRule('tumbling');
});

test('RuleListPage should delete the first rule and update the list', async () => {
    const rules = generateRuleListWith(initialPageSize, true, false);
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, rules);
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(initialPageSize);
    await screen.findByLabelText(/add rule/i);
    // Find first Rule Card
    const ruleCards = await screen.findAllByLabelText(/^element card rule$/i);
    const firstCard = within(ruleCards[0]);
    const ruleToDelete = rules.results[0];
    await screen.findByText(ruleToDelete.name);
    // Open acctions dialog
    userEvent.click(await firstCard.findByLabelText(/settings card rule/i));
    // Cacture actions dialog
    const dialogs = await screen.findAllByLabelText(/setting dialog card rule visible/i);
    expect(dialogs).toHaveLength(1);
    const actionsDialog = within(dialogs[0]);
    // Open delete action
    userEvent.click(await actionsDialog.findByLabelText(/setting dialog delete card rule/i));
    const deleteDialogs = await screen.findAllByLabelText(/delete dialog card rule/i);
    expect(deleteDialogs).toHaveLength(1);
    // Delete first Rule
    const newPageSize = initialPageSize - 1;
    serverDeleteRule(setupNock(BASE_URL), rules.results[0].id);
    const newRulesResult: ServiceList<Rule> = {
        ...rules,
        results: rules.results.slice(1)
    };
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, newRulesResult);
    userEvent.click(await screen.findByLabelText(/delete button/i));
    await waitForElementToBeRemoved(await screen.findByLabelText(/delete dialog card rule/i));
    await waitForElementToBeRemoved(await screen.findByTestId('loading-view-row'));
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(newPageSize);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(newPageSize);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(newPageSize);
    expect(screen.queryByText(ruleToDelete.name)).not.toBeInTheDocument();
});

test('RuleListPage should delete the first rule when load two pages and update the list', async () => {
    const rules = generateRuleListWith(initialPageSize, true, false, 'page1');
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, rules);
    const { unmount } = renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(initialPageSize);
    await screen.findByLabelText(/add rule/i);

    // Load next page of rules
    const loadMore = await screen.findByLabelText(/load more rules/i);
    serverGetRuleList(setupNock(BASE_URL), initialPage + 1, initialPageSize, filter, 200, generateRuleListWith(5, false, true, 'page2'));
    userEvent.click(loadMore);
    expect(await screen.findByTestId(/loading-view-row/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
    const newPageSize = 15;
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(newPageSize);
    expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
    expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);

    // Find Rule Card in position 6
    const ruleCards = await screen.findAllByLabelText(/^element card rule$/i);
    const firstCard = within(ruleCards[6]);
    const ruleToDelete = rules.results[6];
    await screen.findByText(ruleToDelete.name);
    // Open acctions dialog
    userEvent.click(await firstCard.findByLabelText(/settings card rule/i));
    // Capture actions dialog
    const dialogs = await screen.findAllByLabelText(/setting dialog card rule visible/i);
    expect(dialogs).toHaveLength(1);
    const actionsDialog = within(dialogs[0]);
    // Open delete action
    userEvent.click(await actionsDialog.findByLabelText(/setting dialog delete card rule/i));
    const deleteDialogs = await screen.findAllByLabelText(/delete dialog card rule/i);
    expect(deleteDialogs).toHaveLength(1);
    // Delete Rule in position 6
    serverDeleteRule(setupNock(BASE_URL), ruleToDelete.id);
    userEvent.click(await screen.findByLabelText(/delete button/i));
    await waitForElementToBeRemoved(await screen.findByLabelText(/delete dialog card rule/i));
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(newPageSize - 1);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(newPageSize - 1);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(newPageSize - 1);
    expect(screen.queryByText(ruleToDelete.name)).not.toBeInTheDocument();
    unmount();
});

test('RuleListPage should fails when cannnot delete a Rule', async () => {
    const rules = generateRuleListWith(initialPageSize, true, false);
    serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, rules);
    renderInsideApp(<RuleListPage />);

    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(initialPageSize);
    await screen.findByLabelText(/add rule/i);
    // Find first Rule Card
    const ruleCards = await screen.findAllByLabelText(/^element card rule$/i);
    const firstCard = within(ruleCards[0]);
    const ruleToDelete = rules.results[0];
    await screen.findByText(ruleToDelete.name);
    // Open acctions dialog
    userEvent.click(await firstCard.findByLabelText(/settings card rule/i));
    // Cacture actions dialog
    const dialogs = await screen.findAllByLabelText(/setting dialog card rule visible/i);
    expect(dialogs).toHaveLength(1);
    const actionsDialog = within(dialogs[0]);
    // Open delete action
    userEvent.click(await actionsDialog.findByLabelText(/setting dialog delete card rule/i));
    const deleteDialogs = await screen.findAllByLabelText(/delete dialog card rule/i);
    expect(deleteDialogs).toHaveLength(1);
    // Fails to delete first Rule
    const deleteError: ServiceError = {
        error: 'Invalid id of Rule',
        message: 'Cannot delete this rule, please go away...',
        statusCode: 400
    };
    serverDeleteRule(setupNock(BASE_URL), ruleToDelete.id, 400, deleteError);
    userEvent.click(await screen.findByLabelText(/delete button/i));
    // Show error message
    await screen.findByLabelText(/error message/i);
    // Close dialog
    userEvent.click(await screen.findByLabelText(/close button/));
    await waitForElementToBeRemoved(await screen.findByLabelText(/delete dialog card rule/i));
    expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(initialPageSize);
    expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(initialPageSize);
    expect(await screen.findByText(ruleToDelete.name)).toBeInTheDocument();
});
