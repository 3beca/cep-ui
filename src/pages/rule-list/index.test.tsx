import * as React from 'react';
import {
    renderInsideApp,
    waitFor,
    setupNock,
    serverGetRuleList,
    generateRuleListWith,
    screen,
    act,
    fireEvent
} from '../../test-utils';
import userEvent from '@testing-library/user-event';
import RuleListPage  from './index';
import { BASE_URL } from '../../services/config';

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

const initialPage = 1;
const initialPageSize = 10;
const filter = '';

test(
    'RuleListPage should render loading component',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        const {container} = renderInsideApp(<RuleListPage/>);

        await screen.findByTestId(/loading-view-row/i);
        await screen.findByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
    }
);

test(
    'RuleListPage should render Empty List when no elements and snap',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(0, false, false));
        const {container} = renderInsideApp(<RuleListPage/>);

        expect(await screen.findByTestId(/empty-view-row/i)).toBeInTheDocument();
        expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/there are no rules created yet/i);
        await screen.findByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render End List message when no more elements to load and snap',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(10, false, false));
        const {container} = renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(10);
        expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
        await screen.findByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render 20 cards and a create button and snapshot',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        const {container} = renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
        expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(initialPageSize);
        expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(initialPageSize);
        await screen.findByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press close button',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
        const addButton = await screen.findByLabelText(/add rule/i);

        userEvent.click(addButton);
        await screen.findByLabelText(/title create rule/i);
        await screen.findByLabelText(/kind of rules description/i);
        const closeButton = await screen.findByText(/^close$/i);

        userEvent.click(closeButton);
        await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press select button',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
        await selectCreateRule('real time');
    }
);

test(
    'RuleListPage should render a searchbar  and find rules that contains rule',
    async () => {
        jest.useFakeTimers();
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        renderInsideApp(<RuleListPage/>);

        await screen.findByLabelText(/rule search bar/i);
        const input = await screen.findByLabelText(/search input/i) as HTMLInputElement;
        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
        await screen.findByLabelText(/add rule/i);

        const searchText = 'rule-name';
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, searchText, 200, generateRuleListWith(initialPageSize, false, false));
        userEvent.type(input, searchText);
        act(() => {
            jest.runOnlyPendingTimers();
        });
        await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
        jest.useRealTimers();
    }
);

test(
    'RuleListPage should render Empty List whith filter when no elements and snap',
    async () => {
        jest.useFakeTimers();
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(0, false, false));
        const {container} = renderInsideApp(<RuleListPage/>);

        expect(await screen.findByTestId(/empty-view-row/i)).toBeInTheDocument();
        expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/there are no rules created yet/i);
        await screen.findByLabelText(/add rule/i);

        const searchText = 'rule-name';
        const input = await screen.findByLabelText(/search input/i) as HTMLInputElement;
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, searchText, 200, generateRuleListWith(0, false, false));
        userEvent.type(input, searchText);
        act(() => {
            jest.runOnlyPendingTimers();
        });
        await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
        expect(await screen.findByTestId(/empty-view-row/i)).toBeInTheDocument();
        expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/There are no elements for "rule-name"/i);
        expect(container).toMatchSnapshot();
        jest.useRealTimers();
    }
);

test(
    'RuleListPage should not render load button when there are NO MORE elements',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(10, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(10);
        expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
        expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
    }
);

test(
    'RuleListPage should render load button when there are more elements and load next set of elelments when click',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, true, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize);
        const loadMore = await screen.findByLabelText(/load more rules/i);

        serverGetRuleList(setupNock(BASE_URL), initialPage + 1, initialPageSize, filter, 200, generateRuleListWith(5, false, true));
        fireEvent.click(loadMore);
        expect(await screen.findByTestId(/loading-view-row/i)).toBeInTheDocument();
        await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(15);
        expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
        expect(await screen.findByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
    }
);

test(
    'RuleListPage should render 10 RuleCards with header eventType, target, filters and status',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, true, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/element card rule/i)).toHaveLength(10);
        expect(await screen.findAllByLabelText(/eventType name card rule/i)).toHaveLength(10);
        expect(await screen.findAllByLabelText(/target name card rule/i)).toHaveLength(10);
        expect(await screen.findAllByLabelText(/filters card rule/i)).toHaveLength(10);
        expect(await screen.findAllByLabelText(/status card rule/i)).toHaveLength(10);
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and navigate to create realtime rule when select',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
        await selectCreateRule('real time');
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and navigate to create sliding rule when select',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
        await selectCreateRule('sliding');
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and navigate to create hopping rule when select',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
        await selectCreateRule('hopping');
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and navigate to create tumbling rule when select',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(1, false, false));
        renderInsideApp(<RuleListPage/>);

        expect(await screen.findAllByLabelText(/^element card rule$/i)).toHaveLength(1);
        await selectCreateRule('tumbling');
    }
);