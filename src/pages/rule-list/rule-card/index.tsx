import * as React from 'react';
import { Link } from 'react-router-dom';
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
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import DetailsIcon from '@material-ui/icons/DetailsOutlined';
import CloneIcon from '@material-ui/icons/FileCopyOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutline';

import { Rule, RuleTypes } from '../../../services/api';
import { parseRuleFilter } from '../../../services/api/utils';
import RuleFilter from '../../../components/rule-filter';
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

export const RuleCardMenu: React.FC<{rule: Rule}> = ({rule}) => {
    const [anchorElement, setAnchorElement] = React.useState<HTMLElement|null>(null);
    const open = Boolean(anchorElement);
    const openContextMenu = React.useCallback((event: React.MouseEvent<HTMLElement>) => setAnchorElement(event.currentTarget), []);
    const closeContextMenu = React.useCallback(() => setAnchorElement(null), []);

    return (
    <>
        <IconButton aria-label='settings card rule' onClick={openContextMenu}>
            <MoreVertIcon/>
        </IconButton>
        <Menu
            aria-label={`setting dialog card rule ${open ? 'visible' : 'hidden'}`}
            keepMounted={true}
            open={open}
            anchorEl={anchorElement}
            onClose={closeContextMenu}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}>
            <MenuItem onClick={closeContextMenu} component={Link} to={`/rules/details/${rule.id}`} aria-label='setting dialog details card rule'>
                <ListItemIcon>
                    <DetailsIcon fontSize='small'/>
                </ListItemIcon>
                <Typography variant='inherit'>Details</Typography>
            </MenuItem>
            <MenuItem>
                <ListItemIcon>
                    <CloneIcon fontSize='small' />
                </ListItemIcon>
                <Typography variant='inherit'>Clone</Typography>
            </MenuItem>
            <MenuItem>
                <ListItemIcon>
                    <DeleteIcon fontSize='small' />
                </ListItemIcon>
                <Typography variant='inherit'>Delete</Typography>
            </MenuItem>
        </Menu>
    </>
    );
  }

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
                aria-label='header card rule'
                className={styles.ruleCardHeader}
                avatar={
                    <Avatar
                        aria-label='avatar icon'
                        className={`${styles.ruleCardAvatar} ${colorTypeSelector(rule.type, styles)}`}>
                        {mapRuleTypeName(rule.type).slice(0, 1).toUpperCase()}
                    </Avatar>
                }
                action={
                    <RuleCardMenu rule={rule}/>
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
