import * as React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVertOutlined';
import Divider from '@material-ui/core/Divider';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import { Rule, RuleTypes } from '../../../services/api';
import { parseRuleFilter } from '../../../services/api/utils';
import RuleFilter from './filter';
import {useStyles} from './styles';

export const colorTypeSelector = (type: RuleTypes, styles: ReturnType<typeof useStyles>) => {
    switch(type) {
        case 'hopping': return styles.ruleCardAvatarRed;
        case 'sliding': return styles.ruleCardAvatarBlue;
        case 'tumbling': return styles.ruleCardAvatarOrange;
        case 'realtime': return styles.ruleCardAvatarPurple;
        default: return styles.ruleCardAvatarPurple;
    }
};

export const mapRuleTypeName = (type: RuleTypes = 'realtime') => {
    switch(type) {
        case 'hopping': return 'HOPPING';
        case 'sliding': return 'SLIDING';
        case 'tumbling': return 'TUMBLING';
        case 'realtime': return 'REAL TIME';
        default: return 'REAL TIME'
    }
};

export type RuleCardProp = {rule: Rule};
const RuleCard: React.FC<RuleCardProp> = ({rule}) => {
    const styles = useStyles();
    const filters = React.useMemo(
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
                aria-label='header rule card'
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
            <div
                aria-label='content card rule'
                className={styles.ruleCardContent}>
                <div
                    aria-label='eventType name card rule'
                    className={styles.ruleCardBody}>
                    <Typography className={styles.ruleCardBodyLabel}>Event Type:</Typography>
                    <Typography className={styles.ruleCardBodyName} aria-label='eventType name'>{rule.eventTypeName}</Typography>
                </div>
                {/*<Divider/>*/}
                <div
                    aria-label='target name card rule'
                    className={styles.ruleCardBody}>
                    <Typography className={styles.ruleCardBodyLabel}>Target:</Typography>
                    <Typography className={styles.ruleCardBodyName} aria-label='target name'>{rule.targetName}</Typography>
                </div>
                <Divider/>
                <div
                    className={styles.ruleCardFilters}
                    aria-label='filters card rule'>
                    <Typography className={styles.ruleCardBodyLabel}>Filters:</Typography>
                    {filters}
                </div>
                <Divider/>
                <div
                    className={styles.ruleCardStatus}
                    aria-label='status card rule'>
                        <div className={styles.ruleCardStatusDate}><Typography variant='caption'>{/*mapRuleTypeName(rule.type)*/}</Typography></div>
                        <div className={styles.ruleCardStatusOneShot}>
                            <FormGroup>
                                <FormControlLabel
                                    control={<Switch size='small' color='primary' checked={rule.skipOnConsecutivesMatches ? true : false} readOnly arial-label='skip consecutives input'/>}
                                    label='Skip Consecutives'
                                    labelPlacement='start'
                                    aria-label={`skip consecutives ${rule.skipOnConsecutivesMatches ? 'enable' : 'disable'}`}
                                    aria-readonly={true}
                                />
                            </FormGroup>
                        </div>
                </div>
            </div>
        </Card>
    );
};

export default RuleCard;
