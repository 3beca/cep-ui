import * as React from 'react';
import {useParams} from 'react-router-dom';

export const RuleDetailsPage: React.FC<{}> = () => {
    const {ruleId} = useParams<{ruleId: string}>();
    return (
        <div aria-label={`details rule ${ruleId} page`}>
            Details Rule
        </div>
    );
};

export default RuleDetailsPage;