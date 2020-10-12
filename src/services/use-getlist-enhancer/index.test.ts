import { renderHook, act } from '@testing-library/react-hooks';
import { ENTITY } from '../api-provider/use-api';
import { BASE_URL } from '../config';
import { setupNock, serverGetEventTypeList, generateEventTypeListWith } from '../../test-utils';
import { useGetListFilteredAndPaginated, useGetListAccumulated } from './index';
import { Entity, EventType, ServiceList } from '../api';

jest.mock('../api-provider', () => {
    const apiService = require('../api');
    const config = require('../config');
    const api = { api: apiService.buildApiService(config.BASE_URL) };
    return {
        useAPIProvider: () => api
    };
});

const url = BASE_URL;
const server = setupNock(url);

const renderHookIntheNextPage = async (initialPage: number, initialPageSize: number, initialFilter: string) => {
    serverGetEventTypeList(
        server,
        initialPage,
        initialPageSize,
        initialFilter,
        200,
        generateEventTypeListWith(initialPageSize, true, false)
    );
    const hookApi = renderHook(() => useGetListFilteredAndPaginated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, initialFilter, true));

    expect(hookApi.result.current.isLoading).toBe(true);
    expect(hookApi.result.current.currentPage).toBe(initialPage);
    expect(hookApi.result.current.currentPageSize).toBe(initialPageSize);

    await hookApi.waitForNextUpdate();
    expect(hookApi.result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(hookApi.result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(
        server,
        initialPage + 1,
        initialPageSize,
        hookApi.result.current.currentFilter,
        200,
        generateEventTypeListWith(initialPageSize, true, true)
    );
    act(() => hookApi.result.current.nextPage());

    await hookApi.waitForNextUpdate();
    expect(hookApi.result.current.currentPage).toBe(initialPage + 1);
    expect(hookApi.result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(hookApi.result.current.currentPageSize).toBe(initialPageSize);
    expect(hookApi.result.current.hasMoreElements).toBe(true);

    return hookApi;
};

test('useGetListFilteredAndPaginated should use 20 pageSize with defaults', async () => {
    serverGetEventTypeList(server, 1, 20, '', 200, generateEventTypeListWith(10, true, false));
    const { result, waitForNextUpdate } = renderHook(() => useGetListFilteredAndPaginated(ENTITY.EVENT_TYPES));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentPage).toBe(1);

    await waitForNextUpdate();
    expect(result.current.response?.data.results).toHaveLength(10);
    expect(result.current.hasMoreElements).toBe(true);
});

test('useGetListFilteredAndPaginated should block next page when reach last page and reset pagination', async () => {
    const initialPage = 1;
    const initialPageSize = 10;
    const initialFilter = '';

    const { result, waitForNextUpdate } = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

    const nextPage = result.current.currentPage + 1;
    serverGetEventTypeList(server, nextPage, initialPageSize, result.current.currentFilter, 200, generateEventTypeListWith(5, false, true));
    act(() => result.current.nextPage());

    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(nextPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(5);
    expect(result.current.hasMoreElements).toBe(false);

    // Try to load next page do not fire any request
    act(() => result.current.nextPage());
    expect(result.current.currentPage).toBe(nextPage);

    // Reset pagination
    serverGetEventTypeList(
        server,
        initialPage,
        initialPageSize,
        result.current.currentFilter,
        200,
        generateEventTypeListWith(10, false, true)
    );
    act(() => result.current.resetPage());
    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(result.current.hasMoreElements).toBe(false);
});

test('useGetListFilteredAndPaginated should block prev page when reach first page', async () => {
    const initialPage = 1;
    const initialPageSize = 10;
    const initialFilter = '';

    const { result, waitForNextUpdate } = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

    const prevPage = result.current.currentPage - 1;
    serverGetEventTypeList(
        server,
        prevPage,
        initialPageSize,
        result.current.currentFilter,
        200,
        generateEventTypeListWith(initialPageSize, true, false)
    );
    act(() => result.current.prevPage());

    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(result.current.hasMoreElements).toBe(true);

    // Try to load prev page do not fire any request
    act(() => result.current.prevPage());
    expect(result.current.currentPage).toBe(initialPage);
});

test('useGetListFilteredAndPaginated should change initialPageSize and reset to previous', async () => {
    const initialPage = 1;
    const initialPageSize = 10;
    const initialFilter = '';

    const { result, waitForNextUpdate } = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

    const newPageSize = 20;
    serverGetEventTypeList(server, initialPage, newPageSize, initialFilter, 200, generateEventTypeListWith(newPageSize, true, false));
    act(() => result.current.changePageSize(newPageSize));
    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(newPageSize);
    expect(result.current.response?.data.results).toHaveLength(newPageSize);
    expect(result.current.hasMoreElements).toBe(true);

    // Load next page with new pagination size
    serverGetEventTypeList(server, initialPage + 1, newPageSize, initialFilter, 200, generateEventTypeListWith(newPageSize, true, false));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage + 1);
    expect(result.current.currentPageSize).toBe(newPageSize);

    // reset pagination size
    serverGetEventTypeList(server, initialPage, initialPageSize, initialFilter, 200, generateEventTypeListWith(newPageSize, true, false));
    act(() => result.current.resetPageSize());
    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
});

test('useGetListFilteredAndPaginated should next and prev page filtered and reset filter', async () => {
    const initialPage = 1;
    const initialPageSize = 10;
    const initialFilter = 'initialfilter';

    const { result, waitForNextUpdate } = await renderHookIntheNextPage(initialPage, initialPageSize, initialFilter);

    const filter = 'new-search-condition';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(10, true, false));
    act(() => result.current.changeFilter(filter));

    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(10);
    expect(result.current.hasMoreElements).toBe(true);

    // Next filtered page
    const nextPage = initialPage + 1;
    serverGetEventTypeList(server, nextPage, initialPageSize, filter, 200, generateEventTypeListWith(5, false, true));
    act(() => result.current.nextPage());

    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(nextPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(5);
    expect(result.current.hasMoreElements).toBe(false);
    expect(result.current.currentFilter).toBe(filter);

    // Prev filtered page
    const prevPage = result.current.currentPage - 1;
    serverGetEventTypeList(server, prevPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(() => result.current.prevPage());

    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(prevPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(result.current.hasMoreElements).toBe(true);
    expect(result.current.currentFilter).toBe(filter);

    // Reset filtered page
    serverGetEventTypeList(
        server,
        initialPage,
        initialPageSize,
        initialFilter,
        200,
        generateEventTypeListWith(initialPageSize, true, true)
    );
    act(() => result.current.resetFilter());

    await waitForNextUpdate();
    expect(result.current.currentPage).toBe(initialPage);
    expect(result.current.currentPageSize).toBe(initialPageSize);
    expect(result.current.response?.data.results).toHaveLength(initialPageSize);
    expect(result.current.hasMoreElements).toBe(true);
    expect(result.current.currentFilter).toBe(initialFilter);
});

test('useGetListAcumulated should get 20 elements by default', async () => {
    const initialPage = 1;
    const initialPageSize = 20;
    const filter = '';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(40);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 2, initialPageSize, filter, 200, generateEventTypeListWith(10, false, true));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(50);
    expect(result.current.hasMoreElements).toBe(false);
});

test('useGetListAcumulated should get 20 elements, nextPage and accumulate +20 and next +10 elments', async () => {
    const initialPage = 1;
    const initialPageSize = 20;
    const filter = '';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(40);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 2, initialPageSize, filter, 200, generateEventTypeListWith(10, false, true));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(50);
    expect(result.current.hasMoreElements).toBe(false);
});

test('useGetListAcumulated should get 20 elements, nextPage and filter accumulate 10 reset filter accumulate 20', async () => {
    const initialPage = 1;
    const initialPageSize = 20;
    const filter = '';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(40);
    expect(result.current.hasMoreElements).toBe(true);

    const newFilter = 'new-search-condition';
    serverGetEventTypeList(server, initialPage, initialPageSize, newFilter, 200, generateEventTypeListWith(10, false, false));
    act(() => result.current.changeFilter(newFilter));

    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(10);
    expect(result.current.currentFilter).toEqual(newFilter);
    expect(result.current.hasMoreElements).toBe(false);

    // Reset filtered page
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
    act(() => result.current.resetFilter());

    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.currentFilter).toEqual(filter);
    expect(result.current.hasMoreElements).toBe(true);
});

