import React from 'react';
import { render } from '@testing-library/react';
import EventTypeTable from './index';
import { EventTypeList } from '../../services/event-type';

const generateListWith = (many: number = 5, next = false, prev = false) => {
    const list: EventTypeList = {
        results: Array(many).map((_, idx) => ({
            id: idx + '',
            name: 'Elemento ' + idx,
            url: 'http://cep/elemento' + idx,
            createdAt: '2020-01-01T10:10:10.123Z',
            updatedAt: '2020-01-01T10:10:10.123Z'
        }))
    };
    if (prev) list.prev = 'http://cep/?page=prev';
    if (next) list.next = 'http://cep/?page=next';
    return list;
};

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
            eventTypeList={generateListWith(5, true, true)}
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
            eventTypeList={generateListWith(5, true, true)}
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
            eventTypeList={generateListWith(0, false, false)}
            isLoading={true}
            page={1}
            size={5}
        />
    );
    expect(container).toMatchSnapshot();
});

test('EventTypeTable should render 5 items in page 2and pagination prev and next enabled', () => {
    const onChangePage = jest.fn();
    const {getByText, getByTitle, getByLabelText, rerender} = render(
        <EventTypeTable
            eventTypeList={undefined}
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
    expect(nextButton.disabled).toBe(true);
    expect(rowsPerPage).toHaveTextContent('5');
    //expect(getByText('6-10 of 100')).toHaveTextContent('2');

    // Rerender with new data
    rerender(
        <EventTypeTable
            eventTypeList={generateListWith(5, true, true)}
            isLoading={false}
            page={1}
            size={5}
            onChangePage={onChangePage}
        />
    );

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(false);
    expect(rowsPerPage).toHaveTextContent('5');
    expect(getByText('6-10 of 100')).toHaveTextContent('2');
});