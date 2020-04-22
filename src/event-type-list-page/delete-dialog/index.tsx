import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import {useIconDialog} from '../../components/icon-dialog';
import {useStyles} from './styles';
import { EventType, EventTypeDeleted, EventTypeError } from '../../services/event-type';
import { useDeleteEventList } from '../../services/use-event-type';


const EmptyMessage: React.FC<{show: boolean;}> = ({show}) => {
    if(!show) return null;
    return (
        <div aria-label='empty message'>
            <Typography variant='h3'>There are NOT Event Types selected!</Typography>
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

const Actions: React.FC<{close():void; disableDelete: boolean, deleteEvents():void}> = ({close, disableDelete, deleteEvents}) => {
    return (
        <div aria-label='actions'>
            <button onClick={close}>Close</button>
            <button onClick={deleteEvents} disabled={disableDelete}>Delete</button>
        </div>
    );
};

const DeleteList: React.FC<{show: boolean; eventTypes?: EventType[]; isLoading: boolean}> = ({show, eventTypes, isLoading}) => {
    if (!show) return null;
    return (
        <div aria-label='eventtypes to delete'>
        {
            eventTypes!.map(
                (et) => (
                    <div key={et.id} aria-label='eventtype to delete'>
                        <div>{et.name}</div>
                        {
                            isLoading ? <div aria-label='deleting element'>Deleting...</div> : <div>{et.id}</div>
                        }
                    </div>
                )
            )
        }
        </div>
    );
};

const DeletedList: React.FC<{responses: EventTypeDeleted[]|undefined; eventTypes: EventType[]|undefined;}> = ({responses, eventTypes}) => {
    if (!Array.isArray(eventTypes) || eventTypes.length === 0) return null;
    if (!Array.isArray(responses) || responses.length === 0) return null;
    return (
        <div aria-label='eventtypes deleted'>
        {
            responses.map(
                (event, idx) => (
                    <div key={event.id} aria-label='eventtype to delete'>
                        <div aria-label='deleted element'>{eventTypes[idx].name}</div>
                        {
                            event.state === 'DELETED' ? <div>DELETED</div> : <div>NOT DELETED</div>
                        }
                        {
                            event.error && (<div aria-label='error message'>{event.error.message}</div>)
                        }
                    </div>
                )
            )
        }
        </div>
    );
};

export type DeleteDialogProps = {eventTypes?: EventType[]};
export const DeleteDialog: React.FC<DeleteDialogProps> = ({eventTypes}) => {
    const styles = useStyles();
    const closeDialog = useIconDialog();
    const events = React.useMemo(() => eventTypes ? eventTypes?.map(e => e.id) : [], [eventTypes])
    const {isLoading, response, error, request} = useDeleteEventList(events);
    const hasEventTypes = Array.isArray(eventTypes) && eventTypes.length > 0;
    const hasResponse = !(!Array.isArray(response?.data) || response?.data?.length === 0);

    React.useEffect(
        () => {
            // TODO: Si hay alguna respuesta con delete, recargar el listado de eventtypes
        }, [hasResponse]
    );

    return (
        <div className={styles.container}>
            <div aria-label='title'>Dialogo Eliminar</div>
            <EmptyMessage show={!hasEventTypes}/>
            <DeleteList show={hasEventTypes && !hasResponse && !error} eventTypes={eventTypes} isLoading={isLoading}/>
            <DeletedList eventTypes={eventTypes} responses={response?.data}/>
            <ErrorMessage error={error && error.error}/>
            <Actions close={closeDialog} disableDelete={!hasEventTypes || hasResponse || !!error} deleteEvents={request}/>
        </div>
    );
};

export default DeleteDialog;

