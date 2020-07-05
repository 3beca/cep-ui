import * as React from 'react';
import {useParams, Link} from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    waitFor,
    serverGetEventTypeList,
    serverGetTargetList,
    serverCreateRule,
    setupNock,
    generateEventTypeListWith,
    generateTargetListWith,
    generateEventLogListWithPayload,
    serverGetEventLogList
} from '../../test-utils';
import RuleCreatePage, {ConfigFilterExpression} from './';
import { BASE_URL } from '../../services/config';
import { Rule, RuleError } from '../../services/api';
import { Payload, RULEFILTERCONTAINER, EXPRESSION } from '../../services/api/utils';

const fakeUseParams = useParams as unknown as jest.Mock;
const fakeLink = Link as unknown as {linkAction: jest.Mock};
jest.mock('react-router-dom', () => {
    const React = require('react');
    const useParams = jest.fn();
    const linkAction = jest.fn();
    const Link = React.forwardRef((props: any, ref: any) => {
        return <div ref={ref} {...props} onClick={() => linkAction(props.to)}/>
    });
    Link.linkAction = linkAction;
    return {
        useParams,
        Link
    };
});

beforeEach(() => {
    fakeUseParams.mockClear();
    fakeLink.linkAction.mockClear();
});
test('RuleCreatePage for realtime rules should render 3 sections, Manage EventTypes, Create rule and Manage Target and snapshot', async () => {
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, generateEventTypeListWith(10, false, false));
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    fakeUseParams.mockReturnValue({type: 'realtime'});
    render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);

    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/loading targets/i);

    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a target/i);

    await screen.findByLabelText(/manage payload creator section/i);
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

    await screen.findByLabelText(/manage payload creator section/i);
    expect(await screen.findByLabelText(/rule create button/i)).toBeDisabled();

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
    await userEvent.type(await screen.findByLabelText(/rule creator name/i), ruleName);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(await screen.findByLabelText(/rule create button/i)).not.toBeDisabled();

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
    serverCreateRule(setupNock(BASE_URL), ruleBody, 201, ruleCreated);
    userEvent.click(await screen.findByLabelText(/rule create button/i));
    expect(await screen.findByLabelText(/rule create button/)).toBeDisabled();
    await screen.findByLabelText(/rule create loading/i);
    await screen.findByLabelText(/rule create success$/i);
    expect(await screen.findByLabelText(/rule create success message/i)).toHaveTextContent(`Rule ${ruleCreated.name} created successfully`);
    expect(screen.queryByLabelText(/rule create error message/i)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule create success button details/));
    expect(fakeLink.linkAction).toHaveBeenCalledTimes(1);
    expect(fakeLink.linkAction).toHaveBeenNthCalledWith(1, "/rules/details/123456789098");
});

test('RuleCreatePage should show an error when create rule fails', async () => {
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

    await screen.findByLabelText(/manage payload creator section/i);
    expect(await screen.findByLabelText(/rule create button/i)).toBeDisabled();

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
    await userEvent.type(await screen.findByLabelText(/rule creator name/i), ruleName);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(await screen.findByLabelText(/rule create button/i)).not.toBeDisabled();

    const ruleBody: Partial<Rule> = {
        name: ruleName,
        type: 'realtime',
        eventTypeId: eventType.id,
        targetId: target.id,
        skipOnConsecutivesMatches: true,
        filters: {}
    };

    const ruleError: RuleError = {
        statusCode: 400,
        error: 'Bad Request',
        message: 'body/type should be equal to one of the allowed values'
    };
    serverCreateRule(setupNock(BASE_URL), ruleBody, 400, ruleError);
    userEvent.click(await screen.findByLabelText(/rule create button/i));
    expect(await screen.findByLabelText(/rule create button/)).toBeDisabled();
    screen.getByLabelText(/rule create loading/i);
    await screen.findByLabelText(/eventtype selector disabled/i);
    await screen.findByLabelText(/target selector disabled/i);
    await screen.findByLabelText(/payload creator disabled/i);
    await screen.findByLabelText(/rule creator disabled/i);
    expect(await screen.findByLabelText(/rule create error message/i)).toHaveTextContent(ruleError.message);
    expect(screen.queryByLabelText(/rule create success message/i)).not.toBeInTheDocument();
});

