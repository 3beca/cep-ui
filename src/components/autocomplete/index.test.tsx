import * as React from 'react';
import userEvent from '@testing-library/user-event';
import {
    render,
    screen,
    act
} from '../../test-utils';

import Autocomplete, {createCustomFilterOptions} from './index';

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

test('Autocomplete should render with defaults placeholdres', async () => {
    const options = [
        {id: '1', name: 'element 1'}
    ];
    const selected: {id: string; name: string;}|null = null;
    const setSelected = jest.fn();
    const changeFilter = jest.fn();
    const emptyElement = {id: '', name: ''};
    const {rerender} = render(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );

    await screen.findByLabelText('element name');
    await screen.findByLabelText(/search a element/i);

    rerender(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={true}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );

    await screen.findByLabelText('element name');
    await screen.findByLabelText(/loading elements/i);
});

test('Autocomplete should render with custom placeholdres', async () => {
    const options = [
        {id: '1', name: 'element 1'}
    ];
    const selected: {id: string; name: string;}|null = null;
    const setSelected = jest.fn();
    const changeFilter = jest.fn();
    const emptyElement = {id: '', name: ''};
    const {rerender} = render(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
            ariaLabel='anything name'
            placeholderText='Search Anything'
            loadingText='Loading Anything'
        />
    );

    await screen.findByLabelText('anything name');
    await screen.findByLabelText(/search anything/i);

    rerender(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={true}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
            ariaLabel='anything name'
            placeholderText='Search Anything'
            loadingText='Loading Anything'
        />
    );

    await screen.findByLabelText('anything name');
    await screen.findByLabelText(/loading anything/i);
});

test('Autocomplete should render with custom filter function', async () => {
    const options = [
        {id: '1', name: 'element 1'}
    ];
    const selected: {id: string; name: string;}|null = null;
    const setSelected = jest.fn();
    const changeFilter = jest.fn();
    const emptyElement = {id: '', name: ''};
    const filterFunction = createCustomFilterOptions<{id: string; name: string;}>();
    render(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
            defaultFilter={filterFunction}
        />
    );

    await screen.findByLabelText('element name');
    await screen.findByLabelText(/search a element/i);
});

test('Autocomplete should filter options, change filter and select one', async () => {
    const options = [
        {id: '1', name: 'element 1'},
        {id: '2', name: 'element 11'},
        {id: '3', name: 'element 1111'},
        {id: '4', name: 'element 2'},
        {id: '5', name: 'element 12'},
        {id: '6', name: 'element 23'},
        {id: '7', name: 'element 3'},
        {id: '8', name: 'element 4'}
    ];
    const selected: {id: string; name: string;}|null = null;
    const setSelected = jest.fn();
    const changeFilter = jest.fn();
    const emptyElement = {id: '', name: ''};
    render(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );

    await screen.findByLabelText('element name');
    await screen.findByLabelText(/search a element/i);

    // Open options when click in input
    const prefix = '2';
    const input = await screen.findByLabelText(/search a element/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).toHaveValue(prefix);
    expect(changeFilter).toHaveBeenNthCalledWith(1, prefix);
    await screen.findAllByLabelText(/search a element/i);
    const optionsFiltered = await screen.findAllByRole('option');
    expect(optionsFiltered).toHaveLength(3);

    // Select
    changeFilter.mockClear();
    userEvent.click(optionsFiltered[1]);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).toHaveValue('element 12');
    expect(setSelected).toHaveBeenNthCalledWith(1, options[4]);
    expect(changeFilter).toHaveBeenCalledTimes(0);
    await screen.findAllByLabelText(/search a element/i);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('Autocomplete should filter all options, and create a new one', async () => {
    const options = [
        {id: '1', name: 'element 1'},
        {id: '2', name: 'element 11'},
        {id: '3', name: 'element 1111'},
        {id: '4', name: 'element 2'},
        {id: '5', name: 'element 12'},
        {id: '6', name: 'element 23'},
        {id: '7', name: 'element 3'},
        {id: '8', name: 'element 4'}
    ];
    const selected: {id: string; name: string;}|null = null;
    const setSelected = jest.fn();
    const changeFilter = jest.fn();
    const emptyElement = {id: 'customidfornewelements', name: ''};
    const {rerender} = render(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );

    await screen.findByLabelText('element name');
    await screen.findByLabelText(/search a element/i);

    // Open options when click in input
    const prefix = 'element 5';
    const input = await screen.findByLabelText(/search a element/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).toHaveValue(prefix);
    screen.getByText(/no options/i);
    act(() => void jest.runOnlyPendingTimers());
    expect(changeFilter).toHaveBeenNthCalledWith(1, prefix);
    await screen.findAllByLabelText(/search a element/i);
    // Simulate isLoading
    rerender(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={[]}
            isLoading={true}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );
    // Simulate after loading....
    rerender(
        <Autocomplete
            selected={selected}
            setSelected={setSelected}
            options={[]}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );

    const newElement = await screen.findByRole('option');
    expect(newElement).toHaveTextContent('Create ' + prefix);
    expect(input).toHaveAttribute('value', prefix);

    // Select
    changeFilter.mockClear();
    userEvent.click(newElement);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).toHaveValue(prefix);
    expect(setSelected).toHaveBeenNthCalledWith(1, {...emptyElement, name: prefix});
    expect(changeFilter).toHaveBeenCalledTimes(0);
    await screen.findAllByLabelText(/search a element/i);
    expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('Autocomplete should render disabled', async () => {
    const options = [
        {id: '1', name: 'element 1'}
    ];
    const selected: {id: string; name: string;}|null = null;
    const setSelected = jest.fn();
    const changeFilter = jest.fn();
    const emptyElement = {id: '', name: ''};
    render(
        <Autocomplete
            disabled={true}
            selected={selected}
            setSelected={setSelected}
            options={options}
            isLoading={false}
            changeFilter={changeFilter}
            emptyElement={emptyElement}
        />
    );

    await screen.findByLabelText('element name');

    // DO NOT Open options when disabled
    const prefix = 'element 5';
    const input = await screen.findByLabelText(/search a element/i);
    await userEvent.type(input, prefix);
    act(() => void jest.runOnlyPendingTimers());
    expect(input).not.toHaveValue();
});