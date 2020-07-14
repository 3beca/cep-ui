import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import nock from 'nock/types';
import { ComponentWithUseSelectableProps } from '../services/use-selectable-list';
import { ServiceList } from '../services/api';

const expectMUICheckboxChecked = (e: HTMLElement) => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.stringContaining('Mui-checked'));
const expectMUICheckboxNotChecked = (e: HTMLElement) => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.not.stringContaining('Mui-checked'));


export const runSelectableTableTest = <R, E>(
    title: string,
    SelectableTable: React.FC<ComponentWithUseSelectableProps<R>>,
    dataGenerator: (size: number, next: boolean, prev: boolean) => ServiceList<R>,
    serverResponse: (page: number, pageSize: number, status: number, response: ServiceList<R>|E) => nock.Scope|void,
    checkInternals: boolean = true
) => {

    test(`${title} snapshot when no element selected`, async () => {
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        render(
            <SelectableTable/>
        );
        await waitFor(() => expect(screen.getAllByLabelText('element name')).toHaveLength(5));

        const elements = await screen.findAllByRole(/element-selector$/);

        expect(elements.length).toBe(5);
    });

    test(`${title} snapshot when one element selected`, async () => {
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        // First load, nothing selected
        render(
            <SelectableTable/>
        );
        await waitFor(() => expect(screen.getAllByLabelText('element name')).toHaveLength(5));

        const elements = await screen.findAllByRole(/element-selector$/);

        expect(elements.length).toBe(5);
        fireEvent.click(elements[0], {target: {value: true}});
    });

    test(`${title} snapshot when all element selected`, async () => {
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        // First load, nothing selected
        render(
            <SelectableTable/>
        );
        await waitFor(() => expect(screen.getAllByLabelText('element name')).toHaveLength(5));
        const selectorAll = await screen.findByLabelText(/element-selector-all$/);

        fireEvent.click(selectorAll, {target: {value: true}});
    });

    test(`${title} should keep checked elements and notify on each element checked change`, async () => {
        const onSelected = jest.fn();
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        // First load, nothing selected
        render(
            <SelectableTable
                onSelected={onSelected}
            />
        );
        await waitFor(() => expect(screen.getAllByLabelText('element name')).toHaveLength(5));

        const elements = await screen.findAllByRole(/element-selector$/);

        expect(elements.length).toBe(5);
        const [first, second, thrid, fourth, fifth] = elements;
        fireEvent.click(elements[0], {target: {value: true}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(1);
            expect(onSelected).toHaveBeenCalledWith([events.results[0]]);
        }
        const [, ...notChecked] = elements;
        expectMUICheckboxChecked(first);
        notChecked.map(e => expectMUICheckboxNotChecked(e));

        // Unchecked first element
        fireEvent.click(elements[0], {target: {value: false}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(2);
            expect(onSelected).toHaveBeenNthCalledWith(2, []);
        }
        elements.map(e => expectMUICheckboxNotChecked(e));

        // check first, thirsd and fifth elements
        fireEvent.click(elements[0], {target: {value: true}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(3);
            expect(onSelected).toHaveBeenNthCalledWith(3, [events.results[0]]);
        }
        fireEvent.click(elements[2], {target: {value: true}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(4);
            expect(onSelected).toHaveBeenNthCalledWith(4, [events.results[0], events.results[2]]);
        }
        fireEvent.click(elements[4], {target: {value: true}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(5);
            expect(onSelected).toHaveBeenNthCalledWith(5, [events.results[0], events.results[2], events.results[4]]);
        }
        [first, thrid, fifth].map(e => expectMUICheckboxChecked(e));
        [second, fourth].map(e => expectMUICheckboxNotChecked(e));

        // uncheck third element
        fireEvent.click(elements[2], {target: {value: false}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(6);
            expect(onSelected).toHaveBeenNthCalledWith(6, [events.results[0], events.results[4]]);
        }
        [first, fifth].map(e => expectMUICheckboxChecked(e));
        [second, thrid, fourth].map(e => expectMUICheckboxNotChecked(e));

        // Forward page should reset selecteds
        const secondPageOfEvents = dataGenerator(5, false, true);
        serverResponse(2, 10, 200, secondPageOfEvents);
        const nextButton = await screen.findByTitle(/next page/i) as HTMLButtonElement;
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());

        // Expect new elements to be unchecked
        // TODO: Test muy peligroso pq depende de un estilo, pendiente de buscar una forma mejor de identificar
        // si un componente Check de MUI está seleccionado o plantear mockearlo
        const nextElements = await screen.findAllByRole(/element-selector$/);
        nextElements.map(e => expectMUICheckboxNotChecked(e));
        //elements.map(e => expectMUICheckboxNotChecked(e));
    });

    test(`${title} should check and uncheck all elements from header check selector`, async () => {
        const onSelected = jest.fn();
        const events = dataGenerator(5, true, false);
        serverResponse(1, 10, 200, events);
        // First load, nothing selected
        render(
            <SelectableTable
                onSelected={onSelected}
            />
        );
        await waitFor(() => expect(screen.getAllByLabelText('element name')).toHaveLength(5));

        const selectAllChecker = await screen.findByLabelText(/element-selector-all/);
        const elements = await screen.findAllByRole(/element-selector$/);

        // Check All elements
        fireEvent.click(selectAllChecker, {target: {value: true}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(1);
            expect(onSelected).toHaveBeenCalledWith([events.results[0], events.results[1], events.results[2], events.results[3], events.results[4]]);
        }

        expectMUICheckboxChecked(selectAllChecker);
        elements.map(e => expectMUICheckboxChecked(e));

        // Unchecked all elements
        fireEvent.click(selectAllChecker, {target: {value: false}});
        if(checkInternals) {
            expect(onSelected).toHaveBeenCalledTimes(2);
            expect(onSelected).toHaveBeenNthCalledWith(2, []);
        }
        elements.map(e => expectMUICheckboxNotChecked(e));
        expectMUICheckboxNotChecked(selectAllChecker);

        // Forward page should reset selecteds
        fireEvent.click(selectAllChecker, {target: {value: true}});
        const secondPageOfEvents = dataGenerator(5, false, true);
        serverResponse(2, 10, 200, secondPageOfEvents);
        const nextButton = await screen.findByTitle(/next page/i) as HTMLButtonElement;
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());

        // Expect new elements to be unchecked
        // TODO: Test muy peligroso pq depende de un estilo, pendiente de buscar una forma mejor de identificar
        // si un componente Check de MUI está seleccionado o plantear mockearlo
        const nextElements = await screen.findAllByRole(/element-selector$/);
        nextElements.map(e => expectMUICheckboxNotChecked(e));
        expectMUICheckboxNotChecked(selectAllChecker);
    });
};
