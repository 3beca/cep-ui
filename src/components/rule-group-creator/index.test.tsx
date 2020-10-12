import * as React from 'react';
import { EventPayload } from '../event-payload-creator/models';
import { render, screen, fireEvent } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import RuleGroupCreator, { TargetValue } from './index';
import { RuleGroupPayload } from './models';

test('TargetValue should render only with _sum operator', async () => {
    const setValue = jest.fn();
    const { rerender } = render(<TargetValue setTarget={setValue} />);
    expect(screen.queryByLabelText(/rule group creator addfield dialog input value/i)).not.toBeInTheDocument();

    rerender(<TargetValue operator={'_max'} setTarget={setValue} />);
    expect(screen.queryByLabelText(/rule group creator addfield dialog input value/i)).not.toBeInTheDocument();

    rerender(<TargetValue operator={'_sum'} setTarget={setValue} />);
    await screen.findByLabelText(/rule group creator addfield dialog input value/i);
});

test('TargetValue should only accept positive integers values', async () => {
    const setValue = jest.fn();
    render(<TargetValue operator='_sum' setTarget={setValue} />);

    const inputValue = await screen.findByLabelText(/rule group creator addfield dialog input value/i);

    fireEvent.change(inputValue, { target: { value: 'notnumber' } });
    await screen.findByLabelText(/rule group creator addfield dialog input error value/i);
    expect(setValue).toHaveBeenCalledTimes(0);

    setValue.mockReset();
    fireEvent.change(inputValue, { target: { value: '.,#!' } });
    await screen.findByLabelText(/rule group creator addfield dialog input error value/i);
    expect(setValue).toHaveBeenCalledTimes(0);

    setValue.mockReset();
    fireEvent.change(inputValue, { target: { value: '0' } });
    await screen.findByLabelText(/rule group creator addfield dialog input error value/i);
    expect(setValue).toHaveBeenCalledTimes(0);

    setValue.mockReset();
    fireEvent.change(inputValue, { target: { value: '1.5' } });
    await screen.findByLabelText(/rule group creator addfield dialog input error value/i);
    expect(setValue).toHaveBeenCalledTimes(0);

    setValue.mockReset();
    fireEvent.change(inputValue, { target: { value: '25' } });
    expect(screen.queryByLabelText(/rule group creator addfield dialog input error value/i)).not.toBeInTheDocument();
    expect(setValue).toHaveBeenCalledTimes(1);
    expect(setValue).toHaveBeenNthCalledWith(1, 25);
});

test('RuleGroupCreator should not render when ruletype is realtime', async () => {
    render(<RuleGroupCreator ruleTpe='realtime' payload={null} setGroup={() => {}} />);
    expect(screen.queryByLabelText(/rule group creator container/)).toBeNull();
});

test('RuleGroupCreator should show a message when EventPayload exist but group needs to be created', async () => {
    const group: RuleGroupPayload = [{ name: 'fieldName', operator: '_sum', field: 1 }];
    const setGroup = jest.fn();
    const { rerender } = render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} />);

    await screen.findByLabelText(/rule group creator container/i);
    await screen.findByLabelText(/rule group creator addfield button open dialog/i);
    await screen.findByLabelText(/rule group creator info group payload message/);

    rerender(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    await screen.findByLabelText(/rule group creator container/i);
    await screen.findByLabelText(/rule group creator addfield button open dialog/i);
    expect(screen.queryByLabelText(/rule group creator info group payload message/)).not.toBeInTheDocument();
});

test('RuleGroupCreator should open add field dialog with add button disabled and close dialog', async () => {
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} />);

    await screen.findByLabelText(/rule group creator container/i);
    const addFieldButton = await screen.findByLabelText(/rule group creator addfield button open dialog/i);
    await screen.findByLabelText(/rule group creator info group payload message/);

    userEvent.click(addFieldButton);

    await screen.findByLabelText(/rule group creator addfield dialog container/i);
    await screen.findByLabelText(/rule group creator addfield dialog name/i);
    await screen.findByLabelText(/rule group creator addfield dialog operators/i);
    await screen.findByLabelText(/rule group creator addfield dialog targets/i);

    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    const closeButton = await screen.findByLabelText(/rule group creator addfield dialog close/i);

    userEvent.click(closeButton);
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();
});

export const openAddFieldGroupDialog = async () => {
    await screen.findByLabelText(/rule group creator container/i);
    const addFieldButton = await screen.findByLabelText(/rule group creator addfield button open dialog/i);

    userEvent.click(addFieldButton);

    await screen.findByLabelText(/rule group creator addfield dialog container/i);
    const inputName = await screen.findByLabelText(/rule group creator addfield dialog name/i);
    const selectOperator = await screen.findByLabelText(/rule group creator addfield dialog operators/i);
    await screen.findByLabelText(/rule group creator addfield dialog targets/i);

    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    await screen.findByLabelText(/rule group creator addfield dialog close/i);

    return { inputName, selectOperator };
};