test('useGetListAcumulated get 20 elements, nextPage and reuest should return the firsts 40 elements', async () => {
    const initialPage = 1;
    const initialPageSize = 20;
    const filter = '';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.hasMoreElements).toBe(true);

    const secondPage = generateEventTypeListWith(initialPageSize, true, true);
    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, secondPage);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(40);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, secondPage);
    act(() => result.current.request());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(40);
    expect(result.current.currentFilter).toEqual(filter);
    expect(result.current.hasMoreElements).toBe(true);
});

test('useGetListAcumulated get 20 elements, nextPage and reuest after delete one element should return the firsts 39 elements', async () => {
    const initialPage = 1;
    const initialPageSize = 20;
    const filter = '';
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, false));
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, generateEventTypeListWith(initialPageSize, true, true));
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(40);
    expect(result.current.hasMoreElements).toBe(true);

    serverGetEventTypeList(
        server,
        initialPage + 1,
        initialPageSize,
        filter,
        200,
        generateEventTypeListWith(initialPageSize - 1, true, true)
    );
    act(() => result.current.request());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(39);
    expect(result.current.currentFilter).toEqual(filter);
    expect(result.current.hasMoreElements).toBe(true);
});

test('useGetListAcumulated should remove 3 elements and refresh accumulated', async () => {
    const initialPage = 1;
    const initialPageSize = 5;
    const filter = '';
    const items = generateEventTypeListWith(23).results;
    const serverPages: ServiceList<EventType>[] = [
        { next: 'http://page2', results: items.slice(0, 5) },
        {
            next: 'http://page3',
            prev: 'http://page1',
            results: items.slice(5, 10)
        },
        {
            next: 'http://page4',
            prev: 'http://page2',
            results: items.slice(10, 15)
        },
        {
            next: 'http://page5',
            prev: 'http://page3',
            results: items.slice(15, 20)
        },
        {
            next: 'http://page5',
            prev: 'http://page3',
            results: items.slice(18, 23)
        }
    ];
    const itemsToDelete = [3, 8, 13];
    const itemsAcumulatedBeforeDelete = items.slice(0, 20);
    const itemsAcumulatedAferDelete = items.filter((_, index) => !itemsToDelete.includes(index));

    // Iterate 4 pages
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, serverPages[0]);
    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, serverPages[1]);
    serverGetEventTypeList(server, initialPage + 2, initialPageSize, filter, 200, serverPages[2]);
    serverGetEventTypeList(server, initialPage + 3, initialPageSize, filter, 200, serverPages[3]);
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(5);
    expect(result.current.hasMoreElements).toBe(true);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(10);
    expect(result.current.hasMoreElements).toBe(true);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(15);
    expect(result.current.hasMoreElements).toBe(true);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.accumulated).toEqual(itemsAcumulatedBeforeDelete);
    expect(result.current.hasMoreElements).toBe(true);
    expect(result.current.currentFilter).toEqual(filter);

    // Delete 3 items
    serverGetEventTypeList(server, initialPage + 3, initialPageSize, filter, 200, serverPages[4]);
    act(() => result.current.deleteItems(itemsToDelete));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(20);
    expect(result.current.accumulated).toEqual(itemsAcumulatedAferDelete);
    expect(result.current.hasMoreElements).toBe(true);
    expect(result.current.currentFilter).toEqual(filter);
});

