import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconAdd from '@material-ui/icons/AddOutlined';
import IconDelete from '@material-ui/icons/DeleteOutline';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { useStyles } from './styles';
import { TargetHeader } from '../../../../../services/api';
import IconDialog, { useIconDialog } from '../../../../../components/icon-dialog';
import { Divider } from '@material-ui/core';

export type KeyValueString = { name: string; value: string };
export type ArrayHeader = KeyValueString[];
export const parseTargetHeaders = (headers?: ArrayHeader): TargetHeader | undefined => {
    if (!Array.isArray(headers) || headers.length === 0) return undefined;
    return headers.reduce((header: TargetHeader, entry: KeyValueString) => {
        return {
            ...header,
            [entry.name]: entry.value
        };
    }, {});
};

export type TargetEditHeaderDialogProps = {
    setHeader: (key: string, value: string) => void;
};
export const TargetEditHeaderDialog: React.FC<TargetEditHeaderDialogProps> = ({ setHeader }) => {
    const styles = useStyles();
    const close = useIconDialog();
    const [headerName, setHeaderName] = React.useState('');
    const [headerValue, setHeaderValue] = React.useState('');
    const addHeader = React.useCallback(() => {
        setHeader(headerName, headerValue);
        setHeaderName('');
        setHeaderValue('');
    }, [headerName, headerValue, setHeader]);
    const isInvalidHeader = !headerName || headerName.toLowerCase() === 'content-type' || headerName.toLowerCase() === 'content-length';
    const isDisabled = isInvalidHeader || !headerValue;
    return (
        <div data-testid='target-edit-headers-dialog'>
            <DialogTitle>Add new header</DialogTitle>
            <DialogContent className={styles.targetHeaderAddDialog}>
                <TextField
                    className={styles.targetHeaderAddDialogKey}
                    inputProps={{ 'data-testid': 'target-edit-headers-dialog-input-key' }}
                    placeholder='Add header key'
                    label='Header key'
                    value={headerName.trim()}
                    onChange={ev => setHeaderName(ev.target.value)}
                    error={isInvalidHeader && headerName !== ''}
                />
                <TextField
                    className={styles.targetHeaderAddDialogValue}
                    inputProps={{ 'data-testid': 'target-edit-headers-dialog-input-value' }}
                    placeholder='Add header value'
                    label='Header value'
                    value={headerValue}
                    onChange={ev => setHeaderValue(ev.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close} data-testid='target-edit-headers-dialog-button-close'>
                    Close
                </Button>
                <Button
                    data-testid='target-edit-headers-dialog-button-add'
                    disabled={isDisabled}
                    onClick={addHeader}
                    className={styles.targetHeaderDialogAddButton}
                >
                    Add
                </Button>
            </DialogActions>
        </div>
    );
};

export type TargetEditHeadersItemProps = {
    deleteHeader: (key: string) => void;
    header: KeyValueString;
};
export const TargetEditHeadersItem: React.FC<TargetEditHeadersItemProps> = ({ header, deleteHeader }) => {
    const styles = useStyles();
    return (
        <div data-testid='target-edit-headers-item-container' className={styles.targetHeaderEditListItem}>
            <Typography variant='caption' className={styles.targetHeaderEditListItemKey} data-testid='target-edit-headers-item-key'>
                {header.name}
            </Typography>
            <Typography variant='caption'>:</Typography>
            <Typography variant='caption' className={styles.targetHeaderEditListItemValue} data-testid='target-edit-headers-item-value'>
                {header.value}
            </Typography>
            <IconButton data-testid='target-edit-headers-item-button-delete' onClick={() => deleteHeader(header.name)}>
                <IconDelete fontSize='small' />
            </IconButton>
        </div>
    );
};

export type TargetEditHeadersListProps = {
    deleteHeader: (key: string) => void;
    headers?: ArrayHeader;
};
export const TargetEditHeadersList: React.FC<TargetEditHeadersListProps> = ({ headers, deleteHeader }) => {
    if (!headers || headers.length === 0) return null;
    return (
        <div data-testid='target-edit-headers-list-container'>
            {headers.map(header => (
                <TargetEditHeadersItem key={header.name} header={header} deleteHeader={deleteHeader} />
            ))}
        </div>
    );
};
export type TargetEditHeadersProps = {
    disabled?: boolean;
    headers?: ArrayHeader;
    onChange: (headers: ArrayHeader) => void;
};
export const TargetEditHeaders: React.FC<TargetEditHeadersProps> = ({ headers = [], onChange, disabled = false }) => {
    const styles = useStyles();
    const addHeader = React.useCallback(
        (name: string, value: string) => {
            onChange([...headers.filter(header => header.name !== name), { name, value }]);
        },
        [onChange, headers]
    );
    const deleteHeader = React.useCallback(
        (name: string) => {
            onChange(headers.filter(header => header.name !== name));
        },
        [onChange, headers]
    );
    return (
        <div data-testid='target-edit-headers-container' className={styles.targetHeaderEditList}>
            <Divider />
            <div className={styles.targetHeaderEditHeader}>
                <Typography variant='caption' className={styles.targetHeaderEditTitle}>
                    Headers
                </Typography>
                <IconDialog
                    show={true}
                    disabled={disabled}
                    icon={<IconAdd data-testid='target-edit-headers-button-add' fontSize='small' />}
                >
                    <TargetEditHeaderDialog setHeader={addHeader} />
                </IconDialog>
            </div>
            <TargetEditHeadersList headers={headers} deleteHeader={deleteHeader} />
            <Divider />
        </div>
    );
};

export default TargetEditHeaders;
