import * as React from 'react';
//import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import AddIcon from '@material-ui/icons/AddOutlined';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
import IconDialog, {useIconDialog} from '../icon-dialog';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { EventPayload } from '../event-payload-creator/models';

import {useStyles} from './styles';
import { RuleTypes } from '../../services/api';
import {
    RuleGroupField,
    RuleGroupPayload,
    RuleGroupOperator
} from './models';
import {syncEventPayloadAndGroupPayload} from './utils';

export const OperatosNoPayloadList = [
    ['_sum', 'Summation']
];
export const OperatorList = [
    ['_max', 'Max. Value'],
    ['_min', 'Min. Value'],
    ['_avg', 'Average'],
    ['_sum', 'Summation'],
    ['_stdDevPop', 'Population Std. Dev.'],
    ['_stdDevSamp', 'Sample Std. Dev.']
];
export type OperatorSelectorProps = {
    displayOperators: boolean;
    operator?: RuleGroupOperator;
    setOperator: (operator: RuleGroupOperator) => void;
    disabled?: boolean;
};
export const OperatorSelector: React.FC<OperatorSelectorProps> = ({operator, setOperator, displayOperators, disabled}) => {
    const [open, setOpen] = React.useState(false);
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setOperator(event.target.value as RuleGroupOperator);
    };
    const handleClose = () => {
      setOpen(false);
    };
    const handleOpen = () => {
      setOpen(true);
    };
    const operators = displayOperators ? OperatorList : OperatosNoPayloadList;
    return (
         <Select
            inputProps={
                {'aria-label': 'rule group creator addfield dialog operators'}
            }
            open={open}
            onClose={handleClose}
            onOpen={handleOpen}
            value={operator || ''}
            onChange={handleChange}
            disabled={disabled}>
            {
                operators.map((operatorItem) => (
                    <MenuItem
                        key={operatorItem[0]}
                        aria-label={`rule group creator addfield dialog select operator ${operatorItem[0]}`}
                        value={operatorItem[0]}>
                        {operatorItem[1]}
                    </MenuItem>
                ))
            }
       </Select>
    );
};

export const isValidPayload = (payload: EventPayload|null|undefined) => Array.isArray(payload) ? payload.filter(field => field.type === 'number').length > 0 : false;
export type TargetSelectorFromPayloadProps = {
    payload?: EventPayload|null;
    target?: string|number;
    setTarget: (operator: string) => void;
    disabled?: boolean;
};
export const TargetSelectorFromPayload: React.FC<TargetSelectorFromPayloadProps> = ({payload, target, setTarget, disabled}) => {
    const styles = useStyles();
    const [open, setOpen] = React.useState(false);
    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        setTarget(event.target.value as string);
    };
    const handleClose = () => {
      setOpen(false);
    };
    const handleOpen = () => {
      setOpen(true);
    };

    if (!payload || !isValidPayload(payload)) return null;
    return (
        <>
            <Typography className={styles.addfieldTarget} variant='caption'>Select a field:</Typography>
            <Select
                inputProps={
                    {'aria-label': 'rule group creator addfield dialog selector targets from payload'}
                }
                open={open}
                onClose={handleClose}
                onOpen={handleOpen}
                value={typeof target === 'string' ? target : ''}
                onChange={handleChange}
                disabled={disabled}>
                {
                    payload.filter(field => field.type === 'number').map((field) => (
                        <MenuItem
                            key={field.name}
                            aria-label={`rule group creator addfield dialog select target ${field.name}`}
                            value={field.name}>
                            {field.name}
                        </MenuItem>
                    ))
                }
        </Select>
       </>
    );
};

export type TargetSelectorProps = {
    payload?: EventPayload|null;
    operator?: RuleGroupOperator;
    target?: string|number;
    setTarget: (operator: string|number|undefined) => void;
    disabled?: boolean;
};
export const TargetSelector: React.FC<TargetSelectorProps> = ({payload, operator, target, setTarget, disabled}) => {
    return (
         <div
            aria-label='rule group creator addfield dialog targets'>
             <TargetSelectorFromPayload
                payload={payload}
                target={target}
                setTarget={setTarget}
                disabled={disabled}/>
            <TargetValue
                target={target}
                setTarget={setTarget}
                operator={operator}/>
         </div>
    );
};

