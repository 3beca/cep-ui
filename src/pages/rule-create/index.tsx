import * as React from 'react';
import { useParams } from 'react-router-dom';
import {useStyles} from './styles';
import {EventTypeSelector} from './event-type-select';
import {TargetSelector} from './target-select/index';

export const RuleCreatePage: React.FC<{}> = () => {
    const styles = useStyles();
    const {type} = useParams();

    return (
        <div
            className={styles.container}
            aria-label={`create ${type} rule page`}>
            <div className={styles.sectionSearch}>
                <div
                    aria-label='manage eventtype section'
                    className={styles.sections}>
                    <EventTypeSelector/>
                </div>
                <div
                    aria-label='manage target section'
                    className={styles.sections}>
                    <TargetSelector/>
                </div>
            </div>
            <div aria-label='create rule section' className={styles.sections}>Create Rule section</div>
        </div>
    );
};

export default RuleCreatePage;