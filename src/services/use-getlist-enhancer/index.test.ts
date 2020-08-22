import {renderHook, act} from '@testing-library/react-hooks'
import {
    ENTITY
} from '../api-provider/use-api';
import {
    BASE_URL
} from '../config';
import {
    setupNock,
    serverGetEventTypeList,
    generateEventTypeListWith,
} from '../../test-utils';
import {
    useGetListFilteredAndPaginated,
    useGetListAccumulated
} from './index';

jest.mock('../api-provider', () => {
    const apiService = require('../api');
    const config = require('../config');
    const api = {api: apiService.buildApiService(config.BASE_URL)};
    return {
        useAPIProvider: () => api
    };
});

const url = BASE_URL;
const server = setupNock(url);

const renderHookIntheNextPage = async (initialPage: number, initialPageSize: number, initialFilter: string) => {
    serverGetEventTypeList(server, initialPage, initialPageSize, initialFilter, 200, generateEventTypeListWith(initialPageSize, true, false));
        const hookApi = renderHook(() => useGetListFilteredAndPaginated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, initialFilter, true));

        expect(hookApi.result.current.isLoading).toBe(true);
        expect(hookApi.result.current.currentPage).toBe(initialPage);
        expect(hookApi.result.current.currentPageSize).toBe(initialPageSize);

        await  hookApi.waitForNextUpdate();
        expect(hookApi.result.current.response?.data.results).toHaveLength(initialPageSize);
        expect(hookApi.result.current.hasMoreElements).toBe(true);

        serverGetEventTypeList(server, initialPage + 1, initialPageSize, hookApi.result.current.currentFilter, 200, generateEventTypeListWith(initialPageSize, true, true));
        act(
            () => hookApi.result.current.nextPage()
        );

        await  hookApi.waitForNextUpdate();
        expect(hookApi.result.current.currentPage).toBe(initialPage + 1);
        expect(hookApi.result.current.response?.data.results).toHaveLength(initialPageSize);
        expect(hookApi.result.current.currentPageSize).toBe(initialPageSize);
        expect(hookApi.result.current.hasMoreElements).toBe(true);

        return hookApi;
}

test(
    'useGetListFilteredAndPaginated should use 20 pageSize with defaults',
    async () => {
        serverGetEventTypeList(server, 1, 20, '', 200, generateEventTypeListWith(10, true, false));
        const {result, waitForNextUpdate} = renderHook(() => useGetListFilteredAndPaginated(ENTITY.EVENT_TYPES));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.currentPage).toBe(1);

        await  waitForNextUpdate();
        expect(result.current.response?.data.results).toHaveLength(10);
        expect(result.current.hasMoreElements).toBe(true);
    }
);

test(
    'useGetListFilteredAndPaginated should block next page when reach last page and reset pagination',
    async () => {
        const initialPage = 1;
        const initialPageSize = 10;
        const initialFilter = '';

        const {result, waitForNextUpdate} = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

        const nextPage = result.current.currentPage + 1;
        serverGetEventTypeList(server, nextPage, initialPageSize, result.current.currentFilter, 200, generateEventTypeListWith(5, false, true));
        act(
            () => result.current.nextPage()
        );

        await  waitForNextUpdate();
        expect(result.current.currentPage).toBe(nextPage);
        expect(result.current.currentPageSize).toBe(initialPageSize);
        expect(result.current.response?.data.results).toHaveLength(5);
        expect(result.current.hasMoreElements).toBe(false);

        // Try to load next page do not fire any request
        act(
            () => result.current.nextPage()
        );
        expect(result.current.currentPage).toBe(nextPage);

        // Reset pagination
        serverGetEventTypeList(server, initialPage, initialPageSize, result.current.currentFilter, 200, generateEventTypeListWith(10, false, true));
        act(
            () => result.current.resetPage()
        );
        await  waitForNextUpdate();
        expect(result.current.currentPage).toBe(initialPage);
        expect(result.current.currentPageSize).toBe(initialPageSize);
        expect(result.current.response?.data.results).toHaveLength(initialPageSize);
        expect(result.current.hasMoreElements).toBe(false);
    }
);

test(
    'useGetListFilteredAndPaginated should block prev page when reach first page',
    async () => {
        const initialPage = 1;
        const initialPageSize = 10;
        const initialFilter = '';

        const {result, waitForNextUpdate} = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

        const prevPage = result.current.currentPage - 1;
        serverGetEventTypeList(server, prevPage, initialPageSize, result.current.currentFilter, 200, generateEventTypeListWith(initialPageSize, true, false));
        act(
            () => result.current.prevPage()
        );

        await  waitForNextUpdate();
        expect(result.current.currentPage).toBe(initialPage);
        expect(result.current.currentPageSize).toBe(initialPageSize);
        expect(result.current.response?.data.results).toHaveLength(initialPageSize);
        expect(result.current.hasMoreElements).toBe(true);

        // Try to load prev page do not fire any request
        act(
            () => result.current.prevPage()
        );
        expect(result.current.currentPage).toBe(initialPage);
    }
);

