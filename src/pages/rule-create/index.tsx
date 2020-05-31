import * as React from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { useParams, Redirect } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import {EventTypeSelector} from './event-type-select';
import {TargetSelector} from './target-select/index';
import {PayloadLoader, Payload} from './payload-loader';
import { EventType, Target, Rule } from '../../services/api';
import { useCreate, ENTITY } from '../../services/api/use-api';
import {useStyles} from './styles';

export type RuleCreatorProps = {
    rule: Partial<Rule>;
    updateRule(rule: Partial<Rule>): void;
};
export const RuleCreator: React.FC<RuleCreatorProps> = ({rule, updateRule}) => {
    return (
        <div>
            <span>Create Rule section</span>
            <TextField
                required={true}
                placeholder='Enter rule name'
                inputProps={{
                    'aria-label': 'rule create name',
                }}
                value={rule.name}
                onChange={(ev) => updateRule({name: ev.target.value})}/>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                size='medium'
                                color='primary'
                                checked={rule.skipOnConsecutivesMatches ? true : false}
                                onChange={(ev) => updateRule({skipOnConsecutivesMatches: ev.target.checked})}
                                aria-label='rule create skip consecutives'/>
                        }
                        title='Skip Consecutives'
                        label='Skip Consecutives'
                        labelPlacement='end'
                    />
                </FormGroup>
        </div>
    );
};

const initialRuleState: Partial<Rule> = {
    skipOnConsecutivesMatches: false,
    name: ''
};
export const RuleCreatePage: React.FC<{}> = () => {
    const styles = useStyles();
    const {type} = useParams();
    const [eventType, setEventType] = React.useState<EventType|null>(null);
    const [target, setTarget] = React.useState<Target|null>(null);
    const [payload, setPayload] = React.useState<Payload|null>(null);
    const [rule, updateRule] = React.useReducer((state: Partial<Rule>, update: Partial<Rule>) => ({...state, ...update}), initialRuleState);
    const bodyRule = React.useMemo((): Partial<Rule> => {
        return {
            name: rule.name,
            type: type,
            eventTypeId: eventType?.id,
            targetId: target?.id,
            skipOnConsecutivesMatches: rule.skipOnConsecutivesMatches,
            filters: {}
        };
    }, [rule, target, eventType, type]);
    const {request, isLoading, error, response} = useCreate<Rule>(ENTITY.RULES, bodyRule, false);
    const isCreateRuleDisabled = React.useCallback(() => !!(!bodyRule.targetId || !bodyRule.eventTypeId || !bodyRule.name), [bodyRule]);

    if (!isLoading && !error && response?.status === 200) {
        return (<Redirect to={`/rules/details/${response.data.id}`}/>);
    }

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
            <div
                aria-label='create rule section'
                className={styles.sections}>
                    <RuleCreator rule={rule} updateRule={updateRule}/>
            </div>
            <div
                aria-label='submit rule section'
                className={styles.sections}>
                    <Button
                        aria-label='create rule button'
                        disabled={isCreateRuleDisabled()}
                        onClick={request}>
                        Create New Rule
                    </Button>
                    {
                        isLoading &&
                        (<CircularProgress color='primary' aria-label='rule create loading'/>)
                    }
            </div>
        </div>
    );
};

export default RuleCreatePage;