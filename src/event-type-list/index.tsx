import React from 'react';
import { TableEventType } from './event-type-table';
import { useGetEventList } from '../services/use-event-type';
import { useStyles } from './styles';

export type EventTypeListProps = {};
export const EventTypeList: React.FC<EventTypeListProps> = function CEPList() {
    const style = useStyles();
    const [page, setPage] = React.useState(1);
    const {response, isLoading} = useGetEventList(page, 10);
    return (
        <div className={style.root}>
            <TableEventType
                eventTypeList={response?.data}
                isLoading={isLoading}
                isEmpty={response?.data ? response.data.results.length <= 0 : true}
                page={page}
                size={10}
                onChangePage={setPage}
            />
        </div>
    );
}

export default EventTypeList;
