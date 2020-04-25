import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import {useIconDialog} from '../../components/icon-dialog';
import { EventType, EventTypeDeleted, EventTypeError } from '../../services/event-type';
import { useDeleteEventList } from '../../services/use-event-type';
import {useStyles} from './styles';

const EmptyMessage: React.FC<{show: boolean;}> = ({show}) => {
    if(!show) return null;
    return (
        <div aria-label='empty message'>
            <Typography variant='h6'>There are NOT Event Types selected to be deleted!</Typography>
        </div>
    );
};

const ErrorMessage: React.FC<{error: EventTypeError|undefined;}> = ({error}) => {
    if(!error) return null;
    return (
        <div aria-label='error message'>
            <Typography variant='h3'>{error.message}</Typography>
        </div>
    );
};

const Actions: React.FC<{close():void; disableClose: boolean; disableDelete: boolean, deleteEvents():void}> = ({close, disableClose, disableDelete, deleteEvents}) => {
    const styles = useStyles();
    return (
        <DialogActions aria-label='actions'>
            <Button onClick={close} disabled={disableClose}>Close</Button>
            <Button onClick={deleteEvents} disabled={disableDelete} className={styles.deleteButton}>Delete</Button>
        </DialogActions>
    );
};

const LoadingView: React.FC<{show: boolean}> = ({show}) => {
    if (!show) return (
        <div aria-label='element loader'>
            <LinearProgress variant='determinate' value={100} color='primary'/>
        </div>
    );
    return (
        <div aria-label='deleting element'>
            <LinearProgress variant='indeterminate' color='secondary'/>
        </div>
    );
};

const DeleteList: React.FC<{show: boolean; eventTypes?: EventType[]; isLoading: boolean}> = ({show, eventTypes, isLoading}) => {
    const styles = useStyles();
    if (!show) return null;
    isLoading = true;
    return (
        <div aria-label='eventtypes to delete' className={styles.elementList}>
        {
            eventTypes!.map(
                (et) => (
                    <div key={et.id} aria-label='eventtype to delete' className={styles.elementItem}>
                        <div><Typography variant='h5'>{et.name}</Typography></div>
                        <div><Typography variant='caption' className={styles.captionText}>{et.id}</Typography></div>
                    </div>
                )
            )
        }
        </div>
    );
};

const DeletedList: React.FC<{responses: EventTypeDeleted[]|undefined; eventTypes: EventType[]|undefined;}> = ({responses, eventTypes}) => {
    const styles = useStyles();
    if (!Array.isArray(eventTypes) || eventTypes.length === 0) return null;
    if (!Array.isArray(responses) || responses.length === 0) return null;
    return (
        <div aria-label='eventtypes deleted' className={styles.elementList}>
        {
            responses.map(
                (event, idx) => {
                    //if(event.state === 'DELETED') return null;
                    return (
                        <div key={event.id} aria-label='eventtype to delete' className={styles.elementItem}>
                            <div aria-label='deleted element'><Typography variant='h5'>{eventTypes[idx].name}</Typography></div>
                            {
                                event.state === 'DELETED' ?
                                (<div aria-label='success message'><Typography variant='caption' className={styles.successText}>Deleted: Event type has been deleted successfuly</Typography></div>) :
                                (<div aria-label='error message'><Typography variant='caption' className={styles.errorText}>Error: {event.error ? event.error.message : 'Event type cannot be deleted'}</Typography></div>)
                            }
                        </div>
                    );
                }
            )
        }
        </div>
    );
};

export type DeleteDialogProps = {eventTypesSelecteds?: EventType[]; onDeleted?():void;};
export const DeleteDialog: React.FC<DeleteDialogProps> = React.memo(({eventTypesSelecteds, onDeleted}) => {
    const styles = useStyles();
    const [eventTypes] = React.useState(eventTypesSelecteds);
    const closeDialog = useIconDialog();
    const events = React.useMemo(() => eventTypes ? eventTypes?.map(e => e.id) : [], [eventTypes])
    const {isLoading, response, error, request} = useDeleteEventList(events);
    const hasEventTypes = Array.isArray(eventTypes) && eventTypes.length > 0;
    const hasResponse = !(!Array.isArray(response?.data) || response?.data?.length === 0);
    React.useEffect(
        () => {
            // TODO: Si hay alguna respuesta con delete, recargar el listado de eventtypes
            hasResponse && (typeof onDeleted === 'function') && onDeleted();
        }, [hasResponse, onDeleted]
    );
    return (
        <div className={styles.container}>
            <DialogTitle aria-label='title' id='icon-dialog-title'>
                Delete Event Types
            </DialogTitle>
            <DialogContent dividers={true} className={styles.dialogContent} id='icon-dialog-content'>
                <EmptyMessage show={!hasEventTypes && !hasResponse && !error}/>
                <DeleteList show={hasEventTypes && !hasResponse && !error} eventTypes={eventTypes} isLoading={isLoading}/>
                <DeletedList eventTypes={eventTypes} responses={response?.data}/>
                <ErrorMessage error={error && error.error}/>
            </DialogContent>
            <LoadingView show={isLoading}/>
            <Actions close={closeDialog} disableClose={isLoading} disableDelete={!hasEventTypes || hasResponse || !!error} deleteEvents={request}/>
        </div>
    );
}, () => true);

export default DeleteDialog;

