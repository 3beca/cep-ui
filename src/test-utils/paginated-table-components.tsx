import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import { EventTypeTableProps } from '../event-type-list-page/event-type-table';
import nock from 'nock/types';
import { EventTypeList, EventTypeError } from '../services/event-type';

export const runPaginatedTableTest = (
    title: string,
    PaginatedTable: React.FC<EventTypeTableProps>,
    dataGenerator: (size: number, next: boolean, prev: boolean) => EventTypeList,
    serverResponse: (page: number, pageSize: number, status: number, response: EventTypeList|EventTypeError) => nock.Scope,
) => {

    test(`${title} snapshot when loading first time`, async () => {
        // mock Empty server response
        serverResponse(1, 10, 200, dataGenerator(0, false, false));
        const { container, getByTestId, getByTitle, getByLabelText} = render(<PaginatedTable/>);
        await waitFor(() => getByTestId(/loading-view-row/));
        expect(container).toMatchSnapshot();

        const loadingView = getByTestId(/loading-view-row/i);
        const prevButton = getByTitle(/previous page/i) as HTMLButtonElement;
        const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
        const rowsPerPage = getByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => getByTestId(/empty-view-row/)).toThrowError();
        expect(loadingView).toBeInTheDocument();
        expect(rowsPerPage).toHaveTextContent('10');

        await waitFor(() => getByTestId(/empty-view-row/));
    });

    test(`${title} snapshot when empty data`, async () => {
        // mock Empty server response
        serverResponse(1, 10, 200, dataGenerator(0, false, false));
        const { container, getByTestId, getByTitle, getByLabelText} = render(<PaginatedTable/>);
        await waitFor(() => getByTestId(/empty-view-row/));
        expect(container).toMatchSnapshot();

        const noDataView = getByTestId(/empty-view-row/i);
        const prevButton = getByTitle(/previous page/i) as HTMLButtonElement;
        const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
        const rowsPerPage = getByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(noDataView).toBeInTheDocument();
        expect(() => getByTestId(/loading-view-row/)).toThrowError();
        expect(rowsPerPage).toHaveTextContent('10');
    });

    test(`${title} snapshot with data and pagination by default`, async () => {
        serverResponse(1, 10, 200, dataGenerator(10, false, false));
        const { container, getAllByLabelText } = render(
            <PaginatedTable/>
        );
        await waitFor(() => getAllByLabelText(/element name/));
        expect(container).toMatchSnapshot();
    });

    test(`${title} snapshot with data and custom initial pagination`, async () => {
        serverResponse(3, 20, 200, dataGenerator(20, false, false));
        const { container, getAllByLabelText } = render(
            <PaginatedTable initialPage={3} initialPageSize={20}/>
        );
        await waitFor(() => expect(getAllByLabelText(/element name/)).toHaveLength(20));
        expect(container).toMatchSnapshot();
    });

    test(`${title} snapshot while loading with previous data and pagination`, async () => {
        serverResponse(1, 10, 200, dataGenerator(10, true, false));
        const { container, getAllByLabelText, getByTitle, getByTestId } = render(
            <PaginatedTable/>
        );
        await waitFor(() => getAllByLabelText(/element name/));
        serverResponse(2, 10, 200, dataGenerator(10, true, true));
        const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
        fireEvent.click(nextButton);
        await waitFor(() => getByTestId(/loading-view-row/));
        expect(container).toMatchSnapshot();
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());
    });

    test(`${title} render items and can navigate by pages`, async () => {
        // Render in first page
        serverResponse(1, 10, 200, dataGenerator(10, true, false));
        const {getByTitle, getByLabelText, getByTestId} = render(
            <PaginatedTable/>
        );
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());

        const prevButton = getByTitle(/previous page/i) as HTMLButtonElement;
        const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
        const rowsPerPage = getByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(false);
        expect(rowsPerPage).toHaveTextContent('10');

        // Simulate click on next page
        serverResponse(2, 10, 200, dataGenerator(10, true, true));
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());
        expect(prevButton.disabled).toBe(false);
        expect(nextButton.disabled).toBe(false);
        expect(rowsPerPage).toHaveTextContent('10');

        // Simulate click on next page
        serverResponse(3, 10, 200, dataGenerator(5, false, true));
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());
        expect(prevButton.disabled).toBe(false);
        expect(nextButton.disabled).toBe(true);
        expect(rowsPerPage).toHaveTextContent('10');

        // Simulate click on prev page
        serverResponse(2, 10, 200, dataGenerator(10, true, true));
        fireEvent.click(prevButton);
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());
        expect(prevButton.disabled).toBe(false);
        expect(nextButton.disabled).toBe(false);
        expect(rowsPerPage).toHaveTextContent('10');
    });

    test(`${title} render elements and change pagesize rerender a new set of elements`, async () => {
        serverResponse(1, 10, 200, dataGenerator(10, false, false));
        const {getByTitle, getByLabelText, getByTestId, getAllByLabelText, unmount} = render(
            <PaginatedTable/>
        );
        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());

        const prevButton = getByTitle(/Previous page/) as HTMLButtonElement;
        const nextButton = getByTitle(/Next page/) as HTMLButtonElement;
        const rowsPerPage = getByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => getByTestId(/empty-view-row/)).toThrowError();
        expect(() => getByTestId(/loading-view-row/)).toThrowError();
        expect(getAllByLabelText(/element name/).length).toBe(10);
        expect(rowsPerPage).toHaveTextContent('10');

        serverResponse(1, 5, 200, dataGenerator(5, false, false));
        fireEvent.mouseDown(rowsPerPage);
        let bound = within(document.getElementById('menu-')!);
        let options = bound.getAllByRole(/option/);
        fireEvent.click(options[0]); // 0->5, 1->10, 2->20

        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => getByTestId(/empty-view-row/)).toThrowError();
        expect(() => getByTestId(/loading-view-row/)).toThrowError();
        expect(getAllByLabelText(/element name/).length).toBe(5);
        expect(rowsPerPage).toHaveTextContent('5');

        serverResponse(1, 20, 200, dataGenerator(20, false, false));
        fireEvent.mouseDown(rowsPerPage);
        bound = within(document.getElementById('menu-')!);
        options = bound.getAllByRole(/option/);
        fireEvent.click(options[2]); // 0->5, 1->10, 2->20

        await waitFor(() => expect(() => getByTestId(/loading-view-row/)).toThrowError());

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => getByTestId(/empty-view-row/)).toThrowError();
        expect(() => getByTestId(/loading-view-row/)).toThrowError();
        expect(getAllByLabelText(/element name/).length).toBe(20);
        expect(rowsPerPage).toHaveTextContent('20');

        unmount();
    });
};