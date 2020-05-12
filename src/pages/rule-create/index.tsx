import * as React from 'react';
import { useParams } from 'react-router-dom';
import {useStyles} from './styles';


export const RuleCreatePage: React.FC<{}> = () => {
    const styles = useStyles();
    const {type} = useParams();

    return (
        <div
        className={styles.container}
        aria-label={`create ${type} rule page`}>
            <span>Create Rule Page!</span>
        </div>
    );
};

export default RuleCreatePage;