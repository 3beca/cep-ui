import * as React from 'react';
import {
    renderInsideApp,
    within,
    fireEvent,
    waitFor,
    setupNock,
    serverGetRuleList,
    generateRuleListWith,
} from '../../test-utils';
import RuleListPage  from './index';
import { BASE_URL } from '../../services/config';

test(
    'RuleListPage should render loading component',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(20, false, false));
        const {container, getByTestId, getByLabelText, getAllByLabelText} = renderInsideApp(<RuleListPage/>);

        getByTestId(/loading-view-row/i);
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
    }
);

test(
    'RuleListPage should render Empty List when no elements and snap',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(0, false, false));
        const {container, getByTestId, getByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getByTestId(/empty-view-row/i)).toBeInTheDocument());
        expect(getByTestId(/empty-view-row/i)).toHaveTextContent(/there are not rules created yet/i);
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render End List message when no more elements to load and snap',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(10, false, false));
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
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(20, false, false));
        const {container, getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
        expect(getAllByLabelText(/rule filter elements/i)).toHaveLength(20);
        expect(getAllByLabelText(/rule status element/i)).toHaveLength(20);
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press close button',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(20, false, false));
        const {getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
        const addButton = getByLabelText(/add rule/i);

        fireEvent.click(addButton);
        const dialog = within(document.getElementById('create-rule-dialog')!);
        dialog.getByLabelText(/title create rule/i);
        dialog.getByLabelText(/kind of rules description/i);
        const closeButton = dialog.getByText(/^close$/i);

        fireEvent.click(closeButton);
        await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press selecte button',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(20, false, false));
        const {getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
        const addButton = getByLabelText(/add rule/i);

        fireEvent.click(addButton);
        const dialog = within(document.getElementById('create-rule-dialog')!);
        dialog.getByLabelText(/title create rule/i);
        dialog.getByLabelText(/kind of rules description/i);
        const realTimeCard =  dialog.getByLabelText(/create rule real time card/i);
        const selectButton = dialog.getByText(/^select$/i);

        fireEvent.click(realTimeCard);
        fireEvent.click(selectButton);
        await waitFor(() => expect(document.getElementById('create-rule-dialog')).toBe(null));
    }
);

test(
    'RuleListPage should render a searchbar  and find rules that contains rule',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, '', 200, generateRuleListWith(20, false, false));
        const {getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        getByLabelText(/rule search bar/i);
        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
        getByLabelText(/add rule/i);
    }
);