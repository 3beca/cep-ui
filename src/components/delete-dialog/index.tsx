import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

import {useIconDialog} from '../../components/icon-dialog';
import { EventType, ServiceError, Target, ServiceDeleted } from '../../services/api';
import { useDelete, ENTITY } from '../../services/api/use-api';
import {useStyles} from './styles';

const EmptyMessage: React.FC<{show: boolean;}> = ({show}) => {
    if(!show) return null;
    return (
        <div aria-label='empty message'>
            <Typography variant='h6'>There are NOT Elements selected to be deleted!</Typography>
        </div>
    );
};

const ErrorMessage: React.FC<{error: ServiceError|undefined;}> = ({error}) => {
    if(!error) return null;
    return (
        <div aria-label='error message'>
            <Typography variant='h3'>{error.message}</Typography>
        </div>
    );
};

const Actions: React.FC<{close():void; disableClose: boolean; disableDelete: boolean, deleteElements():void}> = ({close, disableClose, disableDelete, deleteElements}) => {
    const styles = useStyles();
    return (
        <DialogActions aria-label='actions'>
            <Button onClick={close} disabled={disableClose}>Close</Button>
            <Button onClick={deleteElements} disabled={disableDelete} className={styles.deleteButton}>Delete</Button>
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

export type ELEMENTS = (EventType|Target)[];
const DeleteList: React.FC<{show: boolean; elements?: ELEMENTS; isLoading: boolean}> = ({show, elements, isLoading}) => {
    const styles = useStyles();
    if (!show) return null;
    isLoading = true;
    return (
        <div aria-label='elements to delete' className={styles.elementList}>
        {
            elements!.map(
                (e) => (
                    <div key={e.id} aria-label='element to delete' className={styles.elementItem}>
                        <div><Typography variant='h5'>{e.name}</Typography></div>
                        <div><Typography variant='caption' className={styles.captionText}>{e.id}</Typography></div>
                    </div>
                )
            )
        }
        </div>
    );
};

const DeletedList: React.FC<{responses: ServiceDeleted[]|undefined; elements: ELEMENTS|undefined;}> = ({responses, elements}) => {
    const styles = useStyles();
    if (!Array.isArray(elements) || elements.length === 0) return null;
    if (!Array.isArray(responses) || responses.length === 0) return null;
    return (
        <div aria-label='elements deleted' className={styles.elementList}>
        {
            responses.map(
                (event, idx) => {
                    //if(event.state === 'DELETED') return null;
                    return (
                        <div key={event.id} aria-label='element to delete' className={styles.elementItem}>
                            <div aria-label='deleted element'><Typography variant='h5'>{elements[idx].name}</Typography></div>
                            {
                                event.state === 'DELETED' ?
                                (<div aria-label='success message'><Typography variant='caption' className={styles.successText}>This entity has been deleted successfuly</Typography></div>) :
                                (<div aria-label='error message'><Typography variant='caption' className={styles.errorText}>Error: {event.error ? event.error.message : 'This element cannot be deleted'}</Typography></div>)
                            }
                        </div>
                    );
                }
            )
        }
        </div>
    );
};

export type DeleteDialogProps = {title: string; entity: ENTITY; elementsSelecteds?: ELEMENTS; onDeleted?():void;};
export const DeleteDialog: React.FC<DeleteDialogProps> = React.memo(({title, entity, elementsSelecteds, onDeleted}) => {
    const styles = useStyles();
    const [elements] = React.useState(elementsSelecteds);
    const closeDialog = useIconDialog();
    const events = React.useMemo(() => elements ? elements?.map(e => e.id) : [], [elements])
    const {isLoading, response, error, request} = useDelete(entity, events);
    const hasElements = Array.isArray(elements) && elements.length > 0;
    const hasResponse = !(!Array.isArray(response?.data) || response?.data?.length === 0);
    React.useEffect(
        () => {
            // TODO: Si hay alguna respuesta con delete, recargar el listado de elements
            hasResponse && (typeof onDeleted === 'function') && onDeleted();
        }, [hasResponse, onDeleted]
    );
    return (
        <div className={styles.container}>
            <DialogTitle aria-label='title' id='icon-dialog-title'>
                {title}
            </DialogTitle>
            <DialogContent dividers={true} className={styles.dialogContent} id='icon-dialog-content'>
                <EmptyMessage show={!hasElements && !hasResponse && !error}/>
                <DeleteList show={hasElements && !hasResponse && !error} elements={elements} isLoading={isLoading}/>
                <DeletedList elements={elements} responses={response?.data}/>
                <ErrorMessage error={error && error.error}/>
            </DialogContent>
            <LoadingView show={isLoading}/>
            <Actions close={closeDialog} disableClose={isLoading} disableDelete={!hasElements || hasResponse || !!error} deleteElements={request}/>
        </div>
    );
}, () => true);

export default DeleteDialog;

