import * as React from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import { useParams, Link } from 'react-router-dom';
import RuleFilter from '../../components/rule-filter';
import EventTypeSelector from './event-type-select';
import TargetSelector from './target-select';
import RuleCreator, { RuleHeader } from './rule-creator';
import PayloadCreator from '../../components/event-payload-creator';
import { EventPayload } from '../../components/event-payload-creator/models';
import RuleGroupCreator from '../../components/rule-group-creator';
import RuleWindowSize from '../../components/rule-windowsize';
import {
    buildEventPayloadFromGroupPayload,
    parseRuleGroupPayloadToRuleGroup
} from '../../components/rule-group-creator/utils';
import ConfigFilterExpression from '../../components/config-filter-expression';
import { EventType, Target, Rule, RuleTypes, WindowingSize } from '../../services/api';
import { useCreate, ENTITY } from '../../services/api-provider/use-api';
import {useStyles} from './styles';
import {
    parseFilterContainer,
    synchronizeRuleFilterContainerAndEventPayload
} from '../../components/rule-filter/utils';
import {
    RuleFilterContainer,
    Expression,
    DEFAULT_RULEFILTERCONTAINER
} from '../../components/rule-filter/models';
import { RuleGroupPayload } from '../../components/rule-group-creator/models';
import { isRuleTypeRealtime } from '../../services/api/models';

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

const initialRuleState: RuleHeader = {
    skipOnConsecutivesMatches: false,
    name: ''
};
export const RuleCreatePage: React.FC<{}> = () => {
    const styles = useStyles();
    const { type: ruleType} = useParams<{type: RuleTypes}>();
    const type: RuleTypes = ruleType ? ruleType : 'realtime';
    const [eventType, setEventType] = React.useState<EventType|null>(null);
    const [target, setTarget] = React.useState<Target|null>(null);
    const [eventPayload, setEventPayload] = React.useState<EventPayload|null>(null);
    const [ruleGroupPayload, setRuleGroupPayload] = React.useState<RuleGroupPayload>();
    const [windowSize, setWindowSize] = React.useState<WindowingSize>();
    const [ruleHeader, updateRuleHeader] = React.useReducer((state: RuleHeader, update: Partial<RuleHeader>) => ({...state, ...update}), initialRuleState);
    const [isResponseDialogOpen, setResponseDialogOpen] = React.useState(false);
    const [ruleFilterContainer, setRuleFilterContainer] = React.useState<RuleFilterContainer>(DEFAULT_RULEFILTERCONTAINER);
    const [mutateFilterContainer, setMutateFilterContainer] = React.useState<{filter: RuleFilterContainer; expression?: Expression;}>();
    const updateRuleFilter = React.useCallback((filter: RuleFilterContainer) => {
        setMutateFilterContainer(undefined);
        setRuleFilterContainer(filter);
    }, []);
    const filterPayload = React.useMemo(() => {
        if (type === 'realtime') return eventPayload;
        return buildEventPayloadFromGroupPayload(ruleGroupPayload);
    }, [type, eventPayload, ruleGroupPayload]);
    React.useEffect(() => {
        setRuleFilterContainer(ruleFilterContainer => synchronizeRuleFilterContainerAndEventPayload(filterPayload, ruleFilterContainer));
    }, [filterPayload]);

    // Request create Rule
    const bodyRule = React.useMemo((): Partial<Rule> => {
        const newRule: Rule = {
            name: ruleHeader.name,
            type: type,
            eventTypeId: eventType?.id || '',
            targetId: target?.id || '',
            skipOnConsecutivesMatches: ruleHeader.skipOnConsecutivesMatches,
            filters: parseFilterContainer(ruleFilterContainer),
        } as Rule;
        if (!isRuleTypeRealtime(newRule)) {
            const group = parseRuleGroupPayloadToRuleGroup(ruleGroupPayload);
            group && (newRule.group = group);
            windowSize && (newRule.windowSize = windowSize);
        }
        return newRule;
    }, [ruleHeader, target, eventType, type, ruleFilterContainer, ruleGroupPayload, windowSize]);
    const {request, isLoading, error, response, reset} = useCreate<Rule>(ENTITY.RULES, bodyRule, false);
    const isCreateRuleDisabled = React.useCallback(() => {
        if (!bodyRule.targetId || !bodyRule.eventTypeId || !bodyRule.name || isLoading || isResponseDialogOpen) return true;
        if (type !== 'realtime' && (!ruleGroupPayload || !windowSize)) return true;
        return false;
    }, [bodyRule, isLoading, isResponseDialogOpen, ruleGroupPayload, windowSize, type]);

    // Clear Rule when change EventTypeId
    const eventTypeId = bodyRule.eventTypeId;
    React.useEffect(() => {
        setEventPayload(null);
        setMutateFilterContainer(undefined);
        setRuleFilterContainer(DEFAULT_RULEFILTERCONTAINER);
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
                            ruleHeader={ruleHeader}
                            updateRuleHeader={updateRuleHeader}/>
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
                        disabled={isLoading}
                        ruleTpe={type}
                        payload={eventPayload}
                        group={ruleGroupPayload}
                        setGroup={setRuleGroupPayload}/>
                    <RuleWindowSize
                        disabled={isLoading}
                        type={type}
                        windowSize={windowSize}
                        updateWindowSize={setWindowSize}
                    />
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