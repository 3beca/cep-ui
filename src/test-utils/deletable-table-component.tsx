import React from 'react';
import userEvent from '@testing-library/user-event';
import {
    renderWithAPI as render,
    waitFor,
    screen,
    within
} from './index';
import nock from 'nock/types';
import {
    ServiceList,
    Entity,
    ServiceError
} from '../services/api';

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
        render(
            <DeletableTable/>
        );
        expect(await screen.findAllByLabelText(ariaElementRow)).toHaveLength(10);
        const elements = await screen.findAllByLabelText('delete one dialog');
        expect(elements.length).toBe(10);
        userEvent.click(elements[0]);

        const dialog = within(document.getElementById('icon-dialog')!);
        await dialog.findByLabelText(/title/i);
        await dialog.findByLabelText(/elements to delete/i);
        expect(await await dialog.findAllByLabelText(/element to delete/i)).toHaveLength(1);
        const closeButton = await dialog.findByLabelText(/^close button$/i);
        const deleteButton = await dialog.findByLabelText(/^delete button$/i);

        // First eventType should be deleted and reload list
        serverDeleteResponse(response.results[0].id, 204);
        serverDataResponse(1, 10, 200, dataGenerator(5, false, false));

        userEvent.click(deleteButton);

        expect(await dialog.findAllByLabelText(/deleted element/)).toHaveLength(1);
        expect(await dialog.findAllByLabelText(/success message/i)).toHaveLength(1);
        expect(deleteButton).toBeDisabled();

        await screen.findByTestId(/loading-view-row/);
        await waitFor(() =>  expect(screen.queryByTestId(/loading-view-row/)).not.toBeInTheDocument());
        expect(await screen.findAllByLabelText(ariaElementRow)).toHaveLength(5);
        // Close dialog
        userEvent.click(closeButton);
        expect(document.getElementById('icon-dialog')).toBe(null);
    });

    test(`${title} should show a delete icon button when have some elements selected`, async () => {
        const response = dataGenerator(10, false, false);
        serverDataResponse(1, 10, 200, response);
        render(
            <DeletableTable/>
        );
        expect(await screen.findAllByLabelText(ariaElementRow)).toHaveLength(10);
        const elements = await screen.findAllByRole(/element-selector$/);
        await waitFor(() => expect(screen.queryByLabelText('delete selecteds icon')).not.toBeInTheDocument());

        // Select second and third element
        userEvent.click(elements[1]);
        userEvent.click(elements[2]);
        expect(await screen.findByLabelText('delete selecteds icon')).toBeInTheDocument();

        // Click on delete icon should open a delete dialog
        userEvent.click(await screen.findByLabelText('delete selecteds dialog'));
        const dialog = within(document.getElementById('icon-dialog')!);
        await dialog.findByLabelText(/title/i);
        await dialog.findByLabelText(/elements to delete/i);
        expect(await dialog.findAllByLabelText(/element to delete/i)).toHaveLength(2);
        const closeButton = await dialog.findByLabelText(/^close button$/i);
        const deleteButton = await dialog.findByLabelText(/^delete button$/i);

        // First eventType should be deleted and second rejected
        serverDeleteResponse(response.results[1].id, 200);
        serverDeleteResponse(response.results[2].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
        serverDataResponse(1, 10, 200, dataGenerator(5, false, false));

        userEvent.click(deleteButton);

        expect(await dialog.findAllByLabelText(/deleted element/)).toHaveLength(2);
        expect(await dialog.findAllByLabelText(/success message/i)).toHaveLength(1);
        expect(await dialog.findAllByLabelText(/error message/i)).toHaveLength(1);
        expect(deleteButton).toBeDisabled();
        await screen.findByTestId(/loading-view-row/);
        await waitFor(() => expect(screen.queryByTestId(/loading-view-row/)).not.toBeInTheDocument());
        expect(await screen.findAllByLabelText(ariaElementRow)).toHaveLength(5);
        // Close dialog
        userEvent.click(closeButton);
        expect(document.getElementById('icon-dialog')).toBe(null);
    });
};