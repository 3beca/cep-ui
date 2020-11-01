import * as React from 'react';
import { NOOP } from '../../utils';
export type MainMenuToggleContextValue = {
    toggle: () => void;
    close: () => void;
    open: () => void;
};
const MainMenuStateContext = React.createContext(false);
const MainMenuToggleContext = React.createContext<MainMenuToggleContextValue>({
    toggle: NOOP,
    close: NOOP,
    open: NOOP
});

export const MainMenuProvider: React.FC<{}> = props => {
    const [isOpen, setOpen] = React.useState(false);
    const toggle = React.useCallback(() => setOpen(isOpen => !isOpen), []);
    const open = React.useCallback(() => setOpen(true), []);
    const close = React.useCallback(() => setOpen(false), []);
    const utils = React.useMemo(
        () => ({
            toggle,
            open,
            close
        }),
        [toggle, open, close]
    );

    return (
        <MainMenuToggleContext.Provider value={utils}>
            <MainMenuStateContext.Provider value={isOpen} {...props} />
        </MainMenuToggleContext.Provider>
    );
};

export const useMainMenuState = () => {
    return React.useContext(MainMenuStateContext);
};

export const useMainMenuToggle = () => {
    return React.useContext(MainMenuToggleContext);
};
