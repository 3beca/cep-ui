import React from 'react';
import { useStyles } from './styles';

export const App: React.FC<{}> = function App() {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            CEP UI
        </div>
    );
}

export default App;
