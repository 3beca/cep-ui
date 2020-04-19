import * as React from 'react';

export const usePagination = (initialPage: number = 1, initialPageSize: number = 10) => {
    const [page, setPage] = React.useState(initialPage);
    const [pageSize, setPageSize] = React.useState(initialPageSize);

    return {page, pageSize, changePage: setPage, changePageSize: setPageSize};
}