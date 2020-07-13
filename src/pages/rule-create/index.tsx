import * as React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import { useParams, Link } from 'react-router-dom';
import {EventTypeSelector} from './event-type-select';
import {TargetSelector} from './target-select';
import {RuleCreator} from './rule-creator';
import {PayloadCreator} from './payload-creator';
import { EventType, Target, Rule, RuleTypes, Geometry } from '../../services/api';
import { useCreate, ENTITY } from '../../services/api/use-api';
import {useStyles} from './styles';
import {
    Payload,
    PayloadField,
    RuleFilterContainer,
    Expression,
    EPassthrow,
    EComparator,
    EDefault,
    isExpressionPassthrow,
    isExpressionLocation,
    isExpressionComparator,
    EComparatorLocation
} from '../../services/api/utils';
import RuleFilter from '../../components/rule-filter';
import {parseFilterContainer} from '../../services/api/utils';

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

export type FieldSelectorProps = {
    payload: Payload;
    selected?: PayloadField;
    onSelected: (field: PayloadField|undefined) => void;
};
export const FieldSelector: React.FC<FieldSelectorProps> = ({payload, selected, onSelected}) => {
    const styles = useStyles();
    return (
        <Select
            className={styles.fieldSelector}
            value={selected ? selected.name : ''}
            onChange={(ev) => onSelected(payload.find(field => field.name === ev.target.value))}
            inputProps={{
                'aria-label': 'config filter field selector',
            }}>
            {
                payload.map(
                    (field: PayloadField) => (
                        <MenuItem
                            aria-label='config filter options'
                            key={field.name}
                            value={field.name}>
                            {field.name}
                        </MenuItem>
                    )
                )
            }
        </Select>
    );
};

export type FieldOperatorProps = {
    operator?: 'EQ'|'GT'|'GTE'|'LT'|'LTE';
    setOperator: (operator: 'EQ'|'GT'|'GTE'|'LT'|'LTE') => void;
};
export const FieldOperator: React.FC<FieldOperatorProps> = ({operator, setOperator}) => {
    return (
        <Select
            value={operator}
            onChange={(ev) => ev.target.value && setOperator(ev.target.value as 'EQ'|'GT'|'GTE'|'LT'|'LTE')}
            inputProps={{
                'aria-label': 'config filter operator selector'
            }}>
            {
                ['EQ', 'GT', 'GTE', 'LT', 'LTE'].map(
                    (operator, index) => (
                        <MenuItem
                            aria-label='config filter operators'
                            key={index}
                            value={operator}>
                            <Typography>{operator}</Typography>
                        </MenuItem>
                    )
                )
            }
        </Select>
    );
};
export type FieldValueProps = {
    type?: string|number;
    value?: string|number;
    setValue: (value: number|string) => void;
};
export const FieldValue: React.FC<FieldValueProps> = ({type, value, setValue}) => {
    return (
        <div>
            <TextField
                type={type === 'number' ? 'number' : 'text'}
                value={value || ''}
                onChange={(ev) => setValue(type === 'number' ? Number(ev.target.value) : ev.target.value)}
                inputProps={{
                    'aria-label': 'config filter value'
                }}/>
        </div>
    );
};

export type FieldExpressionComparatorProps = {
    field: PayloadField;
    expression: EComparator|EDefault|EPassthrow;
    updateExpression: (comaprator: EComparator|EDefault) => void;
};
export const FieldExpressionComparator: React.FC<FieldExpressionComparatorProps> = ({field, expression, updateExpression}) => {
    const operator = (expression as EComparator).operator || '';
    const value = (expression as EComparator).value || '';
    const updateValue = (value: number|string) => {
        if (isExpressionPassthrow(expression)) updateExpression({field: field.name, model: 'EXPRESSION', type: 'DEFAULT', value: value});
        else updateExpression({...expression, value});
    };
    const updateOperator = (operator: 'EQ'|'GT'|'GTE'|'LT'|'LTE') => {
        if (!isExpressionComparator(expression)) updateExpression({field: field.name, model: 'EXPRESSION', type: 'COMPARATOR', value: value, operator});
        else updateExpression({...expression, operator});
    };
    return (
        <div>
            <FieldOperator operator={operator} setOperator={updateOperator}/>
            <FieldValue type={field.type} value={value} setValue={updateValue}/>
        </div>
    );
};

