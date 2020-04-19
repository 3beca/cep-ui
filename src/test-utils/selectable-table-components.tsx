import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { EventTypeTableProps } from '../event-type-list/event-type-table';
import nock from 'nock/types';
import { EventTypeList, EventTypeError } from '../services/event-type';

export const runSelectableTableTest = (
    title: string,
    SelectableTable: React.FC<EventTypeTableProps>,
    dataGenerator: (size: number, next: boolean, prev: boolean) => EventTypeList,
    serverResponse: (page: number, pageSize: number, status: number, response: EventTypeList|EventTypeError) => nock.Scope,
) => {
    test('EventTypeTable should keep checked elements and notify on each element checked change', async () => {
        const onSelected = jest.fn();
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        // First load, nothing selected
        const {getAllByLabelText, getAllByRole, getByTitle, getByTestId} = render(
            <SelectableTable
                onSelected={onSelected}
            />
        );
        await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(5));

        const elements = getAllByRole(/element-selector$/);

        expect(elements.length).toBe(5);
        fireEvent.click(elements[0], {target: {value: true}});
        expect(onSelected).toHaveBeenCalledTimes(1);
        expect(onSelected).toHaveBeenCalledWith([events.results[0]]);

        // Unchecked first element
        fireEvent.click(elements[0], {target: {value: false}});
        expect(onSelected).toHaveBeenCalledTimes(2);
        expect(onSelected).toHaveBeenNthCalledWith(2, []);

        // check first, thirsd and fifth elements
        fireEvent.click(elements[0], {target: {value: true}});
        expect(onSelected).toHaveBeenCalledTimes(3);
        expect(onSelected).toHaveBeenNthCalledWith(3, [events.results[0]]);

        fireEvent.click(elements[2], {target: {value: true}});
        expect(onSelected).toHaveBeenCalledTimes(4);
        expect(onSelected).toHaveBeenNthCalledWith(4, [events.results[0], events.results[2]]);

        fireEvent.click(elements[4], {target: {value: true}});
        expect(onSelected).toHaveBeenCalledTimes(5);
        expect(onSelected).toHaveBeenNthCalledWith(5, [events.results[0], events.results[2], events.results[4]]);

        // uncheck third element
        fireEvent.click(elements[2], {target: {value: false}});
        expect(onSelected).toHaveBeenCalledTimes(6);
        expect(onSelected).toHaveBeenNthCalledWith(6, [events.results[0], events.results[4]]);

        // Forward page should reset selecteds
        const secondPageOfEvents = dataGenerator(5, false, true);
        serverResponse(2, 10, 200, secondPageOfEvents);
        const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());

        // Expect new elements to be unchecked
        // TODO: Test muy peligroso pq depende de un estilo, pendiente de buscar una forma mejor de identificar
        // si un componente Check de MUI está seleccionado o plantear mockearlo
        elements.map(e => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.not.stringContaining('Mui-checked')));
    });

    test('EventTypeTable should check and uncheck all elements from header check selector', async () => {
        const onSelected = jest.fn();
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        // First load, nothing selected
        const {getByRole, getAllByRole, getAllByLabelText, getByTitle, getByTestId} = render(
            <SelectableTable
                onSelected={onSelected}
            />
        );
        await waitFor(() => expect(getAllByLabelText('element name')).toHaveLength(5));

        const selectAllChecker = getByRole(/element-selector-all/);
        const elements = getAllByRole(/element-selector$/);

        fireEvent.click(selectAllChecker, {target: {value: true}});

        // Check All elements
        expect(onSelected).toHaveBeenCalledTimes(1);
        expect(onSelected).toHaveBeenCalledWith([events.results[0], events.results[1], events.results[2], events.results[3], events.results[4]]);
        elements.map(e => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.stringContaining('Mui-checked')));

        // Unchecked all elements
        fireEvent.click(selectAllChecker, {target: {value: false}});
        expect(onSelected).toHaveBeenCalledTimes(2);
        expect(onSelected).toHaveBeenNthCalledWith(2, []);
        elements.map(e => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.not.stringContaining('Mui-checked')));

        // Forward page should reset selecteds
        const secondPageOfEvents = dataGenerator(5, false, true);
        serverResponse(2, 10, 200, secondPageOfEvents);
        const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());

        // Expect new elements to be unchecked
        // TODO: Test muy peligroso pq depende de un estilo, pendiente de buscar una forma mejor de identificar
        // si un componente Check de MUI está seleccionado o plantear mockearlo
        elements.map(e => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.not.stringContaining('Mui-checked')));
    });
};