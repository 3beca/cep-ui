import React from 'react';
import { TableEventType } from './event-type-table';
import { useStyles } from './styles';

export type EventTypeListPageProps = {};
export const EventTypeListPage: React.FC<EventTypeListPageProps> = function CEPList() {
    const style = useStyles();
    return (
        <div className={style.root}>
            <TableEventType/>
        </div>
    );
}

export default EventTypeListPage;
