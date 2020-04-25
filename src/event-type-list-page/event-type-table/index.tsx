import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Checkbox from '@material-ui/core/Checkbox';
import CopyIcon from '@material-ui/icons/FileCopyOutlined';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';

import IconDialog from '../../components/icon-dialog';
import DeleteDialog from '../delete-dialog';
import { useStyles } from './styles';
import { PaginatedTable } from '../../components/paginated-table';
import { EventType } from '../../services/event-type';
import {RowsSizes} from '../../components/paginated-table';
import {useGetEventList} from '../../services/use-event-type';
import {useSelectableList} from '../../components/use-selectable-list';
import {usePagination} from '../../components/use-pagination';
import {useClipboard} from '../../components/use-clipboard';
import {NOOP} from '../../utils';

export type EventTypeTableProps = {
    initialPage?: number;
    initialPageSize?: RowsSizes;
    onSelected?(selecteds: EventType[]): void;
};
export const TableEventType: React.FC<EventTypeTableProps> = ({
    initialPage = 1,
    initialPageSize = 10,
    onSelected=NOOP
}) => {
    const styles = useStyles();

    // Paginator
    const {page, pageSize, changePage, changePageSize} = usePagination(initialPage, initialPageSize);
    const {response, isLoading, request: forceReload} = useGetEventList(page, pageSize);
    const eventTypeList = response?.data;
    const events = eventTypeList && Array.isArray(eventTypeList?.results) ? eventTypeList.results : [];
    const isEmpty = response?.data ? response.data.results.length <= 0 : true
    const hasNextPage = !!eventTypeList?.next;
    const hasPrevPage = !!eventTypeList?.prev;
    // Selector
    const {selectOne, selectAll, selecteds} = useSelectableList(eventTypeList?.results, onSelected);
    const show = selecteds.size > 0;
    // Clipboard
    const {text, copy, clear} = useClipboard();

    return (
        <>
            <div className={styles.tabletitle}>
                <Toolbar>
                    <Typography variant='h6' className={styles.tablename}>List of Event Types</Typography>
                    <IconDialog
                        show={show}
                        aria-label='delete selecteds dialog'
                        icon={<DeleteIcon className={styles.deleteIcon} aria-label='delete selecteds icon'/>}>
                        <DeleteDialog eventTypesSelecteds={[...selecteds]} onDeleted={forceReload}/>
                    </IconDialog>
                </Toolbar>
            </div>
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
                            <TableCell align='left'><Typography className={styles.headText}>Name</Typography></TableCell>
                            <TableCell align='right'><Typography className={styles.headText}>Created</Typography></TableCell>
                            <TableCell align='right'><Typography className={styles.headText}>Actions</Typography></TableCell>
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
                                    <TableCell align='right'>{new Date(eventType.createdAt).toLocaleString()}</TableCell>
                                    <TableCell align='right'>
                                        <IconButton aria-label='copy-icon' onClick={() => copy(eventType.url)}><CopyIcon fontSize='small'/></IconButton>
                                        <IconDialog
                                            show={true}
                                            aria-label='delete one dialog'
                                            icon={<DeleteIcon aria-label='delete one icon'/>}>
                                            <DeleteDialog eventTypesSelecteds={[eventType]} onDeleted={forceReload}/>
                                        </IconDialog>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </PaginatedTable>
            <Snackbar
                open={!!text}
                onClose={clear}
                autoHideDuration={2000}
                message={`URL copied!`}
            />
        </>
    );
};

export default TableEventType;
