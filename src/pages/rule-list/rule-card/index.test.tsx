import * as React from 'react';
import { RuleTypes } from '../../../services/api';
import {render} from '@testing-library/react';
import RuleCard, {colorTypeSelector, mapRuleTypeName} from './index';
import { generateRule } from '../../../test-utils';

test('selector avatar color function shuold return a default color', () => {
    expect(colorTypeSelector(undefined as unknown as RuleTypes, {ruleCardAvatarBlue: 'default color'} as any)).toEqual('default color');
});

test('mapRuleTypeName should return REAL TIME when undefined type', () => {
    expect(mapRuleTypeName(undefined as unknown as RuleTypes)).toEqual('REAL TIME');
});

test('mapRuleTypeName should return REAL TIME when invalid type', () => {
    expect(mapRuleTypeName('invalidtype' as unknown as RuleTypes)).toEqual('REAL TIME');
});

test('RuleCard should render with a rule and snap', () => {
    const rule = generateRule(1);
    const {} = render(<RuleCard rule={rule}/>);
});