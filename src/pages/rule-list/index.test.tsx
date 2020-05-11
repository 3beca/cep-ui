import * as React from 'react';
import {
    renderInsideApp,
    fireEvent,
    waitFor,
    setupNock,
    serverGetRuleList,
    generateRuleListWith,
    screen,
    act
} from '../../test-utils';
import userEvent from '@testing-library/user-event';
import RuleListPage  from './index';
import { BASE_URL } from '../../services/config';

const initialPage = 1;
const initialPageSize = 10;
const filter = '';

test(
    'RuleListPage should render loading component',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        const {container, getByTestId, getByLabelText, getAllByLabelText} = renderInsideApp(<RuleListPage/>);

        getByTestId(/loading-view-row/i);
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize));
    }
);

test(
    'RuleListPage should render Empty List when no elements and snap',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(0, false, false));
        const {container, getByTestId, getByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getByTestId(/empty-view-row/i)).toBeInTheDocument());
        expect(getByTestId(/empty-view-row/i)).toHaveTextContent(/there are no rules created yet/i);
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render End List message when no more elements to load and snap',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(10, false, false));
        const {container, getByTestId, getByLabelText, getAllByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(10));
        expect(getByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
        getByLabelText(/add rule/i);
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

        await waitFor(() => expect(screen.getAllByLabelText(/^element card rule$/i)).toHaveLength(1));
        const addButton = screen.getByLabelText(/add rule/i);

        fireEvent.click(addButton);
        screen.getByLabelText(/title create rule/i);
        screen.getByLabelText(/kind of rules description/i);
        const closeButton = screen.getByText(/^close$/i);

        fireEvent.click(closeButton);
        await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press select button',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(screen.getAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize));
        const addButton = screen.getByLabelText(/add rule/i);

        fireEvent.click(addButton);
        screen.getByLabelText(/title create rule/i);
        screen.getByLabelText(/kind of rules description/i);
        const realTimeCard =  screen.getByLabelText(/create rule real time card/i);
        const selectButton = screen.getByText(/^select$/i);

        fireEvent.click(realTimeCard);
        fireEvent.click(selectButton);
        await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
    }
);

test(
    'RuleListPage should render a searchbar  and find rules that contains rule',
    async () => {
        jest.useFakeTimers();
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, false, false));
        const {getAllByLabelText, getByLabelText, queryByTestId} = renderInsideApp(<RuleListPage/>);

        getByLabelText(/rule search bar/i);
        const input = getByLabelText(/search input/i) as HTMLInputElement;
        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize));
        getByLabelText(/add rule/i);

        const searchText = 'rule-name';
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, searchText, 200, generateRuleListWith(initialPageSize, false, false));
        userEvent.type(input, searchText);
        act(() => {
            jest.runOnlyPendingTimers();
        });
        await waitFor(() => expect(queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize));
    }
);

test(
    'RuleListPage should render Empty List whith filter when no elements and snap',
    async () => {
        jest.useFakeTimers();
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(0, false, false));
        const {container, getByTestId, getByLabelText, queryByTestId} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getByTestId(/empty-view-row/i)).toBeInTheDocument());
        expect(getByTestId(/empty-view-row/i)).toHaveTextContent(/there are no rules created yet/i);
        getByLabelText(/add rule/i);

        const searchText = 'rule-name';
        const input = getByLabelText(/search input/i) as HTMLInputElement;
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, searchText, 200, generateRuleListWith(0, false, false));
        userEvent.type(input, searchText);
        act(() => {
            jest.runOnlyPendingTimers();
        });
        await waitFor(() => expect(queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
        await waitFor(() => expect(getByTestId(/empty-view-row/i)).toBeInTheDocument());
        expect(getByTestId(/empty-view-row/i)).toHaveTextContent(/There are no elements for "rule-name"/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should not render load button when there are NO MORE elements',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(10, false, false));
        renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(screen.getAllByLabelText(/^element card rule$/i)).toHaveLength(10));
        expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
        expect(screen.getByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
    }
);

test(
    'RuleListPage should render load button when there are more elements and load next set of elelments when click',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), initialPage, initialPageSize, filter, 200, generateRuleListWith(initialPageSize, true, false));
        renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(screen.getAllByLabelText(/^element card rule$/i)).toHaveLength(initialPageSize));
        const loadMore = screen.getByLabelText(/load more rules/i);

        serverGetRuleList(setupNock(BASE_URL), initialPage + 1, initialPageSize, filter, 200, generateRuleListWith(5, false, true));
        fireEvent.click(loadMore);
        await waitFor(() => expect(screen.queryByTestId(/loading-view-row/i)).not.toBeInTheDocument());
        await waitFor(() => expect(screen.getAllByLabelText(/^element card rule$/i)).toHaveLength(15));
        expect(screen.queryByLabelText(/load more rules/i)).not.toBeInTheDocument();
        expect(screen.getByTestId(/empty-view-row/i)).toHaveTextContent(/you reached the end of the list/i);
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