test('RuleGroupCreator should create only numeric sum group when no payload', async () => {
    const fieldName = 'countEvents';
    const target = 1;
    const operator = '_sum';
    const payload: EventPayload | null = null;
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={payload} setGroup={setGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(1);
    expect(operators[0]).toHaveTextContent(/summation/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _sum/i);
    userEvent.click(operators[0]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/summation/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    const numericInput = await screen.findByLabelText(/rule group creator addfield dialog input value/i);
    await userEvent.type(numericInput, target + '');
    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toBeInTheDocument();
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();
    const expectedGroup: RuleGroupPayload = [{ field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);
});

test('RuleGroupCreator should filter non numeric payload fields', async () => {
    const fieldName = 'countEvents';
    const invalidEventPayload: EventPayload = [
        { name: 'stringField', type: 'string' },
        { name: 'locationField', type: 'location' }
    ];
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={invalidEventPayload} setGroup={setGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(1);
    expect(operators[0]).toHaveTextContent(/summation/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _sum/i);
    userEvent.click(operators[0]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/summation/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    expect(setGroup).toHaveBeenCalledTimes(0);
});

const validEventPayload: EventPayload = [
    { name: 'temperature', type: 'number' },
    { name: 'humidity', type: 'number' },
    { name: 'pressure', type: 'number' },
    { name: 'stringField', type: 'string' },
    { name: 'locationField', type: 'location' }
];

test('RuleGroupCreator should create a group with max temperature', async () => {
    const fieldName = 'maxTemperature';
    const operator = '_max';
    const target = validEventPayload[0].name;
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(6);
    expect(operators[0]).toHaveTextContent(/max. value/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _max/i);
    userEvent.click(operators[0]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/max. value/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    expect(screen.queryByLabelText(/rule group creator addfield dialog input value/i)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i));
    const targets = await screen.findAllByLabelText(/rule group creator addfield dialog select target/i);
    expect(targets).toHaveLength(3); // Exclude not numeric fields
    userEvent.click(targets[0]); // Select temperature
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();

    const expectedGroup: RuleGroupPayload = [{ field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);
});

test('RuleGroupCreator should add average humidity a group with max temperature', async () => {
    const prevGroup: RuleGroupPayload = [{ field: 'temperature', operator: '_max', name: 'maxTemperature' }];
    const fieldName = 'avgTemperature';
    const operator = '_avg';
    const target = validEventPayload[1].name;
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={prevGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toHaveAttribute(
        'aria-disabled',
        'true'
    );
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(6);
    expect(operators[2]).toHaveTextContent(/average/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _avg/i);
    userEvent.click(operators[2]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toHaveAttribute(
        'aria-disabled',
        'true'
    );
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/average/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    expect(screen.queryByLabelText(/rule group creator addfield dialog input value/i)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i));
    const targets = await screen.findAllByLabelText(/rule group creator addfield dialog select target/i);
    expect(targets).toHaveLength(3); // Exclude not numeric fields
    userEvent.click(targets[1]); // Select humidity
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();

    const expectedGroup: RuleGroupPayload = [...prevGroup, { field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);
});

test('RuleGroupCreator should not duplicate names', async () => {
    const prevGroup: RuleGroupPayload = [{ field: 'temperature', operator: '_max', name: 'maxTemperature' }];
    const fieldName = 'maxTemperature';
    const operator = '_avg';
    const target = validEventPayload[2].name;
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={prevGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(6);
    expect(operators[2]).toHaveTextContent(/average/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _avg/i);
    userEvent.click(operators[2]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/average/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    expect(screen.queryByLabelText(/rule group creator addfield dialog input value/i)).not.toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i));
    const targets = await screen.findAllByLabelText(/rule group creator addfield dialog select target/i);
    expect(targets).toHaveLength(3); // Exclude not numeric fields
    userEvent.click(targets[2]); // Select pressure
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();

    const expectedGroup: RuleGroupPayload = [{ field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);
});

test('RuleGroupCreator should change summation from field to number', async () => {
    const prevGroup: RuleGroupPayload = [{ field: 'temperature', operator: '_sum', name: 'maxTemperature' }];
    const fieldName = 'maxTemperature';
    const operator = '_sum';
    const target = 1;
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={prevGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(6);
    expect(operators[3]).toHaveTextContent(/summation/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _sum/i);
    userEvent.click(operators[3]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/summation/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.type(await screen.findByLabelText(/rule group creator addfield dialog input value/i), '1');
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();

    const expectedGroup: RuleGroupPayload = [{ field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);
});

test('RuleGroupCreator should change summation between number and field', async () => {
    const prevGroup: RuleGroupPayload = [{ field: 1, operator: '_sum', name: 'maxTemperature' }];
    const fieldName = 'maxTemperature';
    const operator = '_sum';
    const target = 15;
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={prevGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(6);
    expect(operators[3]).toHaveTextContent(/summation/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _sum/i);
    userEvent.click(operators[3]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/summation/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();

    // Set numeric value
    await userEvent.type(await screen.findByLabelText(/rule group creator addfield dialog input value/i), '5');
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toHaveTextContent('5');

    // Cahnge to temperature field
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i));
    const targets = await screen.findAllByLabelText(/rule group creator addfield dialog select target/i);
    expect(targets).toHaveLength(3); // Exclude not numeric fields
    userEvent.click(targets[0]); // Select temperature
    expect(await screen.findByLabelText(/rule group creator addfield dialog input value/i)).toHaveAttribute('value', '');
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toHaveTextContent(
        'temperature'
    );

    // Set numeric value again
    await userEvent.type(await screen.findByLabelText(/rule group creator addfield dialog input value/i), '15');
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toHaveTextContent('15');

    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    const expectedGroup: RuleGroupPayload = [{ field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);

    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();
});

test('RuleGroupCreator add dialog should create a group that sum 1 on each event', async () => {
    const fieldName = 'countEvents';
    const target = 1;
    const operator = '_sum';
    const group: RuleGroupPayload = [{ field: 'temperature', operator: '_max', name: 'maxTemperature' }];
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    await userEvent.type(inputName, fieldName);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/i);
    expect(operators).toHaveLength(6);
    expect(operators[3]).toHaveTextContent(/summation/i);
    await screen.findByLabelText(/rule group creator addfield dialog select operator _sum/i);
    userEvent.click(operators[3]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog operators/i)).toHaveTextContent(/summation/i);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    const numericInput = await screen.findByLabelText(/rule group creator addfield dialog input value/i);
    await userEvent.type(numericInput, target + '');
    expect(screen.queryByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));
    expect(await screen.findByLabelText(/rule group creator addfield dialog container/i)).toBeInTheDocument();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();
    const expectedGroup: RuleGroupPayload = [...group, { field: target, name: fieldName, operator }];
    expect(setGroup).toHaveBeenCalledTimes(1);
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroup);
});

test('RuleGroupCreator add dialog should create a group for max and min temperature', async () => {
    const setGroup = jest.fn();
    const { rerender } = render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} />);

    const { inputName, selectOperator } = await openAddFieldGroupDialog();

    await userEvent.type(inputName, 'maxTemperature');
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    let operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/);
    expect(operators).toHaveLength(6);
    userEvent.click(operators[0]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toHaveAttribute(
        'aria-disabled',
        'true'
    );
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i));
    let fields = await screen.findAllByLabelText(/rule group creator addfield dialog select target/i);
    expect(fields).toHaveLength(3);
    userEvent.click(fields[0]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));

    const expectedGroupMax: RuleGroupPayload = [{ field: 'temperature', operator: '_max', name: 'maxTemperature' }];
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroupMax);

    rerender(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={expectedGroupMax} />);

    expect(screen.queryByLabelText(/rule group creator info grouppayload message/)).not.toBeInTheDocument();

    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).toHaveAttribute(
        'aria-disabled',
        'true'
    );
    await screen.findByLabelText(/rule group creator addfield dialog close/i);

    await userEvent.type(inputName, 'minTemperature');
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).toBeDisabled();
    userEvent.click(selectOperator);
    operators = await screen.findAllByLabelText(/rule group creator addfield dialog select operator/);
    expect(operators).toHaveLength(6);
    userEvent.click(operators[1]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i)).not.toHaveAttribute(
        'aria-disabled',
        'true'
    );
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog selector targets from payload/i));
    fields = await screen.findAllByLabelText(/rule group creator addfield dialog select target/i);
    expect(fields).toHaveLength(3);
    userEvent.click(fields[0]);
    expect(await screen.findByLabelText(/rule group creator addfield dialog add/i)).not.toBeDisabled();
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog add/i));

    const expectedGroupCompleted: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' }
    ];
    expect(setGroup).toHaveBeenNthCalledWith(2, expectedGroupCompleted);
    userEvent.click(await screen.findByLabelText(/rule group creator addfield dialog close/i));
    expect(screen.queryByLabelText(/rule group creator addfield dialog container/i)).not.toBeInTheDocument();

    rerender(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={expectedGroupCompleted} />);
    await screen.findByLabelText(/rule group creator payload schema container/i);
});