test('RuleCreatePage should create a new Rule after create one', async () => {
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

    await screen.findByLabelText(/manage payload creator section/i);
    expect(await screen.findByLabelText(/rule create button/i)).toBeDisabled();

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
    await userEvent.type(await screen.findByLabelText(/rule creator name/i), ruleName);
    userEvent.click(await screen.findByLabelText(/rule creator skip consecutives/i));
    expect(await screen.findByLabelText(/rule create button/i)).not.toBeDisabled();

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
    serverCreateRule(setupNock(BASE_URL), ruleBody, 201, ruleCreated);
    userEvent.click(await screen.findByLabelText(/rule create button/i));
    expect(await screen.findByLabelText(/rule create button/)).toBeDisabled();
    await screen.findByLabelText(/rule create loading/i);
    await screen.findByLabelText(/rule create success$/i);
    expect(await screen.findByLabelText(/rule create success message/i)).toHaveTextContent(`Rule ${ruleCreated.name} created successfully`);
    expect(screen.queryByLabelText(/rule create error message/i)).not.toBeInTheDocument();

    userEvent.click(await screen.findByLabelText(/rule create success button more/));
    expect(fakeLink.linkAction).toHaveBeenCalledTimes(0);
    expect(screen.queryByLabelText(/rule create success$/i)).not.toBeInTheDocument();

    const secondRule = 'Second-rule';
    userEvent.clear(await screen.findByLabelText(/rule creator name/i));
    await userEvent.type(await screen.findByLabelText(/rule creator name/i), secondRule);
    ruleBody.name = secondRule;
    ruleCreated.name = secondRule;
    serverCreateRule(setupNock(BASE_URL), ruleBody, 201, ruleCreated);
    userEvent.click(await screen.findByLabelText(/rule create button/i));
    expect(await screen.findByLabelText(/rule create button/)).toBeDisabled();
    await screen.findByLabelText(/rule create loading/i);
    await screen.findByLabelText(/rule create success$/i);
    expect(await screen.findByLabelText(/rule create success message/i)).toHaveTextContent(`Rule ${ruleCreated.name} created successfully`);
});

test('RuleCreatePage for realtime rules should clear payload when change eventype', async () => {
    const eventTypeList = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, eventTypeList);
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    fakeUseParams.mockReturnValue({type: 'realtime'});
    render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);

    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/loading targets/i);

    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a target/i);

    await screen.findByLabelText(/manage payload creator section/i);

    // Select Event Type
    userEvent.click(await screen.findByLabelText(/search a eventtype/i));
    const eventTypes = await screen.findAllByRole('option');
    const eventType = eventTypeList.results[2];
    userEvent.click(eventTypes[2]);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);

    // Download payload
    const checkPayload = await screen.findByLabelText(/payload download button/i);
    const payloadDownloaded = {
        numericField: 25,
        stringField: 'string',
        locationField: [100, 100],
        complexObject: {},
        arrayObject: [],
        invalidArray: [100, 100, 100]
    };
    const eventLog = generateEventLogListWithPayload(payloadDownloaded);
    serverGetEventLogList(setupNock(BASE_URL), 1, 1, eventType.id, 200, eventLog);
    userEvent.click(checkPayload);
    expect(await screen.findByLabelText(/payload download button/i)).toBeDisabled();
    await screen.findByLabelText(/payload creator loading/i);
    await waitFor(() => expect(screen.queryByLabelText(/payload creator loading/i)).not.toBeInTheDocument());
    await screen.findByLabelText(/payload download button enabled/i);
    await screen.findByLabelText(/payload creator schema/i);
    expect(await screen.findAllByLabelText(/payload field$/i)).toHaveLength(3);

    // Cancel selection
    const clearButton = await screen.findByLabelText(/eventtype selected clear/i);
    userEvent.click(clearButton);

    await screen.findByLabelText(/payload download button disabled/i);
    expect(screen.queryByLabelText(/payload creator schema/i)).not.toBeInTheDocument();
    expect(screen.queryAllByLabelText(/payload field$/i)).toHaveLength(0);
});

test('RuleCreatePage for realtime rules should overwrite payload fields with the same name', async () => {
    const eventTypeList = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, eventTypeList);
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    fakeUseParams.mockReturnValue({type: 'realtime'});
    render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);

    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/loading targets/i);

    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a target/i);

    await screen.findByLabelText(/manage payload creator section/i);

    // Select Event Type
    userEvent.click(await screen.findByLabelText(/search a eventtype/i));
    const eventTypes = await screen.findAllByRole('option');
    const eventType = eventTypeList.results[2];
    userEvent.click(eventTypes[2]);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);

    // Create twice the same field
    const addFieldButton = await screen.findByLabelText(/payload addfield button open dialog/i);
    userEvent.click(addFieldButton);
    await screen.findByLabelText(/payload addfield dialog$/i);

    const stringFieldName = 'myNumericfield';
    await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), stringFieldName);
    userEvent.click(await screen.findByLabelText(/payload addfield dialog string/i));
    userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i));
    expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(1);

    await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), stringFieldName);
    userEvent.click(await screen.findByLabelText(/payload addfield dialog number/i));
    userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i));
    expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(1);
});

