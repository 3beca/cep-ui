import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Menu';
import { useMainMenuToggle } from '../../services/main-menu-provider';
import { useStyles } from './styles';

export type TitleBarProps = {};
export const TitleBar: React.FC<TitleBarProps> = function TitleBar() {
    const styles = useStyles();
    const { toggle } = useMainMenuToggle();

    return (
        <AppBar position='fixed' className={styles.root}>
            <Toolbar>
                <IconButton aria-label='toggle show menu' onClick={toggle}>
                    <HomeIcon className={styles.icon} fontSize='large' />
                </IconButton>
                <Typography variant='h6' color='inherit' noWrap>
                    CEP Service
                </Typography>
            </Toolbar>
        </AppBar>
    );
};

export default TitleBar;
