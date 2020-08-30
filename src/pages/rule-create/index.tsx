import * as React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { useParams, Link } from 'react-router-dom';

import EventTypeSelector from './event-type-select';
import TargetSelector from './target-select';
import RuleCreator from './rule-creator';
import PayloadCreator from '../../components/event-payload-creator';
import { EventPayload } from '../../components/event-payload-creator/utils';
import RuleGroupCreator from '../../components/rule-group-creator';
import { buildEventPayloadFromGroupPayload } from '../../components/rule-group-creator/utils';
import RuleFilter from '../../components/rule-filter';
import ConfigFilterExpression from '../../components/config-filter-expression';
import { EventType, Target, Rule, RuleTypes, RuleGroup } from '../../services/api';
import { useCreate, ENTITY } from '../../services/api-provider/use-api';
import {useStyles} from './styles';
import {
    parseFilterContainer
} from '../../components/rule-filter/utils';
import {
    RuleFilterContainer,
    Expression
} from '../../components/rule-filter/models';

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

export type RuleCreatorSuccessProps ={
    show: boolean;
    rule?: Rule;
    clear: () => void;
    setDialogState: (isOpen: boolean) => void;
};
const RuleCreatorSuccess: React.FC<RuleCreatorSuccessProps> = ({rule, show, clear, setDialogState}) => {
    const styles = useStyles();
    React.useEffect(() => {
        setDialogState(!!(rule && show));
    });
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
    const {type} = useParams<{type: RuleTypes}>();
    const [eventType, setEventType] = React.useState<EventType|null>(null);
    const [target, setTarget] = React.useState<Target|null>(null);
    const [eventPayload, setEventPayload] = React.useState<EventPayload|null>(null);
    const [ruleGroup, setRuleGroup] = React.useState<RuleGroup>();
    const [rule, updateRule] = React.useReducer((state: Partial<Rule>, update: Partial<Rule>) => ({...state, ...update}), initialRuleState);
    const [isResponseDialogOpen, setResponseDialogOpen] = React.useState(false);
    const [ruleFilterContainer, setRuleFilterContainer] = React.useState<RuleFilterContainer>([{type: 'PASSTHROW', model: 'EXPRESSION', field: 'root'}]);
    const [mutateFilterContainer, setMutateFilterContainer] = React.useState<{filter: RuleFilterContainer; expression?: Expression;}>();
    const updateRuleFilter = React.useCallback((filter: RuleFilterContainer) => {
        setMutateFilterContainer(undefined);
        setRuleFilterContainer(filter);
    }, []);
    const bodyRule = React.useMemo((): Partial<Rule> => {
        return {
            name: rule.name,
            type: type,
            eventTypeId: eventType?.id,
            targetId: target?.id,
            skipOnConsecutivesMatches: rule.skipOnConsecutivesMatches,
            filters: parseFilterContainer(ruleFilterContainer)
        };
    }, [rule, target, eventType, type, ruleFilterContainer]);
    const {request, isLoading, error, response, reset} = useCreate<Rule>(ENTITY.RULES, bodyRule, false);
    const isCreateRuleDisabled = React.useCallback(() => !!(!bodyRule.targetId || !bodyRule.eventTypeId || !bodyRule.name || isLoading || isResponseDialogOpen), [bodyRule, isLoading, isResponseDialogOpen]);
    const filterPayload = React.useMemo(() => {
        if (type === 'realtime') return eventPayload;
        return buildEventPayloadFromGroupPayload(eventPayload, ruleGroup);
    }, [type, eventPayload, ruleGroup]);
    const eventTypeId = bodyRule.eventTypeId;
    React.useEffect(() => {
        setEventPayload(null);
        setMutateFilterContainer(undefined);
        setRuleFilterContainer([{type: 'PASSTHROW', model: 'EXPRESSION', field: 'root'}]);
    }, [eventTypeId]);

    return (
        <div
            className={styles.container}
            aria-label={`create ${type} rule page`}>
            <div className={styles.sectionSearch}>
                <div
                    aria-label='create rule section'
                    className={styles.sections}>
                        <RuleCreator
                            disabled={isLoading}
                            rule={rule}
                            updateRule={updateRule}/>
                </div>
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
            </div>
            <div
                className={styles.sections}>
                <Paper
                    className={styles.sectionsInPaper}>
                    <div
                        aria-label='manage payload creator section'>
                        <PayloadCreator
                            disabled={isLoading}
                            eventTypeId={eventType?.id}
                            payload={eventPayload}
                            setPayload={setEventPayload}/>
                    </div>
                    <Divider/>
                    <RuleGroupCreator
                        ruleTpe={type}
                        payload={eventPayload}
                        group={ruleGroup}
                        setGroup={setRuleGroup}/>
                    <Divider/>
                    {!!filterPayload && <Typography variant='caption'>Use AND, OR and EXP to create your custom filter.</Typography>}
                    <div
                        aria-label='manage filter section'>
                        <RuleFilter
                            filter={ruleFilterContainer}
                            onChange={(filter, expression) => setMutateFilterContainer({filter, expression})}
                            editMode={!isLoading && !!eventTypeId && !!filterPayload && filterPayload.length > 0}
                            disabled={isLoading}/>
                        <ConfigFilterExpression
                            filter={mutateFilterContainer?.filter}
                            expression={mutateFilterContainer?.expression}
                            updateFilter={updateRuleFilter}
                            payload={filterPayload}/>
                    </div>
                </Paper>
            </div>
            <div
                aria-label='submit rule section'
                className={styles.sections}>
                    <RuleCreatorSuccess rule={response?.data} show={true} clear={reset} setDialogState={setResponseDialogOpen}/>
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