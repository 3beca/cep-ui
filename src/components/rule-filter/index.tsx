import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/DeleteOutline';

import {
    RULEFILTERCONTAINER,
    EXPRESSION,
    CONTAINER,
    isContainer,
    CONTAINER_TYPES,
    isExpressionDefault,
    isExpressionComparator,
    isExpressionLocation,
    createANDContainer,
    createORContainer,
    CONTAINERTYPE,
    createExpresion
} from '../../services/api/utils';
import {Geometry} from '../../services/api';
import {useStyles} from './styles';
import { NOOP } from '../../utils';

const OPERATORS = {
    EQ: '=',
    GT: '>',
    GTE: '>=',
    LT: '<',
    LTE: '<='
};
export type ExpresionComparatorProps = {field: string; operator: string; value: string|number};
export const ExpressionComparator: React.FC<ExpresionComparatorProps> = ({field, operator, value}) => {
    const styles = useStyles();
    return (
        <div
            aria-label='filter expression comparator'
            className={styles.ruleCardFilterExpression}>
            <Typography
                aria-label='filter expression field'
                className={styles.ruleCardFilterExpressionField}>
                {field}
            </Typography>
            <Typography
                aria-label='filter expression operator'
                className={styles.ruleCardFilterExpressionOperator}>
                {operator}
            </Typography>
            <Typography
                aria-label='filter expression value'
                className={styles.ruleCardFilterExpressionValue}>
                {value}
            </Typography>
        </div>
    );
};
const toKilometers = (distance: number) => distance >= 1000 ? (distance / 1000).toFixed(1) + ' kms.' : distance + ' mts.';
export type ExpresionLocationProps = {field: string; operator: string; geometry: Geometry};
export const ExpresionLocation: React.FC<ExpresionLocationProps> = ({field, operator, geometry}) => {
    const styles = useStyles();
    const maxDistance = geometry._maxDistance;
    const minDistance = geometry._minDistance;
    if (maxDistance === undefined && minDistance === undefined) return null;
    let maxDistanceText, minDistanceText;
    if (maxDistance !== undefined) {
        maxDistanceText = toKilometers(maxDistance);
    }
    if (minDistance !== undefined) {
        minDistanceText = toKilometers(minDistance);
    }
    const nearDistanceText = (minDistance && maxDistance) ?
        `is between ${minDistanceText} and ${maxDistanceText}` :
        (maxDistanceText) ?
            `is to less than ${maxDistanceText}` :
            `is to more than ${minDistanceText}`;

    return (
        <div
            aria-label='filter expression location'
            className={styles.ruleCardFilterExpression}>
            <Typography
                aria-label='filter expression field'
                className={styles.ruleCardFilterExpressionField}>
                {field}
            </Typography>
            <Typography
                aria-label={`filter expression location distance`}
                className={styles.ruleCardFilterExpressionDistance}>
                {nearDistanceText + ` from [${geometry._geometry.coordinates[0].toFixed(2) + ', ' + geometry._geometry.coordinates[1].toFixed(2)}]`}
            </Typography>
        </div>
    );
};

export const DeleteButton: React.FC<{onDelete?: () => void}> = ({onDelete}) => {
    if (!onDelete) return null;
    return (
        <IconButton
            aria-label='filter delete button'
            onClick={onDelete}>
            <DeleteIcon fontSize='small'/>
        </IconButton>
    );
};
export const hasContainer = (operator: CONTAINERTYPE, filter: RULEFILTERCONTAINER) => {
    return filter.some(container => container.type === operator);
};
export type EditButtonsProps = {
    show: boolean;
    filter: RULEFILTERCONTAINER;
    onAddContainer: (type: 'OR'|'AND') => void;
    onAddExpression: () => void;
    onDelete?: () => void;
};
export const EditButtons: React.FC<EditButtonsProps> = ({show, filter, onAddContainer, onAddExpression, onDelete}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div
            aria-label='filter action buttons'
            className={styles.ruleCardActionsButtons}>
            <IconButton
                aria-label='filter add button and'
                disabled={hasContainer('AND', filter)}
                onClick={() => onAddContainer('AND')}>
                <Typography>AND</Typography>
            </IconButton>
            <IconButton
                aria-label='filter add button or'
                disabled={hasContainer('OR', filter)}
                onClick={() => onAddContainer('OR')}>
                <Typography>OR</Typography>
            </IconButton>
            <IconButton
                aria-label='filter add button expression'
                onClick={onAddExpression}>
                <Typography>EXP</Typography>
            </IconButton>
            <DeleteButton onDelete={onDelete}/>
        </div>
    );
};

