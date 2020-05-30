import * as React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import {useStyles} from './styles';
import { useGetList, ENTITY } from '../../../services/api/use-api';
import { EventLog } from '../../../services/api';

export type Payload = {[key: string]: 'number'|'string'|'location'};
export type PayloadLoaderProps = {
    eventTypeId?: string;
    payload: Payload|null;
    setPayload(payload: Payload): void;
};
export const PayloadLoader: React.FC<PayloadLoaderProps> = ({eventTypeId}) => {
    const styles = useStyles();
    const filter = React.useMemo(() => !!eventTypeId ? {eventTypeId} : '', [eventTypeId]);
    const {isLoading, response, request} = useGetList<EventLog>(ENTITY.EVENTS_LOG, 1, 1, filter, false);
    const openHelpDialog = React.useRef(isLoading);
    React.useEffect(() => {
        openHelpDialog.current = isLoading;
    }, [isLoading]);
    return (
        <div className={styles.container}>
            <Button
                disabled={!eventTypeId || isLoading}
                onClick={request}>
                Check Payload
                {isLoading && <CircularProgress aria-label='loading payload' size={20}/>}
            </Button>
            {
                openHelpDialog.current && response?.data.results && response.data.results.length === 0 &&
                (
                    <div aria-label='show payload help'>Sorry, no default payload!</div>
                )
            }
            {
                response?.data.results && response.data.results.length > 0 &&
                (
                <div aria-label='schema payload'>{JSON.stringify(response.data.results[0].payload)}</div>
                )
            }
        </div>
    );
};

export default PayloadLoader;