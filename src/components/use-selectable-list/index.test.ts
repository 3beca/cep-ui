import {renderHook, act} from '@testing-library/react-hooks';
import {useSelectableList} from './index';

test('useSelectableList should select elements from a list', async () => {
    let listOfElements = ['Elemento1', 'Elemento2', 'Elemento3', 'Elemento4', 'Elemento5'];
    const selectedCallback = jest.fn();
    const {result, rerender} = renderHook(() => useSelectableList(listOfElements, selectedCallback));

    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, listOfElements[0]));
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenCalledWith([listOfElements[0]]);

    act(() => result.current.selectOne(true, listOfElements[2]));
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, [listOfElements[0], listOfElements[2]]);

    act(() => result.current.selectOne(true, listOfElements[3]));
    expect(selectedCallback).toHaveBeenCalledTimes(3);
    expect(selectedCallback).toHaveBeenNthCalledWith(3, [listOfElements[0], listOfElements[2], listOfElements[3]]);

    act(() => result.current.selectOne(false, listOfElements[2]));
    expect(selectedCallback).toHaveBeenCalledTimes(4);
    expect(selectedCallback).toHaveBeenNthCalledWith(4, [listOfElements[0], listOfElements[3]]);
    // Remove only once
    act(() => result.current.selectOne(false, listOfElements[2]));
    expect(selectedCallback).toHaveBeenCalledTimes(5);
    expect(selectedCallback).toHaveBeenNthCalledWith(5, [listOfElements[0], listOfElements[3]]);

    // Do not duplicate elements
    act(() => result.current.selectOne(true, listOfElements[3]));
    expect(selectedCallback).toHaveBeenCalledTimes(6);
    expect(selectedCallback).toHaveBeenNthCalledWith(6, [listOfElements[0], listOfElements[3]]);

    act(() => result.current.selectOne(false, listOfElements[0]));
    expect(selectedCallback).toHaveBeenCalledTimes(7);
    expect(selectedCallback).toHaveBeenNthCalledWith(7, [listOfElements[3]]);

    listOfElements = ['ElementoN1', 'ElementoN2', 'ElementoN3', 'ElementoN4', 'ElementoN5'];
    selectedCallback.mockClear();
    rerender();

    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, listOfElements[0]));
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenCalledWith([listOfElements[0]]);

    act(() => result.current.selectAll(true));
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, listOfElements);

    act(() => result.current.selectAll(false));
    expect(selectedCallback).toHaveBeenCalledTimes(3);
    expect(selectedCallback).toHaveBeenNthCalledWith(3, []);

    act(() => result.current.selectAll(true));
    expect(selectedCallback).toHaveBeenCalledTimes(4);
    expect(selectedCallback).toHaveBeenNthCalledWith(4, listOfElements);

    listOfElements = ['ElementoN1', 'ElementoN2', 'ElementoN3', 'ElementoN4', 'ElementoN5'];
    selectedCallback.mockClear();
    rerender();

    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, listOfElements[0]));
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenCalledWith([listOfElements[0]]);
});

test('useSelectableList should fire selectAll(true) with empty array when list is null', async () => {
    let listOfElements = null as unknown as string[];
    const selectedCallback = jest.fn();
    const {result} = renderHook(() => useSelectableList(listOfElements, selectedCallback));

    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, 'AnyElement'));
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenCalledWith(['AnyElement']);

    act(() => result.current.selectAll(true));
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, []);
});

test('useSelectableList should fire selectAll(true) with empty array when list is undefined', async () => {
    const selectedCallback = jest.fn();
    const {result} = renderHook(() => useSelectableList(undefined, selectedCallback));

    expect(selectedCallback).toHaveBeenCalledTimes(0);

    act(() => result.current.selectOne(true, 'AnyElement'));
    expect(selectedCallback).toHaveBeenCalledTimes(1);
    expect(selectedCallback).toHaveBeenCalledWith(['AnyElement']);

    act(() => result.current.selectAll(true));
    expect(selectedCallback).toHaveBeenCalledTimes(2);
    expect(selectedCallback).toHaveBeenNthCalledWith(2, []);
});

test('useSelectableList should fire selectAll(true) with empty array when list is undefined', async () => {
    const array = ['AnyElements', 'MoreElements'];
    const {result} = renderHook(() => useSelectableList(array, undefined));

    act(() => result.current.selectOne(true, 'AnyElement'));
    expect(result.current.selecteds.has('AnyElement')).toBe(true);
    act(() => result.current.selectAll(true));
    expect(result.current.selecteds.size).toBe(2);
});