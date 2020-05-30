import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/CloseOutlined';
import IconCopy from '@material-ui/icons/FileCopyOutlined';
import Snackbar from '@material-ui/core/Snackbar';
import CircularProgress from '@material-ui/core/CircularProgress';

import { useClipboard } from '../../../../services/use-clipboard';
import {useStyles} from './styles';
import { EventType, ServiceError } from '../../../../services/api';
import { useCreate, ENTITY } from '../../../../services/api/use-api';
import { APIError } from '../../../../utils/fetch-api';
import {cutString} from '../../../../utils';

const EventTypeCreatorLoader: React.FC<{show: boolean}> = ({show}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div
            className={styles.detailsStatusLoading}
            aria-label='eventtype creating loading'>
            <Typography variant='caption' className={styles.detailsStatusLoadingText}>Creating Event Type</Typography>
            <CircularProgress color='primary' size={24}/>
        </div>
    );
};

const EventTypeCreatorError: React.FC<{error: APIError<ServiceError>|undefined}> = ({error}) => {
    const styles = useStyles();
    if (!error) return null;
    return (
        <div
            className={styles.detailsStatusError}
            aria-label='eventtype creating error'>
            <Typography variant='caption'>{error.error?.message}</Typography>
        </div>
    );
};

const EventTypeCreatorSuccess: React.FC<{eventType: EventType|undefined}> = ({eventType}) => {
    const styles = useStyles();
    if (!eventType) return null;
    return (
        <div
            className={styles.detailsURL}
            aria-label='eventtype creating url'>
            <Typography variant='caption'>{cutString(eventType.url, 40)}</Typography>
        </div>
    );
};

const EventTypeCreator: React.FC<{eventTypeBody: Partial<EventType>; resolve: (eventType: EventType) => void; close: () => void;}> = ({eventTypeBody, resolve, close}) => {
    const styles = useStyles();
    const {isLoading, response, error} = useCreate(ENTITY.EVENT_TYPES, eventTypeBody, true);

    React.useEffect(
        () => {
            if(!isLoading && !error && !!response?.data) {
                resolve(response.data);
            }
        }, [isLoading, error, response, resolve]
    );

    return (
        <div
            className={styles.details}
            aria-label='eventtype creating block'>
            <div className={styles.detailsActions}>
                <Typography className={styles.detailsActionsType} variant='caption'>Event Type</Typography>
                <IconButton
                    disabled={!error || isLoading}
                    onClick={close}
                    aria-label='eventtype creating clear'>
                    <IconClose fontSize='small'/>
                </IconButton>
            </div>
            <div
                className={styles.detailsName}
                aria-label='eventtype creating name'>
                <Typography variant='h5'>{eventTypeBody.name}</Typography>
            </div>
            <div
                className={styles.detailsStatus}
                aria-label='eventtype creating action'>
                <EventTypeCreatorLoader show={isLoading}/>
                <EventTypeCreatorError error={error}/>
                <EventTypeCreatorSuccess eventType={response?.data}/>
            </div>
        </div>
    );
};

export type EventTypeCreateProps = {
    eventType: EventType;
    clearEventType: () => void;
    setEventType: (eventType: EventType) => void;
};
export const EventTypeCreate: React.FC<EventTypeCreateProps> = ({eventType, clearEventType, setEventType}) => {
    const styles = useStyles();
    const eventTypeBody = React.useRef<Partial<EventType>>({name: eventType.name});
    const [currentEvent, setCurrentEvent] = React.useState(eventType);
    // Clipboard
    const {text, copy, clear} = useClipboard();
    React.useEffect(() => {
        if(currentEvent.id) {
            setEventType(currentEvent);
        }
    }, [currentEvent, setEventType]);
    if(!currentEvent.id) {
        return <EventTypeCreator eventTypeBody={eventTypeBody.current} resolve={setCurrentEvent} close={clearEventType}/>
    }
    return (
        <>
            <div
                className={styles.details}
                aria-label='eventtype selected block'>
                <div className={styles.detailsActions}>
                    <Typography className={styles.detailsActionsType} variant='caption'>Event Type</Typography>
                    <IconButton
                        aria-label='eventtype selected copy'
                        onClick={() => copy(currentEvent.url)}>
                        <IconCopy fontSize='small'/>
                    </IconButton>
                    <IconButton
                        onClick={clearEventType}
                        aria-label='eventtype selected clear'>
                        <IconClose fontSize='small'/>
                    </IconButton>
                </div>
                <div
                    className={styles.detailsName}
                    aria-label='eventtype selected name'>
                    <Typography variant='h5'>{currentEvent.name}</Typography>
                </div>
                <div
                    className={styles.detailsURL}
                    aria-label='eventtype selected url'>
                    <Typography variant='caption'>{cutString(currentEvent.url, 40)}</Typography>
                </div>
            </div>
            <Snackbar
                open={!!text}
                onClose={clear}
                autoHideDuration={1500}
                message={`URL copied!`}
            />
        </>
    );
};

export default EventTypeCreate;