import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { useDebounce } from '../../../../../services/use-debounce';
import { useStyles } from './styles';
import { isValidURL } from '../../../../../utils';
export const ErrorMessage: React.FC<{}> = () => {
    return <span data-testid='target-edit-url-error'>You need provide a valir URL</span>;
};

export type TargetEditURLProps = {
    disabled?: boolean;
    show?: boolean;
    url?: string;
    onURLChanged: (url: string) => void;
};
export const TargetEditURL: React.FC<TargetEditURLProps> = ({ show = false, url = '', onURLChanged, disabled = false }) => {
    const styles = useStyles();
    const [inputURL, setInputURL] = useDebounce({ callback: onURLChanged, initialValue: url, delay: 500, skipOnFirstRender: true });
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
                helperText={isValidURL(url) ? 'URL to send events when rule matchs' : <ErrorMessage />}
                inputProps={{ 'data-testid': 'target-edit-url-input' }}
                error={!isValidURL(url)}
            />
        </div>
    );
};

export default TargetEditURL;