const enableRuleFilterComponent = async () => {
    const eventTypeList = generateEventTypeListWith(10, false, false);
    serverGetEventTypeList(setupNock(BASE_URL), 1, 10, '', 200, eventTypeList);
    serverGetTargetList(setupNock(BASE_URL), 1, 10, '', 200, generateTargetListWith(10, false, false));
    fakeUseParams.mockReturnValue({type: 'realtime'});
    render(<RuleCreatePage/>);

    await screen.findByLabelText(/create realtime rule page/i);
    await screen.findByLabelText(/manage eventtype section/i);
    await screen.findByLabelText(/create rule section/i);

    await screen.findByLabelText(/loading eventtypes/i);
    await screen.findByLabelText(/loading targets/i);

    await screen.findByLabelText(/manage target section/i);
    await screen.findByLabelText(/search a target/i);

    await screen.findByLabelText(/manage payload creator section/i);

    // Select Event Type
    userEvent.click(await screen.findByLabelText(/search a eventtype/i));
    const eventTypes = await screen.findAllByRole('option');
    const eventType = eventTypeList.results[2];
    userEvent.click(eventTypes[2]);
    expect(await screen.findByLabelText(/eventtype selected name/i)).toHaveTextContent(eventType.name);
    expect(await screen.findByLabelText(/eventtype selected url/i)).toHaveTextContent(eventType.url);

    // RuleFilter has not actions buttons
    expect(screen.queryByLabelText(/filter action buttons/i)).not.toBeInTheDocument();

    const addFieldButton = await screen.findByLabelText(/payload addfield button open dialog/i);
    userEvent.click(addFieldButton);
    await screen.findByLabelText(/payload addfield dialog$/i);

    const stringFieldName = 'myStringfield';
    await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), stringFieldName);
    userEvent.click(await screen.findByLabelText(/payload addfield dialog string/i));
    userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i));
    expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(1);

    const numberFieldName = 'myNumericfield';
    await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), numberFieldName);
    userEvent.click(await screen.findByLabelText(/payload addfield dialog number/i));
    userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i));
    expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(2);

    const locationFieldName = 'myLocationfield';
    await userEvent.type(await screen.findByLabelText(/payload addfield dialog name/), locationFieldName);
    userEvent.click(await screen.findByLabelText(/payload addfield dialog location/i));
    userEvent.click(await screen.findByLabelText(/payload addfield dialog add/i));
    expect(await screen.findAllByLabelText(/payload field$/)).toHaveLength(3);
    userEvent.click(await screen.findByLabelText(/payload addfield dialog close/i));
    expect(screen.queryByLabelText(/payload addfield dialog$/i)).not.toBeInTheDocument();
};

test('RuleCreatePage for realtime rules should activate RuleFilter editMode only when eventId and payload are valid', async () => {
    await enableRuleFilterComponent();
    expect(screen.queryByLabelText(/filter action buttons/i)).toBeInTheDocument();
});

test('RuleCreatePage for realtime rules shoul config a numeric field expression', async () => {
    await enableRuleFilterComponent();
    expect(screen.queryByLabelText(/filter action buttons/i)).toBeInTheDocument();

    // Add a filter for string should show the filter comparator dialog
    const expressionButtons = await screen.findAllByLabelText(/filter add button expression/i);
    expect(expressionButtons).toHaveLength(1);
    userEvent.click(expressionButtons[0]);

    await screen.findByLabelText(/config filter dialog/i);
    const selector = await screen.findByLabelText(/config filter field selector/i);
    userEvent.click(selector);
    const options = await screen.findAllByLabelText(/config filter options/i);
    expect(options).toHaveLength(3);
    userEvent.click(options[0]);

    await screen.findByLabelText(/config filter operator selector/);
    await screen.findByLabelText(/config filter value/);
});

test('ConfigFilterExpresion should set operator GT to numeric field', async () => {
    const fieldName = 'fieldNumeric';
    const payload: Payload = [{name: fieldName, type: 'number'}];
    const expression: EXPRESSION = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RULEFILTERCONTAINER = [expression];
    const updateFilter = jest.fn();
    render(
        <ConfigFilterExpression
            payload={payload}
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
        />
    );

    await screen.findByLabelText(/config filter dialog/i);
    const selector = await screen.findByLabelText(/config filter field selector/i);
    userEvent.click(selector);
    const options = await screen.findAllByLabelText(/config filter options/i);
    expect(options).toHaveLength(1);
    userEvent.click(options[0]);

    const operatorSelector = await screen.findByLabelText(/config filter operator selector/);
    userEvent.click(operatorSelector);
    const operators = await screen.findAllByLabelText(/config filter operators/);
    expect(operators).toHaveLength(5);
    userEvent.click(operators[1]);
    const valueField = await screen.findByLabelText(/config filter value/);
    await userEvent.type(valueField, '100');
    userEvent.click(await screen.findByLabelText(/config filter button save/));

    const expectedFilter = [
        {
          model: 'EXPRESSION',
          type: 'COMPARATOR',
          operator: 'GT',
          field: fieldName,
          value: 100
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});