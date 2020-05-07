import * as React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react';
import {generateEventTypeListWith, setupNock, serverDeleteEventType} from '../../test-utils';
import {useIconDialog} from '../../components/icon-dialog';
import {BASE_URL} from '../../services/config';
import DeleteDialog from './index';
import { EventType } from '../../services/api';
import { ENTITY } from '../../services/use-api';

jest.mock('../../components/icon-dialog', () => {
    const mockClose = jest.fn();
    return {
        useIconDialog: () => mockClose,
        mockClose
    };
});
const mockUseIconDialog = useIconDialog as unknown as () => jest.Mock;
afterEach(() => mockUseIconDialog().mockClear());

test('Should render a dialog with empty message and snapshot', () => {
    const closeCallback = mockUseIconDialog();
    const {container, getByLabelText, getByText, queryByLabelText, queryByText} = render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES}/>);
    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/empty message/i);
    expect(queryByLabelText(/elements to delete/i)).not.toBeInTheDocument();
    expect(queryByText(/^delete$/i)).toBeDisabled();
    const closeButton = getByText(/close/i);
    expect(container).toMatchSnapshot();

    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of EventTypes to delete and snapshot', async () => {
    const eventTypeList = generateEventTypeListWith(3, false, false);
    const closeCallback = mockUseIconDialog();
    const {container, getByText, getByLabelText, queryByLabelText} = render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/elements to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    expect(container).toMatchSnapshot();

    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of EventTypes to delete and delete all items and snapshot', async () => {
    const eventTypeList = generateEventTypeListWith(3, false, false);
    const closeCallback = mockUseIconDialog();
    const onDelete = jest.fn();

    const {container, getByLabelText, getByText, queryByLabelText, getAllByLabelText} = render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results}  onDeleted={onDelete}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/elements to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    const deleteButton = getByText(/^delete$/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[2].id, 200);
    fireEvent.click(deleteButton);

    await waitFor(() => getByLabelText(/deleting element/));

    await waitFor(() => expect(getAllByLabelText(/deleted element/)).toHaveLength(3));
    expect(getAllByLabelText(/success message/i)).toHaveLength(3);
    expect(deleteButton).toBeDisabled();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();

    // Close dialog
    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of 4 EventTypes to delete and fail to delete 2 and snapshot', async () => {
    const eventTypeList = generateEventTypeListWith(4, false, false);
    const closeCallback = mockUseIconDialog();
    const onDelete = jest.fn();

    const {container, getByLabelText, getByText, queryByLabelText, getAllByLabelText} = render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results} onDeleted={onDelete}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/elements to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    const deleteButton = getByText(/^delete$/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[2].id, 400);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[3].id, 200);
    fireEvent.click(deleteButton);

    await waitFor(() => getByLabelText(/deleting element/));

    await waitFor(() => expect(getAllByLabelText(/deleted element/)).toHaveLength(4));
    expect(getAllByLabelText(/error message/i)).toHaveLength(2);
    expect(getAllByLabelText(/success message/i)).toHaveLength(2);
    expect(deleteButton).toBeDisabled();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(container).toMatchSnapshot();
    // Close dialog
    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with error when evettypes is invalid and snapshot', async () => {
    const closeCallback = mockUseIconDialog();
    const invalidEventType = {id: null} as unknown as EventType;
    const {container, getByLabelText, getByText, queryByLabelText} = render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={[invalidEventType]}/>);

    getByLabelText(/title/);
    getByLabelText(/actions/);
    getByLabelText(/elements to delete/i);
    expect(queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = getByText(/close/i);
    const deleteButton = getByText(/^delete$/i);

    fireEvent.click(deleteButton);
    await waitFor(() => getByLabelText(/error message/i));
    expect(container).toMatchSnapshot();

    fireEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});