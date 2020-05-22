import {renderHook, act} from '@testing-library/react-hooks';
import {useDebounce, debounceProps} from './index';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('useDebounde should receive 3 changes and fire only the last', async () => {
    const fireCallback = jest.fn();
    const {result} = renderHook(useDebounce, {initialProps: {callback: fireCallback, initialValue: '', skipOnFirstRender: true}});
    const [, setValue] = result.current;

    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).not.toHaveBeenCalled();

    act(() => setValue('filter'));
    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).toHaveBeenNthCalledWith(1, 'filter');
    fireCallback.mockClear();

    act(() => setValue('filter1'));
    expect(result.current[0]).toEqual('filter1');

    act(() => setValue('filter2'));
    expect(result.current[0]).toEqual('filter2');

    act(() => setValue('filter3'));
    expect(result.current[0]).toEqual('filter3');

    act(() => setValue('filter4'));
    expect(result.current[0]).toEqual('filter4');

    act(() => setValue('filter5'));
    expect(result.current[0]).toEqual('filter5');
    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).toHaveBeenNthCalledWith(1, 'filter5');
    expect(result.current[0]).toEqual('filter5');
});

test('useDebounde should receive 3 changes and fire only the last', async () => {
    const fireCallback = jest.fn();
    const {rerender, result} = renderHook(useDebounce, {initialProps: {callback: fireCallback, delay: 500, initialValue: '', skipOnFirstRender: true}});

    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).not.toHaveBeenCalled();

    const [, setValue] = result.current;
    act(() => setValue('filter'));
    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).toHaveBeenNthCalledWith(1, 'filter');
    fireCallback.mockClear();

    act(() => setValue('filter1'));
    act(() => setValue('filter2'));
    act(() => setValue('filter3'));
    act(() => setValue('filter4'));
    act(() => setValue('filter5'));
    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).toHaveBeenNthCalledWith(1, 'filter5');
    fireCallback.mockClear();

    rerender({callback: fireCallback, delay: 0, initialValue: '', skipOnFirstRender: true});
    expect(fireCallback).toHaveBeenCalledTimes(1);
    fireCallback.mockClear();

    rerender({callback: fireCallback, delay: 0, initialValue: '', skipOnFirstRender: true});
    expect(fireCallback).toHaveBeenCalledTimes(0);
    fireCallback.mockClear();

    act(() => setValue('filter'));
    act(() => setValue('filter2'));
    expect(fireCallback).toHaveBeenNthCalledWith(1, 'filter');
    fireCallback.mockClear();
});

test('useDebounde should do nothing if callback is invalid', async () => {
    const {result} = renderHook(useDebounce, {initialProps: {callback: undefined as unknown as () => void, initialValue: ''}});
    expect(() => result.current).toThrowError('callback param must be a function');
});

test('useDebounde should fire with custom filter', async () => {
    const fireCallback = jest.fn().mockImplementationOnce((value: string) => {});
    const props: debounceProps<string> = {
        callback: fireCallback,
        initialValue: '',
        filterDispatch: (value: string|undefined) => !!value && value.length > 5
    };
    const {result} = renderHook(
        useDebounce,
        {initialProps: props}
    );
    const [, setValue] = result.current;

    expect(fireCallback).not.toHaveBeenCalled();

    act(() => setValue('fil'));
    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).not.toHaveBeenCalled();

    act(() => setValue('filter'));
    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).toHaveBeenNthCalledWith(1, 'filter');
});

test('useDebounde should fire callback in first render', async () => {
    const fireCallback = jest.fn();
    renderHook(useDebounce, {initialProps: {callback: fireCallback, initialValue: ''}});

    act(() => void jest.runOnlyPendingTimers());
    expect(fireCallback).toHaveBeenCalledTimes(1);
});