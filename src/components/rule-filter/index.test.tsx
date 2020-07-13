import * as React from 'react';
import {render, screen, within} from '@testing-library/react';
import RuleFilterView from './index';
import {
    RuleFilter,
    Geometry,
    RuleFilterComparatorLocation
} from '../../services/api';
import { parseRuleFilter, createANDContainer, createORContainer, createExpresion } from '../../services/api/utils';
import userEvent from '@testing-library/user-event';

test('Render RuleFilter with Passthrow when no filter received', async () => {
        const filter = {} as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test('Render RuleFilter with Passthrow when filter in undefined', async () => {
        const filter = undefined as unknown as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test('Render RuleFilter with Passthrow when filter in null', async () => {
        const filter = null as unknown as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test('Render RuleFilter with Passthrow when filter in []', async () => {
        const filter = [] as unknown as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test('Render RuleFilter with FilterComparator when received an filter expression default', async () => {
        const filter = {
            temperature: 10,
            humidity: 80
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression comparator/i)).toHaveLength(2);

        const fields = await screen.findAllByLabelText(/filter expression field/i);
        expect(fields).toHaveLength(2);
        expect(fields[0]).toHaveTextContent(/temperature/i);
        expect(fields[1]).toHaveTextContent(/humidity/i);


        const operators = await screen.findAllByLabelText(/filter expression operator/i);
        expect(operators).toHaveLength(2);
        expect(operators[0]).toHaveTextContent(/=/i);
        expect(operators[1]).toHaveTextContent(/=/i);

        const values = await screen.findAllByLabelText(/filter expression value/i);
        expect(values).toHaveLength(2);
        expect(values[0]).toHaveTextContent(/10/i);
        expect(values[1]).toHaveTextContent(/80/i);

    }
);

test('Render RuleFilter with FilterComparator when received an filter expression Comparator', async () => {
        const filter = {
            field1: {_eq: 10},
            field2: {_gt: 20},
            field3: {_gte: 30},
            field4: {_lt: 40},
            field5: {_lte: 50},
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression comparator/i)).toHaveLength(5);

        const fields = await screen.findAllByLabelText(/filter expression field/i);
        expect(fields).toHaveLength(5);
        expect(fields[0]).toHaveTextContent(/field1/i);
        expect(fields[1]).toHaveTextContent(/field2/i);
        expect(fields[2]).toHaveTextContent(/field3/i);
        expect(fields[3]).toHaveTextContent(/field4/i);
        expect(fields[4]).toHaveTextContent(/field5/i);


        const operators = await screen.findAllByLabelText(/filter expression operator/i);
        expect(operators).toHaveLength(5);
        expect(operators[0]).toHaveTextContent(/=/i);
        expect(operators[1]).toHaveTextContent(/>/i);
        expect(operators[2]).toHaveTextContent(/>=/i);
        expect(operators[3]).toHaveTextContent(/</i);
        expect(operators[4]).toHaveTextContent(/<=/i);

        const values = await screen.findAllByLabelText(/filter expression value/i);
        expect(values).toHaveLength(5);
        expect(values[0]).toHaveTextContent(/10/i);
        expect(values[1]).toHaveTextContent(/20/i);
        expect(values[2]).toHaveTextContent(/30/i);
        expect(values[3]).toHaveTextContent(/40/i);
        expect(values[4]).toHaveTextContent(/50/i);

    }
);

test('Render RuleFilter with FilterComparator when received an filter expression location comparator with max distance', async () => {
        const location: Geometry = {
            _geometry: {
                type: 'Point',
                coordinates: [37.123456, -1.12]
            },
            _maxDistance: 6500
        };
        const filter = {
            location: {
                _near: location
            }
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression location$/i)).toHaveLength(1);

        await screen.findByLabelText(/filter expression field/i);
        expect(await screen.findByLabelText(/filter expression location distance/i)).toHaveTextContent('is to less than 6.5 kms. from [37.12, -1.12]');

    }
);

test('Render RuleFilter with FilterComparator when received an filter expression location comparator with min distance', async () => {
        const location: Geometry = {
            _geometry: {
                type: 'Point',
                coordinates: [37.123456, -1.12]
            },
            _minDistance: 6500
        };
        const filter = {
            location: {
                _near: location
            }
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression location$/i)).toHaveLength(1);

        await screen.findByLabelText(/filter expression field/i);
        expect(await screen.findByLabelText(/filter expression location distance/i)).toHaveTextContent('is to more than 6.5 kms. from [37.12, -1.12]');

    }
);

test('Render RuleFilter with FilterComparator when received an filter expression location comparator with min and max distance', async () => {
        const location: Geometry = {
            _geometry: {
                type: 'Point',
                coordinates: [37.123456, -1.12]
            },
            _minDistance: 500,
            _maxDistance: 1500
        };
        const filter = {
            location: {
                _near: location
            }
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression location$/i)).toHaveLength(1);

        await screen.findByLabelText(/filter expression field/i);
        expect(await screen.findByLabelText(/filter expression location distance/i)).toHaveTextContent('is between 500 mts. and 1.5 kms. from [37.12, -1.12]');

    }
);

test('Do not render RuleFilter with FilterComparator when received an invalid filter expression location comparator', async () => {
        const location: Geometry = {
            _geometry: {
                type: 'Point',
                coordinates: [37.123456, -1.12]
            }
        };
        const filter = {
            location: {
                _near: location
            }
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(screen.queryByLabelText(/filter expression location$/i)).not.toBeInTheDocument();
    }
);

test('Render RuleFilter with FilterComparator when received a container AND', async () => {
        const filter: RuleFilter = {
            _and: [
                {field1: 10},
                {field2: {_gt: 50}},
                {field2: {_lte: 50}}
            ]
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        await screen.findByLabelText(/container expressions$/i);
        expect(await screen.findByLabelText(/container expressions header/)).toHaveTextContent(/all of/i);
        expect(await screen.findAllByLabelText(/filter expression comparator/i)).toHaveLength(3);

        const fields = await screen.findAllByLabelText(/filter expression field/i);
        expect(fields).toHaveLength(3);
        expect(fields[0]).toHaveTextContent(/field1/i);
        expect(fields[1]).toHaveTextContent(/field2/i);
        expect(fields[2]).toHaveTextContent(/field2/i);


        const operators = await screen.findAllByLabelText(/filter expression operator/i);
        expect(operators).toHaveLength(3);
        expect(operators[0]).toHaveTextContent(/=/i);
        expect(operators[1]).toHaveTextContent(/>/i);
        expect(operators[2]).toHaveTextContent(/<=/i);

        const values = await screen.findAllByLabelText(/filter expression value/i);
        expect(values).toHaveLength(3);
        expect(values[0]).toHaveTextContent(/10/i);
        expect(values[1]).toHaveTextContent(/50/i);
        expect(values[2]).toHaveTextContent(/50/i);

    }
);

test('Render RuleFilter with FilterComparator when received a container OR', async () => {
        const filter: RuleFilter = {
            _or: [
                {field1: 10},
                {field2: {_gt: 50}},
                {field2: {_lte: 50}}
            ]
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        await screen.findByLabelText(/container expressions$/i);
        expect(await screen.findByLabelText(/container expressions header/)).toHaveTextContent(/one of/i);
        expect(await screen.findAllByLabelText(/filter expression comparator/i)).toHaveLength(3);

        const fields = await screen.findAllByLabelText(/filter expression field/i);
        expect(fields).toHaveLength(3);
        expect(fields[0]).toHaveTextContent(/field1/i);
        expect(fields[1]).toHaveTextContent(/field2/i);
        expect(fields[2]).toHaveTextContent(/field2/i);


        const operators = await screen.findAllByLabelText(/filter expression operator/i);
        expect(operators).toHaveLength(3);
        expect(operators[0]).toHaveTextContent(/=/i);
        expect(operators[1]).toHaveTextContent(/>/i);
        expect(operators[2]).toHaveTextContent(/<=/i);

        const values = await screen.findAllByLabelText(/filter expression value/i);
        expect(values).toHaveLength(3);
        expect(values[0]).toHaveTextContent(/10/i);
        expect(values[1]).toHaveTextContent(/50/i);
        expect(values[2]).toHaveTextContent(/50/i);

    }
);

test('Render RuleFilter with FilterComparator when received a container UNKNOWN', async () => {
        const filter: RuleFilter = {
            anyfield: [
                {field1: 10},
                {field2: {_gt: 50}},
                {field2: {_lte: 50}}
            ]
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        await screen.findByLabelText(/container expressions$/i);
        expect(await screen.findByLabelText(/container expressions header/)).toHaveTextContent(/anyfield/i);
        expect(await screen.findAllByLabelText(/filter expression comparator/i)).toHaveLength(3);

        const fields = await screen.findAllByLabelText(/filter expression field/i);
        expect(fields).toHaveLength(3);
        expect(fields[0]).toHaveTextContent(/field1/i);
        expect(fields[1]).toHaveTextContent(/field2/i);
        expect(fields[2]).toHaveTextContent(/field2/i);


        const operators = await screen.findAllByLabelText(/filter expression operator/i);
        expect(operators).toHaveLength(3);
        expect(operators[0]).toHaveTextContent(/=/i);
        expect(operators[1]).toHaveTextContent(/>/i);
        expect(operators[2]).toHaveTextContent(/<=/i);

        const values = await screen.findAllByLabelText(/filter expression value/i);
        expect(values).toHaveLength(3);
        expect(values[0]).toHaveTextContent(/10/i);
        expect(values[1]).toHaveTextContent(/50/i);
        expect(values[2]).toHaveTextContent(/50/i);

    }
);

test('Render RuleFilter with FilterComparator when received an AND and OR container', async () => {
        const filter: RuleFilter = {
            _and: [{p1: 10, p2: 20}],
            _or: [{p3: 30}, {p4: 40}]
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        const containers = await screen.findAllByLabelText(/container expressions$/i);
        const containersHeaders = await screen.findAllByLabelText(/container expressions header/);
        expect(containers).toHaveLength(2);
        expect(containersHeaders).toHaveLength(2);
        expect(containersHeaders[0]).toHaveTextContent(/all of/i);
        expect(containersHeaders[1]).toHaveTextContent(/one of/i);

        const andContainer = within(containers[0]);
        expect(await andContainer.findAllByLabelText(/filter expression comparator/i)).toHaveLength(2);
        const andFields = await andContainer.findAllByLabelText(/filter expression field/i);
        expect(andFields).toHaveLength(2);
        expect(andFields[0]).toHaveTextContent(/p1/i);
        expect(andFields[1]).toHaveTextContent(/p2/i);
        const andOperators = await andContainer.findAllByLabelText(/filter expression operator/i);
        expect(andOperators).toHaveLength(2);
        expect(andOperators[0]).toHaveTextContent(/=/i);
        expect(andOperators[1]).toHaveTextContent(/=/i);
        const andValues = await andContainer.findAllByLabelText(/filter expression value/i);
        expect(andValues).toHaveLength(2);
        expect(andValues[0]).toHaveTextContent(/10/i);
        expect(andValues[1]).toHaveTextContent(/20/i);

        const orContainer = within(containers[1]);
        expect(await orContainer.findAllByLabelText(/filter expression comparator/i)).toHaveLength(2);
        const orFields = await orContainer.findAllByLabelText(/filter expression field/i);
        expect(orFields).toHaveLength(2);
        expect(orFields[0]).toHaveTextContent(/p3/i);
        expect(orFields[1]).toHaveTextContent(/p4/i);
        const orOperators = await orContainer.findAllByLabelText(/filter expression operator/i);
        expect(orOperators).toHaveLength(2);
        expect(orOperators[0]).toHaveTextContent(/=/i);
        expect(orOperators[1]).toHaveTextContent(/=/i);
        const orValues = await orContainer.findAllByLabelText(/filter expression value/i);
        expect(orValues).toHaveLength(2);
        expect(orValues[0]).toHaveTextContent(/30/i);
        expect(orValues[1]).toHaveTextContent(/40/i);
    }
);

test('Render RuleFilter with FilterComparator when received an AND container with a nested OR container', async () => {
        const filter: RuleFilter = {
            _and: [
                {p1: 10, p2: 20},
                {_or: [{p3: 30}, {p4: 40}]}
            ]
        };
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        const containers = await screen.findAllByLabelText(/container expressions$/i);
        const containersHeaders = await screen.findAllByLabelText(/container expressions header/);
        expect(containers).toHaveLength(2);
        expect(containersHeaders).toHaveLength(2);
        expect(containersHeaders[0]).toHaveTextContent(/all of/i);
        expect(containersHeaders[1]).toHaveTextContent(/one of/i);

        const andContainer = within(containers[0]);
        expect(await andContainer.findAllByLabelText(/filter expression comparator/i)).toHaveLength(4);
        const andFields = await andContainer.findAllByLabelText(/filter expression field/i);
        expect(andFields).toHaveLength(4);
        expect(andFields[0]).toHaveTextContent(/p1/i);
        expect(andFields[1]).toHaveTextContent(/p2/i);
        expect(andFields[2]).toHaveTextContent(/p3/i);
        expect(andFields[3]).toHaveTextContent(/p4/i);
        const andOperators = await andContainer.findAllByLabelText(/filter expression operator/i);
        expect(andOperators).toHaveLength(4);
        expect(andOperators[0]).toHaveTextContent(/=/i);
        expect(andOperators[1]).toHaveTextContent(/=/i);
        expect(andOperators[3]).toHaveTextContent(/=/i);
        expect(andOperators[3]).toHaveTextContent(/=/i);
        const andValues = await andContainer.findAllByLabelText(/filter expression value/i);
        expect(andValues).toHaveLength(4);
        expect(andValues[0]).toHaveTextContent(/10/i);
        expect(andValues[1]).toHaveTextContent(/20/i);
        expect(andValues[2]).toHaveTextContent(/30/i);
        expect(andValues[3]).toHaveTextContent(/40/i);

        const orContainer = within(await andContainer.findByLabelText(/container expressions$/i));
        expect(await orContainer.findAllByLabelText(/filter expression comparator/i)).toHaveLength(2);
        const orFields = await orContainer.findAllByLabelText(/filter expression field/i);
        expect(orFields).toHaveLength(2);
        expect(orFields[0]).toHaveTextContent(/p3/i);
        expect(orFields[1]).toHaveTextContent(/p4/i);
        const orOperators = await orContainer.findAllByLabelText(/filter expression operator/i);
        expect(orOperators).toHaveLength(2);
        expect(orOperators[0]).toHaveTextContent(/=/i);
        expect(orOperators[1]).toHaveTextContent(/=/i);
        const orValues = await orContainer.findAllByLabelText(/filter expression value/i);
        expect(orValues).toHaveLength(2);
        expect(orValues[0]).toHaveTextContent(/30/i);
        expect(orValues[1]).toHaveTextContent(/40/i);
    }
);

test('Render RuleFilter in editMode show Passthrow when no filter received and create an AND and OR container in it', async () => {
        const filter = {} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
        const addRootAnd = await screen.findByLabelText(/filter add button and/i);
        const addRootOr = await screen.findByLabelText(/filter add button or/i);
        await screen.findByLabelText(/filter add button expression/i);

        const expecttedAnd = createANDContainer();
        userEvent.click(addRootAnd);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, [expecttedAnd]);

        const expectedOr = createORContainer();
        userEvent.click(addRootOr);
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(2, [expectedOr]);
    }
);

test('Render RuleFilter in editMode cannot add AND when there is one', async () => {
        const filter = {_and: [{temperature: 25}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const addButtons = await screen.findAllByLabelText(/filter add button and/i);
        expect(addButtons).toHaveLength(2);
        expect(addButtons[0]).toBeDisabled();
        expect(addButtons[1]).not.toBeDisabled();
    }
);

test('Render RuleFilter in editMode cannot add OR when there is one', async () => {
        const filter = {_or: [{temperature: 25}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const addButtons = await screen.findAllByLabelText(/filter add button or/i);
        expect(addButtons).toHaveLength(2);
        expect(addButtons[0]).toBeDisabled();
        expect(addButtons[1]).not.toBeDisabled();
    }
);

test('Render RuleFilter in editMode show Passthrow when no filter received and create a expression', async () => {
        const filter = {} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
        await screen.findByLabelText(/filter add button and/i);
        await screen.findByLabelText(/filter add button or/i);
        const expressionButton = await screen.findByLabelText(/filter add button expression/i);

        const expecttedExpression = createExpresion();
        userEvent.click(expressionButton);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, [expecttedExpression], expecttedExpression);
    }
);

test('Render RuleFilter in editMode can delete first container', async () => {
        const filter = {_and: [{teperature: 5}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);

        const expectedExpression = createExpresion();
        userEvent.click(deleteButtons[0]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, [expectedExpression]);
    }
);

test('Render RuleFilter in editMode can delete first container with more elements', async () => {
        const filter = {_and: [{teperature: 5}], temperature: 10} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);

        const expectedExpression = createExpresion('temperature', 10);
        userEvent.click(deleteButtons[0]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, [expectedExpression]);
    }
);

test('Render RuleFilter in editMode can delete an INNER AND container', async () => {
        const filter = {_and: [{_and: [{teperature: 5}]}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(3);

        const expectedContainer = parseRuleFilter({_and: []});
        userEvent.click(deleteButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedContainer);

        const expectedPassthrowExpression = parseRuleFilter({});
        userEvent.click(deleteButtons[0]);
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(2, expectedPassthrowExpression);
    }
);

test('Render RuleFilter in editMode can delete an INNER AND container and other expressions', async () => {
        const filter = {_and: [{_and: [{teperature: 5}], humidity: 45}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(4);

        const expectedContainer = parseRuleFilter({_and: [{humidity: 45}]});
        userEvent.click(deleteButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedContainer);

        const expectedPassthrowExpression = parseRuleFilter({});
        userEvent.click(deleteButtons[0]);
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(2, expectedPassthrowExpression);
    }
);

test('Render RuleFilter in editMode can delete an INNER AND container and complex expressions', async () => {
        const filter = {_and: [{_and: [{teperature: 5}, {pressure: 1000}], humidity: 45}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(5);

        const expectedContainer = parseRuleFilter({_and: [{humidity: 45}]});
        userEvent.click(deleteButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedContainer);

        const expectedPassthrowExpression = parseRuleFilter({});
        userEvent.click(deleteButtons[0]);
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenNthCalledWith(2, expectedPassthrowExpression);
    }
);

test('Render RuleFilter can create an INNER empty AND container', async () => {
        const filter = {_or: []} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const addAndButtons = await screen.findAllByLabelText(/filter add button and/i);
        expect(addAndButtons).toHaveLength(2);

        userEvent.click(addAndButtons[1]);
        const expectedContainer = parseRuleFilter({_or: [{_and: []}]});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedContainer);
    }
);

test('Render RuleFilter can create an INNER AND container with passthrow', async () => {
        const filter = {_or: [{}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const addAndButtons = await screen.findAllByLabelText(/filter add button and/i);
        expect(addAndButtons).toHaveLength(2);

        userEvent.click(addAndButtons[1]);
        const expectedContainer = parseRuleFilter({_or: [{_and: []}]});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedContainer);
    }
);

test('Render RuleFilter can create an INNER OR container', async () => {
        const filter = {_and: []} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const addORButtons = await screen.findAllByLabelText(/filter add button or/i);
        expect(addORButtons).toHaveLength(2);

        userEvent.click(addORButtons[1]);
        const expectedContainer = parseRuleFilter({_and: [{_or: []}]});
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedContainer);
    }
);

test('Render RuleFilter in editMode can create a INNER expression', async () => {
        const filter = {_and: []} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        await screen.findAllByLabelText(/filter add button and/i);
        await screen.findAllByLabelText(/filter add button or/i);
        const expressionButtons = await screen.findAllByLabelText(/filter add button expression/i);
        expect(expressionButtons).toHaveLength(2);
        const expectedFilter = parseRuleFilter({_and: [{}]});
        userEvent.click(expressionButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter, createExpresion());
    }
);

test('Render RuleFilter in editMode can create a INNER expression passthrow', async () => {
        const filter = {_and: [{}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        await screen.findAllByLabelText(/filter add button and/i);
        await screen.findAllByLabelText(/filter add button or/i);
        const expressionButtons = await screen.findAllByLabelText(/filter add button expression/i);
        expect(expressionButtons).toHaveLength(2);
        const expectedFilter = parseRuleFilter({_and: [{}]});
        userEvent.click(expressionButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter, createExpresion());
    }
);

test('Render RuleFilter in editMode can delete an expression', async () => {
        const filter = {humidity: 45} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(1);
        const expectedFilter = parseRuleFilter({});
        userEvent.click(deleteButtons[0]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter);

    }
);

test('Render RuleFilter in editMode can delete an expression when more root expressions', async () => {
        const filter = {humidity: 45, temperature: 12} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(2);
        const expectedFilter = parseRuleFilter({humidity: 45});
        userEvent.click(deleteButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter);

    }
);

test('Render RuleFilter in editMode can delete an INNER expression', async () => {
        const filter = {_and: [{humidity: 25}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(2);
        const expectedFilter = parseRuleFilter({_and: []});
        userEvent.click(deleteButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter);

    }
);

test('Render RuleFilter in editMode can delete an INNER expression inside container', async () => {
        const filter = {_and: [{humidity: 25, _or: [{pressure: 1000}]}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(4);
        const expectedFilter = parseRuleFilter({_and: [{_or: [{pressure: 1000}]}]});
        userEvent.click(deleteButtons[1]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter);

    }
);

test('Render RuleFilter in editMode can delete an INNER expression comparator inside container', async () => {
        const filter = {_and: [{humidity: 25, pressure: {_gt: 25}}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(3);
        const expectedFilter = parseRuleFilter({_and: [{humidity: 25}]});
        userEvent.click(deleteButtons[2]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter);

    }
);

test('Render RuleFilter in editMode can delete an INNER expression location inside container', async () => {
        const location: RuleFilterComparatorLocation = {_near: {_geometry: {coordinates: [100, 100], type: 'Point'}, _maxDistance: 100}};
        const filter = {_and: [{humidity: 25, location}]} as RuleFilter;
        const ruleContainer = parseRuleFilter(filter);
        const onChange = jest.fn();
        render(
            <RuleFilterView
                filter={ruleContainer}
                editMode={true}
                onChange={onChange}/>
            );
        await screen.findByLabelText(/filters container/i);
        const deleteButtons = await screen.findAllByLabelText(/filter delete button/i);
        expect(deleteButtons).toHaveLength(3);
        const expectedFilter = parseRuleFilter({_and: [{humidity: 25}]});
        userEvent.click(deleteButtons[2]);
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenNthCalledWith(1, expectedFilter);

    }
);

test('Render RuleFilter in editMode can edit an location expression', async () => {
    const location: RuleFilterComparatorLocation = {_near: {_geometry: {coordinates: [100, 100], type: 'Point'}, _maxDistance: 100}};
    const filter = {_and: [{humidity: 25}, {location}]} as RuleFilter;
    const ruleContainer = parseRuleFilter(filter);
    const onChange = jest.fn();
    render(
        <RuleFilterView
            filter={ruleContainer}
            editMode={true}
            onChange={onChange}/>
        );
    await screen.findByLabelText(/filters container/i);
    const editButtons = await screen.findAllByLabelText(/filter edit button/i);
    expect(editButtons).toHaveLength(2);
    userEvent.click(editButtons[1]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, ruleContainer, parseRuleFilter({location})[0]);
});

test('Render RuleFilter in editMode can edit an string expression', async () => {
    const stringFilter = {type: 'humudity'};
    const filter = {_and: [stringFilter]} as RuleFilter;
    const ruleContainer = parseRuleFilter(filter);
    const onChange = jest.fn();
    render(
        <RuleFilterView
            filter={ruleContainer}
            editMode={true}
            onChange={onChange}/>
        );
    await screen.findByLabelText(/filters container/i);
    const editButtons = await screen.findAllByLabelText(/filter edit button/i);
    expect(editButtons).toHaveLength(1);
    userEvent.click(editButtons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, ruleContainer, parseRuleFilter(stringFilter)[0]);
});

test('Render RuleFilter in editMode can edit an numeric expression', async () => {
    const numericFilter = {temperature: {_gt: 25}};
    const filter = {_and: [numericFilter]} as RuleFilter;
    const ruleContainer = parseRuleFilter(filter);
    const onChange = jest.fn();
    render(
        <RuleFilterView
            filter={ruleContainer}
            editMode={true}
            onChange={onChange}/>
        );
    await screen.findByLabelText(/filters container/i);
    const editButtons = await screen.findAllByLabelText(/filter edit button/i);
    expect(editButtons).toHaveLength(1);
    userEvent.click(editButtons[0]);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenNthCalledWith(1, ruleContainer, parseRuleFilter(numericFilter)[0]);
});

