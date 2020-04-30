import * as React from 'react';
import {useStyles} from './styles';

export const RuleListPage: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <h1>Rules List</h1>
            {
                Array.from(
                    {length: 10},
                    (_, idx) => <div key={idx} aria-label='element row rules'>Rule {idx}</div>
                )
            }
        </div>
    );
};

export default RuleListPage;