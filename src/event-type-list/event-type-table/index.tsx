import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import EditIcon from '@material-ui/icons/Edit';
import IconButton from '@material-ui/core/IconButton';

import { useStyles } from './styles';
import { EventTypeList, EventType } from '../../services/event-type';

const TableLoadingView: React.FC<{show: boolean;}> = ({show}) => {
    if (!show) return null;
    return (
        <div
            data-testid='loading-view-row'>
            <div
                style={{backgroundColor: 'pink'}}>
                    <Typography align='center'>Loading...</Typography>
            </div>
        </div>
    );
};

const TableEmptyView: React.FC<{show: boolean;}> = ({show}) => {
    if (!show) return null;
    return (
        <div
            data-testid='empty-view-row'>
            <div>
                    <Typography align='center'>No Event Types created yet!</Typography>
            </div>
        </div>
    );
};

export type EventTypeTableProps = {
    eventTypeList?: EventTypeList;
    page?: number;
    size?: number;
    isLoading?: boolean;
    isEmpty?: boolean;
    onChangePage?(page: number):void;
};
export const TableEventType: React.FC<EventTypeTableProps> = React.memo(
    ({
        eventTypeList,
        page = 1,
        size = 10,
        isLoading = true,
        isEmpty = true,
        onChangePage=()=>{}
    }) => {
        const styles = useStyles();
        const events = eventTypeList && Array.isArray(eventTypeList?.results) ? eventTypeList.results : [];
        const hasNextPage = !!eventTypeList?.next;
        const hasPrevPage = !!eventTypeList?.prev;
        return (
            <div className={styles.root}>
                <span>Table of Event Types</span>
                <TableContainer>
                    <Table>
                        <TableHead className={styles.head}>
                            <TableRow>
                                <TableCell padding='checkbox' component='th'><Checkbox className={styles.mainCheck} color='default' disabled={isLoading}/></TableCell>
                                <TableCell align='left'><Typography className={styles.headText}>Event Type Name</Typography></TableCell>
                                <TableCell align='left'><Typography className={styles.headText}>URL</Typography></TableCell>
                                <TableCell align='right'><Typography className={styles.headText}>Last updated</Typography></TableCell>
                                <TableCell align='right'><Typography className={styles.headText}>Created At</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                events.map((eventType: EventType) => (
                                    <TableRow key={eventType.id}>
                                        <TableCell padding='checkbox'><Checkbox/></TableCell>
                                        <TableCell align='left' aria-label='event name'>{eventType.name}</TableCell>
                                        <TableCell align='left'>{eventType.url}<IconButton><EditIcon fontSize='small'/></IconButton></TableCell>
                                        <TableCell align='right'>{new Date(eventType.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell align='right'>{new Date(eventType.createdAt).toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TableEmptyView show={!isLoading && isEmpty}/>
                <TableLoadingView show={isLoading}/>
                <TablePagination
                    component='div'
                    rowsPerPageOptions={[5, 10, 20]}
                    count={-1}
                    rowsPerPage={size}
                    page={page - 1}
                    nextIconButtonProps={{disabled: !hasNextPage}}
                    backIconButtonProps={{disabled: !hasPrevPage}}
                    onChangePage={(ev, page) => onChangePage(page + 1)}
                />
            </div>
        );
    }
);

export default TableEventType;
