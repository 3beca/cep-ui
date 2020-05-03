import * as React from 'react';
import {renderInsideApp, within, fireEvent, waitFor} from '../../test-utils';
import RuleListPage, {colorTypeSelector} from './index';
import { RuleTypes } from '../../services/api';

test('selector avatar color function shuold return a default color', () => {
    expect(colorTypeSelector(undefined as unknown as RuleTypes, {ruleCardAvatarBlue: 'default color'} as any)).toEqual('default color');
});

test(
    'RuleListPage should render 20 cards and a create button and snapshot',
    async () => {
        const {container, getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20);
        getByLabelText(/add rule/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'RuleListPage should render a create rule dialog when click on add button and close when press close button',
    async () => {
        const {getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20);
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
        const {getAllByLabelText, getByLabelText} = renderInsideApp(<RuleListPage/>);

        expect(getAllByLabelText(/^element card rule$/i)).toHaveLength(20);
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