export type TargetValueProps = {
    operator?: RuleGroupOperator;
    target?: string|number;
    setTarget: (value: number|undefined) => void;
};
export const TargetValue: React.FC<TargetValueProps> = ({operator, target, setTarget}) => {
    const [hasError, setHasError] = React.useState(false);
    const validateTarget = (ev: React.ChangeEvent<HTMLInputElement>) => {
        if (ev.target.value === '0') {
            //setTarget(undefined);
            setHasError(true);
            return;
        }
        const evValue = Number(ev.target.value);
        if (evValue === parseInt(evValue + '', 10)) {
            setTarget(evValue);
            setHasError(false);
            return;
        }
        setHasError(true);
    };
    const value = React.useMemo(() => target === parseInt(target + '', 10) ? target : undefined, [target]);
    if (operator !== '_sum') return null;
    return (
        <TextField
            inputProps={
                {'aria-label': 'rule group creator addfield dialog input value'}
            }
            value={value || ''}
            onChange={validateTarget}
            label=''
            error={hasError}
            helperText={hasError && <span aria-label='rule group creator addfield dialog input error value'>Only positive integers</span>}
        />
    );
};

export type GroupAddFieldProps = {
    payload?: EventPayload|null;
    updateGroupPayload: (field: RuleGroupField) => void;
    disabled?: boolean;
};
export const GroupAddField: React.FC<GroupAddFieldProps> = ({disabled, updateGroupPayload, payload}) => {
    const styles = useStyles();
    const closeDialog = useIconDialog();
    const [name, setName] = React.useState('');
    const [operator, setOperator] = React.useState<RuleGroupOperator>();
    const [field, setField] = React.useState<string|number>();
    const isDisabled = !name || !operator || !field;
    const addField = React.useCallback(
        () => {
            const groupField = {name, operator, field} as RuleGroupField;
            updateGroupPayload(groupField);
            setName('');
            setOperator(undefined);
            setField('');
        }, [name, operator, field, updateGroupPayload]
    );
    return (
        <>
            <DialogTitle id='groupcreator-addfield-icon-dialog-title'>
                Add new field
            </DialogTitle>
            <DialogContent
                aria-label='rule group creator addfield dialog container'
                dividers={true}
                id='icon-dialog-rule-group-content'
                className={styles.addFieldDialogContent}>
                <div className={styles.addFieldForm}>
                    <div className={styles.addFieldName}>
                        <TextField
                            value={name}
                            onChange={(ev) => setName(ev.target.value)}
                            inputProps={
                                {'aria-label': 'rule group creator addfield dialog name'}
                            }
                            placeholder='Filed name'/>
                    </div>
                    <div className={styles.addFieldOperator}>
                        <Typography className={styles.addfieldTarget} variant='caption'>Select an Operator:</Typography>
                        <OperatorSelector
                            displayOperators={isValidPayload(payload)}
                            operator={operator}
                            setOperator={setOperator}
                            disabled={disabled}/>
                    </div>
                    <div className={styles.addfieldTarget}>
                        <TargetSelector
                            disabled={disabled || !operator}
                            payload={payload}
                            operator={operator}
                            target={field}
                            setTarget={setField}/>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    aria-label='rule group creator addfield dialog close'
                    onClick={closeDialog}>
                        Close
                </Button>
                <Button
                    onClick={addField}
                    disabled={isDisabled}
                    className={styles.selectButton}
                    aria-label='rule group creator addfield dialog add'>
                        Add
                </Button>
            </DialogActions>
        </>
    );
};



export type GroupFieldViewDeleteButtonProps= {
    removeGroupField?: () => void;
    disabled?: boolean;
};
export const GroupFieldViewDeleteButton: React.FC<GroupFieldViewDeleteButtonProps> = ({removeGroupField, disabled}) => {
    return (
        <IconButton
            aria-label='rule group creator schema field button remove'
            onClick={removeGroupField}
            disabled={disabled}>
                <DeleteIcon/>
        </IconButton>
    );
};

