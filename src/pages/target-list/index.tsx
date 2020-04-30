import * as React from 'react';
import TargetTable from './target-table';
import {useStyles} from './styles';

export const TargetListPage: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <TargetTable/>
        </div>
    );
};

export default TargetListPage;