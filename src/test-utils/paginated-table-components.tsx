import React from 'react';
import { renderWithAPI as render, fireEvent, waitFor, screen, within } from './index';
import nock from 'nock/types';
import { ComponentWithUsePaginationProps } from '../services/use-pagination';

export const runPaginatedTableTest = <R, E>(
    title: string,
    PaginatedTable: React.FC<ComponentWithUsePaginationProps>,
    dataGenerator: (size: number, next: boolean, prev: boolean) => R,
    serverResponse: (page: number, pageSize: number, status: number, response: R | E) => nock.Scope | void
) => {
    test(`${title} loading first time`, async () => {
        // mock Empty server response
        serverResponse(1, 10, 200, dataGenerator(0, false, false));
        render(<PaginatedTable />);
        await screen.findByTestId(/loading-view-row/);

        const prevButton = (await screen.findByTitle(/previous page/i)) as HTMLButtonElement;
        const nextButton = (await screen.findByTitle(/next page/i)) as HTMLButtonElement;
        const rowsPerPage = await screen.findByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(rowsPerPage).toHaveTextContent('10');

        await screen.findByTestId(/empty-view-row/);
    });

    test(`${title} snapshot when empty data`, async () => {
        // mock Empty server response
        serverResponse(1, 10, 200, dataGenerator(0, false, false));
        render(<PaginatedTable />);
        await screen.findByTestId(/empty-view-row/);

        const noDataView = await screen.findByTestId(/empty-view-row/i);
        const prevButton = (await screen.findByTitle(/previous page/i)) as HTMLButtonElement;
        const nextButton = (await screen.findByTitle(/next page/i)) as HTMLButtonElement;
        const rowsPerPage = await screen.findByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(noDataView).toBeInTheDocument();
        expect(() => screen.getByTestId(/loading-view-row/)).toThrowError();
        expect(rowsPerPage).toHaveTextContent('10');
    });

    test(`${title} snapshot with data and pagination by default`, async () => {
        serverResponse(1, 10, 200, dataGenerator(10, false, false));
        render(<PaginatedTable />);
        await screen.findAllByLabelText(/element row/);
    });

    test(`${title} snapshot with data and custom initial pagination`, async () => {
        serverResponse(3, 20, 200, dataGenerator(20, false, false));
        render(<PaginatedTable initialPage={3} initialPageSize={20} />);
        expect(await screen.findAllByLabelText(/element row/)).toHaveLength(20);
    });

    test(`${title} snapshot while loading with previous data and pagination`, async () => {
        serverResponse(1, 10, 200, dataGenerator(10, true, false));
        render(<PaginatedTable />);
        await screen.findAllByLabelText(/element row/);
        serverResponse(2, 10, 200, dataGenerator(10, true, true));
        const nextButton = (await screen.findByTitle(/next page/i)) as HTMLButtonElement;
        fireEvent.click(nextButton);
        await screen.findByTestId(/loading-view-row/);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
    });

    test(`${title} render items and can navigate by pages`, async () => {
        // Render in first page
        serverResponse(1, 10, 200, dataGenerator(10, true, false));
        render(<PaginatedTable />);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());

        const prevButton = (await screen.findByTitle(/previous page/i)) as HTMLButtonElement;
        const nextButton = (await screen.findByTitle(/next page/i)) as HTMLButtonElement;
        const rowsPerPage = await screen.findByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(false);
        expect(rowsPerPage).toHaveTextContent('10');

        // Simulate click on next page
        serverResponse(2, 10, 200, dataGenerator(10, true, true));
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
        expect(prevButton.disabled).toBe(false);
        expect(nextButton.disabled).toBe(false);
        expect(rowsPerPage).toHaveTextContent('10');

        // Simulate click on next page
        serverResponse(3, 10, 200, dataGenerator(5, false, true));
        fireEvent.click(nextButton);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
        expect(prevButton.disabled).toBe(false);
        expect(nextButton.disabled).toBe(true);
        expect(rowsPerPage).toHaveTextContent('10');

        // Simulate click on prev page
        serverResponse(2, 10, 200, dataGenerator(10, true, true));
        fireEvent.click(prevButton);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
        expect(prevButton.disabled).toBe(false);
        expect(nextButton.disabled).toBe(false);
        expect(rowsPerPage).toHaveTextContent('10');
    });

    test(`${title} render elements and change pagesize rerender a new set of elements`, async () => {
        serverResponse(1, 10, 200, dataGenerator(10, false, false));
        const { unmount } = render(<PaginatedTable />);
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());

        const prevButton = (await screen.findByTitle(/Previous page/)) as HTMLButtonElement;
        const nextButton = (await screen.findByTitle(/Next page/)) as HTMLButtonElement;
        const rowsPerPage = await screen.findByLabelText(/^rows:$/i);

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => screen.getByTestId(/empty-view-row/)).toThrowError();
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
        expect((await screen.findAllByLabelText(/element row/)).length).toBe(10);
        expect(rowsPerPage).toHaveTextContent('10');

        serverResponse(1, 5, 200, dataGenerator(5, false, false));
        fireEvent.mouseDown(rowsPerPage);
        let bound = within(document.getElementById('menu-')!);
        let options = bound.getAllByRole('option');
        fireEvent.click(options[0]); // 0->5, 1->10, 2->20

        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => screen.getByTestId(/empty-view-row/)).toThrowError();
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
        expect((await screen.findAllByLabelText(/element row/)).length).toBe(5);
        expect(rowsPerPage).toHaveTextContent('5');

        serverResponse(1, 20, 200, dataGenerator(20, false, false));
        fireEvent.mouseDown(rowsPerPage);
        bound = within(document.getElementById('menu-')!);
        options = bound.getAllByRole('option');
        fireEvent.click(options[2]); // 0->5, 1->10, 2->20

        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());

        expect(prevButton.disabled).toBe(true);
        expect(nextButton.disabled).toBe(true);
        expect(() => screen.getByTestId(/empty-view-row/)).toThrowError();
        await waitFor(() => expect(() => screen.getByTestId(/loading-view-row/)).toThrowError());
        expect((await screen.findAllByLabelText(/element row/)).length).toBe(20);
        expect(rowsPerPage).toHaveTextContent('20');

        unmount();
    });
};
