import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import AddIcon from '@material-ui/icons/AddOutlined';
import DownloadIcon from '@material-ui/icons/CloudDownloadOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LocationIcon from '@material-ui/icons/LocationOnOutlined';
import NumberIcon from '@material-ui/icons/Filter1Outlined';
import StringIcon from '@material-ui/icons/FontDownloadOutlined';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import {useStyles} from './styles';
import { useGetList, ENTITY } from '../../../services/api/use-api';
import { EventLog } from '../../../services/api';
import { Payload, buildPayloadFromEventLogPayload, PayloadField, PayloadTypes } from '../../../services/api/utils';
import IconDialog, {useIconDialog} from '../../../components/icon-dialog';

export const HelpDialog: React.FC<{showDialog: boolean; closeDialog: () => void;}> = ({showDialog, closeDialog}) => {
    const styles = useStyles();
    if (!showDialog) return null;
    return (
        <Dialog
            open={true}
            onClose={closeDialog}
            id='help-dialog'
            scroll='paper'
            aria-labelledby='help-dialog-title'
            aria-describedby='help-dialog-content'>
            <DialogTitle aria-label='payload creator help' id='help-dialog-title'>
                Sorry, no default payload!
            </DialogTitle>
            <DialogContent dividers={true} id='help-dialog-content' className={styles.addFieldDialogContent}>
                Sorry, this eventType has not been received any data, yo can copy the url from the EventType and fire your first request, then you will be able to download its schema.
            </DialogContent>
            <DialogActions>
                <Button aria-label='payload creator help button close' onClick={closeDialog}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export type PayloadDownloaderProps = {
    eventTypeId?: string;
    setPayload: setPayload;
    disabled?: boolean;
};
export const PayloadDownloader: React.FC<PayloadDownloaderProps> = ({eventTypeId, disabled, setPayload}) => {
    const filter = React.useMemo(() => !!eventTypeId ? {eventTypeId} : '', [eventTypeId]);
    const {isLoading, response, request, reset} = useGetList<EventLog>(ENTITY.EVENTS_LOG, 1, 1, filter, false);
    const eventLogResult = response?.data.results && response.data.results[0];
    React.useEffect(() => {
        if (eventLogResult) {
            const payload = buildPayloadFromEventLogPayload(eventLogResult.payload);
            if (payload) setPayload(payload);
        }
    }, [eventLogResult, setPayload]);
    const openHelpDialog = React.useRef(isLoading);
    const showDialog = !!(openHelpDialog.current && response?.data.results);
    React.useEffect(() => {
        openHelpDialog.current = isLoading;
    }, [isLoading]);
    const isDisabled = !eventTypeId || isLoading || disabled;
    return (
        <>
            <HelpDialog showDialog={showDialog} closeDialog={reset}/>
            <IconButton
                aria-label={`payload download button ${ isDisabled ? 'disabled' : 'enabled'}`}
                disabled={isDisabled}
                onClick={request}>
                {isLoading ? <CircularProgress aria-label='payload creator loading' size={26}/> : <DownloadIcon/>}
            </IconButton>
        </>
    );
};

export type PayloadFieldViewDeleteButtonProps= {
    removePayloadField?: () => void;
    disabled?: boolean;
};
export const PayloadFieldViewDeleteButton: React.FC<PayloadFieldViewDeleteButtonProps> = ({removePayloadField, disabled = false}) => {
    if (!removePayloadField) return null;
    return (
        <IconButton
            aria-label='payload field button remove'
            onClick={removePayloadField}
            disabled={disabled}>
                <DeleteIcon/>
        </IconButton>
    );
};
export const IconByFieldType: React.FC<{type: PayloadTypes}> = ({type}) => {
    if (type === 'number') return <NumberIcon/>;
    if (type === 'location') return <LocationIcon/>;
    return <StringIcon/>;
};
export type PayloadFieldViewProps = {
    payloadField: PayloadField;
    removePayloadField?: () => void;
    disabled?: boolean;
};
export const PayloadFieldView: React.FC<PayloadFieldViewProps> = ({payloadField, removePayloadField, disabled}) => {
    const styles = useStyles();
    return (
        <div
            aria-label='payload field'
            className={styles.paloadFieldView}>
            <div className={styles.payloadFieldViewIcon}><IconByFieldType type={payloadField.type}/></div>
            <Typography className={styles.payloadFieldViewText}>{payloadField.name}</Typography>
            <PayloadFieldViewDeleteButton removePayloadField={removePayloadField} disabled={disabled}/>
        </div>
    );
};
export const PayloadSchema: React.FC<{disabled?: boolean; payload: Payload|null, setPayload: setPayload}> = ({disabled, payload, setPayload}) => {
    const removePayloadField = React.useCallback(
        (index: number) => {
            const beforeIndex = payload && payload.slice(0, index);
            const afterIndex = payload && payload.slice(index + 1);
            setPayload([...beforeIndex, ...afterIndex]);
        },
        [setPayload, payload]
    );
    if (!payload) return null;
    const fields = payload.map(
        (payloadField, idx) => (
            <div key={idx}>
                <PayloadFieldView
                    disabled={disabled}
                    payloadField={payloadField}
                    removePayloadField={() => removePayloadField(idx)}/>
            </div>
        )
    );
    return (
        <div aria-label='payload creator schema'>
            <Divider/>
            {fields}
            <Divider/>
        </div>
    );
};
export type PayloadAddFieldProps = {
    updatePayload: (field: PayloadField) => void;
    disabled?: boolean;
};
export const PayloadAddField: React.FC<PayloadAddFieldProps> = ({disabled, updatePayload}) => {
    const styles = useStyles();
    const closeDialog = useIconDialog();
    const [type, setType] = React.useState<PayloadTypes>('number');
    const [name, setName] = React.useState('');
    const isDisabled = !name || !type;
    const addField = React.useCallback(
        () => {
            updatePayload({name, type});
            setName('');
        }, [updatePayload, name, type]
    );
    return (
        <>
            <DialogTitle aria-label='payload addfield dialog' id='addfield-icon-dialog-title'>
                Add new field
            </DialogTitle>
            <DialogContent dividers={true} id='icon-dialog-content' className={styles.addFieldDialogContent}>
                <div className={styles.addFieldForm}>
                    <div className={styles.addFieldName}>
                        <TextField
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            inputProps={
                                {'aria-label': 'payload addfield dialog name'}
                            }
                            placeholder='Filed name'/>
                    </div>
                    <div className={styles.addfieldSelector}>
                        <Typography className={styles.addfieldSelectorLabel} variant='caption'>Select a field type:</Typography>
                        <div className={styles.addFieldIconTypes}>
                            <div
                                onClick={() => setType('string')}
                                className={type === 'string' ? styles.addFieldIconSelected : styles.addFieldIcon}
                                aria-label='payload addfield dialog string'>
                                <StringIcon fontSize='large'/>
                            </div>
                            <div
                                onClick={() => setType('number')}
                                className={type === 'number' ? styles.addFieldIconSelected : styles.addFieldIcon}
                                aria-label='payload addfield dialog number'>
                                <NumberIcon fontSize='large'/>
                            </div>
                            <div
                                onClick={() => setType('location')}
                                className={type === 'location' ? styles.addFieldIconSelected : styles.addFieldIcon}
                                aria-label='payload addfield dialog location'>
                                <LocationIcon fontSize='large'/>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    aria-label='payload addfield dialog close'
                    onClick={closeDialog}>
                        Close
                </Button>
                <Button
                    onClick={addField}
                    disabled={isDisabled}
                    className={styles.selectButton}
                    aria-label='payload addfield dialog add'>
                        Add
                </Button>
            </DialogActions>
        </>
    );
};
export type setPayload = (payload: Payload|null) => void;
export type PayloadCreatorProps = {
    eventTypeId?: string;
    payload: Payload|null;
    setPayload: setPayload;
    disabled?: boolean;
};
export const PayloadCreator: React.FC<PayloadCreatorProps> = ({eventTypeId, disabled, payload, setPayload}) => {
    const styles = useStyles();
    return (
        <Paper className={styles.container} aria-label={`payload creator${disabled ? ' disabled' : ''}`}>
            <div className={styles.payloadCreatorHeader}>
                <Typography variant='caption' className={styles.payloadCreatorHeaderTitle}>Event payload</Typography>
                <IconDialog aria-label='payload addfield button open dialog' show={true} disabled={disabled || !eventTypeId} icon={<AddIcon aria-label='payload addfield icon'/>}>
                    <PayloadAddField
                        disabled={disabled}
                        updatePayload={(newPayloadField: PayloadField) => {
                            const currentPayload = !payload ? [] : payload;
                            const sameFieldName = currentPayload.find(field => field.name === newPayloadField.name);
                            if (sameFieldName) {
                                sameFieldName.type = newPayloadField.type;
                                setPayload([...payload]);
                            }
                            else {
                                setPayload([...currentPayload, newPayloadField]);
                            }
                        }}/>
                </IconDialog>
                <PayloadDownloader
                    eventTypeId={eventTypeId}
                    disabled={disabled}
                    setPayload={setPayload}/>
            </div>
            <PayloadSchema
                disabled={disabled}
                payload={payload}
                setPayload={setPayload}/>
        </Paper>
    );
};

export default PayloadCreator;