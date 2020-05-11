import * as React from 'react';
import Typography from '@material-ui/core/Typography';

import {
    RULEFILTERCONTAINER,
    EXPRESSION,
    CONTAINER,
    isContainer,
    CONTAINER_TYPES,
    isExpressionDefault,
    isExpressionComparator,
    isExpressionLocation
} from '../../../../services/api/utils';
import {Geometry} from '../../../../services/api';
import {useStyles} from './styles';

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

export type ExpresionLocationProps = {field: string; operator: string; geometry: Geometry};
export const ExpresionLocation: React.FC<ExpresionLocationProps> = ({field, operator, geometry}) => {
    const styles = useStyles();
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
                aria-label='filter expression location min distance'
                className={styles.ruleCardFilterExpressionDistance}>
                {geometry._minDistance}
            </Typography>
            <Typography
                aria-label='filter expression location coordinates'
                className={styles.ruleCardFilterExpressionOperator}>
                {`[${geometry._geometry.coordinates[0].toFixed(2) + ', ' + geometry._geometry.coordinates[1].toFixed(2)}]`}
            </Typography>
            <Typography
                aria-label='filter expression location max distance'
                className={styles.ruleCardFilterExpressionDistance}>
                {geometry._maxDistance}
            </Typography>
        </div>
    );
};
export const FilterExpression: React.FC<{expression: EXPRESSION}> = ({expression}) => {
    const styles = useStyles();
    if (isExpressionDefault(expression)) {
        return (
            <ExpressionComparator
                field={expression.field}
                operator={OPERATORS['EQ']}
                value={expression.value}/>
        );
    }
    if (isExpressionComparator(expression)) {
        return (
            <ExpressionComparator
                field={expression.field}
                operator={OPERATORS[expression.operator]}
                value={expression.value}/>
        );
    }
    if (isExpressionLocation(expression)) {
        return (
            <ExpresionLocation
                field={expression.field}
                operator={expression.operator}
                geometry={expression.value}/>
        );
    }
    return (
        <div
            aria-label='filter expression passthrow'
            className={styles.ruleCardFilterExpressionPassthrow}>
                <Typography variant='h6'>{expression.type}</Typography>
            </div>
    );
};
export const FilterContainer: React.FC<{container: CONTAINER}> = ({container}) => {
    const styles = useStyles();
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
            {
                container.values.map(
                    (expression, idx) => {
                        return isContainer(expression) ? <FilterContainer container={expression} key={idx}/> : <FilterExpression expression={expression} key={idx}/>
                    }
                )
            }
        </div>
    );
};

export const RuleFilter: React.FC<{filter: RULEFILTERCONTAINER}> = ({filter}) => {
    return (
        <div
            aria-label='filters container'>
            {
                filter.map(
                    (container, idx) => {
                        return isContainer(container) ? <FilterContainer container={container} key={idx}/> : <FilterExpression expression={container} key={idx}/>
                    }
                )
            }
        </div>
    );
};

export default RuleFilter;