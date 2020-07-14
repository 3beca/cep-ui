import React from 'react';
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

import TitleTable from '../../../components/title-table';
import IconDialog from '../../../components/icon-dialog';
import DeleteDialog from '../../../components/delete-dialog';
import { useStyles } from './styles';
import { PaginatedTable } from '../../../components/paginated-table';
import { EventType } from '../../../services/api';
import {RowsSizes} from '../../../components/paginated-table';
import {ENTITY} from '../../../services/api/use-api';
import {useGetListFilteredAndPaginated} from '../../../services/use-getlist-enhancer';
import {useSelectableList, ComponentWithUseSelectableProps} from '../../../services/use-selectable-list';
import {ComponentWithUsePaginationProps} from '../../../services/use-pagination';
import {useClipboard} from '../../../services/use-clipboard';
import {NOOP} from '../../../utils';

export type EventTypeTableProps = ComponentWithUseSelectableProps<EventType> & ComponentWithUsePaginationProps;
export const TableEventType: React.FC<EventTypeTableProps> = ({
    initialPage = 1,
    initialPageSize = 10,
    onSelected=NOOP
}) => {
    const styles = useStyles();
    const {
        isLoading,
        request: forceReload,
        response,
        currentPage: page,
        changePage,
        currentPageSize: pageSize,
        changePageSize
    } = useGetListFilteredAndPaginated<EventType>(ENTITY.EVENT_TYPES, initialPage, initialPageSize);

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
            <TitleTable title='List of Event Types'>
                <IconDialog
                    show={show}
                    aria-label='delete selecteds dialog'
                    icon={<DeleteIcon className={styles.deleteIcon} aria-label='delete selecteds icon'/>}>
                    <DeleteDialog title='Delete Event Types' entity={ENTITY.EVENT_TYPES} elementsSelecteds={[...selecteds]} onDeleted={forceReload}/>
                </IconDialog>
            </TitleTable>
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
                                    inputProps={{'aria-label': 'element-selector-all'}}
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
                                <TableRow key={eventType.id} aria-label='element row eventtype'>
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
                                            <DeleteDialog title='Delete Event Types' entity={ENTITY.EVENT_TYPES} elementsSelecteds={[eventType]} onDeleted={forceReload}/>
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
                autoHideDuration={1500}
                message={`EventType URL copied!`}
            />
        </>
    );
};

export default TableEventType;
