import * as React from 'react';
import {render, screen, within} from '@testing-library/react';
import RuleFilterView from './index';
import {
    RuleFilter, Geometry,
} from '../../../../services/api';
import { parseRuleFilter } from '../../../../services/api/utils';

test(
    'Render RuleFilter with Passthrow when no filter received',
    async () => {
        const filter = {} as RuleFilter;
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with Passthrow when filter in undefined',
    async () => {
        const filter = undefined as unknown as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test(
    'Render RuleFilter with Passthrow when filter in null',
    async () => {
        const filter = null as unknown as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test(
    'Render RuleFilter with Passthrow when filter in []',
    async () => {
        const filter = [] as unknown as RuleFilter;
        render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findByLabelText(/filter expression passthrow/i)).toHaveTextContent(/passthrow/i);
    }
);

test(
    'Render RuleFilter with FilterComparator when received an filter expression default',
    async () => {
        const filter = {
            temperature: 10,
            humidity: 80
        };
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

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

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received an filter expression Comparator',
    async () => {
        const filter = {
            field1: {_eq: 10},
            field2: {_gt: 20},
            field3: {_gte: 30},
            field4: {_lt: 40},
            field5: {_lte: 50},
        };
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

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

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received an filter expression location comparator with max distance',
    async () => {
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
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression location$/i)).toHaveLength(1);

        await screen.findByLabelText(/filter expression field/i);
        expect(await screen.findByLabelText(/filter expression location distance/i)).toHaveTextContent('is to less than 6.5 kms. from [37.12, -1.12]');

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received an filter expression location comparator with min distance',
    async () => {
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
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression location$/i)).toHaveLength(1);

        await screen.findByLabelText(/filter expression field/i);
        expect(await screen.findByLabelText(/filter expression location distance/i)).toHaveTextContent('is to more than 6.5 kms. from [37.12, -1.12]');

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received an filter expression location comparator with min and max distance',
    async () => {
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
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

        await screen.findByLabelText(/filters container/i);
        expect(await screen.findAllByLabelText(/filter expression location$/i)).toHaveLength(1);

        await screen.findByLabelText(/filter expression field/i);
        expect(await screen.findByLabelText(/filter expression location distance/i)).toHaveTextContent('is between 500 mts. and 1.5 kms. from [37.12, -1.12]');

        expect(container).toMatchSnapshot();
    }
);

test(
    'Do not render RuleFilter with FilterComparator when received an invalid filter expression location comparator',
    async () => {
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

test(
    'Render RuleFilter with FilterComparator when received a container AND',
    async () => {
        const filter: RuleFilter = {
            _and: [
                {field1: 10},
                {field2: {_gt: 50}},
                {field2: {_lte: 50}}
            ]
        };
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

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

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received a container OR',
    async () => {
        const filter: RuleFilter = {
            _or: [
                {field1: 10},
                {field2: {_gt: 50}},
                {field2: {_lte: 50}}
            ]
        };
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

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

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received a container UNKNOWN',
    async () => {
        const filter: RuleFilter = {
            anyfield: [
                {field1: 10},
                {field2: {_gt: 50}},
                {field2: {_lte: 50}}
            ]
        };
        const {container} = render(<RuleFilterView filter={parseRuleFilter(filter)}/>);

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

        expect(container).toMatchSnapshot();
    }
);

test(
    'Render RuleFilter with FilterComparator when received an AND and OR container',
    async () => {
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

test(
    'Render RuleFilter with FilterComparator when received an AND container with a nested OR container',
    async () => {
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