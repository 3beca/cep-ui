import React from 'react';
import { render, fireEvent, waitFor, within } from '@testing-library/react';
import nock from 'nock/types';
import { ServiceList, Entity, ServiceError } from '../services/api';

export const runDeletableTableTest = <R extends Entity, E extends ServiceError>(
    title: string,
    DeletableTable: React.FC<{}>,
    ariaElementRow: string|RegExp,
    dataGenerator: (size: number, next: boolean, prev: boolean) => ServiceList<R>,
    serverDataResponse: (page: number, pageSize: number, status: number, response: ServiceList<R>|E) => nock.Scope|void,
    serverDeleteResponse: (id: string, status: number, response?: ServiceError) => nock.Scope|void
) => {
    test(`${title} should show delete dialog when click in its delete icon`, async () => {
        const response = dataGenerator(10, false, false);
        serverDataResponse(1, 10, 200, response);
        const {getAllByLabelText, getByTestId, queryByTestId} = render(
            <DeletableTable/>
        );
        await waitFor(() => expect(getAllByLabelText(ariaElementRow)).toHaveLength(10));
        const elements = getAllByLabelText('delete one dialog');
        expect(elements.length).toBe(10);
        fireEvent.click(elements[0]);

        const dialog = within(document.getElementById('icon-dialog')!);
        dialog.getByLabelText(/title/i);
        dialog.getByLabelText(/elements to delete/i);
        expect(dialog.getAllByLabelText(/element to delete/i)).toHaveLength(1);
        const closeButton = dialog.getByText(/^close$/i);
        const deleteButton = dialog.getByText(/^delete$/i);

        // First eventType should be deleted and reload list
        serverDeleteResponse(response.results[0].id, 204);
        serverDataResponse(1, 10, 200, dataGenerator(5, false, false));

        fireEvent.click(deleteButton);

        await waitFor(() => expect(dialog.getAllByLabelText(/deleted element/)).toHaveLength(1));
        expect(deleteButton).toBeDisabled();
        await waitFor(() => getByTestId(/loading-view-row/));
        await waitFor(() => expect(queryByTestId(/loading-view-row/)).not.toBeInTheDocument());
        await waitFor(() => expect(getAllByLabelText(ariaElementRow)).toHaveLength(5));
        // Close dialog
        fireEvent.click(closeButton);
        expect(document.getElementById('icon-dialog')).toBe(null);
    });

    test(`${title} should show a delete icon button when have some elements selected`, async () => {
        const response = dataGenerator(10, false, false);
        serverDataResponse(1, 10, 200, response);
        const {container, getAllByLabelText, getAllByRole, getByLabelText, queryByLabelText, getByTestId, queryByTestId} = render(
            <DeletableTable/>
        );
        await waitFor(() => expect(getAllByLabelText(ariaElementRow)).toHaveLength(10));
        const elements = getAllByRole(/element-selector$/);
        expect(queryByLabelText('delete selecteds icon')).not.toBeInTheDocument();

        // Select second and third element
        fireEvent.click(elements[1], {target: {value: true}});
        fireEvent.click(elements[2], {target: {value: true}});
        expect(getByLabelText('delete selecteds icon')).toBeInTheDocument();

        // snapshot with delete icon visible
        expect(container).toMatchSnapshot();

        // Click on delete icon should open a delete dialog
        fireEvent.click(getByLabelText('delete selecteds dialog'));
        const dialog = within(document.getElementById('icon-dialog')!);
        dialog.getByLabelText(/title/i);
        dialog.getByLabelText(/elements to delete/i);
        expect(dialog.getAllByLabelText(/element to delete/i)).toHaveLength(2);
        const closeButton = dialog.getByText(/^close$/i);
        const deleteButton = dialog.getByText(/^delete$/i);

        // First eventType should be deleted and second rejected
        serverDeleteResponse(response.results[1].id, 200);
        serverDeleteResponse(response.results[2].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
        serverDataResponse(1, 10, 200, dataGenerator(5, false, false));

        fireEvent.click(deleteButton);

        await waitFor(() => expect(dialog.getAllByLabelText(/deleted element/)).toHaveLength(2));
        getAllByLabelText(/error message/i);
        expect(deleteButton).toBeDisabled();
        await waitFor(() => getByTestId(/loading-view-row/));
        await waitFor(() => expect(queryByTestId(/loading-view-row/)).not.toBeInTheDocument());
        await waitFor(() => expect(getAllByLabelText(ariaElementRow)).toHaveLength(5));
        // Close dialog
        fireEvent.click(closeButton);
        expect(document.getElementById('icon-dialog')).toBe(null);
    });
};