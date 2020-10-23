import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import { useStyles } from './styles';

export type TargetEditURLProps = {
    disabled?: boolean;
    show?: boolean;
    url?: string | null;
    onURLChanged: (url: string) => void;
};
export const TargetEditURL: React.FC<TargetEditURLProps> = ({ show = false, url = '', onURLChanged, disabled = false }) => {
    const styles = useStyles();
    const changeURL = React.useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            onURLChanged(ev.target.value);
        },
        [onURLChanged]
    );
    if (!show) return null;
    return (
        <div className={styles.targetEditorURL} data-testid='target-edit-url'>
            <TextField
                disabled={disabled}
                fullWidth={true}
                value={url}
                onChange={changeURL}
                label='URL (http/https)'
                helperText='URL to send events when rule matchs'
                inputProps={{ 'data-testid': 'target-edit-url-input' }}
            />
        </div>
    );
};

export default TargetEditURL;
