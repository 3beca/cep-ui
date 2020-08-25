import * as React from 'react';
import App from '../app';
import LoginPage from './login';
import ServiceNotFoundPage from './service-notfound';
import { useAPIProviderStatus } from '../services/api-provider';

export const AuthApp: React.FC<{}> = () => {
    const {
        showLoading,
        showLogin,
        showNoService,
        invalidReason,
        apiKey
    } = useAPIProviderStatus();

    if (showLoading) {
        return (
            <div aria-label='authapp validating'>

            </div>
        );
    }

    if (showNoService) {
        return (<ServiceNotFoundPage/>);
    }

    if (showLogin) {
        return (
            <LoginPage invalidReason={invalidReason}/>
        );
    }
    return (<App/>);
};

export default AuthApp;