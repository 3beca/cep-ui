import * as React from 'react';
import {Router} from 'react-router-dom';
import {createMemoryHistory, History} from 'history';
import {render} from '@testing-library/react';
import {MainMenuProvider} from '../services/main-menu-provider';
export * from '@testing-library/react';
export * from './api';

type OptionsRenderRouter = {
    route?: string;
    history?: History
};
export function renderInsideApp(
    ui: React.ReactElement,
    {
        route = '/',
        history = createMemoryHistory({initialEntries: [route]}),
        ...renderOptions
    }: OptionsRenderRouter = {}
) {
    const Wrapper: React.FC<{}> = function Wrapper(props) {
        return (
            <Router history={history}>
                <MainMenuProvider {...props} />
            </Router>
        );
    }
    return {
        ...render(ui, {wrapper: Wrapper, ...renderOptions}),
        history
    };
};
