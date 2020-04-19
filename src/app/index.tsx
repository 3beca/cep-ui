import React from 'react';
import TitleBar from './title-bar';
import EventTypeListPage from '../event-type-list-page';
import { useStyles } from './styles';


export const App: React.FC<{}> = function App() {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <TitleBar/>
            CEP UI
            <EventTypeListPage/>
        </div>
    );
}

export default App;
