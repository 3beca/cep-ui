import * as React from 'react';
import { RuleGroup, RuleTypes } from '../../services/api';
import { Payload } from '../../services/api/utils';

import {useStyles} from './styles';

export const buildPayloadFromRuleGroup = (payload?: Payload|null, group?: RuleGroup) => {
    return payload;
};

export type RuleGroupCreatorProps = {
    ruleTpe: RuleTypes;
    payload: Payload|null;
    group?: RuleGroup;
    setGroup: (group?: RuleGroup) => void;
};
export const RuleGroupCreator: React.FC<RuleGroupCreatorProps> = ({
    ruleTpe,
    payload,
    group,
    setGroup
}) => {
    const styles = useStyles();
    if (ruleTpe === 'realtime') return null;
    return (
        <div className={styles.container}>
            Grouping Component under construction
        </div>
    );
};

export default RuleGroupCreator;