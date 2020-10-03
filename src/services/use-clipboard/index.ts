import * as React from 'react';

export const useClipboard = () => {
    const [text, setText] = React.useState(null);
    const copy = React.useCallback(txt => {
        navigator.clipboard.writeText(txt);
        setText(txt);
    }, []);
    const clear = React.useCallback(() => setText(null), []);
    return { text, copy, clear };
};
