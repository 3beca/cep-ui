import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import SearchBar from '../../components/search-bar';
import {
    ListLoadingView,
    ListEmptyView
} from '../../components/paginated-table';
import RuleCard from './rule-card';
import {CreateRuleDialog} from './create-dialog';
import {useGetList, ENTITY} from '../../services/use-api';
import {useStyles} from './styles';

const LoadMoreButton: React.FC<{show: boolean; onClick: () => void;}> = ({show, onClick}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div className={styles.loadMoreButton}>
            <Button
                fullWidth={true}
                onClick={onClick}
                aria-label='load more rules'
                color='secondary'
                variant='outlined'
                title='Load More Rules'>
                    Load More Rules
            </Button>
        </div>
    );
};

export const RuleListPage: React.FC<{}> = () => {
    const styles = useStyles();
    const [isOpen, setOpen] = React.useState(false);
    const openDialog = React.useCallback(() => setOpen(true), []);
    const closeDialog = React.useCallback(() => setOpen(false), []);
    const [filter, setFilter] = React.useState('');
    const [page, setPage] = React.useState(1);
    const {response, isLoading} = useGetList(ENTITY.RULES, page, 20, filter);
    const incrementPage = React.useCallback(() => setPage(p => p + 1), []);
    const results = response?.data.results;
    const isEmpty = !results || results.length === 0;
    const hasMoreElements = !!response && !!response?.data.next;

    return (
        <div className={styles.root}>
            <div aria-label='rule search bar' className={styles.searchBar}>
                <SearchBar
                    hint='Enter a rule name...'
                    minLength={0}
                    onSearchFor={setFilter}/>
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
            <LoadMoreButton
                show={!isLoading && hasMoreElements}
                onClick={incrementPage}/>
            <ListLoadingView show={isLoading}/>
            <ListEmptyView
                emptyMessage='There are not RULES created yet!'
                noMoreMessage='You reached the end of the list!'
                show={!isLoading && !hasMoreElements} isEmpty={isEmpty}
                variant={isEmpty ? 'h4' : 'caption'}/>
            <CreateRuleDialog isOpen={isOpen} onClose={closeDialog}/>
        </div>
    );
};

export default RuleListPage;
