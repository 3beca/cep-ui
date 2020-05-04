import * as React from 'react';
import {useStyles} from './styles';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Fab from '@material-ui/core/Fab';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';

import { Rule, RuleTypes } from '../../services/api';
import { Divider } from '@material-ui/core';
import {CreateRuleDialog} from './create-dialog';
import {useGetList, ENTITY} from '../../services/use-api';

export const colorTypeSelector = (type: RuleTypes, styles: ReturnType<typeof useStyles>) => {
    switch(type) {
        case 'hopping': return styles.ruleCardAvatarRed;
        case 'sliding': return styles.ruleCardAvatarBlue;
        case 'tumbling': return styles.ruleCardAvatarOrange;
        case 'none': return styles.ruleCardAvatarPurple;
        default: return styles.ruleCardAvatarBlue;
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
                avatar={
                    <Avatar aria-label="recipe"
                    className={`${styles.ruleCardAvatar} ${colorTypeSelector(rule.type, styles)}`}>
                        {mapRuleTypeName(rule.type).slice(0, 1).toUpperCase()}
                    </Avatar>
                }
                action={
                    <IconButton aria-label="settings">
                        <MoreVertIcon />
                    </IconButton>
                }
                title={rule.name}
                subheader={(new Date(rule.createdAt)).toLocaleString()}
            />
            <Divider/>
        </Card>
    );
};

export function SearchBar() {
    const styles = useStyles();
    return (
      <Paper component='div' className={styles.searchContainer}>
        <InputBase
          className={styles.searchInput}
          placeholder='Search rules by name'
          inputProps={{ 'aria-label': 'search rules by name' }}
        />
        <div className={styles.searchButton} aria-label='search button'>
          <SearchIcon color='primary'/>
        </div>
      </Paper>
    );
  }

export const RuleListPage: React.FC<{}> = () => {
    const styles = useStyles();
    const [isOpen, setOpen] = React.useState(false);
    const openDialog = React.useCallback(() => setOpen(true), []);
    const closeDialog = React.useCallback(() => setOpen(false), []);
    const {response} = useGetList(ENTITY.RULES, 1, 20, true);
    const results = response?.data.results;

    return (
        <div className={styles.root}>
            <div aria-label='rule search bar' className={styles.searchBar}>
                <SearchBar/>
            </div>
            <Fab
                color='primary'
                aria-label='add rule'
                className={styles.fabAddRule}
                onClick={openDialog}>
                <AddIcon />
            </Fab>
            <div className={styles.gridCards}>
                {
                    results && results.map(rule => <RuleCard rule={rule} key={rule.id}/>)
                }
            </div>
            <CreateRuleDialog isOpen={isOpen} onClose={closeDialog}/>
        </div>
    );
};

export default RuleListPage;