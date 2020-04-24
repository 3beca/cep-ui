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
            <div>
                <CircularProgress className={styles.loadingSpinner} />
            </div>
        </div>
    );
};

const TableEmptyView: React.FC<{show: boolean;}> = ({show}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div
            data-testid='empty-view-row' >
            <div>
                <Typography align='center' className={styles.errorView}>No Elements created yet!</Typography>
            </div>
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
        return (
            <>
                <TableContainer>
                   {children}
                </TableContainer>
                <TableEmptyView show={!isLoading && isEmpty}/>
                <TableLoadingView show={true}/>
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
                    SelectProps={{'aria-label': 'pageSelector'}}
                />
            </>
        );
    }
);

export default PaginatedTable;
