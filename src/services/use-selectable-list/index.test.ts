import { renderHook, act } from '@testing-library/react-hooks';
import { useSelectableList } from './index';

test('useSelectableList should select and deselect elements from a list without duplicate elements', async () => {
    let listOfElements = ['Elemento1', 'Elemento2', 'Elemento3', 'Elemento4', 'Elemento5'];
    const selectedCallback = jest.fn();
    const { result, rerender } = renderHook(() => useSelectableList(listOfElements, selectedCallback));

    expect(result.current.selecteds.size).toBe(0);
    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, listOfElements[0]));
    expect(result.current.selecteds.size).toBe(1);
    expect([...result.current.selecteds]).toEqual([listOfElements[0]]);
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenCalledWith([listOfElements[0]]);

    act(() => result.current.selectOne(true, listOfElements[2]));
    expect(result.current.selecteds.size).toBe(2);
    expect([...result.current.selecteds]).toEqual([listOfElements[0], listOfElements[2]]);
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, [listOfElements[0], listOfElements[2]]);

    act(() => result.current.selectOne(true, listOfElements[3]));
    expect(result.current.selecteds.size).toBe(3);
    expect([...result.current.selecteds]).toEqual([listOfElements[0], listOfElements[2], listOfElements[3]]);
    expect(selectedCallback).toHaveBeenCalledTimes(3);
    expect(selectedCallback).toHaveBeenNthCalledWith(3, [listOfElements[0], listOfElements[2], listOfElements[3]]);

    act(() => result.current.selectOne(false, listOfElements[2]));
    expect(result.current.selecteds.size).toBe(2);
    expect([...result.current.selecteds]).toEqual([listOfElements[0], listOfElements[3]]);
    expect(selectedCallback).toHaveBeenCalledTimes(4);
    expect(selectedCallback).toHaveBeenNthCalledWith(4, [listOfElements[0], listOfElements[3]]);

    // Remove only once
    act(() => result.current.selectOne(false, listOfElements[2]));
    expect(result.current.selecteds.size).toBe(2);
    expect([...result.current.selecteds]).toEqual([listOfElements[0], listOfElements[3]]);
    expect(selectedCallback).toHaveBeenCalledTimes(5);
    expect(selectedCallback).toHaveBeenNthCalledWith(5, [listOfElements[0], listOfElements[3]]);

    // Do not duplicate elements
    act(() => result.current.selectOne(true, listOfElements[3]));
    expect(result.current.selecteds.size).toBe(2);
    expect([...result.current.selecteds]).toEqual([listOfElements[0], listOfElements[3]]);
    expect(selectedCallback).toHaveBeenCalledTimes(6);
    expect(selectedCallback).toHaveBeenNthCalledWith(6, [listOfElements[0], listOfElements[3]]);

    act(() => result.current.selectOne(false, listOfElements[0]));
    expect(result.current.selecteds.size).toBe(1);
    expect([...result.current.selecteds]).toEqual([listOfElements[3]]);
    expect(selectedCallback).toHaveBeenCalledTimes(7);
    expect(selectedCallback).toHaveBeenNthCalledWith(7, [listOfElements[3]]);

    selectedCallback.mockClear();
    listOfElements = ['ElementoN1', 'ElementoN2', 'ElementoN3', 'ElementoN4', 'ElementoN5'];
    rerender();

    expect(result.current.selecteds.size).toBe(0);
    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, listOfElements[0]));
    expect(result.current.selecteds.size).toBe(1);
    expect([...result.current.selecteds]).toEqual([listOfElements[0]]);
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenNthCalledWith(1, [listOfElements[0]]);

    act(() => result.current.selectAll(true));
    expect(result.current.selecteds.size).toBe(5);
    expect([...result.current.selecteds]).toEqual(listOfElements);
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, listOfElements);

    act(() => result.current.selectAll(false));
    expect(result.current.selecteds.size).toBe(0);
    expect([...result.current.selecteds]).toEqual([]);
    expect(selectedCallback).toHaveBeenCalledTimes(3);
    expect(selectedCallback).toHaveBeenNthCalledWith(3, []);

    act(() => result.current.selectAll(true));
    expect(result.current.selecteds.size).toBe(5);
    expect([...result.current.selecteds]).toEqual(listOfElements);
    expect(selectedCallback).toHaveBeenCalledTimes(4);
    expect(selectedCallback).toHaveBeenNthCalledWith(4, listOfElements);

    selectedCallback.mockClear();
    listOfElements = ['ElementoN1', 'ElementoN2', 'ElementoN3', 'ElementoN4', 'ElementoN5'];
    rerender();

    expect(result.current.selecteds.size).toBe(0);
    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, listOfElements[0]));
    expect(result.current.selecteds.size).toBe(1);
    expect([...result.current.selecteds]).toEqual([listOfElements[0]]);
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenNthCalledWith(1, [listOfElements[0]]);
});

test('useSelectableList should fire selectAll(true) with empty array when list is null', async () => {
    const selectedCallback = jest.fn();
    let listOfElements = (null as unknown) as string[];
    const { result } = renderHook(() => useSelectableList(listOfElements, selectedCallback));

    expect(result.current.selecteds.size).toBe(0);
    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, 'AnyElement'));
    expect(result.current.selecteds.size).toBe(1);
    expect([...result.current.selecteds]).toEqual(['AnyElement']);
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenNthCalledWith(1, ['AnyElement']);

    act(() => result.current.selectAll(true));
    expect(result.current.selecteds.size).toBe(0);
    expect([...result.current.selecteds]).toEqual([]);
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, []);
});

test('useSelectableList should fire selectAll(true) with empty array when list is undefined', async () => {
    const selectedCallback = jest.fn();
    const { result } = renderHook(() => useSelectableList(undefined, selectedCallback));

    expect(result.current.selecteds.size).toBe(0);
    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, 'AnyElement'));
    expect(result.current.selecteds.size).toBe(1);
    expect([...result.current.selecteds]).toEqual(['AnyElement']);
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenNthCalledWith(1, ['AnyElement']);

    act(() => result.current.selectAll(true));
    expect(result.current.selecteds.size).toBe(0);
    expect([...result.current.selecteds]).toEqual([]);
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, []);
});

test('useSelectableList should not duplicate element already selected when selectedAll', async () => {
    const array = ['AnyElements', 'MoreElements'];
    const { result } = renderHook(() => useSelectableList(array));

    act(() => result.current.selectOne(true, 'AnyElement'));
    expect(result.current.selecteds.has('AnyElement')).toBe(true);
    act(() => result.current.selectAll(true));
    expect(result.current.selecteds.size).toBe(2);
});
