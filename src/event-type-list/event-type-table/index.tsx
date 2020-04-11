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

import { useStyles } from './styles';

export const TableLoadingView: React.FC<{show: boolean; colSpan: number;}> = ({show = false, colSpan= 4}) => show ? <TableRow><TableCell colSpan={colSpan} style={{backgroundColor: 'pink'}}><Typography align='center'>Loading...</Typography></TableCell></TableRow> : null;

export type EventTypeTableProps = {
    eventTypeList?: any;
    page?: number;
    size?: number;
    isLoading?: boolean;
    onChangePage?(page: number):void;
};
export const TableEventType: React.FC<EventTypeTableProps> = React.memo(
    ({
        eventTypeList,
        page = 1,
        size = 10,
        isLoading = true,
        onChangePage=()=>{}
    }) => {
        const styles = useStyles();
        const events = eventTypeList ? eventTypeList.results : [];
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
                                <TableCell align='center'><Typography className={styles.headText}>Event Type Name</Typography></TableCell>
                                <TableCell align='right'><Typography className={styles.headText}>Last updated</Typography></TableCell>
                                <TableCell align='right'><Typography className={styles.headText}>Created At</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell padding='checkbox'><Checkbox/></TableCell>
                                <TableCell align='center'>Dos</TableCell>
                                <TableCell align='right'>{new Date().toLocaleString()}</TableCell>
                                <TableCell align='right'>{new Date().toLocaleString()}</TableCell>
                            </TableRow>
                            <TableLoadingView show={isLoading} colSpan={4}/>
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component='div'
                    rowsPerPageOptions={[5, 10, 20]}
                    count={100}
                    rowsPerPage={size}
                    page={page - 1}
                    onChangePage={(ev, page) => onChangePage(page)}
                />
            </div>
        );
    }
);

export default TableEventType;
