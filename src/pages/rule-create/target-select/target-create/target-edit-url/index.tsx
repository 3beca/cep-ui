import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { useDebounce } from '../../../../../services/use-debounce';
import { useStyles } from './styles';

export const isValidURL = (url: string) => {
    if (url === '') return true;
    if (url.startsWith('http://')) return true;
    if (url.startsWith('https://')) return true;
    return false;
};
export const ErrorMessage: React.FC<{}> = () => {
    return <span data-testid='target-edit-url-error'>URL needs to start with http or https</span>;
};

export type TargetEditURLProps = {
    disabled?: boolean;
    show?: boolean;
    url?: string;
    onURLChanged: (url: string) => void;
};
export const TargetEditURL: React.FC<TargetEditURLProps> = ({ show = false, url = '', onURLChanged, disabled = false }) => {
    const styles = useStyles();
    const [inputURL, setInputURL] = useDebounce({ callback: onURLChanged, initialValue: url, delay: 100, filterDispatch: isValidURL });
    const changeURL = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setInputURL(ev.target.value);
        },
        [setInputURL]
    );
    if (!show) return null;
    return (
        <div className={styles.targetEditorURL} data-testid='target-edit-url'>
            <TextField
                disabled={disabled}
                fullWidth={true}
                value={inputURL}
                onChange={changeURL}
                label='URL (http/https)'
                helperText={isValidURL(inputURL) ? 'URL to send events when rule matchs' : <ErrorMessage />}
                inputProps={{ 'data-testid': 'target-edit-url-input' }}
                error={isValidURL(inputURL)}
            />
        </div>
    );
};

export default TargetEditURL;