test(
    'useGetListFilteredAndPaginated should change initialPageSize and reset to previous',
    async () => {
        const initialPage = 1;
        const initialPageSize = 10;
        const initialFilter = '';

        const {result, waitForNextUpdate} = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

        const newPageSize = 20;
        serverGetEventTypeList(server, initialPage, newPageSize, initialFilter, 200, generateEventTypeListWith(newPageSize, true, false));
        act(
            () => result.current.changePageSize(newPageSize)
        );
        await  waitForNextUpdate();
        expect(result.current.currentPage).toBe(initialPage);
        expect(result.current.currentPageSize).toBe(newPageSize);
        expect(result.current.response?.data.results).toHaveLength(newPageSize);
        expect(result.current.hasMoreElements).toBe(true);

        // Load next page with new pagination size
        serverGetEventTypeList(server, initialPage + 1, newPageSize, initialFilter, 200, generateEventTypeListWith(newPageSize, true, false));
        act(
            () => result.current.nextPage()
        );
        await  waitForNextUpdate();
        expect(result.current.currentPage).toBe(initialPage + 1);
        expect(result.current.currentPageSize).toBe(newPageSize);

        // reset pagination size
        serverGetEventTypeList(server, initialPage, initialPageSize, initialFilter, 200, generateEventTypeListWith(newPageSize, true, false));
        act(
            () => result.current.resetPageSize()
        );
        await  waitForNextUpdate();
        expect(result.current.currentPage).toBe(initialPage);
        expect(result.current.currentPageSize).toBe(initialPageSize);
    }
);

test('useGetListFilteredAndPaginated should next and prev page filtered and reset filter', async () => {
    const initialPage = 1;
    const initialPageSize = 10;
    const initialFilter = 'initialfilter';

    const {result, waitForNextUpdate} = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

    const filter = 'new-search-condition';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(10, true, false));
    act(
        () => result.current.changeFilter(filter)
    );

    await  waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(10);
    expect(result.current.hasMoreElements).toBe(true);

    // Next filtered page
    const nextPage = initialPage + 1;
    serverGetEventTypeList(server, nextPage, initialPageSize, filter, 200, generateEventTypeListWith(5, false, true));
    act(
        () => result.current.nextPage()
    );

    await  waitForNextUpdate();
    expect(result.current.currentPage).toBe(nextPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(5);
    expect(result.current.hasMoreElements).toBe(false);
    expect(result.current.currentFilter).toBe(filter);

    // Prev filtered page
    const prevPage = result.current.currentPage - 1;
    serverGetEventTypeList(server, prevPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(
        () => result.current.prevPage()
    );

    await  waitForNextUpdate();
    expect(result.current.currentPage).toBe(prevPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(result.current.hasMoreElements).toBe(true);
    expect(result.current.currentFilter).toBe(filter);

    // Reset filtered page
    serverGetEventTypeList(server, initialPage, initialPageSize, initialFilter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(
        () => result.current.resetFilter()
    );

    await  waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(result.current.hasMoreElements).toBe(true);
    expect(result.current.currentFilter).toBe(initialFilter);
});

test(
    'useGetListAcumulated should get 20 elements by default',
    async () => {
        const initialPage = 1;
        const initialPageSize = 20;
        const filter = '';
        serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
        const {result, waitForNextUpdate} = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES));
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(20);
        expect(result.current.hasMoreElements).toBe(true);

        serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
        act(
            () => result.current.nextPage()
        );
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(40);
        expect(result.current.hasMoreElements).toBe(true);

        serverGetEventTypeList(server, initialPage + 2, initialPageSize, filter, 200, generateEventTypeListWith(10, false, true));
        act(
            () => result.current.nextPage()
        );
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(50);
        expect(result.current.hasMoreElements).toBe(false);
    }
);

test(
    'useGetListAcumulated should get 20 elements, nextPage and accumulate +20 and next +10 elments',
    async () => {
        const initialPage = 1;
        const initialPageSize = 20;
        const filter = '';
        serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
        const {result, waitForNextUpdate} = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(20);
        expect(result.current.hasMoreElements).toBe(true);

        serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
        act(
            () => result.current.nextPage()
        );
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(40);
        expect(result.current.hasMoreElements).toBe(true);

        serverGetEventTypeList(server, initialPage + 2, initialPageSize, filter, 200, generateEventTypeListWith(10, false, true));
        act(
            () => result.current.nextPage()
        );
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(50);
        expect(result.current.hasMoreElements).toBe(false);
    }
);

test(
    'useGetListAcumulated should get 20 elements, nextPage and filter accumulate 10 reset filter accumulate 20',
    async () => {
        const initialPage = 1;
        const initialPageSize = 20;
        const filter = '';
        serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
        const {result, waitForNextUpdate} = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(20);
        expect(result.current.hasMoreElements).toBe(true);

        serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
        act(
            () => result.current.nextPage()
        );
        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(40);
        expect(result.current.hasMoreElements).toBe(true);

        const newFilter = 'new-search-condition';
        serverGetEventTypeList(server, initialPage, initialPageSize, newFilter, 200, generateEventTypeListWith(10, false, false));
        act(
            () => result.current.changeFilter(newFilter)
        );

        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(10);
        expect(result.current.currentFilter).toEqual(newFilter);
        expect(result.current.hasMoreElements).toBe(false);

        // Reset filtered page
        serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
        act(
            () => result.current.resetFilter()
        );

        await  waitForNextUpdate();
        expect(result.current.accumulated).toHaveLength(20);
        expect(result.current.currentFilter).toEqual(filter);
        expect(result.current.hasMoreElements).toBe(true);
    }
);

