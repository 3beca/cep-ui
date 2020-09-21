import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    renderWithAPI as render,
    screen
} from '../../test-utils';
import ConfigFilterExpression from './';
import { EventPayload } from '../event-payload-creator/models';
import { EComparatorLocation, Expression, RuleFilterContainer } from '../rule-filter/models';

// ConfigFilterExpression test
test('ConfigFilterExpresion should close dialog when click outside', async () => {
    const fieldName = 'fieldString';
    const payload: EventPayload = [{name: fieldName, type: 'string'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
    const updateFilter = jest.fn();
    const {rerender} = render(
        <ConfigFilterExpression
            payload={payload}
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
        />
    );

    const dialog = await screen.findByLabelText(/config filter dialog/i);
    userEvent.click(dialog.firstElementChild!);
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, filter);

    rerender(
        <ConfigFilterExpression
            payload={payload}
            updateFilter={updateFilter}
        />
    );
    expect(screen.queryByLabelText(/config filter dialog/i)).not.toBeInTheDocument();
});

test('ConfigFilterExpresion should close dialog when click in cancel button', async () => {
    const fieldName = 'fieldString';
    const payload: EventPayload = [{name: fieldName, type: 'string'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
    const updateFilter = jest.fn();
    const {rerender} = render(
        <ConfigFilterExpression
            payload={payload}
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
        />
    );

    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button cancel/));
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, filter);

    rerender(
        <ConfigFilterExpression
            payload={payload}
            updateFilter={updateFilter}
        />
    );
    expect(screen.queryByLabelText(/config filter dialog/i)).not.toBeInTheDocument();
});

