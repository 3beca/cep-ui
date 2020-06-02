import * as React from 'react';
import { EventType } from '../../../services/api';
import {useStyles} from './styles';
import { useGetListAccumulated } from '../../../services/use-getlist-enhancer';
import { ENTITY } from '../../../services/api/use-api';
import EventTypeCreate from './event-type-create/index';
import Autocomplete from '../../../components/autocomplete/index';
import Paper from '@material-ui/core/Paper';

export const emptyEventType: EventType = {
    id: '',
    name: '',
    url: '',
    createdAt: '',
    updatedAt: ''
};
export type EventTypeSelectorProps = {
    selected: EventType|null;
    onSelected: (eventType: EventType|null) => void;
    disabled?: boolean;
};
export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({selected, onSelected, disabled = false}) => {
    const styles = useStyles();
    const {accumulated, isLoading, changeFilter} = useGetListAccumulated<EventType>(ENTITY.EVENT_TYPES, 1, 10, '', !disabled && !selected);
    const handleClearSelection = React.useCallback(() => onSelected(null), [onSelected]);

    // Render component
    if (selected) {
        return (
            <Paper
                className={styles.container}
                aria-label={`eventtype selector${disabled ? ' disabled' : ''}`}>
                <EventTypeCreate eventType={selected} clearEventType={handleClearSelection} setEventType={onSelected} disabled={disabled}/>
            </Paper>
        );
    }
    return (
        <Paper
            className={styles.container}
            aria-label={`eventtype selector${disabled ? ' disabled' : ''}`}>
            <Autocomplete<EventType>
                disabled={disabled}
                options={accumulated}
                selected={selected}
                setSelected={onSelected}
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