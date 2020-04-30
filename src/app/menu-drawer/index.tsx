import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import EventIcon from '@material-ui/icons/MoveToInboxOutlined';
import TargetIcon from '@material-ui/icons/MailOutlineOutlined';
import EventLogIcon from '@material-ui/icons/ListAltOutlined';
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider';
import {Link, useLocation} from 'react-router-dom';
import {
    useMainMenuState,
    useMainMenuToggle
} from '../../services/main-menu-provider';
import IMGLogo from '../../images/logo.jpg'

import {useStyles} from './styles';
import { Location } from 'history';

const isSelected = (path: string, location: Location) => {
    return path === location.pathname;
}

export const MenuDrawer: React.FC<{}> = () => {
    const styles = useStyles();
    const location = useLocation();
    const isOpen = useMainMenuState();
    const {close} = useMainMenuToggle();
    return (
        <Drawer
            aria-label='drawer menu'
            open={isOpen}
            onClose={close}>
            <List
                className={styles.container}
                onClick={close}>
                <ListItem alignItems='center'>
                    <Avatar alt='logo CEP' src={IMGLogo} className={styles.avatar}/>
                </ListItem>
                <Divider/>
                <ListItem
                    button
                    component={Link}
                    to='/'
                    aria-label='menu rules list page'
                    selected={isSelected('/', location)}
                    className={isSelected('/', location) ? styles.selected : styles.unselected}>
                    <ListItemIcon><EventIcon color={isSelected('/', location) ? 'secondary' : 'inherit'}/></ListItemIcon>
                    <ListItemText primary='Rules'/>
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to='/event-types'
                    aria-label='menu event type list page'
                    selected={isSelected('/event-types', location)}
                    className={isSelected('/event-types', location) ? styles.selected : styles.unselected}>
                    <ListItemIcon><EventIcon color={isSelected('/event-types', location) ? 'secondary' : 'inherit'}/></ListItemIcon>
                    <ListItemText primary='Event Types'/>
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to='/targets'
                    aria-label='menu target list page'
                    selected={isSelected('/targets', location)}
                    className={isSelected('/targets', location) ? styles.selected : styles.unselected}>
                    <ListItemIcon><TargetIcon color={isSelected('/targets', location) ? 'secondary' : 'inherit'}/></ListItemIcon>
                    <ListItemText primary='Targets'/>
                </ListItem>
                <Divider/>
                <ListItem
                    button
                    component={Link}
                    to='/event-logs'
                    aria-label='menu event logs list page'
                    selected={isSelected('/event-logs', location)}
                    className={isSelected('/event-logs', location) ? styles.selected : styles.unselected}>
                    <ListItemIcon><EventLogIcon color={isSelected('/event-logs', location) ? 'secondary' : 'inherit'}/></ListItemIcon>
                    <ListItemText primary='Events Log'/>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default MenuDrawer;
