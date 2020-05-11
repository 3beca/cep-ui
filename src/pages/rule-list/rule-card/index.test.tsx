import * as React from 'react';
import { RuleTypes } from '../../../services/api';
import RuleCard, {colorTypeSelector, mapRuleTypeName} from './index';
import { generateRule, render, screen } from '../../../test-utils';

test('selector avatar color function shuold return a default color', () => {
    expect(colorTypeSelector(undefined as unknown as RuleTypes, {ruleCardAvatarPurple: 'default color'} as any)).toEqual('default color');
});

test('mapRuleTypeName should return REAL TIME when undefined type', () => {
    expect(mapRuleTypeName(undefined as unknown as RuleTypes)).toEqual('REAL TIME');
});

test('mapRuleTypeName should return REAL TIME when invalid type', () => {
    expect(mapRuleTypeName('invalidtype' as unknown as RuleTypes)).toEqual('REAL TIME');
});

test('RuleCard should render with a rule and snap', () => {
    const rule = generateRule('rule-test', 3, {'_or': [{'hola': 1}], '_and': [{'adios': 2}], p1: 'valor'});
    const {container} = render(<RuleCard rule={rule}/>);

    expect(screen.getByLabelText(/avatar icon/)).toHaveTextContent('R');
    expect(container).toMatchSnapshot();
});

test('RuleCard should render with a eventType name and targetName', () => {
    const rule = generateRule('rule-test', 3, {'_or': [{'hola': 1}], '_and': [{'adios': 2}], p1: 'valor'});
    const {container} = render(<RuleCard rule={rule}/>);

    expect(screen.getByLabelText(/avatar icon/)).toHaveTextContent('R');
    expect(screen.getByLabelText(/eventType name/)).toHaveTextContent('EventType 3-rule-test');
    expect(screen.getByLabelText(/target name/)).toHaveTextContent('Target 3-rule-test');
    expect(container).toMatchSnapshot();
});
