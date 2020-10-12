import * as React from 'react';
import { useStyles } from './styles';
import { Typography } from '@material-ui/core';
import { BASE_URL } from '../../services/config';

export const ServiceNotFoundPage: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <div className={styles.dialog}>
                <div aria-label='authapp no cep service'>
                    <Typography variant='h3' color='primary'>
                        CEP Service not found!
                    </Typography>
                </div>
                <div className={styles.message}>
                    <Typography variant='caption' color='textSecondary' className={styles.messageText}>
                        CEP is not responding in {BASE_URL}, please visit our docs in order to configure it with a valid url.
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default ServiceNotFoundPage;
