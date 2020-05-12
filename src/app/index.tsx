import React from 'react';
import {Switch, Route} from 'react-router-dom';
import { useStyles } from './styles';
import TitleBar from './title-bar';
import MenuDrawer from './menu-drawer';
import RuleListPage from '../pages/rule-list';
import RuleCreatePage from '../pages/rule-create';
import EventTypeListPage from '../pages/event-type-list';
import TargetListPage from '../pages/target-list/index';
import NotFoundPage from '../pages/not-found';
import EventLogListPage from '../pages/event-log-list';

export const App: React.FC<{}> = function App() {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <TitleBar/>
            <MenuDrawer/>
            CEP UI
            <Switch>
                <Route exact path='/'>
                    <RuleListPage/>
                </Route>
                <Route path='/rules/create/:type'>
                    <RuleCreatePage/>
                </Route>
                <Route path='/event-types'>
                    <EventTypeListPage/>
                </Route>
                <Route path='/targets'>
                    <TargetListPage/>
                </Route>
                <Route path='/event-logs'>
                    <EventLogListPage/>
                </Route>
                <Route>
                    <NotFoundPage/>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
