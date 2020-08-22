import * as React from 'react';
import {
    useGetList,
    ENTITY
} from '../api-provider/use-api';
import { Entity } from '../api';
type ActionNextPage = {
    type: 'NEXT_PAGE'|'PREV_PAGE'|'RESET_PAGE'|'RESET_PAGE_SIZE'|'RESET_FILTER';
};
type ActionChangePage = {
    type: 'CHANGE_PAGE';
    page: number;
};
type ActionChangePageSize = {
    type: 'CHANGE_PAGE_SIZE';
    pageSize: number;
};
type ActionChangeFiler = {
    type: 'CHANGE_FILTER';
    filter: string;
};
type ReducerActions = ActionNextPage | ActionChangeFiler | ActionChangePageSize | ActionChangePage;
type ReducerState = {
    initialPage: number;
    currentPage: number;
    initialPageSize: number;
    currentPageSize: number;
    initialFilter: string;
    filter: string;
};

const reducer = (state: ReducerState, action: ReducerActions): ReducerState => {
    switch(action.type) {
        case 'NEXT_PAGE': {
            return {
                ...state,
                currentPage: state.currentPage + 1
            };
        }
        case 'PREV_PAGE': {
            return {
                ...state,
                currentPage: state.currentPage > state.initialPage ? state.currentPage - 1 : state.initialPage
            };
        }
        case 'CHANGE_PAGE': {
            return {
                ...state,
                currentPage: action.page
            }
        }
        case 'RESET_PAGE': {
            return {
                ...state,
                currentPage: state.initialPage
            };
        }
        case 'CHANGE_FILTER': {
            return {
                ...state,
                currentPage: state.initialPage,
                filter: action.filter
            }
        }
        case 'RESET_FILTER': {
            return {
                ...state,
                currentPage: state.initialPage,
                filter: state.initialFilter
            }
        }
        case 'CHANGE_PAGE_SIZE': {
            return {
                ...state,
                currentPage: state.initialPage,
                currentPageSize: action.pageSize
            }
        }
        case 'RESET_PAGE_SIZE': {
            return {
                ...state,
                currentPage: state.initialPage,
                currentPageSize: state.initialPageSize
            }
        }
    }
};

export const useGetListFilteredAndPaginated = <T extends Entity>(entity: ENTITY, initialPage: number = 1, initialPageSize: number = 20, initialFilter: string = '', runOnLoad: boolean = true) => {
    const initialState = {initialPage, currentPage: initialPage, initialPageSize, currentPageSize: initialPageSize, initialFilter, filter: initialFilter};
    const [{currentPage, currentPageSize, filter}, dispatch] = React.useReducer(reducer, initialState);
    const list = useGetList<T>(entity, currentPage, currentPageSize, filter, runOnLoad);
    const hasMoreElements = list.response?.data.next ? true : false;
    const nextPage = React.useCallback(() => {
        if (hasMoreElements) hasMoreElements && dispatch({type: 'NEXT_PAGE'});
    }, [hasMoreElements]);
    const prevPage = React.useCallback(() => dispatch({type: 'PREV_PAGE'}), []);
    const resetPage = React.useCallback(() => dispatch({type: 'RESET_PAGE'}), []);
    const changePage = React.useCallback((page: number) => dispatch({type: 'CHANGE_PAGE', page}), []);
    const changeFilter = React.useCallback((filter: string) => dispatch({type: 'CHANGE_FILTER', filter}), []);
    const resetFilter = React.useCallback(() => dispatch({type: 'RESET_FILTER'}), []);
    const changePageSize = React.useCallback((pageSize: number) => dispatch({type: 'CHANGE_PAGE_SIZE', pageSize}), []);
    const resetPageSize = React.useCallback(() => dispatch({type: 'RESET_PAGE_SIZE'}), []);
    return {...list, firstPage: initialPage, currentPage, nextPage, prevPage, changePage, resetPage, hasMoreElements, currentPageSize, changePageSize, resetPageSize, currentFilter: filter, changeFilter, resetFilter};
};

export const useGetListAccumulated = <T extends Entity>(entity: ENTITY, initialPage: number = 1, initialPageSize: number = 20, initialFilter: string = '', runOnLoad: boolean = true) => {
    const listPaginatedApi = useGetListFilteredAndPaginated<T>(entity, initialPage, initialPageSize, initialFilter, runOnLoad);
    const {response, currentPage, firstPage, isLoading} = listPaginatedApi;
    const commingFromLoading = React.useRef(isLoading);
    // TODO: Accumulate responses
    const accumulatedResults = React.useRef<T[]>([]);
    accumulatedResults.current = React.useMemo(
        () => {
            if (!commingFromLoading.current || !response) {
                return accumulatedResults.current;
            }
            if (currentPage === firstPage) {
                return [...response.data.results];
            }
            else {
                return [...accumulatedResults.current, ...response.data.results];
            }
        }, [currentPage, firstPage, response]
    );
    // Set this render was a loading in order to
    // recalculate accumulated in next render
    commingFromLoading.current = isLoading;
    return {
        ...listPaginatedApi,
        accumulated: accumulatedResults.current
    };
};