export type GroupFieldViewProps = {
    groupField: RuleGroupField;
    removeGroupField?: () => void;
    disabled?: boolean;
};
export const GroupFieldView: React.FC<GroupFieldViewProps> = ({groupField, removeGroupField, disabled}) => {
    const styles = useStyles();
    return (
        <div
            aria-label='rule group creator payload schema field'
            className={styles.paloadFieldView}>
            <Typography className={styles.schemaGroupFieldViewText}>{groupField.name}</Typography>
            <GroupFieldViewDeleteButton removeGroupField={removeGroupField} disabled={disabled}/>
        </div>
    );
};

export type GroupSchemaFields = {
    disabled?: boolean;
    group: RuleGroupPayload;
    setGroup: (group?: RuleGroupPayload) => void;
};
export const GropupSchemaFields: React.FC<GroupSchemaFields> = ({disabled, group, setGroup}) => {

    const removeGroupField = React.useCallback(
        (index: number) => {
            const beforeIndex = group.slice(0, index);
            const afterIndex = group.slice(index + 1);
            setGroup([...beforeIndex, ...afterIndex]);
        },
        [setGroup, group]
    );
    return (
        <div aria-label='rule group creator payload schema container'>
            {
                group.map(
                    (payloadField, idx) => (
                        <div key={idx}>
                            <GroupFieldView
                                disabled={disabled}
                                groupField={payloadField}
                                removeGroupField={() => {removeGroupField(idx)}}/>
                        </div>
                    )
                )
            }
        </div>
    );
};
export type GroupSchema = {
    disabled?: boolean;
    group?: RuleGroupPayload;
    setGroup: (group?: RuleGroupPayload) => void;
};
export const GroupSchema: React.FC<GroupSchema> = ({disabled, group, setGroup}) => {
    const styles = useStyles();
    if (!group) {
        return (
            <div
                aria-label='rule group creator info group payload message'
                className={styles.info}>
                <Typography className={styles.infoText}>A Group is required in order to create a Rule, please use add button (+).</Typography>
            </div>
        );
    }
    return (<GropupSchemaFields disabled={disabled} group={group} setGroup={setGroup}/>);
};

export type RuleGroupCreatorProps = {
    ruleTpe: RuleTypes;
    payload: EventPayload|null;
    group?: RuleGroupPayload;
    setGroup: (group?: RuleGroupPayload) => void;
    disabled?: boolean;
};
export const RuleGroupCreator: React.FC<RuleGroupCreatorProps> = ({
    ruleTpe,
    payload,
    group,
    setGroup,
    disabled = false
}) => {
    const styles = useStyles();
    React.useEffect(() => {
        if (ruleTpe !== 'realtime') {
            const [needUpdate, newGroup] = syncEventPayloadAndGroupPayload(payload, group);
            if (needUpdate) setGroup(newGroup);
        }
    }, [ruleTpe, payload, group, setGroup]);
    if (ruleTpe === 'realtime') return null;
    return (
        <div className={styles.container} aria-label='rule group creator container'>
            <div className={styles.groupCreatorHeader}>
                <Typography variant='caption' className={styles.groupCreatorHeaderTitle}>Windowing Group</Typography>
                <IconDialog aria-label='rule group creator addfield button open dialog' show={true} disabled={disabled} icon={<AddIcon aria-label='rule group creator addfield icon'/>}>
                    <GroupAddField
                        disabled={disabled}
                        payload={payload}
                        updateGroupPayload={(newPayloadField: RuleGroupField) => {
                            const currentGroup = !group ? [] : group;
                            const sameFieldName = currentGroup.find(field => field.name === newPayloadField.name);
                            if (sameFieldName) {
                                sameFieldName.field = newPayloadField.field;
                                sameFieldName.operator = newPayloadField.operator;
                                setGroup([...currentGroup]);
                            }
                            else {
                                setGroup([...currentGroup, newPayloadField]);
                            }
                        }}/>
                </IconDialog>
            </div>
            <GroupSchema
                disabled={disabled}
                group={group}
                setGroup={setGroup}/>
        </div>
    );
};

export default RuleGroupCreator;
