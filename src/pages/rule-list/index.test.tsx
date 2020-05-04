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
import RuleListPage, {colorTypeSelector, mapRuleTypeName} from './index';
import { RuleTypes } from '../../services/api';
import { BASE_URL } from '../../services/config';

test('selector avatar color function shuold return a default color', () => {
    expect(colorTypeSelector(undefined as unknown as RuleTypes, {ruleCardAvatarBlue: 'default color'} as any)).toEqual('default color');
});

test('mapRuleTypeName should return REAL TIME when undefined type', () => {
    expect(mapRuleTypeName(undefined as unknown as RuleTypes)).toEqual('REAL TIME');
});

test('mapRuleTypeName should return REAL TIME when invalid type', () => {
    expect(mapRuleTypeName('invalidtype' as unknown as RuleTypes)).toEqual('REAL TIME');
});

test(
    'RuleListPage should render 20 cards and a create button and snapshot',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, 200, generateRuleListWith(20, false, false));
        const {container, getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press close button',
    async () => {
        serverGetRuleList(setupNock(BASE_URL), 1, 20, 200, generateRuleListWith(20, false, false));
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
        serverGetRuleList(setupNock(BASE_URL), 1, 20, 200, generateRuleListWith(20, false, false));
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
        serverGetRuleList(setupNock(BASE_URL), 1, 20, 200, generateRuleListWith(20, false, false));
        const {getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        getByLabelText(/rule search bar/i);
        await waitFor(() => expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20));
        getByLabelText(/add rule/i);
    }
);