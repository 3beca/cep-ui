import * as React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    serverGetEventTypeList,
    serverGetTargetList,
    serverCreateRule,
    setupNock,
    generateEventTypeListWith,
    generateTargetListWith
} from '../../test-utils';
import {RuleCreatePage} from './index';
import { BASE_URL } from '../../services/config';
import { Rule } from '../../services/api';
import { waitFor } from '@testing-library/react';

const fakeUseParams = useParams as unknown as jest.Mock;
const fakeRedirect = Redirect as unknown as jest.Mock;
jest.mock('react-router', () => {
    const useParams = jest.fn();
    return {
        useParams,
        Redirect: jest.fn().mockReturnValue(null)
    };
});

test('RuleCreatePage for realtime rules should render 3 sections, Manage EventTypes, Create rule and Manage Target and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    fakeUseParams.mockReturnValue({type: 'realtime'});
    const {container} = render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);

    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/loading targets/i);

    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a target/i);

    await screen.findByLabelText(/manage payload loader section/i);
    expect(container).toMatchSnapshot();
});

test('RuleCreatePage should create a Passthrow rule', async () => {
    const eventTypeList = generateEventTypeListWith(10, false, false);
    const targetList = generateTargetListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, eventTypeList);
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, targetList);
    fakeUseParams.mockReturnValue({type: 'realtime'});
    render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);

    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/loading targets/i);

    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a target/i);

    await screen.findByLabelText(/manage payload loader section/i);
    expect(await screen.findByLabelText(/create rule button/i)).toBeDisabled();

    // Select Event Type
    userEvent.click(await screen.findByLabelText(/search a eventtype/i));
    const eventTypes = await screen.findAllByRole('option');
    const eventType = eventTypeList.results[2];
    userEvent.click(eventTypes[2]);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);

    // Select Target
    userEvent.click(await screen.findByLabelText(/search a target/i));
    const targets = await screen.findAllByRole('option');
    const target = targetList.results[2];
    userEvent.click(targets[2]);
    expect(await screen.findByLabelText(/target selected name/i)).toHaveTextContent(target.name);
    expect(await screen.findByLabelText(/target selected url/i)).toHaveTextContent(target.url);

    const ruleName = 'Test-New-Rule';
    userEvent.type(await screen.findByLabelText(/rule create name/i), ruleName);
    userEvent.click(await screen.findByLabelText(/rule create skip consecutives/i));
    expect(await screen.findByLabelText(/create rule button/i)).not.toBeDisabled();

    const ruleBody: Partial<Rule> = {
        name: ruleName,
        type: 'realtime',
        eventTypeId: eventType.id,
        targetId: target.id,
        skipOnConsecutivesMatches: true,
        filters: {}
    };
    const ruleCreated = {
        id: '123456789098',
        ...ruleBody,
        eventTypeName: eventType.name,
        targetName: target.name,
        createdAt: '2020-01-01T10:10:10.123Z',
        updatedAt: '2020-01-01T10:10:10.123Z'
    } as Rule;
    serverCreateRule(setupNock(BASE_URL), ruleBody, 200, ruleCreated);
    userEvent.click(await screen.findByLabelText(/create rule button/i));
    // TODO: Check a passthrow rus was created
    await screen.findByLabelText(/rule create loading/i);
    await waitFor(() => expect(screen.queryByLabelText(/create realtime rule page/i)).toBe(null));
    expect(fakeRedirect).toHaveBeenCalledTimes(1);
    expect(fakeRedirect).toHaveBeenNthCalledWith(1, {to: '/rules/details/' + ruleCreated.id}, {});
});