import * as React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

import { useParams, Link } from 'react-router-dom';
import {EventTypeSelector} from './event-type-select';
import {TargetSelector} from './target-select';
import {RuleCreator} from './rule-creator';
import {PayloadLoader, Payload} from './payload-loader';
import { EventType, Target, Rule } from '../../services/api';
import { useCreate, ENTITY } from '../../services/api/use-api';
import {useStyles} from './styles';

const RuleCreateError: React.FC<{message?: string}> = ({message}) => {
    const styles = useStyles();
    if (!message) return null;
    return (
        <Paper
            aria-label='rule create error'
            className={styles.elementItem}>
            <Typography
                variant='caption'
                className={styles.errorText}
                aria-label='rule create error message'>
                {message}
            </Typography>
        </Paper>
    );
};

const RuleCreatorSuccess: React.FC<{show: boolean; rule?: Rule, clear: () => void;}> = ({rule, show, clear}) => {
    const styles = useStyles();
    if (!rule || !show) return null;
    return (
        <Paper
            aria-label='rule create success'
            className={styles.elementItem}>
            <Typography
                className={styles.successText}
                aria-label='rule create success message'>
                Rule {rule?.name} created successfully
            </Typography>
            <div className={styles.successButtons}>
                <Button aria-label='rule create success button more' className={styles.moreButton} onClick={clear}>Create more</Button>
                <Button aria-label='rule create success button details' component={Link} to={`/rules/details/${rule.id}`} className={styles.visitButton}>Details</Button>
            </div>
        </Paper>
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
    const {request, isLoading, error, response, reset} = useCreate<Rule>(ENTITY.RULES, bodyRule, false);
    const isCreateRuleDisabled = React.useCallback(() => !!(!bodyRule.targetId || !bodyRule.eventTypeId || !bodyRule.name || isLoading), [bodyRule, isLoading]);

    return (
        <div
            className={styles.container}
            aria-label={`create ${type} rule page`}>
            <div className={styles.sectionSearch}>
                <div
                    aria-label='manage eventtype section'
                    className={styles.sections}>
                    <EventTypeSelector
                        disabled={isLoading}
                        selected={eventType}
                        onSelected={setEventType}/>
                </div>
                <div
                    aria-label='manage target section'
                    className={styles.sections}>
                    <TargetSelector
                        disabled={isLoading}
                        selected={target}
                        onSelected={setTarget}/>
                </div>
                <div
                    aria-label='manage payload loader section'
                    className={styles.sections}>
                    <PayloadLoader
                        disabled={isLoading}
                        eventTypeId={eventType?.id}
                        payload={payload}
                        setPayload={setPayload}/>
                </div>
            </div>
            <div
                aria-label='create rule section'
                className={styles.sections}>
                    <RuleCreator
                        disabled={isLoading}
                        rule={rule}
                        updateRule={updateRule}/>
            </div>
            <div
                aria-label='submit rule section'
                className={styles.sections}>
                    <RuleCreatorSuccess rule={response?.data} show={true} clear={reset}/>
                    <RuleCreateError message={error?.error?.message}/>
                    <Button
                        className={styles.submitButton}
                        aria-label='rule create button'
                        disabled={isCreateRuleDisabled()}
                        fullWidth={true}
                        variant='contained'
                        color='primary'
                        onClick={request}>
                        {isLoading ? (<CircularProgress color='primary' aria-label='rule create loading' size={26}/>) : 'Create New Rule'}
                    </Button>
            </div>
        </div>
    );
};

export default RuleCreatePage;