export type FilterExpressionProps = {
    expression: EXPRESSION,
    filter: RULEFILTERCONTAINER;
    parent?: CONTAINER;
    index: number;
    editMode: boolean;
    onChange:(newFilter: RULEFILTERCONTAINER, expression?: EXPRESSION) => void;
};
export const FilterExpression: React.FC<FilterExpressionProps> = ({expression, editMode, filter, parent, index, onChange}) => {
    const styles = useStyles();
    const onDeleteExpression = React.useCallback(() => {
        if(!parent) {
            const newFilter = [...filter.slice(0, index), ...filter.slice(index + 1)];
            if (newFilter.length === 0) {
                newFilter.push(createExpresion());
            }
            onChange(newFilter);
        }
        else {
            const newValues = [...parent.values.slice(0, index), ...parent.values.slice(index + 1)];
            parent.values = newValues;
            // if (newValues.length === 0) {
            //     newValues.push(createExpresion());
            // }
            onChange([...filter]);
        }
    }, [parent, filter, onChange, index]);
    if (isExpressionDefault(expression)) {
        return (
            <>
                <ExpressionComparator
                    field={expression.field}
                    operator={OPERATORS['EQ']}
                    value={expression.value}/>
                <DeleteButton onDelete={editMode ? onDeleteExpression : undefined}/>
            </>
        );
    }
    if (isExpressionComparator(expression)) {
        return (
            <>
                <ExpressionComparator
                    field={expression.field}
                    operator={OPERATORS[expression.operator]}
                    value={expression.value}/>
                <DeleteButton onDelete={editMode ? onDeleteExpression : undefined}/>
            </>
        );
    }
    if (isExpressionLocation(expression)) {
        return (
            <>
                <ExpresionLocation
                    field={expression.field}
                    operator={expression.operator}
                    geometry={expression.value}/>
                <DeleteButton onDelete={editMode ? onDeleteExpression : undefined}/>
            </>
        );
    }
    return (
        <div
            aria-label='filter expression passthrow'>
                <Typography className={styles.ruleCardFilterExpressionPassthrow}>{expression.type}</Typography>
            </div>
    );
};
export type FilterContainerProps = {
    filter: RULEFILTERCONTAINER;
    parent?: CONTAINER;
    container: CONTAINER;
    index: number;
    editMode: boolean;
    onChange:(newFilter: RULEFILTERCONTAINER, expression?: EXPRESSION) => void;
};
export const FilterContainer: React.FC<FilterContainerProps> = ({filter, parent, container, index, editMode, onChange}) => {
    const styles = useStyles();
    const onDelete = React.useCallback(() => {
        if(!parent) {
            const newFilter = [...filter.slice(0, index), ...filter.slice(index + 1)];
            if (newFilter.length === 0) {
                newFilter.push(createExpresion());
            }
            onChange(newFilter);
        }
        else {
            const newValues = [...parent.values.slice(0, index), ...parent.values.slice(index + 1)];
            parent.values = newValues;
            // if (newValues.length === 0) {
            //     newValues.push(createExpresion());
            // }
            onChange([...filter]);
        }
    }, [parent, onChange, filter, index]);
    const onAddContainer = React.useCallback((type: 'OR'|'AND') => {
        const containerWithoutPassthrow = container.values.filter(expressions => expressions.type !== 'PASSTHROW');
        const newContainer = type === 'OR' ? createORContainer() : createANDContainer();
        containerWithoutPassthrow.push(newContainer);
        container.values = containerWithoutPassthrow;
        onChange([...filter]);
    }, [filter, onChange, container]);
    const onAddExpression = React.useCallback(() => {
        const containerWithoutPassthrow = container.values.filter(expressions => expressions.type !== 'PASSTHROW');
        const newExpression = createExpresion();
        containerWithoutPassthrow.push(newExpression);
        container.values = containerWithoutPassthrow;
        onChange([...filter], newExpression);
    }, [filter, onChange, container]);
    return (
        <div
            aria-label='container expressions'
            className={styles.ruleCardFilterContainer}>
            <div
                aria-label='container expressions header'
                className={styles.ruleCardFilterContainerHeader}>
                <Typography
                    className={styles.ruleCardFilterContainerHeaderText}>
                    {container.type === CONTAINER_TYPES.OR ? 'One Of' : container.type === CONTAINER_TYPES.AND ? 'All Of' : container.field}
                </Typography>
            </div>
            <EditButtons
                    filter={container.values}
                    show={editMode}
                    onAddContainer={onAddContainer}
                    onAddExpression={onAddExpression}
                    onDelete={onDelete}/>
            {
                container.values.map(
                    (expression, idx) => {
                        return isContainer(expression) ?
                        (
                            <FilterContainer
                                index={idx}
                                parent={container}
                                container={expression}
                                key={idx}
                                editMode={editMode}
                                filter={filter}
                                onChange={onChange}/>
                        ) :
                        (
                            <FilterExpression
                                index={idx}
                                parent={container}
                                expression={expression}
                                key={idx}
                                editMode={editMode}
                                filter={filter}
                                onChange={onChange}/>
                        )
                    }
                )
            }
        </div>
    );
};

export type RuleFilterProps = {
    filter: RULEFILTERCONTAINER;
    disabled?: boolean;
    editMode?: boolean;
    onChange?:(newFilter: RULEFILTERCONTAINER, expression?: EXPRESSION) => void;
};
export const RuleFilter: React.FC<RuleFilterProps> = ({filter, disabled, editMode = false, onChange = NOOP}) => {
    const onAddContainer = React.useCallback((type: 'OR'|'AND') => {
        const filterWithoutPassthrow = filter.filter(container => container.type !== 'PASSTHROW');
        const newContainer = type === 'OR' ? createORContainer() : createANDContainer();
        filterWithoutPassthrow.push(newContainer);
        onChange(filterWithoutPassthrow);
    }, [filter, onChange]);
    const onAddExpression = React.useCallback(() => {
        const filterWithoutPassthrow = filter.filter(container => container.type !== 'PASSTHROW');
        const newExpression = createExpresion();
        onChange([...filterWithoutPassthrow, newExpression], newExpression);
    }, [filter, onChange]);
    return (
        <div
            aria-label='filters container'>
            <EditButtons
                show={editMode && !disabled}
                filter={filter}
                onAddContainer={onAddContainer}
                onAddExpression={onAddExpression}/>
            {
                filter.map(
                    (container, idx) => {
                        return isContainer(container) ?
                        (
                            <FilterContainer
                                index={idx}
                                container={container}
                                key={idx}
                                filter={filter}
                                editMode={editMode}
                                onChange={onChange}/>
                        ) :
                        (
                            <FilterExpression
                                index={idx}
                                expression={container}
                                key={idx}
                                filter={filter}
                                editMode={editMode}
                                onChange={onChange}/>
                        )
                    }
                )
            }
        </div>
    );
};

export default RuleFilter;