import * as React from 'react';
import Delete from '@material-ui/icons/Delete';
import { render, fireEvent } from '@testing-library/react';
import IconDialog, { useIconDialog } from './index';

const DialogContent = () => {
    const close = useIconDialog();
    return (
        <>
            <div aria-label='title'>Title</div>
            <div aria-label='content'>Content</div>
            <div aria-label='actions'>
                <button onClick={close}>Close</button>
            </div>
        </>
    );
};

test('DialogIcon should render null, no icon button, no dialog', () => {
    // Render null, no icon button, no dialog
    const { queryByLabelText } = render(
        <IconDialog show={false} icon={<Delete aria-label='delete-icon' />}>
            <DialogContent />
        </IconDialog>
    );
    expect(queryByLabelText(/delete-icon/i)).not.toBeInTheDocument();
});

test('dialogIcon should render dialog when click in icon dialog and close when press close button', () => {
    const onClose = jest.fn();
    const onOpen = jest.fn();

    // Render icon for dialog
    const { getByLabelText, queryByLabelText, getByText } = render(
        <IconDialog
            show={true}
            icon={<Delete aria-label='delete-icon' />}
            onOpen={onOpen}
            onClose={onClose}
        >
            <DialogContent />
        </IconDialog>
    );
    getByLabelText(/delete-icon/i);
    const iconButton = getByLabelText(/open dialog/i);

    // Render dialog
    fireEvent.click(iconButton);
    expect(queryByLabelText(/delete-icon/i)).not.toBeInTheDocument();
    expect(onClose).toBeCalledTimes(0);
    expect(onOpen).toBeCalledTimes(1);
    getByLabelText(/title/);
    getByLabelText(/content/);
    getByLabelText(/actions/);
    const closeButton = getByText(/close/i);

    // close Dialog
    fireEvent.click(closeButton);
    expect(onClose).toBeCalledTimes(1);
    expect(onOpen).toBeCalledTimes(1);
    getByLabelText(/delete-icon/i);
    expect(queryByLabelText(/title/i)).not.toBeInTheDocument();
    expect(queryByLabelText(/content/i)).not.toBeInTheDocument();
    expect(queryByLabelText(/actions/i)).not.toBeInTheDocument();
});
