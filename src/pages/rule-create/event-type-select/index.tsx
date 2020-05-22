import * as React from 'react';
import { EventType } from '../../../services/api';
import {useStyles} from './styles';
import { useGetListAccumulated } from '../../../services/use-getlist-enhancer';
import { ENTITY } from '../../../services/api/use-api';
import EventTypeCreate from './event-type-create/index';
import Autocomplete from '../../../components/autocomplete/index';
import Paper from '@material-ui/core/Paper';

const emptyEventType: EventType = {
    id: '',
    name: '',
    url: '',
    createdAt: '',
    updatedAt: ''

};
export const EventTypeSelector: React.FC<{}> = () => {
    const styles = useStyles();
    const {accumulated, isLoading, changeFilter} = useGetListAccumulated<EventType>(ENTITY.EVENT_TYPES, 1, 10);
    const [selected, setSelected] = React.useState<EventType|null>(null);
    const handleClearSelection = React.useCallback(() => setSelected(null), []);

    // Render component
    if (selected) {
        return (
            <Paper
                className={styles.container}
                aria-label={`eventtype selector`}>
                <EventTypeCreate eventType={selected} clearEventType={handleClearSelection}/>
            </Paper>
        );
    }
    return (
        <Paper
            className={styles.container}
            aria-label={`eventtype selector`}>
            <Autocomplete<EventType>
                options={accumulated}
                selected={selected}
                setSelected={setSelected}
                emptyElement={emptyEventType}
                isLoading={isLoading}
                changeFilter={changeFilter}
                ariaLabel='eventtype name'
                placeholderText='Search a Eventtype'
                loadingText='Loading Eventtypes'
            />
        </Paper>
    );
};

export default EventTypeSelector;