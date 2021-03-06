import React from 'react';
import ReactDOM from 'react-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import { BrowserRouter } from 'react-router-dom';
import { MainMenuProvider } from './services/main-menu-provider';
import { APIProvider } from './services/api-provider';
import * as serviceWorker from './serviceWorker';

import AuthApp from './auth-app';
import theme from './theme';
import './index.css';
ReactDOM.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <APIProvider>
                <BrowserRouter>
                    <MainMenuProvider>
                        <AuthApp />
                    </MainMenuProvider>
                </BrowserRouter>
            </APIProvider>
        </ThemeProvider>
    </React.StrictMode>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