test('ConfigFilterExpresion should disable save button when delete value from comparator DEFAULT', async () => {
    const fieldName = 'fieldString';
    const payload: EventPayload = [{name: fieldName, type: 'string'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
    const updateFilter = jest.fn();
    render(
        <ConfigFilterExpression
            payload={payload}
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
        />
    );

    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    // Set value to 25
    await userEvent.type(await screen.findByLabelText(/config filter value/), '25');
    expect(await screen.findByLabelText(/config filter button save/)).not.toBeDisabled();
    // Delete 5
    await userEvent.type(await screen.findByLabelText(/config filter value/), '{backspace}');
    expect(await screen.findByLabelText(/config filter value/)).toHaveAttribute('value', '2');
    // Delete 2
    await userEvent.type(await screen.findByLabelText(/config filter value/), '{backspace}');
    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    expect(await screen.findByLabelText(/config filter value/)).toHaveAttribute('value', '');
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should disable save button when delete value from comparator EQ', async () => {
    const fieldName = 'fieldString';
    const payload: EventPayload = [{name: fieldName, type: 'string'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
    const updateFilter = jest.fn();
    render(
        <ConfigFilterExpression
            payload={payload}
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
        />
    );

    // Set comparator
    userEvent.click(await screen.findByLabelText(/config filter field selector/i));
    const options = await screen.findAllByLabelText(/config filter options/i);
    expect(options).toHaveLength(1);
    userEvent.click(options[0]);

    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    // Set value to 25
    await userEvent.type(await screen.findByLabelText(/config filter value/), '25');
    expect(await screen.findByLabelText(/config filter value/)).toHaveAttribute('value', '25');
    expect(await screen.findByLabelText(/config filter button save/)).not.toBeDisabled();
    // Delete 5
    await userEvent.type(await screen.findByLabelText(/config filter value/), '{backspace}');
    expect(await screen.findByLabelText(/config filter value/)).toHaveAttribute('value', '2');
    // Delete 2
    await userEvent.type(await screen.findByLabelText(/config filter value/), '{backspace}');
    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    expect(await screen.findByLabelText(/config filter value/)).toHaveAttribute('value', '');
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should not show dialog when no expression', async () => {
    const fieldName = 'fieldString';
    const payload: EventPayload = [{name: fieldName, type: 'string'}];
    const filter: RuleFilterContainer = [];
    const updateFilter = jest.fn();
    render(
        <ConfigFilterExpression
            payload={payload}
            filter={filter}
            expression={undefined}
            updateFilter={updateFilter}
        />
    );

    expect(screen.queryByLabelText(/config filter dialog/i)).not.toBeInTheDocument();
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, filter);
});

test('ConfigFilterExpresion should set operator GT to zero', async () => {
    const fieldName = 'fieldNumeric';
    const payload: EventPayload = [{name: fieldName, type: 'number'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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
    await userEvent.type(valueField, '0');
    expect(await screen.findByLabelText(/config filter value/)).toHaveProperty('value', '0');
    userEvent.click(await screen.findByLabelText(/config filter button save/));

    const expectedFilter = [
        {
          model: 'EXPRESSION',
          type: 'COMPARATOR',
          operator: 'GT',
          field: fieldName,
          value: 0
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should set operator GT to numeric field', async () => {
    const fieldName = 'fieldNumeric';
    const payload: EventPayload = [{name: fieldName, type: 'number'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

test('ConfigFilterExpresion should update operator LTE and numeric field', async () => {
    const fieldName = 'fieldNumeric';
    const payload: EventPayload = [{name: fieldName, type: 'number'}];
    const expression: Expression = {type: 'COMPARATOR', model: 'EXPRESSION', field: fieldName, operator: 'EQ', value: 50};
    const filter: RuleFilterContainer = [expression];
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
    userEvent.click(operators[3]);
    const valueField = await screen.findByLabelText(/config filter value/);
    await userEvent.type(valueField, '100');
    userEvent.click(await screen.findByLabelText(/config filter button save/));

    const expectedFilter = [
        {
          model: 'EXPRESSION',
          type: 'COMPARATOR',
          operator: 'LT',
          field: fieldName,
          value: 50100
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should set a default operator with a string field', async () => {
    const fieldName = 'fieldString';
    const payload: EventPayload = [{name: fieldName, type: 'string'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const valueField = await screen.findByLabelText(/config filter value/);
    await userEvent.type(valueField, 'temperature');
    userEvent.click(await screen.findByLabelText(/config filter button save/));

    const expectedFilter = [
        {
          model: 'EXPRESSION',
          type: 'DEFAULT',
          field: fieldName,
          value: 'temperature'
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field without maxDistance OR minDistance', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, '100');
    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, '200');


    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should set operator NEAR to GEO field with maxDistance', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, '100');
    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, '80');
    const maxField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(maxField, '300');


    userEvent.click(await screen.findByLabelText(/config filter button save/));
    const expectedFilter: EComparatorLocation[] = [
        {
          model: 'EXPRESSION',
          type: 'GEO',
          operator: 'NEAR',
          field: fieldName,
          value: {
              _geometry: {type: 'Point', coordinates: [100, 80]},
              _maxDistance: 300
          }
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should set operator NEAR to GEO field with minDistance', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, '100');
    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, '{backspace}-80');
    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '300');


    userEvent.click(await screen.findByLabelText(/config filter button save/));
    const expectedFilter: EComparatorLocation[] = [
        {
          model: 'EXPRESSION',
          type: 'GEO',
          operator: 'NEAR',
          field: fieldName,
          value: {
              _geometry: {type: 'Point', coordinates: [100, -80]},
              _minDistance: 300
          }
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should set operator NEAR to GEO field with minDistance and maxDistance', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, '100');

    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, '{backspace}-40');

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '300');

    const maxField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(maxField, '600');


    userEvent.click(await screen.findByLabelText(/config filter button save/));
    const expectedFilter: EComparatorLocation[] = [
        {
          model: 'EXPRESSION',
          type: 'GEO',
          operator: 'NEAR',
          field: fieldName,
          value: {
              _geometry: {type: 'Point', coordinates: [100, -40]},
              _minDistance: 300,
              _maxDistance: 600
          }
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should set operator NEAR to GEO field with minDistance and maxDistance all to zero', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, '0');

    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, '0');

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '0');

    const maxField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(maxField, '0');

    userEvent.click(await screen.findByLabelText(/config filter button save/));
    const expectedFilter: EComparatorLocation[] = [
        {
          model: 'EXPRESSION',
          type: 'GEO',
          operator: 'NEAR',
          field: fieldName,
          value: {
              _geometry: {type: 'Point', coordinates: [0, 0]},
              _minDistance: 0,
              _maxDistance: 0
          }
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field with minDistance and maxDistance when update to empty values', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'GEO', model: 'EXPRESSION', field: fieldName, operator: 'NEAR', value: {_geometry: { coordinates: [10, 10], type: 'Point'}, _maxDistance: 100, _minDistance: 100}};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, '{backspace}');

    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, '{backspace}');

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '{backspace}');

    const maxField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(maxField, '{backspace}');

    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));

    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field with minDistance and maxDistance when delete max and min distance', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'GEO', model: 'EXPRESSION', field: fieldName, operator: 'NEAR', value: {_geometry: { coordinates: [10, 10], type: 'Point'}, _maxDistance: 100, _minDistance: 100}};
    const filter: RuleFilterContainer = [expression];
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

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '{backspace}');

    const maxField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(maxField, '{backspace}');

    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should change location filter to passthorw when payload field is not location', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'number'}];
    const expression: Expression =         {
        model: 'EXPRESSION',
        type: 'GEO',
        operator: 'NEAR',
        field: fieldName,
        value: {
            _geometry: {type: 'Point', coordinates: [100, 200]},
            _maxDistance: 300
        }
    };
    const filter: RuleFilterContainer = [expression];
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

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field with min distance NOT a number', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'GEO', model: 'EXPRESSION', field: fieldName, operator: 'NEAR', value: {_geometry: { coordinates: [10, 10], type: 'Point'}, _maxDistance: 100, _minDistance: 100}};
    const filter: RuleFilterContainer = [expression];
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

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, 'invalidmindistance');

    expect(await screen.findByLabelText(/config filter location component min distance/)).toHaveTextContent(/Min. distanceDistance greater or equal to 0/i);
    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field with max distance NOT a number', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'GEO', model: 'EXPRESSION', field: fieldName, operator: 'NEAR', value: {_geometry: { coordinates: [10, 10], type: 'Point'}, _maxDistance: 100, _minDistance: 100}};
    const filter: RuleFilterContainer = [expression];
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

    const minField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(minField, 'invalidmacdistance');

    expect(await screen.findByLabelText(/config filter location component max distance/)).toHaveTextContent(/Max. distanceDistance greater or equal to 0/i);
    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field with min distance out of range', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'GEO', model: 'EXPRESSION', field: fieldName, operator: 'NEAR', value: {_geometry: { coordinates: [10, 10], type: 'Point'}, _maxDistance: 100, _minDistance: 100}};
    const filter: RuleFilterContainer = [expression];
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

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '-100');

    expect(await screen.findByLabelText(/config filter location component min distance/)).toHaveTextContent(/Min. distanceDistance greater or equal to 0/i);
    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should NOT set operator NEAR to GEO field with max distance out of range', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'GEO', model: 'EXPRESSION', field: fieldName, operator: 'NEAR', value: {_geometry: { coordinates: [10, 10], type: 'Point'}, _maxDistance: 100, _minDistance: 100}};
    const filter: RuleFilterContainer = [expression];
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

    const minField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(minField, '-100');

    expect(await screen.findByLabelText(/config filter location component max distance/)).toHaveTextContent(/Max. distanceDistance greater or equal to 0/i);
    expect(await screen.findByLabelText(/config filter button save/)).toBeDisabled();
    userEvent.click(await screen.findByLabelText(/config filter button save/));
    expect(updateFilter).toHaveBeenCalledTimes(0);
});

test('ConfigFilterExpresion should warning invalid coordinates, Lat: [-90, 90] and Lng: [-180, 180]', async () => {
    const fieldName = 'fieldLocation';
    const payload: EventPayload = [{name: fieldName, type: 'location'}];
    const expression: Expression = {type: 'PASSTHROW', model: 'EXPRESSION', field: fieldName};
    const filter: RuleFilterContainer = [expression];
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

    const lngField = await screen.findByLabelText(/config filter location longitude/);
    await userEvent.type(lngField, 'invalid');
    expect(await screen.findByLabelText(/config filter location component longitude/)).toHaveTextContent(/LongitudeValues between -180 and 180/i);
    userEvent.clear(lngField);
    await userEvent.type(lngField, '200');
    expect(await screen.findByLabelText(/config filter location component longitude/)).toHaveTextContent(/LongitudeValues between -180 and 180/i);
    userEvent.clear(lngField);
    await userEvent.type(lngField, '-200');
    expect(await screen.findByLabelText(/config filter location component longitude/)).toHaveTextContent(/LongitudeValues between -180 and 180/i);
    userEvent.clear(lngField);
    await userEvent.type(lngField, '-37.123456');
    expect(lngField).toHaveAttribute('value', '-37.123456');
    expect(await screen.findByLabelText(/config filter location component longitude/)).not.toHaveTextContent(/Values between -180 and 180/i);

    const latField = await screen.findByLabelText(/config filter location latitude/);
    await userEvent.type(latField, 'invalid');
    expect(await screen.findByLabelText(/config filter location component latitude/)).toHaveTextContent(/LatitudeValues between -90 and 90/i);
    userEvent.clear(latField);
    await userEvent.type(latField, '95');
    expect(await screen.findByLabelText(/config filter location component latitude/)).toHaveTextContent(/LatitudeValues between -90 and 90/i);
    userEvent.clear(latField);
    await userEvent.type(latField, '-90.01');
    expect(await screen.findByLabelText(/config filter location component latitude/)).toHaveTextContent(/LatitudeValues between -90 and 90/i);
    userEvent.clear(latField);
    await userEvent.type(latField, '-40');
    expect(latField).toHaveAttribute('value', '-40');
    expect(await screen.findByLabelText(/config filter location component latitude/)).not.toHaveTextContent(/Values between -90 and 90/i);

    const minField = await screen.findByLabelText(/config filter location min distance/);
    await userEvent.type(minField, '300');

    const maxField = await screen.findByLabelText(/config filter location max distance/);
    await userEvent.type(maxField, '600');


    userEvent.click(await screen.findByLabelText(/config filter button save/));
    const expectedFilter: EComparatorLocation[] = [
        {
          model: 'EXPRESSION',
          type: 'GEO',
          operator: 'NEAR',
          field: fieldName,
          value: {
              _geometry: {type: 'Point', coordinates: [-37.123456, -40]},
              _minDistance: 300,
              _maxDistance: 600
          }
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
});
