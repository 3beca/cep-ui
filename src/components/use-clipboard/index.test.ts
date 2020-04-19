import {renderHook, act} from '@testing-library/react-hooks';
import {useClipboard} from './index';

test('useClipboard should copy Hello World and then clear it', () => {
    const {result} = renderHook(() => useClipboard());

    expect(result.current.text).toBe(null);

    act(() => result.current.copy('Hello world'));
    expect(result.current.text).toBe('Hello world');

    act(() => result.current.clear());
    expect(result.current.text).toBe(null);
});
