import * as React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

export const TitleTable: React.FC<{ title: string }> = ({
    title,
    children
}) => {
    const styles = useStyles();
    return (
        <div className={styles.tabletitle} aria-label='table title'>
            <Toolbar>
                <Typography variant='h6' className={styles.tablename}>
                    {title}
                </Typography>
                {children}
            </Toolbar>
        </div>
    );
};

export default TitleTable;
