import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import EventTypeTable from './index';
import { generateEventTypeListWith } from '../../test-utils';



test('EventTypeTable mount without crash', () => {
    const { getByText } = render(<EventTypeTable />);
    const linkElement = getByText(/Table of Event Types/i);
    expect(linkElement).toBeInTheDocument();
});

test('EventTypeTable snapshot without data', () => {
    const { container } = render(<EventTypeTable />);
    expect(container).toMatchSnapshot();
});

test('EventTypeTable snapshot with data and pagination', () => {
    const { container } = render(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, true, true)}
            isLoading={false}
            page={2}
            size={5}
        />
    );
    expect(container).toMatchSnapshot();
});

test('EventTypeTable snapshot while loading with previous data and pagination', () => {
    const { container } = render(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, true, true)}
            isLoading={true}
            page={2}
            size={5}
        />
    );
    expect(container).toMatchSnapshot();
});

test('EventTypeTable snapshot while loading without data', () => {
    const { container } = render(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(0, false, false)}
            isLoading={true}
            page={1}
            size={5}
        />
    );
    expect(container).toMatchSnapshot();
});

test('EventTypeTable render without data should show the empty data message', async () => {
    // Render without data
    const {getByTitle, getByTestId, getByLabelText} = render(
        <EventTypeTable
            eventTypeList={undefined}
            isLoading={false}
            isEmpty={true}
            page={1}
            size={5}
        />
    );
    const noDataView = getByTestId('empty-view-row');
    const prevButton = getByTitle('Previous page') as HTMLButtonElement;
    const nextButton = getByTitle('Next page') as HTMLButtonElement;
    const rowsPerPage = getByLabelText('Rows per page:');

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(noDataView).toBeInTheDocument();
    expect(() => getByTestId('loading-view-row')).toThrowError();
    expect(rowsPerPage).toHaveTextContent('5');

});

test('EventTypeTable render when loading show the loading view', async () => {
    // Render without data
    const {getByTitle, getByLabelText, getByTestId} = render(
        <EventTypeTable
            eventTypeList={undefined}
            isLoading={true}
            isEmpty={true}
            page={1}
            size={5}
        />
    );

    const loadingView = getByTestId('loading-view-row');
    const prevButton = getByTitle('Previous page') as HTMLButtonElement;
    const nextButton = getByTitle('Next page') as HTMLButtonElement;
    const rowsPerPage = getByLabelText('Rows per page:');

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId('empty-view-row')).toThrowError();
    expect(loadingView).toBeInTheDocument();
    expect(rowsPerPage).toHaveTextContent('5');
});

test('EventTypeTable render items and can navigate by pages', async () => {
    const onChangePage = jest.fn();
    // Render in first page
    const {getByTitle, getByLabelText, rerender} = render(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, true, false)}
            isLoading={false}
            page={1}
            size={5}
            onChangePage={onChangePage}
        />
    );
    const prevButton = getByTitle('Previous page') as HTMLButtonElement;
    const nextButton = getByTitle('Next page') as HTMLButtonElement;
    const rowsPerPage = getByLabelText('Rows per page:');

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);
    expect(rowsPerPage).toHaveTextContent('5');

    // Simulate click on next page
    fireEvent.click(nextButton);
    expect(onChangePage).toHaveBeenCalledTimes(1);
    expect(onChangePage).toHaveBeenCalledWith(2);

    // Rerender in second page
    rerender(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, true, true)}
            isLoading={false}
            page={2}
            size={5}
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

    // Rerender in last page
    rerender(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, false, true)}
            isLoading={false}
            page={3}
            size={5}
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
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, false, true)}
            isLoading={false}
            page={2}
            size={5}
            onChangePage={onChangePage}
        />
    );

    expect(prevButton.disabled).toBe(false);
    expect(nextButton.disabled).toBe(true);
    expect(rowsPerPage).toHaveTextContent('5');    
});

test('EventTypeTable render 5 elements and header', async () => {
    // Render without data
    const {getByTitle, getByLabelText, getByTestId, getAllByRole} = render(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(5, false, false)}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={5}
        />
    );

    const elements = getAllByRole('row').length;
    expect(elements).toBe(6);
    const prevButton = getByTitle('Previous page') as HTMLButtonElement;
    const nextButton = getByTitle('Next page') as HTMLButtonElement;
    const rowsPerPage = getByLabelText('Rows per page:');

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId('empty-view-row')).toThrowError();
    expect(() => getByTestId('loading-view-row')).toThrowError();
    expect(rowsPerPage).toHaveTextContent('5');
});
