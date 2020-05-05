import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import {NOOP} from '../../utils';
import {useStyles} from './styles';

export type SearchBarProps = {
    hint?: string;
    delay?: number;
    minLength?: number;
    onSearchFor?(searchText: string): void;
};
export const SearchBar: React.FC<SearchBarProps> = function SearchBar({hint = 'search for...', onSearchFor = NOOP, delay = 500, minLength = 3}) {
    const styles = useStyles();
    const [searchText, setSearchText] = React.useState('');
    const onTextChange = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => setSearchText(ev.target.value), []);
    React.useEffect(
        () => {
            if (!searchText || searchText.length < minLength) return;
            if (delay <= 0) {
                onSearchFor(searchText);
                return;
            }
            const timerId = setTimeout(
                () => {
                     onSearchFor(searchText);
                }, delay
            );
            return () => clearTimeout(timerId);
        }, [searchText, delay, minLength, onSearchFor]
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
                <SearchIcon color='primary'/>
            </div>
        </Paper>
    );
};

export default SearchBar;