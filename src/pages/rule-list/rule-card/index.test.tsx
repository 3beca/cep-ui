import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {Link} from 'react-router-dom';
import { RuleTypes } from '../../../services/api';
import RuleCard, {colorTypeSelector, mapRuleTypeName} from './index';
import { generateRule, render, screen } from '../../../test-utils';

const fakeLink = Link as unknown as {linkAction: jest.Mock};
jest.mock('react-router-dom', () => {
    const React = require('react');
    const linkAction = jest.fn();
    const Link = React.forwardRef((props: any, ref: any) => {
        return <div ref={ref} {...props} onClick={() => {
            props.onClick && props.onClick();
            linkAction(props.to);
        }}/>
    });
    Link.linkAction = linkAction;
    return {
        Link
    };
});

beforeEach(() => fakeLink.linkAction.mockClear());

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

test('RuleCard should render with a eventType name, target name, filters and skip execution disable', async () => {
    const rule = generateRule('rule-test', 3, {'_or': [{'hola': 1}], '_and': [{'adios': 2}], p1: 'valor'});
    const {container} = render(<RuleCard rule={rule}/>);

    expect(await screen.findByLabelText(/avatar icon/)).toHaveTextContent('R');
    expect(await screen.findByLabelText(/eventType name card rule/)).toHaveTextContent('EventType 3-rule-test');
    expect(await screen.findByLabelText(/target name card rule/)).toHaveTextContent('Target 3-rule-test');
    await screen.findByLabelText(/filters card rule/);
    expect(await screen.findByLabelText(/status card rule/)).toHaveTextContent(/skip consecutives/i);
    await screen.findByLabelText(/skip consecutives disable/);
    expect(await screen.findByRole('checkbox')).toHaveAttribute('readonly');
    expect(container).toMatchSnapshot();
});

test('RuleCard should render with a eventType name, target name, filter passthrow and skip execution enable', async () => {
    const rule = generateRule('rule-test', 2, {});
    const {container} = render(<RuleCard rule={rule}/>);

    expect(await screen.findByLabelText(/avatar icon/)).toHaveTextContent('T');
    expect(await screen.findByLabelText(/eventType name card rule/)).toHaveTextContent('EventType 2-rule-test');
    expect(await screen.findByLabelText(/target name card rule/)).toHaveTextContent('Target 2-rule-test');
    expect(await screen.findByLabelText(/filters card rule/)).toHaveTextContent(/^filters.*passthrow$/i);
    expect(await screen.findByLabelText(/status card rule/)).toHaveTextContent(/skip consecutives/i);
    await screen.findByLabelText(/skip consecutives enable/);
    expect(await screen.findByRole('checkbox')).toHaveAttribute('readonly');
    expect(container).toMatchSnapshot();
});

test('RuleCard should open the context menu and navigate to details', async () => {
    const rule = generateRule('rule-test', 2, {});
    render(<RuleCard rule={rule}/>);
    await screen.findByLabelText(/setting dialog card rule hidden$/);

    expect(await screen.findByLabelText(/avatar icon/)).toHaveTextContent('T');
    userEvent.click(await screen.findByLabelText(/settings card rule$/i));
    await screen.findByLabelText(/setting dialog card rule visible/);

    userEvent.click(await screen.findByLabelText(/setting dialog details card rule$/i));
    expect(fakeLink.linkAction).toHaveBeenCalledTimes(1);
    expect(fakeLink.linkAction).toHaveBeenNthCalledWith(1, '/rules/details/2_rule-test');
    await screen.findByLabelText(/setting dialog card rule hidden$/);
});