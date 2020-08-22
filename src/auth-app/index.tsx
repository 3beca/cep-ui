import * as React from 'react';
import App from '../app';
import { useAPIProviderStatus } from '../services/api-provider';

export const AuthApp: React.FC<{}> = () => {
    const {
        showLoading,
        showLogin,
        showNoService,
        invalidReason
    } = useAPIProviderStatus();

    if (showLoading) {
        return (
            <div aria-label='validating'>

            </div>
        );
    }

    if (showNoService) {
        return (
            <div aria-label='no cep service'>

            </div>
        );
    }

    if (showLogin) {
        return (
            <div aria-label='apikey'>
                <div aria-label='login reason'>{invalidReason}</div>
            </div>
        );
    }
    return (<App/>);
};

export default AuthApp;