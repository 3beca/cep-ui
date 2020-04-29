import * as React from 'react';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import {Link, useLocation} from 'react-router-dom';
import {
    useMainMenuState,
    useMainMenuToggle
} from '../../services/main-menu-provider';

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
                <ListItem
                    button
                    component={Link}
                    to='/'
                    aria-label='menu event type list page'
                    selected={isSelected('/', location)}
                    className={isSelected('/', location) ? styles.selected : styles.unselected}>
                    <ListItemIcon><InboxIcon/></ListItemIcon>
                    <ListItemText primary='Event Types'/>
                </ListItem>
                <ListItem
                    button
                    component={Link}
                    to='/targets'
                    aria-label='menu target list page'
                    selected={isSelected('/targets', location)}
                    className={isSelected('/targets', location) ? styles.selected : styles.unselected}>
                    <ListItemIcon><MailIcon/></ListItemIcon>
                    <ListItemText primary='Targets'/>
                </ListItem>
            </List>
        </Drawer>
    );
};

export default MenuDrawer;
