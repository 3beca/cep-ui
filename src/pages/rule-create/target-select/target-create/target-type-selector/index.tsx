import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { useStyles } from './styles';

export type TargetType = 'passthrow' | 'custom' | 'template';
export type TargetTypeSelectorProps = {
    show: boolean;
    type?: TargetType;
    setType: (type: TargetType) => void;
    completed: boolean;
    onComplete: () => void;
    onCancel: () => void;
};
export const TargetTypeSelector: React.FC<TargetTypeSelectorProps> = ({ show, type, setType, onComplete, onCancel, completed }) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <>
            <DialogContent data-testid='target-create-wizzard' className={styles.container}>
                <div>
                    <div data-testid='target-create-type-selector'>
                        <div data-testid='target-create-type-passthrow' onClick={() => setType('passthrow')}>
                            Passthrow
                        </div>
                    </div>
                    <div data-testid={`target-create-type-${type ? type : ''}-details`}></div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button disabled={!completed} onClick={onComplete} data-testid='target-create-button-next'>
                    <Typography>SELECT</Typography>
                </Button>
            </DialogActions>
        </>
    );
};

export default TargetTypeSelector;
