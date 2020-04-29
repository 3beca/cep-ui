import * as React from 'react';
import {useStyles} from './styles';

export const TargetListPage: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <div className={styles.root} aria-label='target list page'>TargetList Page</div>
    );
};

export default TargetListPage;