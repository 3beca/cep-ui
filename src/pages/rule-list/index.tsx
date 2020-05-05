import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';

import SearchBar from '../../components/search-bar';
import {
    ListLoadingView,
    ListEmptyView
} from '../../components/paginated-table';
import RuleCard from './rule-card';
import {CreateRuleDialog} from './create-dialog';
import {useGetList, ENTITY} from '../../services/use-api';
import {useStyles} from './styles';

export const RuleListPage: React.FC<{}> = () => {
    const styles = useStyles();
    const [isOpen, setOpen] = React.useState(false);
    const openDialog = React.useCallback(() => setOpen(true), []);
    const closeDialog = React.useCallback(() => setOpen(false), []);
    const {response, isLoading} = useGetList(ENTITY.RULES, 1, 20);
    const results = response?.data.results;
    const isEmpty = !results || results.length === 0;

    return (
        <div className={styles.root}>
            <div aria-label='rule search bar' className={styles.searchBar}>
                <SearchBar
                    hint='Enter a rule name...'/>
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
            <ListLoadingView show={isLoading}/>
            <ListEmptyView
                emptyMessage='There are not RULES created yet!'
                noMoreMessage='You reached the end of the list!'
                show={!isLoading} isEmpty={isEmpty}
                variant={isEmpty ? 'h4' : 'caption'}/>
            <CreateRuleDialog isOpen={isOpen} onClose={closeDialog}/>
        </div>
    );
};

export default RuleListPage;