import React from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import {NOOP} from '../../utils';

import { useStyles } from './styles';

const TableLoadingView: React.FC<{show: boolean;}> = ({show}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div
            data-testid='loading-view-row' className={styles.loadingView}>
             <CircularProgress className={styles.loadingSpinner} />
        </div>
    );
};

const TableEmptyView: React.FC<{show: boolean; page: number}> = ({show, page}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div
            data-testid='empty-view-row' >
            <Typography align='center' className={styles.emptyView} variant='h4'>{page <= 1 ? 'No Elements created yet!' : 'There are no more elements!'}</Typography>
        </div>
    );
};
export type RowsSizes = 5|10|20;
export type PaginatedTableProps = {
    page?: number;
    size?: RowsSizes;
    isLoading?: boolean;
    isEmpty?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    onChangePage?(page: number):void;
    onChangePageSize?(page: RowsSizes):void;
};
export const PaginatedTable: React.FC<PaginatedTableProps> = React.memo(
    ({
        page = 1,
        size = 10,
        isLoading = true,
        isEmpty = true,
        hasNextPage = false,
        hasPrevPage = false,
        onChangePage=NOOP,
        onChangePageSize=NOOP,
        children
    }) => {
        const styles = useStyles();
        return (
            <>
                <TableContainer>
                   {children}
                </TableContainer>
                <TableEmptyView show={!isLoading && isEmpty} page={page}/>
                <div className={styles.paginatorRow}>
                    <TableLoadingView show={isLoading}/>
                    <TablePagination
                        role='paginator'
                        component='div'
                        rowsPerPageOptions={[5, 10, 20]}
                        count={-1}
                        rowsPerPage={size}
                        page={page - 1}
                        nextIconButtonProps={{disabled: !hasNextPage}}
                        backIconButtonProps={{disabled: !hasPrevPage}}
                        onChangePage={(ev, page) => onChangePage(page + 1)}
                        onChangeRowsPerPage={(ev) => onChangePageSize(Number(ev.target.value) as RowsSizes)}
                        labelDisplayedRows={({page}) => `Page ${page + 1}`}
                        labelRowsPerPage='Rows:'
                        SelectProps={{'aria-label': 'pageSelector'}}
                    />
                </div>
            </>
        );
    }
);

export default PaginatedTable;
