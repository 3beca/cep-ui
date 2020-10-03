import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import { NOOP } from '../../utils';
import { useDebounce } from '../../services/use-debounce';
import { useStyles } from './styles';

export type SearchBarProps = {
    hint?: string;
    delay?: number;
    minLength?: number;
    onSearchFor?(searchText: string): void;
};
export const SearchBar: React.FC<SearchBarProps> = function SearchBar({
    hint = 'search for...',
    onSearchFor = NOOP,
    delay = 500,
    minLength = 3
}) {
    const styles = useStyles();
    const filter = React.useCallback(
        value => !!value && value.length >= minLength,
        [minLength]
    );
    const [searchText, setSearchText] = useDebounce({
        callback: onSearchFor,
        initialValue: '',
        delay: delay,
        filterDispatch: filter
    });
    const onTextChange = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) =>
            setSearchText(ev.target.value),
        [setSearchText]
    );
    return (
        <Paper component='div' className={styles.searchContainer}>
            <InputBase
                className={styles.searchInput}
                placeholder={hint}
                value={searchText}
                onChange={onTextChange}
                inputProps={{ 'aria-label': 'search input' }}
            />
            <div className={styles.searchButton} aria-label='search icon'>
                <SearchIcon color='primary' />
            </div>
        </Paper>
    );
};

export default SearchBar;
