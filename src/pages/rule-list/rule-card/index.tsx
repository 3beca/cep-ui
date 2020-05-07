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

export type RuleCardProp = {rule: Rule};
const RuleCard: React.FC<RuleCardProp> = ({rule}) => {
    const styles = useStyles();
    return (
        <Card
        aria-label='element card rule'
        className={styles.ruleCard}>
            <CardHeader
                className={styles.ruleCardHeader}
                avatar={
                    <Avatar aria-label="recipe"
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
                <div>Event Type {rule.eventTypeId}</div>
                <div>Target {rule.eventTypeId}</div>
                <div
                    className={styles.ruleCardFilters}
                    aria-label='rule filter elements'>
                        {JSON.stringify(rule.filters)}
                </div>
                <Divider/>
                <div
                    className={styles.ruleCardStatus}
                    aria-label='rule status element'>
                        <div className={styles.ruleCardStatusDate}><Typography>{(new Date(rule.createdAt)).toLocaleDateString()}</Typography></div>
                        <div className={styles.ruleCardStatusOneShot}><Typography>Skip Consecutives</Typography><div className={`${styles.onShotLabel} ${rule.skipOnConsecutivesMatches ? styles.onShotLabelOn : styles.onShotLabelOff}`}/></div>
                </div>
            </div>
        </Card>
    );
};

export default RuleCard;
