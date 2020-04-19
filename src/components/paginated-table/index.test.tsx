import React from 'react';
import { render, fireEvent, within } from '@testing-library/react';
import PaginatedTable from './index';

test('PaginatedTable snapshot without data', () => {
    const { container } = render(<PaginatedTable/>);
    expect(container).toMatchSnapshot();
});

test('PaginatedTable snapshot with data and pagination', () => {
    const { container } = render(
        <PaginatedTable
            isLoading={false}
            page={2}
            size={5}
        />

    );
    expect(container).toMatchSnapshot();
});

test('PaginatedTable snapshot while loading with previous data and pagination', () => {
    const { container } = render(
        <PaginatedTable
            isLoading={true}
            page={2}
            size={5}
        />
    );
    expect(container).toMatchSnapshot();
});

test('PaginatedTable snapshot while loading without data', () => {
    const { container } = render(
        <PaginatedTable
            isLoading={true}
            page={1}
            size={5}
        />
    );
    expect(container).toMatchSnapshot();
});

test('PaginatedTable render without data should show the empty data message', async () => {
    // Render without data
    const {getByTitle, getByTestId, getByLabelText} = render(
        <PaginatedTable
            isLoading={false}
            isEmpty={true}
            page={1}
            size={5}
        />
    );
    const noDataView = getByTestId(/empty-view-row/i);
    const prevButton = getByTitle(/previous page/i) as HTMLButtonElement;
    const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
    const rowsPerPage = getByLabelText(/rows per page:/i);

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(noDataView).toBeInTheDocument();
    expect(() => getByTestId(/loading-view-row/)).toThrowError();
    expect(rowsPerPage).toHaveTextContent('5');

});

test('PaginatedTable render when loading show the loading view', async () => {
    // Render without data
    const {getByTitle, getByLabelText, getByTestId} = render(
        <PaginatedTable
            isLoading={true}
            isEmpty={true}
            page={1}
            size={5}
        />
    );

    const loadingView = getByTestId(/loading-view-row/i);
    const prevButton = getByTitle(/previous page/i) as HTMLButtonElement;
    const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
    const rowsPerPage = getByLabelText(/rows per page:/i);

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId(/empty-view-row/)).toThrowError();
    expect(loadingView).toBeInTheDocument();
    expect(rowsPerPage).toHaveTextContent('5');
});

test('PaginatedTable render items and can navigate by pages', async () => {
    const onChangePage = jest.fn();
    // Render in first page
    const {getByTitle, getByLabelText, rerender} = render(
        <PaginatedTable
            isLoading={false}
            page={1}
            size={5}
            hasNextPage={true}
            hasPrevPage={false}
            onChangePage={onChangePage}
        />
    );
    const prevButton = getByTitle(/previous page/i) as HTMLButtonElement;
    const nextButton = getByTitle(/next page/i) as HTMLButtonElement;
    const rowsPerPage = getByLabelText(/rows per page:/i);

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);
    expect(rowsPerPage).toHaveTextContent('5');

    // Simulate click on next page
    fireEvent.click(nextButton);
    expect(onChangePage).toHaveBeenCalledTimes(1);
    expect(onChangePage).toHaveBeenCalledWith(2);

    // Rerender in second page
    rerender(
        <PaginatedTable
            isLoading={false}
            page={2}
            size={5}
            hasNextPage={true}
            hasPrevPage={true}
            onChangePage={onChangePage}
        />
    );

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(false);
    expect(rowsPerPage).toHaveTextContent('5');

    // Simulate click on next page
    fireEvent.click(nextButton);
    expect(onChangePage).toHaveBeenCalledTimes(2);
    expect(onChangePage).toHaveBeenNthCalledWith(2, 3);

    // Rerender last page
    rerender(
        <PaginatedTable
            isLoading={false}
            page={3}
            size={5}
            hasNextPage={false}
            hasPrevPage={true}
            onChangePage={onChangePage}
        />
    );

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);
    expect(rowsPerPage).toHaveTextContent('5');

    // Simulate click on prev page
    fireEvent.click(prevButton);
    expect(onChangePage).toHaveBeenCalledTimes(3);
    expect(onChangePage).toHaveBeenNthCalledWith(3, 2);

    // Rerender in last page
    rerender(
        <PaginatedTable
            isLoading={false}
            page={2}
            size={5}
            hasNextPage={false}
            hasPrevPage={true}
            onChangePage={onChangePage}
        />
    );

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);
    expect(rowsPerPage).toHaveTextContent('5');
});

test('PaginatedTable render 10 elements when change pageSize', async () => {
    // Render without data
    const onChangePageSize = jest.fn();
    const {rerender, getByTitle, getByLabelText, getByTestId} = render(
        <PaginatedTable
            isLoading={false}
            isEmpty={false}
            page={1}
            size={5}
            onChangePageSize={onChangePageSize}
        />
    );
    const prevButton = getByTitle(/Previous page/) as HTMLButtonElement;
    const nextButton = getByTitle(/Next page/) as HTMLButtonElement;
    const rowsPerPage = getByLabelText(/rows per page:/i);

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId(/empty-view-row/)).toThrowError();
    expect(() => getByTestId(/loading-view-row/)).toThrowError();
    expect(rowsPerPage).toHaveTextContent('5');

    fireEvent.mouseDown(rowsPerPage);
    const bound = within(document.getElementById('menu-')!);
    const options = bound.getAllByRole(/option/);
    fireEvent.click(options[1]); // 0->5, 1->10, 2->20

    expect(onChangePageSize).toHaveBeenCalledTimes(1);
    expect(onChangePageSize).toHaveBeenCalledWith(10);

    rerender(
        <PaginatedTable
            isLoading={false}
            isEmpty={false}
            page={1}
            size={10}
            onChangePageSize={onChangePageSize}
        />
    );

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId(/empty-view-row/)).toThrowError();
    expect(() => getByTestId(/loading-view-row/)).toThrowError();
    expect(rowsPerPage).toHaveTextContent('10');

    fireEvent.mouseDown(rowsPerPage);
    fireEvent.click(options[2]); // 0->5, 1->10, 2->20

    expect(onChangePageSize).toHaveBeenCalledTimes(2);
    expect(onChangePageSize).toHaveBeenNthCalledWith(2, 20);

    rerender(
        <PaginatedTable
            isLoading={false}
            isEmpty={false}
            page={1}
            size={20}
            onChangePageSize={onChangePageSize}
        />
    );

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId(/empty-view-row/)).toThrowError();
    expect(() => getByTestId(/loading-view-row/)).toThrowError();
    expect(rowsPerPage).toHaveTextContent('20');
});
