import * as React from 'react';
import { useUpdateAPIProvider } from '../../services/api-provider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import { useStyles } from './styles';

export type LoginPageProps = {
    invalidReason?: string;
};
export const LoginPage: React.FC<LoginPageProps> = ({ invalidReason }) => {
    const styles = useStyles();
    const [newApikey, setNewApikey] = React.useState('');
    const { setApiKey } = useUpdateAPIProvider();
    const submitApikey = React.useCallback(() => {
        setApiKey(newApikey);
    }, [setApiKey, newApikey]);
    return (
        <div className={styles.container} aria-label='login container'>
            <div className={styles.dialog}>
                <Typography className={styles.title}>API KEY Required</Typography>
                <div className={styles.content}>
                    <TextField
                        value={newApikey}
                        onChange={ev => setNewApikey(ev.target.value)}
                        inputProps={{
                            'data-testid': 'login input'
                        }}
                        fullWidth={true}
                        variant='outlined'
                        label='API Key'
                        placeholder='Your APIKEY goes here!'
                        error={!!invalidReason && !invalidReason.match(/not found/i)}
                    />
                    <div
                        className={!!invalidReason && !invalidReason.match(/not found/i) ? styles.errorMessage : styles.infoMessage}
                        aria-label='login reason'
                    >
                        <Typography variant='caption'>{invalidReason}</Typography>
                    </div>
                </div>
                <Divider className={styles.divider} />
                <Button aria-label='login submit' disabled={newApikey.length < 6} fullWidth={true} color='primary' onClick={submitApikey}>
                    Submit API KEY
                </Button>
            </div>
        </div>
    );
};

export default LoginPage;
