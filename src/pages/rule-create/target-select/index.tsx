import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import {useStyles} from './styles';
import { Typography } from '@material-ui/core';

export const TargetSelector: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <Paper
            className={styles.container}
            aria-label={`target selector`}>
            <Typography variant='h5'>Target Selector goes here!</Typography>
        </Paper>
    );
};

export default TargetSelector;