import * as React from 'react';

export type debounceProps<T> = {
    callback: (lastValue: T) => void;
    initialValue: T;
    delay?: number;
    filterDispatch?: (currentValue: T) => boolean;
    skipOnFirstRender?: boolean;
};
const defaultFilter = <T>(currentValue: T) => true;
export const useDebounce = <T>({
    callback,
    initialValue,
    delay = 500,
    filterDispatch = defaultFilter,
    skipOnFirstRender = false
}: debounceProps<T>): [T, (value: T) => void] => {
    if (typeof callback !== 'function')
        throw new Error(`callback param must be a function`);
    const [value, setValue] = React.useState<T>(initialValue);
    const firstRender = React.useRef(true);
    React.useEffect(() => {
        if (skipOnFirstRender && firstRender.current === true) {
            firstRender.current = false;
            return;
        }
        if (!filterDispatch(value)) return;
        if (delay <= 0) {
            callback(value);
            return;
        }
        const timerId = setTimeout(() => {
            callback(value);
        }, delay);
        return () => clearTimeout(timerId);
    }, [callback, value, delay, filterDispatch, skipOnFirstRender]);
    return [value, setValue];
};

export default useDebounce;