export const buildLocationExpression = (name: string, lng = 0, lat = 0): EComparatorLocation => (
    {
        type: 'GEO',
        model: 'EXPRESSION',
        field: name,
        operator: 'NEAR',
        value: {
            _geometry: {type: 'Point', coordinates: [lng, lat]}
        }
    }
);
export type FieldExpressionLocationProps = {
    field: PayloadField;
    expression: EComparatorLocation;
    updateExpression: (comaprator: EComparatorLocation) => void;
};
export const FieldExpressionLocation: React.FC<FieldExpressionLocationProps> = ({field, expression, updateExpression}) => {
    const [location, setLocation] = React.useState<Geometry>(expression.value);
    const updateLocation = React.useCallback((coords: Geometry) => {
        const newLocation =  {...expression, value: coords};
        // console.log('Location', coords, newLocation);
        setLocation(coords);
        updateExpression(newLocation);
    }, [expression, updateExpression]);
    return (
        <div>
            <div>
                <div><Typography>Coordinates</Typography></div>
                <div>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location longitude'
                        }}
                        value={location._geometry.coordinates[0] || ''}
                        onChange={(ev) => updateLocation({...location, _geometry: {type: 'Point', coordinates: [Number(ev.target.value), location._geometry.coordinates[1]]}})}
                        type='number'/>
                </div>
                <div>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location latitude'
                        }}
                        value={location._geometry.coordinates[1] || ''}
                        onChange={(ev) => updateLocation({...location, _geometry: {type: 'Point', coordinates: [location._geometry.coordinates[0], Number(ev.target.value)]}})}
                        type='number'/>
                </div>
            </div>
            <div>
                <div><Typography>Min. Distance:</Typography></div>
                <div>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location min distance'
                        }}
                        value={location._minDistance || ''}
                        onChange={(ev) => updateLocation({...location, _minDistance: Number(ev.target.value)})}
                        type='number'/>
                </div>
            </div>
            <div>
                <div><Typography>Max. Distance:</Typography></div>
                <div>
                    <TextField
                        inputProps={{
                            'aria-label': 'config filter location max distance'
                        }}
                        value={location._maxDistance || ''}
                        onChange={(ev) => updateLocation({...location, _maxDistance: Number(ev.target.value)})}
                        type='number'/>
                </div>
            </div>
        </div>
    );
};
export type FieldExpressionProps = {
    field?: PayloadField;
    expression: Expression;
    updateExpression: (comaprator: Expression) => void;
};
export const FieldExpression: React.FC<FieldExpressionProps> = ({field, expression, updateExpression}) => {
    if (!field) return null;
    if (field.type === 'location') {
        return (
            <FieldExpressionLocation
                field={field}
                expression={isExpressionLocation(expression) ? expression : buildLocationExpression(field.name)}
                updateExpression={updateExpression}/>
        );
    }
    return (
        <FieldExpressionComparator
            field={field}
            expression={isExpressionLocation(expression) ? {type: 'PASSTHROW', model: 'EXPRESSION', field: field.name} : expression}
            updateExpression={updateExpression}/>
    );
};

export type ConfigFilterDialogExpressionProps = {
    filter: RuleFilterContainer;
    expression: Expression;
    updateFilter: (filter: RuleFilterContainer) => void;
    payload: Payload;
};
export const ConfigFilterDialogExpression: React.FC<ConfigFilterDialogExpressionProps> = ({filter, expression, updateFilter, payload}) => {
    const [selected, setSelected] = React.useState<PayloadField|undefined>(payload.find(field => expression.field === field.name));
    const [comparator, setComparator] = React.useState<Expression>(expression);
    const updateExpression = React.useCallback(
        () => {
            expression.field = comparator.field;
            expression.type = comparator.type;
            switch(comparator.type) {
                case 'DEFAULT': {
                    const newExp = expression as EDefault;
                    newExp.value = comparator.value;
                    newExp.field = comparator.field;
                    break;
                }
                case 'COMPARATOR': {
                    const newExp = expression as EComparator;
                    newExp.value = comparator.value;
                    newExp.field = comparator.field;
                    newExp.operator = comparator.operator;
                    break;
                }
                case 'GEO': {
                    const newExp = expression as EComparatorLocation;
                    newExp.value = comparator.value;
                    newExp.field = comparator.field;
                    newExp.operator = comparator.operator;
                    break;
                }
            }
            updateFilter(filter);
        }, [filter, comparator, expression, updateFilter]
    );
    return (
        <Dialog
            fullWidth={true}
            open={true}
            onClose={() => updateFilter(filter)}
            aria-label='config filter dialog'>
            <DialogTitle>Configure filter</DialogTitle>
            <DialogContent>
                <div>
                    <FieldSelector payload={payload} selected={selected} onSelected={setSelected}/>
                    <FieldExpression
                        field={selected}
                        expression={comparator}
                        updateExpression={setComparator}/>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={!selected || !comparator}
                    onClick={updateExpression}
                    aria-label='config filter button save'>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export type ConfigFilterExpressionProps = {
    filter?: RuleFilterContainer;
    expression?: Expression;
    updateFilter: (filter: RuleFilterContainer) => void;
    payload?: Payload|null;
};
export const ConfigFilterExpression: React.FC<ConfigFilterExpressionProps> = ({filter, expression, updateFilter, payload}) => {
    React.useEffect(
        () => {
            if(!expression && !!filter) updateFilter(filter);
        }, [updateFilter, filter, expression]
    );
    if (!expression || !filter || !payload) {
        return null;
    }
    return (
        <ConfigFilterDialogExpression
            filter={filter}
            expression={expression}
            updateFilter={updateFilter}
            payload={payload}
        />
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
    const [payload, setPayload] = React.useState<Payload|null>(null);
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
    const eventTypeId = bodyRule.eventTypeId;
    React.useEffect(() => {
        setPayload(null);
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
                            payload={payload}
                            setPayload={setPayload}/>
                    </div>
                    {!!payload && <Typography variant='caption'>Use AND, OR and EXP to create your custom filter.</Typography>}
                    <Divider/>
                    <div
                        aria-label='manage filter section'>
                        <RuleFilter
                            filter={ruleFilterContainer}
                            onChange={(filter, expression) => setMutateFilterContainer({filter, expression})}
                            editMode={!isLoading && !!eventTypeId && !!payload && payload.length > 0}
                            disabled={isLoading}/>
                        <ConfigFilterExpression
                            filter={mutateFilterContainer?.filter}
                            expression={mutateFilterContainer?.expression}
                            updateFilter={updateRuleFilter}
                            payload={payload}/>
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