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
        <div className={styles.detailsStatusLoading} aria-label='target creating loading'>
            <Typography variant='caption' className={styles.detailsStatusLoadingText}>
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
        <div className={styles.detailsStatusError} aria-label='target creating error'>
            <Typography variant='caption'>{error.error?.message}</Typography>
        </div>
    );
};

const TargetCreatorSuccess: React.FC<{ target: Target | undefined }> = ({ target }) => {
    const styles = useStyles();
    if (!target) return null;
    return (
        <div className={styles.detailsURL} aria-label='target creating url'>
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
    addHeader: (key: string, value: string) => void;
    deleteHeader: (key: string) => void;
    headers: ArrayHeader;
};
export const TargetCreateHeaders: React.FC<TargetCreateHeadersProps> = ({ headers, addHeader, deleteHeader }) => {
    const styles = useStyles();
    return (
        <div aria-label='target creating headers block' className={styles.targetHeaderEditList}>
            <Divider />
            <div className={styles.targetHeaderEditHeader}>
                <Typography variant='caption' className={styles.targetHeaderEditTitle}>
                    Headers
                </Typography>
                <IconDialog show={true} icon={<IconAdd aria-label='target creating headers add button' fontSize='small' />}>
                    <TargetCreateHeaderDialog setHeader={addHeader} />
                </IconDialog>
            </div>
            <HeaderEditList headers={headers} deleteHeader={deleteHeader} />
            <Divider />
        </div>
    );
};

export const TargetCreateURL: React.FC<{
    show: boolean;
    url: string;
    setURL: (url: string) => void;
    createTarget: () => void;
}> = ({ show, url, setURL, createTarget }) => {
    const styles = useStyles();
    const changeURL = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setURL(ev.target.value);
        },
        [setURL]
    );
    if (!show) return null;
    return (
        <div className={styles.detailsCreateURL}>
            <TextField
                fullWidth={true}
                value={url}
                onChange={changeURL}
                label='URL (http/https)'
                helperText='URL to send events when rule matchs'
                inputProps={{ 'aria-label': 'target creating input url' }}
            />
            <Button
                className={styles.detailsCreateURLButton}
                aria-label='target creating button url'
                disabled={!url.startsWith('http')}
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
export const TargetCreator: React.FC<{
    targetName: string;
    resolve: (target: Target) => void;
    close: () => void;
}> = ({ targetName, resolve, close }) => {
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
            resolve(response.data);
        }
    }, [isLoading, error, response, resolve]);

    return (
        <div className={styles.details} aria-label='target creating block'>
            <div className={styles.detailsActions}>
                <Typography className={styles.detailsActionsType} variant='caption'>
                    Target
                </Typography>
                <IconButton disabled={isLoading} onClick={close} aria-label='target creating clear'>
                    <IconClose fontSize='small' />
                </IconButton>
            </div>
            <div className={styles.detailsName} aria-label='target creating name'>
                <Typography variant='h5'>{targetName}</Typography>
            </div>
            <div className={styles.detailsStatus} aria-label='target creating action'>
                <TargetCreateHeaders addHeader={addHeader} deleteHeader={deleteHeader} headers={headers} />
                <TargetCreateURL show={!isLoading && !response} url={url} setURL={setURL} createTarget={request} />
                <TargetCreatorLoader show={isLoading} />
                <TargetCreatorError error={error} />
                <TargetCreatorSuccess target={response?.data} />
            </div>
        </div>
    );
};

export type HeaderItemProps = {
    headerKey: String;
    headerValue: string;
};
export const HeaderItem: React.FC<HeaderItemProps> = ({ headerKey, headerValue }) => {
    const styles = useStyles();
    return (
        <div aria-label='target creating headers item' className={styles.targetHeaderListItem}>
            <Typography aria-label='target selected key header' variant='caption' className={styles.targetHeaderListItemKey}>
                {headerKey}
            </Typography>
            <Typography variant='caption'>{' : '}</Typography>
            <Typography aria-label='target selected value header' variant='caption' className={styles.targetHeaderListItemValue}>
                {headerValue}
            </Typography>
        </div>
    );
};
export type HeaderListProps = {
    headers?: TargetHeader;
};
export const HeaderList: React.FC<HeaderListProps> = ({ headers }) => {
    const styles = useStyles();
    if (!headers) return null;
    const headersKey = Object.keys(headers);
    if (!Array.isArray(headersKey) || headersKey.length === 0) return null;
    return (
        <div aria-label='target selected headers list' className={styles.targetHeaderList}>
            <Divider />
            <Typography variant='caption' className={styles.targetHeaderTitle}>
                Headers
            </Typography>
            {headersKey.map(header => (
                <HeaderItem key={header} headerKey={header} headerValue={headers[header]} />
            ))}
            <Divider />
        </div>
    );
};

export type TargetCreateProps = {
    target: Target;
    clearTarget: () => void;
    setTarget(target: Target): void;
    disabled?: boolean;
};
export const TargetCreate: React.FC<TargetCreateProps> = ({ target, clearTarget, setTarget, disabled = false }) => {
    const styles = useStyles();
    const [currentTarget, setCurrentTarget] = React.useState(target);
    React.useEffect(() => {
        if (currentTarget.id) {
            setTarget(currentTarget);
        }
    }, [currentTarget, setTarget]);
    if (!currentTarget.id && !disabled) {
        return <TargetCreator targetName={target.name} resolve={setCurrentTarget} close={clearTarget} />;
    }
    return (
        <div className={styles.details} aria-label='target selected block'>
            <div className={styles.detailsActions}>
                <Typography className={styles.detailsActionsType} variant='caption'>
                    Target
                </Typography>
                <IconButton disabled={disabled} onClick={clearTarget} aria-label='target selected clear'>
                    <IconClose fontSize='small' />
                </IconButton>
            </div>
            <div className={styles.detailsName} aria-label='target selected name'>
                <Typography variant='h5'>{currentTarget.name}</Typography>
            </div>
            <HeaderList headers={currentTarget.headers} />
            <div className={styles.detailsURL} aria-label='target selected url'>
                <Typography variant='caption' className={styles.detailsURLHeader}>
                    URL
                </Typography>
                <Typography variant='caption' className={styles.detailsURLText}>
                    {cutString(currentTarget.url, 40)}
                </Typography>
            </div>
        </div>
    );
};

export default TargetCreate;
