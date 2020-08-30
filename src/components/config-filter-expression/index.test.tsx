import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    renderWithAPI as render,
    screen
} from '../../test-utils';
import ConfigFilterExpression from './';
import { EventPayload, RuleFilterContainer, Expression, EComparatorLocation } from '../../services/api/utils';

// ConfigFilterExpression test
test('ConfigFilterExpresion should close dialog when click outside', async () => {
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

    const dialog = await screen.findByLabelText(/config filter dialog/i);
    userEvent.click(dialog.firstElementChild!);
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, filter);
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
    await userEvent.type(latField, '200');
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
              _geometry: {type: 'Point', coordinates: [100, 200]},
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
    await userEvent.type(latField, '200');
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
              _geometry: {type: 'Point', coordinates: [100, 200]},
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
    await userEvent.type(latField, '200');
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
              _geometry: {type: 'Point', coordinates: [100, 200]},
              _minDistance: 300,
              _maxDistance: 600
          }
        }
      ];
    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenNthCalledWith(1, expectedFilter);
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

// FieldExpressionLocation
test('FieldExpressionLocation should avoid invalid coordinates, Lat: [-90, 90] and Lng: [-180, 180]', () => {

});
