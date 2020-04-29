import {renderHook, act} from '@testing-library/react-hooks';
import {usePagination} from './index';

test('usePagination should initiate pagination in 1 10 by default and change to page 2', () => {
    const {result} = renderHook(() => usePagination());

    expect(result.current.page).toBe(1);
    expect(result.current.pageSize).toBe(10);

    act(() => result.current.changePage(2));
    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(10);
});

test('usePagination should initiate pagination in 3 20 by default and change pageSize to 5', () => {
    const {result} = renderHook(() => usePagination(3, 20));

    expect(result.current.page).toBe(3);
    expect(result.current.pageSize).toBe(20);

    act(() => result.current.changePage(2));
    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(20);

    act(() => result.current.changePageSize(5));
    expect(result.current.page).toBe(2);
    expect(result.current.pageSize).toBe(5);
});