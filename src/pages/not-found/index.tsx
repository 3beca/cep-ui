import * as React from 'react';
import { useStyles } from './styles';
import { Typography } from '@material-ui/core';

export const NotFoundPage: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <div className={styles.container}>
            <div aria-label='page not found'>
                <Typography variant='h1' color='primary'>
                    404 Page not found!
                </Typography>
            </div>
        </div>
    );
};

export default NotFoundPage;
