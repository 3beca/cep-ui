import * as React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react';
import {generateEventTypeListWith, setupNock, serverDeleteEventType} from '../../test-utils';
import {useIconDialog} from '../../components/icon-dialog';
import {BASE_URL} from '../../services/config';
import DeleteDialog from './index';
import { EventType } from '../../services/event-type';

jest.mock('../../components/icon-dialog', () => {
    const mockClose = jest.fn();
    return {
        useIconDialog: () => mockClose,
        mockClose
    };
});
const mockUseIconDialog = useIconDialog as unknown as () => jest.Mock;
afterEach(() => mockUseIconDialog().mockClear());

test('Should render a dialog with empty message', () => {
    const closeCallback = mockUseIconDialog();
    const {getByLabelText, getByText, queryByLabelText, queryByText} = render(<DeleteDialog/>);
    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/empty message/i);
    expect(queryByLabelText(/eventtypes to delete/i)).not.toBeInTheDocument();
    expect(queryByText(/delete/i)).toBeDisabled();
    const closeButton = getByText(/close/i);

    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog the list of EventTypes to delete and delete all items', async () => {
    const eventTypeList = generateEventTypeListWith(3, false, false);
    const closeCallback = mockUseIconDialog();

    const {getByLabelText, getByText, queryByLabelText, getAllByLabelText} = render(<DeleteDialog eventTypes={eventTypeList.results}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/eventtypes to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    const deleteButton = getByText(/delete/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[2].id, 200);
    fireEvent.click(deleteButton);

    await waitFor(() => expect(getAllByLabelText(/deleting element/)).toHaveLength(3));

    await waitFor(() => expect(getAllByLabelText(/deleted element/)).toHaveLength(3));
    expect(deleteButton).toBeDisabled();
    // Close dialog
    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog the list of EventTypes to delete and fail to delete one', async () => {
    const eventTypeList = generateEventTypeListWith(3, false, false);
    const closeCallback = mockUseIconDialog();

    const {getByLabelText, getByText, queryByLabelText, getAllByLabelText} = render(<DeleteDialog eventTypes={eventTypeList.results}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/eventtypes to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    const deleteButton = getByText(/delete/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[2].id, 200);
    fireEvent.click(deleteButton);

    await waitFor(() => expect(getAllByLabelText(/deleting element/)).toHaveLength(3));

    await waitFor(() => expect(getAllByLabelText(/deleted element/)).toHaveLength(3));
    getByLabelText(/error message/i);
    expect(deleteButton).toBeDisabled();
    // Close dialog
    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with error when evettypes is invalid', async () => {
    const closeCallback = mockUseIconDialog();
    const invalidEventType = {id: null} as unknown as EventType;
    const {getByLabelText, getByText, queryByLabelText} = render(<DeleteDialog eventTypes={[invalidEventType]}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/eventtypes to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    const deleteButton = getByText(/delete/i);

    fireEvent.click(deleteButton);
    await waitFor(() => getByLabelText(/error message/i));

    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});