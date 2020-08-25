import * as React from 'react';
import {Router} from 'react-router-dom';
import {createMemoryHistory, History} from 'history';
import {render} from '@testing-library/react';
import {MainMenuProvider} from '../services/main-menu-provider';
import {APIProviderMock} from './api-provider-mock';
import {APIProvider} from '../services/api-provider';
import {
    APIContextState,
    APIUtilsContext
} from '../services/api-provider/api-context';
export * from '@testing-library/react';
export * from './api';

type OptionsRenderRouter = {
    route?: string;
    history?: History;
    apiState?: APIContextState;
    apiUtils?: APIUtilsContext;
};
export function renderInsideApp(
    ui: React.ReactElement,
    {
        route = '/',
        history = createMemoryHistory({initialEntries: [route]}),
        apiState,
        apiUtils,
        ...renderOptions
    }: OptionsRenderRouter = {}
) {
    const Wrapper: React.FC<{}> = function Wrapper(props) {
        return (
            <APIProviderMock state={apiState} utils={apiUtils}>
                <Router history={history}>
                    <MainMenuProvider {...props} />
                </Router>
            </APIProviderMock>
        );
    }
    return {
        ...render(ui, {wrapper: Wrapper, ...renderOptions}),
        history
    };
};

export function renderInsideRealApp(
    ui: React.ReactElement,
    {
        route = '/',
        history = createMemoryHistory({initialEntries: [route]}),
        ...renderOptions
    }: OptionsRenderRouter = {}
) {
    const Wrapper: React.FC<{}> = function Wrapper(props) {
        return (
            <APIProvider>
                <Router history={history}>
                    <MainMenuProvider {...props} />
                </Router>
            </APIProvider>
        );
    }
    return {
        ...render(ui, {wrapper: Wrapper, ...renderOptions}),
        history
    };
};

export function renderWithAPI(
    ui: React.ReactElement,
    {
        apiState,
        apiUtils,
        ...renderOptions
    }: OptionsRenderRouter = {}
) {
    const Wrapper: React.FC<{}> = function Wrapper(props) {
        return (
            <APIProviderMock state={apiState} utils={apiUtils}>
                <MainMenuProvider {...props} />
            </APIProviderMock>
        );
    }
    return render(ui, {wrapper: Wrapper, ...renderOptions});
};
