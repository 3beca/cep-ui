import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/CloseOutlined';
import IconAdd from '@material-ui/icons/AddOutlined';
import IconDelete from '@material-ui/icons/DeleteOutline';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { useStyles } from './styles';
import { useCreate, ENTITY } from '../../../../services/api-provider/use-api';
import { APIError } from '../../../../utils/fetch-api';
import { cutString } from '../../../../utils';
import { Target, ServiceError, TargetBody, TargetHeader } from '../../../../services/api';
import IconDialog, { useIconDialog } from '../../../../components/icon-dialog';
import { Divider } from '@material-ui/core';

const TargetCreatorLoader: React.FC<{ show: boolean }> = ({ show }) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div className={styles.createDetailsStatusLoading} aria-label='target creating loading'>
            <Typography variant='caption' className={styles.createDetailsStatusLoadingText}>
                Creating Target
            </Typography>
            <CircularProgress color='primary' size={24} />
        </div>
    );
};

const TargetCreatorError: React.FC<{
    error: APIError<ServiceError> | undefined;
}> = ({ error }) => {
    const styles = useStyles();
    if (!error) return null;
    return (
        <div className={styles.createDetailsStatusError} aria-label='target creating error'>
            <Typography variant='caption'>{error.error?.message}</Typography>
        </div>
    );
};

const TargetCreatorSuccess: React.FC<{ target: Target | undefined }> = ({ target }) => {
    const styles = useStyles();
    if (!target) return null;
    return (
        <div className={styles.createDetailsURL} aria-label='target creating url'>
            <Typography variant='caption'>{cutString(target.url, 40)}</Typography>
        </div>
    );
};