test('useGetListAcumulated should remove 3 elements from a ended list and DO NOT refresh accumulated', async () => {
    const initialPage = 1;
    const initialPageSize = 5;
    const filter = '';
    const items = generateEventTypeListWith(17).results;
    const serverPages: ServiceList<EventType>[] = [
        { next: 'http://page2', results: items.slice(0, 5) },
        {
            next: 'http://page3',
            prev: 'http://page1',
            results: items.slice(5, 10)
        },
        {
            next: 'http://page4',
            prev: 'http://page2',
            results: items.slice(10, 15)
        },
        { prev: 'http://page3', results: items.slice(15, 17) }
    ];
    const itemsToDelete = [3, 8, 13];
    const itemsAcumulatedBeforeDelete = items.slice(0, 17);
    const itemsAcumulatedAferDelete = items.filter((_, index) => !itemsToDelete.includes(index));

    // Iterate 4 pages
    serverGetEventTypeList(server, initialPage, initialPageSize, filter, 200, serverPages[0]);
    serverGetEventTypeList(server, initialPage + 1, initialPageSize, filter, 200, serverPages[1]);
    serverGetEventTypeList(server, initialPage + 2, initialPageSize, filter, 200, serverPages[2]);
    serverGetEventTypeList(server, initialPage + 3, initialPageSize, filter, 200, serverPages[3]);
    const { result, waitForNextUpdate } = renderHook(() => useGetListAccumulated(ENTITY.EVENT_TYPES, initialPage, initialPageSize, filter));
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(5);
    expect(result.current.hasMoreElements).toBe(true);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(10);
    expect(result.current.hasMoreElements).toBe(true);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(15);
    expect(result.current.hasMoreElements).toBe(true);
    act(() => result.current.nextPage());
    await waitForNextUpdate();
    expect(result.current.accumulated).toHaveLength(17);
    expect(result.current.accumulated).toEqual(itemsAcumulatedBeforeDelete);
    expect(result.current.hasMoreElements).toBe(false);
    expect(result.current.currentFilter).toEqual(filter);

    // Delete 3 items
    act(() => result.current.deleteItems(itemsToDelete));
    expect(result.current.accumulated).toHaveLength(14);
    expect(result.current.accumulated).toEqual(itemsAcumulatedAferDelete);
    expect(result.current.hasMoreElements).toBe(false);
    expect(result.current.currentFilter).toEqual(filter);
});
