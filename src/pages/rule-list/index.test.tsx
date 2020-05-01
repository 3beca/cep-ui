import * as React from 'react';
import {renderInsideApp} from '../../test-utils';
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