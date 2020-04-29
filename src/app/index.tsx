import React from 'react';
import {Switch, Route} from 'react-router-dom';
import { useStyles } from './styles';
import TitleBar from './title-bar';
import MenuDrawer from './menu-drawer';
import EventTypeListPage from '../event-type-list-page';
import TargetListPage from '../target-list-page/index';
import NotFoundPage from '../not-found-page';

export const App: React.FC<{}> = function App() {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <TitleBar/>
            <MenuDrawer/>
            CEP UI
            <Switch>
                <Route exact path='/'>
                    <EventTypeListPage/>
                </Route>
                <Route path='/targets'>
                    <TargetListPage/>
                </Route>
                <Route>
                    <NotFoundPage/>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
