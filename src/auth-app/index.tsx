import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import App from '../app';
import LoginPage from './login';
import ServiceNotFoundPage from './service-notfound';
import { useAPIProviderStatus } from '../services/api-provider';
import { useStyles } from './styles';

export const AuthApp: React.FC<{}> = () => {
    const styles = useStyles();
    const {
        showLoading,
        showLogin,
        showNoService,
        invalidReason
    } = useAPIProviderStatus();

    if (showLoading) {
        return (
            <div aria-label='authapp validating' className={styles.container}>
                <div className={styles.dialog}>
                    <CircularProgress size={180} color='inherit' />
                    <div className={styles.message}>
                        <Typography className={styles.messageText}>
                            Checking API KEY, please wait a moment...
                        </Typography>
                    </div>
                </div>
            </div>
        );
    }

    if (showNoService) {
        return <ServiceNotFoundPage />;
    }

    if (showLogin) {
        return <LoginPage invalidReason={invalidReason} />;
    }
    return <App />;
};

export default AuthApp;
