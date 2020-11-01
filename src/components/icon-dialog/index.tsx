import * as React from 'react';
import IconButton from '@material-ui/core/IconButton';
import { NOOP } from '../../utils';
import Dialog from '@material-ui/core/Dialog';

export type IconDialogContextValue = () => void;
const IconDialogContext = React.createContext<IconDialogContextValue>(NOOP);
export const useIconDialog = () => {
    return React.useContext<IconDialogContextValue>(IconDialogContext);
};

export type IconDialogProps = {
    show: boolean;
    icon: React.ReactElement;
    onOpen?(): void;
    onClose?(): void;
    disabled?: boolean;
};
export const IconDialog: React.FC<IconDialogProps> = ({ show, icon, disabled, onOpen = NOOP, onClose = NOOP, children, ...props }) => {
    const [open, setOpen] = React.useState(false);
    const closeDialog = React.useCallback(() => {
        setOpen(false);
        onClose();
    }, [onClose]);
    const openDialog = React.useCallback(() => {
        setOpen(true);
        onOpen();
    }, [onOpen]);
    if (!open && !show) return null;
    if (open) {
        return (
            <Dialog
                open={open}
                onClose={closeDialog}
                id='icon-dialog'
                scroll='paper'
                aria-labelledby='icon-dialog-title'
                aria-describedby='icon-dialog-content'
            >
                <IconDialogContext.Provider value={closeDialog} children={children} />
            </Dialog>
        );
    }
    return (
        <IconButton aria-label='open dialog' onClick={openDialog} disabled={disabled} {...props}>
            {icon}
        </IconButton>
    );
};

export default IconDialog;
