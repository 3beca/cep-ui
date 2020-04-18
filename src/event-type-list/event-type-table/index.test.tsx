import React from 'react';
import { render, fireEvent, within, waitFor } from '@testing-library/react';
import EventTypeTable from './index';
import { generateEventTypeListWith } from '../../test-utils';

jest.mock('@material-ui/core/Snackbar', () => {
    return ({open, onClose}: {open: boolean, onClose: () => void}): React.ReactElement|null => {
        if(open) setTimeout(onClose, 0);
        return open ?
        (
            <div aria-label='snackbar-message'>Snackbar Message</div>
        ) : null;
    }
});

test('EventTypeTable mount without crash', () => {
    const { getByText } = render(<EventTypeTable/>);
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

test('EventTypeTable render 10 elements when change pageSize', async () => {
    // Render without data
    const onChangePageSize = jest.fn();
    const {rerender, getByTitle, getByLabelText, getByTestId, getAllByRole, unmount} = render(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith()}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={5}
            onChangePageSize={onChangePageSize}
        />
    );
    const prevButton = getByTitle('Previous page') as HTMLButtonElement;
    const nextButton = getByTitle('Next page') as HTMLButtonElement;
    const rowsPerPage = getByLabelText(/rows per page:/i);

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId('empty-view-row')).toThrowError();
    expect(() => getByTestId('loading-view-row')).toThrowError();
    expect(getAllByRole('row').length).toBe(6);
    expect(rowsPerPage).toHaveTextContent('5');

    fireEvent.mouseDown(rowsPerPage);
    const bound = within(document.getElementById('menu-')!);
    const options = bound.getAllByRole('option');
    fireEvent.click(options[1]); // 0->5, 1->10, 2->20

    expect(onChangePageSize).toHaveBeenCalledTimes(1);
    expect(onChangePageSize).toHaveBeenCalledWith(10);

    rerender(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(10, false, false)}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={10}
            onChangePageSize={onChangePageSize}
        />
    );

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId('empty-view-row')).toThrowError();
    expect(() => getByTestId('loading-view-row')).toThrowError();
    expect(getAllByRole('row').length).toBe(11);
    expect(rowsPerPage).toHaveTextContent('10');

    fireEvent.mouseDown(rowsPerPage);
    fireEvent.click(options[2]); // 0->5, 1->10, 2->20

    expect(onChangePageSize).toHaveBeenCalledTimes(2);
    expect(onChangePageSize).toHaveBeenNthCalledWith(2, 20);

    rerender(
        <EventTypeTable
            eventTypeList={generateEventTypeListWith(20, false, false)}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={20}
            onChangePageSize={onChangePageSize}
        />
    );

    expect(prevButton.disabled).toBe(true);
    expect(nextButton.disabled).toBe(true);
    expect(() => getByTestId('empty-view-row')).toThrowError();
    expect(() => getByTestId('loading-view-row')).toThrowError();
    expect(getAllByRole('row').length).toBe(21);
    expect(rowsPerPage).toHaveTextContent('20');

    unmount();
});

test('EventTypeTable should copy url of element to clipboard when click in edit icon', async () => {
    const events = generateEventTypeListWith();
    const {getAllByLabelText, getByLabelText} = render(
        <EventTypeTable
            eventTypeList={events}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={5}
        />
    );

    const elements = getAllByLabelText('copy-icon');
    expect(elements.length).toBe(5);
    fireEvent.click(elements[0]);
    await waitFor(() => expect(getByLabelText('snackbar-message')).toHaveTextContent(/snackbar message/i));
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(events.results[0].url);
});

test('EventTypeTable should keep checked elements and notify on each element checked change', async () => {
    const onSelected = jest.fn();
    const events = generateEventTypeListWith(5, true, false);
    // First load, nothing selected
    const {getAllByRole, rerender} = render(
        <EventTypeTable
            eventTypeList={events}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={5}
            onSelected={onSelected}
        />
    );

    const elements = getAllByRole('element-selector');

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

    const secondPageOfEvents = generateEventTypeListWith(5, true, false);
    rerender(
        <EventTypeTable
            eventTypeList={secondPageOfEvents}
            isLoading={false}
            isEmpty={false}
            page={2}
            size={5}
            onSelected={onSelected}
        />
    );
    // Expect new elements to be unchecked
    // TODO: Test muy peligroso pq depende de un estilo, pendiente de buscar una forma mejor de identificar
    // si un componente Check de MUI está seleccionado o plantear mockearlo
    elements.map(e => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.not.stringContaining('Mui-checked')));
});

test('EventTypeTable should check and uncheck all elements from header check selector', async () => {
    const onSelected = jest.fn();
    const events = generateEventTypeListWith(5, true, false);
    // First load, nothing selected
    const {getByRole, getAllByRole, rerender} = render(
        <EventTypeTable
            eventTypeList={events}
            isLoading={false}
            isEmpty={false}
            page={1}
            size={5}
            onSelected={onSelected}
        />
    );

    const selectAllChecker = getByRole('element-selector-all');
    const elements = getAllByRole('element-selector');

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

    // Rerender with all elements checked, should rerender with empty elements selected
    fireEvent.click(selectAllChecker, {target: {value: true}});
    const secondPageOfEvents = generateEventTypeListWith(5, true, false);
    rerender(
        <EventTypeTable
            eventTypeList={secondPageOfEvents}
            isLoading={false}
            isEmpty={false}
            page={2}
            size={5}
            onSelected={onSelected}
        />
    );
    // Expect new elements to be unchecked
    // TODO: Test muy peligroso pq depende de un estilo, pendiente de buscar una forma mejor de identificar
    // si un componente Check de MUI está seleccionado o plantear mockearlo
    elements.map(e => expect(e.parentElement!.parentElement!).toHaveAttribute('class', expect.not.stringContaining('Mui-checked')));
});