test('RuleGroupCreator do not show schema while not group', async () => {
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} />);
    expect(screen.queryByLabelText(/rule group creator payload schema container/i)).not.toBeInTheDocument();
});

test('RuleGroupCreator should show schema with maxTemperature and minTemperature', async () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' }
    ];
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    await screen.findByLabelText(/rule group creator payload schema container/i);
    expect(await screen.findAllByLabelText(/rule group creator payload schema field/i)).toHaveLength(2);
});

test('RuleGroupCreator should remove maxTemperature from group', async () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' }
    ];
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    await screen.findByLabelText(/rule group creator payload schema container/i);
    expect(await screen.findAllByLabelText(/rule group creator payload schema field/i)).toHaveLength(2);
    const deleteButtons = await screen.findAllByLabelText(/rule group creator schema field button remove/i);
    expect(deleteButtons).toHaveLength(2);

    userEvent.click(deleteButtons[0]);
    const expectedGroupWithoutTemperature: RuleGroupPayload = [{ field: 'temperature', operator: '_min', name: 'minTemperature' }];
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroupWithoutTemperature);
});

test('RuleGroupCreator cannot remove if disabled', async () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' }
    ];
    const setGroup = jest.fn();
    render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} disabled={true} />);

    await screen.findByLabelText(/rule group creator payload schema container/i);
    expect(await screen.findAllByLabelText(/rule group creator payload schema field/i)).toHaveLength(2);
    const deleteButtons = await screen.findAllByLabelText(/rule group creator schema field button remove/i);
    expect(deleteButtons).toHaveLength(2);

    userEvent.click(deleteButtons[0]);
    expect(setGroup).toHaveBeenCalledTimes(0);
});

