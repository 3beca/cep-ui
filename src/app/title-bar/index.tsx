import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import HomeIcon from '@material-ui/icons/Alarm';
import { useStyles } from './styles';

export type TitleBarProps = {};
export const TitleBar: React.FC<TitleBarProps> = function TitleBar() {
    const styles = useStyles();
    return (
        <AppBar position='static' className={styles.root}>
            <Toolbar>
                <HomeIcon className={styles.icon} fontSize='large'/>
                <Typography variant='h6' color='inherit' noWrap>
                    CEP Service
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default TitleBar;