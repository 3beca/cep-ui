import React from 'react';
import TableContainer from '@material-ui/core/TableContainer';
import TablePagination from '@material-ui/core/TablePagination';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { NOOP } from '../../utils';

import { useStyles } from './styles';
import { Variant } from '@material-ui/core/styles/createTypography';

export const ListLoadingView: React.FC<{ show: boolean }> = ({ show }) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div data-testid='loading-view-row' className={styles.loadingView}>
            <CircularProgress className={styles.loadingSpinner} />
        </div>
    );
};

export type ListEmptyViewProps = {
    show: boolean;
    isEmpty: boolean;
    emptyMessage?: string;
    noMoreMessage?: string;
    variant?: Variant;
};
export const ListEmptyView: React.FC<ListEmptyViewProps> = ({
    show,
    isEmpty,
    emptyMessage = 'No Elements created yet!',
    noMoreMessage = 'There are no more elements!',
    variant = 'h4'
}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div className={styles.emptyView} data-testid='empty-view-row'>
            <Typography align='center' className={styles.emptyViewText} variant={variant}>
                {isEmpty ? emptyMessage : noMoreMessage}
            </Typography>
        </div>
    );
};
export type RowsSizes = 5 | 10 | 20;
export type PaginatedTableProps = {
    page?: number;
    size?: RowsSizes;
    isLoading?: boolean;
    isEmpty?: boolean;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    onChangePage?(page: number): void;
    onChangePageSize?(page: RowsSizes): void;
};
export const PaginatedTable: React.FC<PaginatedTableProps> = React.memo(
    ({
        page = 1,
        size = 10,
        isLoading = true,
        isEmpty = true,
        hasNextPage = false,
        hasPrevPage = false,
        onChangePage = NOOP,
        onChangePageSize = NOOP,
        children
    }) => {
        const styles = useStyles();
        return (
            <>
                <TableContainer>{children}</TableContainer>
                <ListEmptyView show={!isLoading && isEmpty} isEmpty={page === 1} />
                <div className={styles.paginatorRow}>
                    <ListLoadingView show={isLoading} />
                    <TablePagination
                        role='paginator'
                        component='div'
                        rowsPerPageOptions={[5, 10, 20]}
                        count={-1}
                        rowsPerPage={size}
                        page={page - 1}
                        nextIconButtonProps={{ disabled: !hasNextPage }}
                        backIconButtonProps={{ disabled: !hasPrevPage }}
                        onChangePage={(ev, page) => onChangePage(page + 1)}
                        onChangeRowsPerPage={ev => onChangePageSize(Number(ev.target.value) as RowsSizes)}
                        labelDisplayedRows={({ page }) => `Page ${page + 1}`}
                        labelRowsPerPage='Rows:'
                        SelectProps={{ 'aria-label': 'pageSelector' }}
                    />
                </div>
            </>
        );
    }
);

export default PaginatedTable;
