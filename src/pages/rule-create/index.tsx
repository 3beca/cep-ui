import * as React from 'react';
import { useParams } from 'react-router-dom';
import {useStyles} from './styles';
import {EventTypeSelector} from './event-type-select';
import {TargetSelector} from './target-select/index';
import {PayloadLoader, Payload} from './payload-loader';
import { EventType, Target } from '../../services/api';

export const RuleCreatePage: React.FC<{}> = () => {
    const styles = useStyles();
    const {type} = useParams();
    const [eventType, setEventType] = React.useState<EventType|null>(null);
    const [target, setTarget] = React.useState<Target|null>(null);
    const [payload, setPayload] = React.useState<Payload|null>(null);
    return (
        <div
            className={styles.container}
            aria-label={`create ${type} rule page`}>
            <div className={styles.sectionSearch}>
                <div
                    aria-label='manage eventtype section'
                    className={styles.sections}>
                    <EventTypeSelector
                        selected={eventType}
                        onSelected={setEventType}/>
                </div>
                <div
                    aria-label='manage target section'
                    className={styles.sections}>
                    <TargetSelector selected={target} onSelected={setTarget}/>
                </div>
                <div
                    aria-label='manage payload loader section'
                    className={styles.sections}>
                    <PayloadLoader eventTypeId={eventType?.id} payload={payload} setPayload={setPayload}/>
                </div>
            </div>
            <div aria-label='create rule section' className={styles.sections}>Create Rule section</div>
        </div>
    );
};

export default RuleCreatePage;