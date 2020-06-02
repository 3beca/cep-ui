import * as React from 'react';
import MUIAutocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import { EntityWithName } from '../../services/api';
import { FilterOptionsState } from '@material-ui/lab/useAutocomplete';
import {useDebounce} from '../../services/use-debounce';

export const createCustomFilterOptions = createFilterOptions;

export type AutocompleteProps<T> = {
    disabled?: boolean;
    options: T[];
    selected: T|null;
    setSelected(element: T|null): void;
    isLoading: boolean;
    emptyElement: T;
    changeFilter(filter: string): void;
    defaultFilter?: (options: T[], state: FilterOptionsState<T>) => T[];
    ariaLabel?: string;
    elementId?: string;
    placeholderText?: string;
    loadingText?: string;
    className?: string;
};
export function Autocomplete<T extends EntityWithName>(
    {
        disabled = false,
        options,
        selected,
        setSelected,
        isLoading,
        emptyElement,
        changeFilter,
        defaultFilter = createFilterOptions<T>(),
        ariaLabel = 'element name',
        elementId = 'element-autocomplete',
        placeholderText = 'Search a element',
        loadingText = 'Loading elements',
        className
    }: AutocompleteProps<T>) {
    const cameFromLoading = React.useRef(false);
    const handleChange = React.useCallback(
        (ev: React.ChangeEvent<unknown>, element: T|null) => {
            setSelected(element);
        },[setSelected]
    );
    const handleGetOptions = React.useCallback(
        (option: T) => {
            return option.name;
        }, []
    );
    const handleRenderOptions = React.useCallback(
        (option: T) => {
            return (option.id !== emptyElement.id ? '' : 'Create ') + option.name;
        }, [emptyElement]
    );
    const handleFilterOptions = React.useCallback(
        (options: T[], params: FilterOptionsState<T>) => {
            const filtered = defaultFilter(options, params);
            // If there are not matchs...
            if (cameFromLoading.current && !isLoading && options.length === 0 && filtered.length === 0 && params.inputValue !== '') {
                const newElement = {...emptyElement, name: params.inputValue};
                filtered.push(newElement);
            }
            return filtered;
        }, [isLoading, emptyElement, defaultFilter]
    );
     // Debounce filter
     const [filter, setFilter] = useDebounce({callback: changeFilter, initialValue: ''});
     const handleInputChange = React.useCallback(
        (ev: React.ChangeEvent<unknown>, name: string) => {
            setFilter(name);
        },[setFilter]
    );
    React.useEffect(() => {
        cameFromLoading.current = isLoading;
    });

    return (
        <MUIAutocomplete
            disabled={disabled}
            autoComplete={true}
            fullWidth={true}
            id={elementId}
            aria-label={ariaLabel}
            multiple={false}
            value={selected}
            className={className}
            options={options}
            filterOptions={handleFilterOptions}
            getOptionLabel={handleGetOptions}
            renderOption={handleRenderOptions}
            onChange={handleChange}
            loading={isLoading}
            onInputChange={handleInputChange}
            inputValue={filter}
            renderInput={
                (params) => {
                    return (
                        <TextField
                            {...params}
                            label={isLoading ? loadingText : placeholderText}
                            InputProps={
                                {
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {isLoading ? <CircularProgress color="primary" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                )
                                }
                            }
                        />
                    )
                }
            }
        />
    );
};

export default Autocomplete;
