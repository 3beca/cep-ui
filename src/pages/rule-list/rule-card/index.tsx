import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertOutlined';
import Divider from '@material-ui/core/Divider';
import { Rule, RuleTypes } from '../../../services/api';

import {useStyles} from './styles';
import {
    parseRuleFilter,
    RULEFILTERCONTAINER,
    EXPRESSION,
    CONTAINER,
    isContainer,
    CONTAINER_TYPES,
    isExpressionPassthrow,
    isExpressionDefault,
    isExpressionComparator,
    isExpressionLocation
} from '../../../services/api/utils';

export const colorTypeSelector = (type: RuleTypes, styles: ReturnType<typeof useStyles>) => {
    switch(type) {
        case 'hopping': return styles.ruleCardAvatarRed;
        case 'sliding': return styles.ruleCardAvatarBlue;
        case 'tumbling': return styles.ruleCardAvatarOrange;
        case 'none': return styles.ruleCardAvatarPurple;
        default: return styles.ruleCardAvatarPurple;
    }
};

export const mapRuleTypeName = (type: RuleTypes = 'none') => {
    switch(type) {
        case 'hopping': return 'HOPPING';
        case 'sliding': return 'SLIDING';
        case 'tumbling': return 'TUMBLING';
        case 'none': return 'REAL TIME';
        default: return 'REAL TIME'
    }
};

const OPERATORS = {
    EQ: '=',
    GT: '>',
    GTE: '>=',
    LT: '<',
    LTE: '<='
};
export const FilterExpression: React.FC<{expression: EXPRESSION}> = ({expression}) => {
    const styles = useStyles();
    const {field, type} = expression;
    if (isExpressionPassthrow(expression)) {
        return (<div className={styles.ruleCardFilterExpressionPassthrow}><Typography variant='h6'>{type}</Typography></div>);
    }
    if (isExpressionDefault(expression)) {
        return (
            <div className={styles.ruleCardFilterExpression}>
                <Typography className={styles.ruleCardFilterExpressionField}>{field}</Typography>
                <Typography className={styles.ruleCardFilterExpressionOperator}>=</Typography>
                <Typography className={styles.ruleCardFilterExpressionValue}>{expression.value}</Typography>
            </div>
        );
    }
    if (isExpressionComparator(expression)) {
        return (
            <div className={styles.ruleCardFilterExpression}>
                <Typography className={styles.ruleCardFilterExpressionField}>{field}</Typography>
                <Typography className={styles.ruleCardFilterExpressionOperator}>{OPERATORS[expression.operator]}</Typography>
                <Typography className={styles.ruleCardFilterExpressionValue}>{expression.value}</Typography>
            </div>
        );
    }
    if (isExpressionLocation(expression)) {
        return (
            <div className={styles.ruleCardFilterExpression}>
                <Typography className={styles.ruleCardFilterExpressionField}>{field}</Typography>
                <Typography className={styles.ruleCardFilterExpressionOperator}>{'<>'}</Typography>
        <Typography className={styles.ruleCardFilterExpressionValue}>[{expression.value._geometry.coordinates[0]}{' , '}{expression.value._geometry.coordinates[1]}]</Typography>
            </div>
        );
    }
    return (
        <div className={styles.ruleCardFilterExpression}>* {field + ': ' + type}</div>
    );
};
export const FilterContainer: React.FC<{container: CONTAINER}> = ({container}) => {
    const styles = useStyles();
    return (
        <div className={styles.ruleCardFilterContainer}>
            <div className={styles.ruleCardFilterContainerHeader}>
                <Typography className={styles.ruleCardFilterContainerHeaderText}>
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
        <div>
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

export type RuleCardProp = {rule: Rule};
const RuleCard: React.FC<RuleCardProp> = ({rule}) => {
    const styles = useStyles();
    const filter = React.useMemo(
        () => {
            const container = parseRuleFilter(rule.filters);
            return <RuleFilter filter={container}/>
        }, [rule.filters]
    );
    return (
        <Card
        aria-label='element card rule'
        className={styles.ruleCard}>
            <CardHeader
                className={styles.ruleCardHeader}
                avatar={
                    <Avatar
                        aria-label='avatar icon'
                        className={`${styles.ruleCardAvatar} ${colorTypeSelector(rule.type, styles)}`}>
                        {mapRuleTypeName(rule.type).slice(0, 1).toUpperCase()}
                    </Avatar>
                }
                action={
                    <IconButton aria-label="settings">
                        <MoreVertIcon/>
                    </IconButton>
                }
                title={rule.name}
                subheader={(new Date(rule.createdAt)).toLocaleString()}
            />
            <Divider/>
            <div className={styles.ruleCardContent}>
                <div className={styles.ruleCardBody}>
                    <Typography className={styles.ruleCardBodyLabel}>Event Type:</Typography>
                    <Typography className={styles.ruleCardBodyName} aria-label='eventType name'>{rule.eventTypeName}</Typography>
                </div>
                <Divider/>
                <div className={styles.ruleCardBody}>
                    <Typography className={styles.ruleCardBodyLabel}>Target:</Typography>
                    <Typography className={styles.ruleCardBodyName} aria-label='target name'>{rule.targetName}</Typography>
                </div>
                <Divider/>
                <div
                    className={styles.ruleCardFilters}
                    aria-label='rule filter elements'>
                    <Typography className={styles.ruleCardBodyLabel}>Filters:</Typography>
                        {filter}
                </div>
                <Divider/>
                <div
                    className={styles.ruleCardStatus}
                    aria-label='rule status element'>
                        <div className={styles.ruleCardStatusDate}><Typography>{''}</Typography></div>
                        <div className={styles.ruleCardStatusOneShot}><Typography>Skip Consecutives</Typography><div className={`${styles.onShotLabel} ${rule.skipOnConsecutivesMatches ? styles.onShotLabelOn : styles.onShotLabelOff}`}/></div>
                </div>
            </div>
        </Card>
    );
};

export default RuleCard;
