import * as React from 'react';
import {
    renderWithAPI as render,
    screen
} from '../../test-utils';
import userEvent from '@testing-library/user-event';
import {generateEventTypeListWith, setupNock, serverDeleteEventType} from '../../test-utils';
import {useIconDialog} from '../../components/icon-dialog';
import {BASE_URL} from '../../services/config';
import DeleteDialog from './index';
import { EventType } from '../../services/api';
import { ENTITY } from '../../services/api-provider/use-api';

jest.mock('../../components/icon-dialog', () => {
    const mockClose = jest.fn();
    return {
        useIconDialog: () => mockClose,
        mockClose
    };
});
const mockUseIconDialog = useIconDialog as unknown as () => jest.Mock;
afterEach(() => mockUseIconDialog().mockClear());

test('Should render a dialog with empty message and snapshot', async () => {
    const closeCallback = mockUseIconDialog();
    render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES}/>);
    await screen.findByLabelText(/title/);
    await screen.findByLabelText(/actions/);
    await screen.findByLabelText(/empty message/i);
    expect(screen.queryByLabelText(/elements to delete/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^delete button$/i)).toBeDisabled();
    const closeButton = await screen.findByLabelText(/close button/i);

    userEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of EventTypes to delete and snapshot', async () => {
    const eventTypeList = generateEventTypeListWith(3, false, false);
    const closeCallback = mockUseIconDialog();
    render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results}/>);

    await screen.findByLabelText(/title/);
    await screen.findByLabelText(/actions/);
    await screen.findByLabelText(/elements to delete/i);
    expect(screen.queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = await screen.findByLabelText(/close button/i);

    userEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of EventTypes to delete and delete all items and snapshot', async () => {
    const eventTypeList = generateEventTypeListWith(3, false, false);
    const closeCallback = mockUseIconDialog();
    const onDelete = jest.fn();

    render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results}  onDeleted={onDelete}/>);

    await screen.findByLabelText(/title/);
    await screen.findByLabelText(/actions/);
    await screen.findByLabelText(/elements to delete/i);
    expect(screen.queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = await screen.findByLabelText(/close button/i);
    const deleteButton = await screen.findByLabelText(/^delete button$/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[2].id, 200);
    userEvent.click(deleteButton);

    await screen.findByLabelText(/deleting element/);

    expect(await screen.findAllByLabelText(/deleted element/)).toHaveLength(3);
    expect(await screen.findAllByLabelText(/success message/i)).toHaveLength(3);
    expect(deleteButton).toBeDisabled();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenNthCalledWith(1, [eventTypeList.results[0].id, eventTypeList.results[1].id, eventTypeList.results[2].id]);

    // Close dialog
    userEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of 4 EventTypes to delete and fail to delete 2 and snapshot', async () => {
    const eventTypeList = generateEventTypeListWith(4, false, false);
    const closeCallback = mockUseIconDialog();
    const onDelete = jest.fn();

    render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results} onDeleted={onDelete}/>);

    await screen.findByLabelText(/title/);
    await screen.findByLabelText(/actions/);
    await screen.findByLabelText(/elements to delete/i);
    expect(screen.queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = await screen.findByLabelText(/close button/i);
    const deleteButton = await screen.findByLabelText(/^delete button$/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 200);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[2].id, 400);
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[3].id, 200);
    userEvent.click(deleteButton);

    await screen.findByLabelText(/deleting element/);

    expect(await screen.findAllByLabelText(/deleted element/)).toHaveLength(4);
    expect(await screen.findAllByLabelText(/error message/i)).toHaveLength(2);
    expect(await screen.findAllByLabelText(/success message/i)).toHaveLength(2);
    expect(deleteButton).toBeDisabled();
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenNthCalledWith(1, [eventTypeList.results[0].id, eventTypeList.results[3].id]);
    // Close dialog
    userEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with a list of 2 EventTypes to delete and fail to delete all', async () => {
    const eventTypeList = generateEventTypeListWith(2, false, false);
    const closeCallback = mockUseIconDialog();
    const onDelete = jest.fn();

    render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={eventTypeList.results} onDeleted={onDelete}/>);

    await screen.findByLabelText(/title/);
    await screen.findByLabelText(/actions/);
    await screen.findByLabelText(/elements to delete/i);
    expect(screen.queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = await screen.findByLabelText(/close button/i);
    const deleteButton = await screen.findByLabelText(/^delete button$/i);

    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[0].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
    serverDeleteEventType(setupNock(BASE_URL), eventTypeList.results[1].id, 500, {error: 'invalid id', message: 'cannot delete eventtype', statusCode: 400});
    userEvent.click(deleteButton);

    await screen.findByLabelText(/deleting element/);

    expect(await screen.findAllByLabelText(/deleted element/)).toHaveLength(2);
    expect(await screen.findAllByLabelText(/error message/i)).toHaveLength(2);
    expect(screen.queryAllByLabelText(/success message/i)).toHaveLength(0);
    expect(deleteButton).toBeDisabled();
    expect(onDelete).toHaveBeenCalledTimes(0);
    // Close dialog
    userEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});

test('Should render a dialog with error when evettypes is invalid and snapshot', async () => {
    const closeCallback = mockUseIconDialog();
    const onDelete = jest.fn();
    const invalidEventType = {id: null} as unknown as EventType;
    render(<DeleteDialog title='Dialog title' entity={ENTITY.EVENT_TYPES} elementsSelecteds={[invalidEventType]} onDeleted={onDelete}/>);

    await screen.findByLabelText(/title/);
    await screen.findByLabelText(/actions/);
    await screen.findByLabelText(/elements to delete/i);
    expect(screen.queryByLabelText(/empty message/i)).not.toBeInTheDocument();
    const closeButton = await screen.findByLabelText(/close button/i);
    const deleteButton = await screen.findByLabelText(/^delete button$/i);

    userEvent.click(deleteButton);
    await screen.findByLabelText(/error message/i);
    expect(onDelete).toHaveBeenCalledTimes(0);

    userEvent.click(closeButton);
    expect(closeCallback).toHaveBeenCalledTimes(1);
});