import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { useCreate, ENTITY } from '../../../../../services/api-provider/use-api';
import { Target, TargetBody } from '../../../../../services/api';
import { cutString } from '../../../../../utils';
import { useStyles } from './styles';

const TargetCreatorLoader: React.FC<{ show: boolean }> = ({ show }) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div className={styles.createDetailsStatusLoading} aria-label='target creating loading'>
            <Typography variant='caption' className={styles.createDetailsStatusLoadingText}>
                Creating Target
            </Typography>
            <CircularProgress color='primary' size={24} />
        </div>
    );
};

const TargetCreatorError: React.FC<{
    error: APIError<ServiceError> | undefined;
}> = ({ error }) => {
    const styles = useStyles();
    if (!error) return null;
    return (
        <div className={styles.createDetailsStatusError} aria-label='target creating error'>
            <Typography variant='caption'>{error.error?.message}</Typography>
        </div>
    );
};

const TargetCreatorSuccess: React.FC<{ target: Target | undefined }> = ({ target }) => {
    const styles = useStyles();
    if (!target) return null;
    return (
        <div className={styles.createDetailsURL} aria-label='target creating url'>
            <Typography variant='caption'>{cutString(target.url, 40)}</Typography>
        </div>
    );
};

export type TargetCreatorProps = {
    show: boolean;
    target?: TargetBody;
    onComplete: (target: Target) => void;
    onPrevious: () => void;
    onCancel: () => void;
};
export const TargetCreator: React.FC<TargetCreatorProps> = ({ show, target }) => {
    const styles = useStyles();
    const { isLoading, response, error, request } = useCreate<Target>(ENTITY.TARGETS, newBody, false);
    if (!target || !show) return null;

    return (
        <>
            <DialogContent data-testid='target-create-wizzard' className={styles.container}>
                <div data-testid='target-resume-container'>Create Target now?</div>
            </DialogContent>
            <DialogActions>
                <Button disabled={false} onClick={() => {}} data-testid='target-create-button-next'>
                    <Typography>CREATE</Typography>
                </Button>
            </DialogActions>
        </>
    );
};

export default TargetCreator;
