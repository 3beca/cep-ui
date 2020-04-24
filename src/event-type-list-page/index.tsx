import * as React from 'react';
import { TableEventType } from './event-type-table';
import { useStyles } from './styles';

export type EventTypeListPageProps = {};
export const EventTypeListPage: React.FC<EventTypeListPageProps> = function CEPList() {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <TableEventType/>
        </div>
    );
}

export default EventTypeListPage;
