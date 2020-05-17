import * as React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/CloseOutlined';
import IconCopy from '@material-ui/icons/FileCopyOutlined';
import Snackbar from '@material-ui/core/Snackbar';
import Paper from '@material-ui/core/Paper';
import { useClipboard } from '../../../services/use-clipboard';
import { EventType } from '../../../services/api';
import {useStyles} from './styles';
import { useGetListAccumulated } from '../../../services/use-getlist-enhancer';
import { ENTITY } from '../../../services/api/use-api';


export const EventTypeSelector: React.FC<{}> = () => {
    const styles = useStyles();
    const {accumulated, isLoading, changeFilter} = useGetListAccumulated<EventType>(ENTITY.EVENT_TYPES, 1, 10);
    const [selected, setSelected] = React.useState<EventType|null>(null);
    const handleChange = React.useCallback(
        (ev: React.ChangeEvent<unknown>, eventType: EventType|null) => {
            setSelected(eventType);
        },[]
    );
    const handleClearSelection = React.useCallback(() => setSelected(null), []);
     // Clipboard
     const {text, copy, clear} = useClipboard();
     // SearchText filter
     const [searchText, setSearchText] = React.useState('');
     const handleInputChange = React.useCallback(
        (ev: React.ChangeEvent<unknown>, name: string) => {
            setSearchText(name);
        },[setSearchText]
    );
     React.useEffect(
        () => {
            const timerId = setTimeout(
                () => {
                    changeFilter(searchText);
                }, 500
            );
            return () => clearTimeout(timerId);
        }, [searchText, changeFilter]
    );

    if (selected) {
        return (
            <div
                className={styles.container}
                aria-label={`eventtype selector`}>
                <Paper
                    className={styles.details}
                    aria-label='eventtype selected block'>
                    <div className={styles.detailsActions}>
                        <IconButton
                            aria-label='eventtype selected copy'
                            onClick={() => copy(selected.url)}>
                            <IconCopy fontSize='small'/>
                        </IconButton>
                        <IconButton
                            onClick={handleClearSelection}
                            aria-label='eventtype selected clear'>
                            <IconClose fontSize='small'/>
                        </IconButton>
                    </div>
                    <div
                        className={styles.detailsName}
                        aria-label='eventtype selected name'>
                        <Typography variant='h5'>{selected.name}</Typography>
                    </div>
                    <div
                        className={styles.detailsURL}
                        aria-label='eventtype selected url'>
                        <Typography variant='caption'>{selected.url}</Typography>
                    </div>
                </Paper>
                <Snackbar
                    open={!!text}
                    onClose={clear}
                    autoHideDuration={1500}
                    message={`URL copied!`}
                />
            </div>
        );
    }

    return (
        <div
            className={styles.container}
            aria-label={`eventtype selector`}>
            <Autocomplete
                fullWidth={true}
                id='eventtype-autocomplete'
                aria-label='eventtype name'
                multiple={false}
                value={selected}
                className={styles.autocomplete}
                options={accumulated}
                getOptionLabel={(option) => option.name}
                renderOption={option => option.name}
                onChange={handleChange}
                loading={isLoading}
                onInputChange={handleInputChange}
                renderInput={
                    (params) => {
                        return (
                            <TextField
                                {...params}
                                label={isLoading ? 'Loading EventTypes' : 'Search a EventType'}/>
                        )
                    }
                }/>
        </div>
    );
};

export default EventTypeSelector;