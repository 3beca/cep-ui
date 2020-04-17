import React from 'react';
import { TableEventType, RowsSizes } from './event-type-table';
import { useGetEventList } from '../services/use-event-type';
import { useStyles } from './styles';

export type EventTypeListProps = {};
export const EventTypeList: React.FC<EventTypeListProps> = function CEPList() {
    const style = useStyles();
    const [page, setPage] = React.useState(1);
    const [pageSize, setPageSize] = React.useState<RowsSizes>(10);
    const {response, isLoading} = useGetEventList(page, pageSize);
    return (
        <div className={style.root}>
            <TableEventType
                eventTypeList={response?.data}
                isLoading={isLoading}
                isEmpty={response?.data ? response.data.results.length <= 0 : true}
                page={page}
                size={pageSize}
                onChangePage={setPage}
                onChangePageSize={setPageSize}
            />
        </div>
    );
}

export default EventTypeList;
