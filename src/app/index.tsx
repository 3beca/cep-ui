import React from 'react';
import TitleBar from './title-bar';
import EventTypeList from '../event-type-list';
import { useStyles } from './styles';


export const App: React.FC<{}> = function App() {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <TitleBar/>
            CEP UI
            <EventTypeList/>
        </div>
    );
}

export default App;
