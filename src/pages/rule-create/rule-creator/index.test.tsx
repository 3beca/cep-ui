import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen
} from '../../../test-utils';
import RuleCreator, { RuleHeader } from './index';

test('RuleCreator should render disabled', async () => {
    const ruleHeader: RuleHeader = {name: 'rule name', skipOnConsecutivesMatches: false};
    const updateRuleHeader = jest.fn();
    render(<RuleCreator ruleHeader={ruleHeader} updateRuleHeader={updateRuleHeader} disabled={true}/>);

    await screen.findByLabelText(/rule creator disabled/i);

    await userEvent.type(await screen.findByLabelText(/rule creator name/i), 'rule name');
    expect(await screen.findByLabelText(/rule creator name/i)).toHaveValue(ruleHeader.name);
    expect(updateRuleHeader).toHaveBeenCalledTimes(0);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(updateRuleHeader).toHaveBeenCalledTimes(0);
});

test('RuleCreator should create a new rule', async () => {
    const updateRuleHeader = jest.fn();
    const {rerender} = render(<RuleCreator ruleHeader={{name: '', skipOnConsecutivesMatches: false}} updateRuleHeader={updateRuleHeader}/>);

    await screen.findByLabelText(/rule creator$/i);

    const ruleName = 'rule-name';
    await userEvent.type(await screen.findByLabelText(/rule creator name/i), ruleName);
    expect(updateRuleHeader).toHaveBeenCalledTimes(9);
    [...ruleName].map((ch, index) => expect(updateRuleHeader).toHaveBeenNthCalledWith(index + 1, {name: ch}))
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(updateRuleHeader).toHaveBeenCalledTimes(10);
    expect(updateRuleHeader).toHaveBeenNthCalledWith(10, {skipOnConsecutivesMatches: true});

    rerender(<RuleCreator ruleHeader={{name: ruleName, skipOnConsecutivesMatches: true}} updateRuleHeader={updateRuleHeader}/>);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(updateRuleHeader).toHaveBeenCalledTimes(11);
    expect(updateRuleHeader).toHaveBeenNthCalledWith(11, {skipOnConsecutivesMatches: false});
});