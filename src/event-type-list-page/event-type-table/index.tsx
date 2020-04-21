import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';

import { useStyles } from './styles';
import { PaginatedTable } from '../../components/paginated-table';
import { EventTypeList, EventType } from '../../services/event-type';

import {RowsSizes} from '../../components/paginated-table';
import {useGetEventList} from '../../services/use-event-type';
import {useSelectableList} from '../../components/use-selectable-list';
import {usePagination} from '../../components/use-pagination';
import {useClipboard} from '../../components/use-clipboard';

export type EventTypeTableProps = {
    eventTypeList?: EventTypeList;
    initialPage?: number;
    initialPageSize?: RowsSizes;
    onSelected?(selecteds: EventType[]): void;
};
export const TableEventType: React.FC<EventTypeTableProps> = React.memo(
    ({
        initialPage = 1,
        initialPageSize = 10,
        onSelected=()=>{}
    }) => {
        const styles = useStyles();

        // Paginator
        const {page, pageSize, changePage, changePageSize} = usePagination(1, 10);
        const {response, isLoading} = useGetEventList(page, pageSize);
        const eventTypeList = response?.data;
        const events = eventTypeList && Array.isArray(eventTypeList?.results) ? eventTypeList.results : [];
        const isEmpty = response?.data ? response.data.results.length <= 0 : true
        const hasNextPage = !!eventTypeList?.next;
        const hasPrevPage = !!eventTypeList?.prev;

        // Clipboard
        const {text, copy, clear} = useClipboard();

        // Selector
        const {selectOne, selectAll, selecteds} = useSelectableList(eventTypeList?.results, onSelected);

        return (
            <>
                <Snackbar
                    open={!!text}
                    onClose={clear}
                    autoHideDuration={2000}
                    message={`URL ${text} copied!`}
                />
                <PaginatedTable
                    page={page}
                    size={pageSize as RowsSizes}
                    isLoading={isLoading}
                    isEmpty={isEmpty}
                    hasNextPage={hasNextPage}
                    hasPrevPage={hasPrevPage}
                    onChangePage={changePage}
                    onChangePageSize={changePageSize}>
                    <Table>
                        <TableHead className={styles.head}>
                            <TableRow>
                                <TableCell padding='checkbox' component='th'>
                                    <Checkbox
                                        className={styles.mainCheck}
                                        color='default'
                                        disabled={isLoading || isEmpty}
                                        inputProps={{role: 'element-selector-all'}}
                                        checked={selecteds.size === eventTypeList?.results.length}
                                        onChange={(ev, checked) => selectAll(checked)}/>
                                </TableCell>
                                <TableCell align='left'><Typography className={styles.headText}>Event Type Name</Typography></TableCell>
                                <TableCell align='left'><Typography className={styles.headText}>URL</Typography></TableCell>
                                <TableCell align='right'><Typography className={styles.headText}>Last updated</Typography></TableCell>
                                <TableCell align='right'><Typography className={styles.headText}>Created At</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                events.map((eventType: EventType) => (
                                    <TableRow key={eventType.id} role='element row'>
                                        <TableCell padding='checkbox'>
                                            <Checkbox
                                                inputProps={{role: 'element-selector'}}
                                                checked={selecteds.has(eventType)}
                                                onChange={(ev, checked) => selectOne(checked, eventType)}/>
                                        </TableCell>
                                        <TableCell align='left' aria-label='element name'>{eventType.name}</TableCell>
                                        <TableCell align='left'>{eventType.url}<IconButton aria-label='copy-icon' onClick={() => copy(eventType.url)}><EditIcon fontSize='small'/></IconButton></TableCell>
                                        <TableCell align='right'>{new Date(eventType.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell align='right'>{new Date(eventType.createdAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </PaginatedTable>
            </>
        );
    }
);

export default TableEventType;