test('RuleGroupCreator should keep in sync payload and group when deleting all group', async () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'temperature', operator: '_min', name: 'minTemperature' }
    ];
    const setGroup = jest.fn();
    const { rerender } = render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    await screen.findByLabelText(/rule group creator payload schema container/i);
    expect(await screen.findAllByLabelText(/rule group creator payload schema field/i)).toHaveLength(2);

    const newEventPayload = null;
    rerender(<RuleGroupCreator ruleTpe='sliding' payload={newEventPayload} setGroup={setGroup} group={group} />);
    expect(setGroup).toHaveBeenNthCalledWith(1, undefined);
});

test('RuleGroupCreator should keep in sync payload and group when deleting all fields', async () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'pressure', operator: '_min', name: 'minTemperature' },
        { field: 1, operator: '_sum', name: 'countEvents' }
    ];
    const setGroup = jest.fn();
    const { rerender } = render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    await screen.findByLabelText(/rule group creator payload schema container/i);
    expect(await screen.findAllByLabelText(/rule group creator payload schema field/i)).toHaveLength(3);

    const newEventPayload = null;
    rerender(<RuleGroupCreator ruleTpe='sliding' payload={newEventPayload} setGroup={setGroup} group={group} />);
    const expectedGroupOnlySummation: RuleGroupPayload = [{ field: 1, operator: '_sum', name: 'countEvents' }];
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroupOnlySummation);
});

test('RuleGroupCreator should keep in sync payload and group when deleting temperature field', async () => {
    const group: RuleGroupPayload = [
        { field: 'temperature', operator: '_max', name: 'maxTemperature' },
        { field: 'pressure', operator: '_min', name: 'minTemperature' },
        { field: 1, operator: '_sum', name: 'countEvents' }
    ];
    const setGroup = jest.fn();
    const { rerender } = render(<RuleGroupCreator ruleTpe='sliding' payload={validEventPayload} setGroup={setGroup} group={group} />);

    await screen.findByLabelText(/rule group creator payload schema container/i);
    expect(await screen.findAllByLabelText(/rule group creator payload schema field/i)).toHaveLength(3);

    const newEventPayload: EventPayload = [
        { name: 'humidity', type: 'number' },
        { name: 'pressure', type: 'number' },
        { name: 'stringField', type: 'string' },
        { name: 'locationField', type: 'location' }
    ];
    rerender(<RuleGroupCreator ruleTpe='sliding' payload={newEventPayload} setGroup={setGroup} group={group} />);
    const expectedGroupWithoutTemperature: RuleGroupPayload = [
        { field: 'pressure', operator: '_min', name: 'minTemperature' },
        { field: 1, operator: '_sum', name: 'countEvents' }
    ];
    expect(setGroup).toHaveBeenNthCalledWith(1, expectedGroupWithoutTemperature);
});