export type TargetCreateHeaderDialogProps = {
    setHeader: (key: string, value: string) => void;
};
export const TargetCreateHeaderDialog: React.FC<TargetCreateHeaderDialogProps> = ({ setHeader }) => {
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
        <div aria-label='target creating headers add dialog'>
            <DialogTitle>Add new header</DialogTitle>
            <DialogContent className={styles.targetHeaderAddDialog}>
                <TextField
                    className={styles.targetHeaderAddDialogKey}
                    inputProps={{ 'aria-label': 'target creating headers key input dialog' }}
                    placeholder='Add header key'
                    label='Header key'
                    value={headerName.trim()}
                    onChange={ev => setHeaderName(ev.target.value)}
                    error={isInvalidHeader && headerName !== ''}
                />
                <TextField
                    className={styles.targetHeaderAddDialogValue}
                    inputProps={{ 'aria-label': 'target creating headers value input dialog' }}
                    placeholder='Add header value'
                    label='Header value'
                    value={headerValue}
                    onChange={ev => setHeaderValue(ev.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={close} aria-label='target creating headers close dialog'>
                    Close
                </Button>
                <Button
                    aria-label='target creating headers add button dialog'
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

export type HeaderEditItemProps = {
    deleteHeader: (key: string) => void;
    header: KeyValueString;
};
export const HeaderEditItem: React.FC<HeaderEditItemProps> = ({ header, deleteHeader }) => {
    const styles = useStyles();
    return (
        <div aria-label='target creating headers item' className={styles.targetHeaderEditListItem}>
            <Typography variant='caption' className={styles.targetHeaderEditListItemKey}>
                {header.name}
            </Typography>
            <Typography variant='caption'>:</Typography>
            <Typography variant='caption' className={styles.targetHeaderEditListItemValue}>
                {header.value}
            </Typography>
            <IconButton aria-label='target creating headers delete buttom' onClick={() => deleteHeader(header.name)}>
                <IconDelete fontSize='small' />
            </IconButton>
        </div>
    );
};
export type HeaderEditListProps = {
    deleteHeader: (key: string) => void;
    headers: ArrayHeader;
};
export const HeaderEditList: React.FC<HeaderEditListProps> = ({ headers, deleteHeader }) => {
    if (!headers || headers.length === 0) return null;
    return (
        <div aria-label='target creating headers list'>
            {headers.map(header => (
                <HeaderEditItem key={header.name} header={header} deleteHeader={deleteHeader} />
            ))}
        </div>
    );
};
export type TargetCreateHeadersProps = {
    disabled?: boolean;
    addHeader: (key: string, value: string) => void;
    deleteHeader: (key: string) => void;
    headers: ArrayHeader;
};
export const TargetCreateHeaders: React.FC<TargetCreateHeadersProps> = ({ headers, addHeader, deleteHeader, disabled = false }) => {
    const styles = useStyles();
    return (
        <div aria-label='target creating headers block' className={styles.targetHeaderEditList}>
            <Divider />
            <div className={styles.targetHeaderEditHeader}>
                <Typography variant='caption' className={styles.targetHeaderEditTitle}>
                    Headers
                </Typography>
                <IconDialog
                    show={true}
                    disabled={disabled}
                    icon={<IconAdd aria-label='target creating headers add button' fontSize='small' />}
                >
                    <TargetCreateHeaderDialog setHeader={addHeader} />
                </IconDialog>
            </div>
            <HeaderEditList headers={headers} deleteHeader={deleteHeader} />
            <Divider />
        </div>
    );
};

export const TargetCreateURL: React.FC<{
    disabled?: boolean;
    show: boolean;
    url: string;
    setURL: (url: string) => void;
    createTarget: () => void;
}> = ({ show, url, setURL, createTarget, disabled = false }) => {
    const styles = useStyles();
    const changeURL = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setURL(ev.target.value);
        },
        [setURL]
    );
    if (!show) return null;
    return (
        <div className={styles.createDetailsURL}>
            <TextField
                disabled={disabled}
                fullWidth={true}
                value={url}
                onChange={changeURL}
                label='URL (http/https)'
                helperText='URL to send events when rule matchs'
                inputProps={{ 'aria-label': 'target creating input url' }}
            />
            <Button
                className={styles.createDetailsURLButton}
                aria-label='target creating button url'
                disabled={!url.startsWith('http') || disabled}
                title='Create target'
                onClick={createTarget}
            >
                <Typography>Create</Typography>
            </Button>
        </div>
    );
};

export type KeyValueString = { name: string; value: string };
export type ArrayHeader = KeyValueString[];
export const parseTargetHeaders = (headers: ArrayHeader): TargetHeader | undefined => {
    if (!Array.isArray(headers) || headers.length === 0) return undefined;
    return headers.reduce((header: TargetHeader, entry: KeyValueString) => {
        return {
            ...header,
            [entry.name]: entry.value
        };
    }, {});
};
export type TarrgetCreateProps = {
    disabled?: boolean;
    targetName: string;
    onCreate: (target: Target) => void;
    close: () => void;
};
export const TargetCreate: React.FC<TarrgetCreateProps> = ({ targetName, onCreate, close, disabled = false }) => {
    const styles = useStyles();
    const [url, setURL] = React.useState('');
    const [headers, setHeaders] = React.useState<ArrayHeader>([]);
    const newBody = React.useMemo((): TargetBody => {
        return { name: targetName, url, headers: parseTargetHeaders(headers) };
    }, [targetName, url, headers]);
    const { isLoading, response, error, request } = useCreate<Target>(ENTITY.TARGETS, newBody, false);
    const addHeader = React.useCallback((name: string, value: string) => {
        setHeaders(headers => [...headers.filter(header => header.name !== name), { name, value }]);
    }, []);
    const deleteHeader = React.useCallback((name: string) => {
        setHeaders(headers => headers.filter(header => header.name !== name));
    }, []);
    React.useEffect(() => {
        if (!isLoading && !error && !!response?.data) {
            onCreate(response.data);
        }
    }, [isLoading, error, response, onCreate]);

    return (
        <div className={styles.createDetails} aria-label='target creating block'>
            <div className={styles.createDetailsActions}>
                <Typography className={styles.createDetailsActionsType} variant='caption'>
                    Target
                </Typography>
                <IconButton disabled={isLoading} onClick={close} aria-label='target creating clear'>
                    <IconClose fontSize='small' />
                </IconButton>
            </div>
            <div className={styles.createDetailsName} aria-label='target creating name'>
                <Typography variant='h5'>{targetName}</Typography>
            </div>
            <div className={styles.createDetailsStatus} aria-label='target creating action'>
                <TargetCreateHeaders addHeader={addHeader} deleteHeader={deleteHeader} headers={headers} disabled={disabled} />
                <TargetCreateURL show={!isLoading && !response} url={url} setURL={setURL} createTarget={request} disabled={disabled} />
                <TargetCreatorLoader show={isLoading} />
                <TargetCreatorError error={error} />
                <TargetCreatorSuccess target={response?.data} />
            </div>
        </div>
    );
};

export default TargetCreate;
