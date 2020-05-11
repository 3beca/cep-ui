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
import {ENTITY} from '../../services/api/use-api';
import {useStyles} from './styles';
import { Rule } from '../../services/api';
import {useGetListAccumulated} from '../../services/use-getlist-enhancer';

const LoadMoreButton: React.FC<{show: boolean; onClick: () => void;}> = ({show, onClick}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div className={styles.loadMoreButtonView}>
            <Button
                className={styles.loadMoreButton}
                fullWidth={true}
                onClick={onClick}
                aria-label='load more rules'
                color='secondary'
                variant='contained'
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
    const {
        isLoading,
        accumulated,
        hasMoreElements,
        nextPage,
        changeFilter,
        currentFilter
    } = useGetListAccumulated<Rule>(ENTITY.RULES, 1, 10);
    const isEmpty = accumulated.length === 0;
    return (
        <div className={styles.root}>
            <div aria-label='rule search bar' className={styles.searchBar}>
                <SearchBar
                    hint='Enter a rule name...'
                    minLength={0}
                    onSearchFor={changeFilter}/>
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
                    accumulated.map(rule => <RuleCard rule={rule} key={rule.id}/>)
                }
            </div>
            <LoadMoreButton
                show={!isLoading && hasMoreElements}
                onClick={nextPage}/>
            <ListLoadingView show={isLoading}/>
            <ListEmptyView
                emptyMessage={
                    !!currentFilter ?
                        `There are no elements for "${currentFilter}"` : 'There are no RULES created yet!'
                }
                noMoreMessage='You reached the end of the list!'
                show={!isLoading && !hasMoreElements}
                isEmpty={isEmpty}
                variant={isEmpty ? 'h4' : 'caption'}/>
            <CreateRuleDialog isOpen={isOpen} onClose={closeDialog}/>
        </div>
    );
};

export default RuleListPage;
