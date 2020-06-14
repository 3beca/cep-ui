import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    generateRule
} from '../../../test-utils';
import RuleCreator from './index';

test('RuleCreator should render disabled', async () => {
    const rule = generateRule('', 1);
    const updateRule = jest.fn();
    render(<RuleCreator rule={rule} updateRule={updateRule} disabled={true}/>);

    await screen.findByLabelText(/rule creator disabled/i);

    await userEvent.type(await screen.findByLabelText(/rule creator name/i), 'rule name');
    expect(await screen.findByLabelText(/rule creator name/i)).toHaveValue(rule.name);
    expect(updateRule).toHaveBeenCalledTimes(0);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(updateRule).toHaveBeenCalledTimes(0);
});

test('RuleCreator should create a new rule', async () => {
    const updateRule = jest.fn();
    const {rerender} = render(<RuleCreator rule={{name: '', skipOnConsecutivesMatches: false}} updateRule={updateRule}/>);

    await screen.findByLabelText(/rule creator$/i);

    const ruleName = 'rule-name';
    await userEvent.type(await screen.findByLabelText(/rule creator name/i), ruleName);
    expect(updateRule).toHaveBeenCalledTimes(9);
    [...ruleName].map((ch, index) => expect(updateRule).toHaveBeenNthCalledWith(index + 1, {name: ch}))
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(updateRule).toHaveBeenCalledTimes(10);
    expect(updateRule).toHaveBeenNthCalledWith(10, {skipOnConsecutivesMatches: true});

    rerender(<RuleCreator rule={{name: ruleName, skipOnConsecutivesMatches: true}} updateRule={updateRule}/>);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(updateRule).toHaveBeenCalledTimes(11);
    expect(updateRule).toHaveBeenNthCalledWith(11, {skipOnConsecutivesMatches: false});
});