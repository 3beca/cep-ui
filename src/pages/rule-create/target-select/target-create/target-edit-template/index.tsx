import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import TargetEditURL from '../target-edit-url';
import TargetEditHeaders, { ArrayHeader } from '../target-edit-headers';
import { useStyles } from './styles';
import { TargetType } from '../target-type-selector';

export type TargetTemplate = {
    url: string;
    headers?: ArrayHeader;
};

export type TargetTemplateEditPassthrowProps = {
    show: boolean;
    template?: TargetTemplate;
    setTemplate: (template: Partial<TargetTemplate>) => void;
};
export const TargetTemplateEditPassthrow: React.FC<TargetTemplateEditPassthrowProps> = ({ show, template, setTemplate }) => {
    const handleURL = React.useCallback(
        (url: string) => {
            setTemplate({ url });
        },
        [setTemplate]
    );
    const handleHeaders = React.useCallback(
        (headers: ArrayHeader) => {
            setTemplate({ headers });
        },
        [setTemplate]
    );
    if (!show) return null;
    return (
        <div>
            <TargetEditHeaders onChange={handleHeaders} headers={template?.headers} />
            <TargetEditURL url={template?.url} onURLChanged={handleURL} show={true} />
        </div>
    );
};
export type TargetEditTemplateProps = {
    show: boolean;
    type?: TargetType;
    template?: TargetTemplate;
    setTemplate: (template: Partial<TargetTemplate>) => void;
    complete: boolean;
    onComplete: () => void;
    onPrevious: () => void;
    onCancel: () => void;
};
export const TargetEditTemplate: React.FC<TargetEditTemplateProps> = ({ show, type, template, setTemplate, complete, onComplete }) => {
    const styles = useStyles();
    if (!type || !show) return null;
    return (
        <>
            <DialogContent data-testid='target-create-wizzard' className={styles.container}>
                <div data-testid='target-template-container'>
                    {type === 'passthrow'
                        ? 'PASSTHROW Target'
                        : type === 'custom'
                        ? 'CUSTOM Target Template'
                        : 'Predefined Target Template'}
                    <TargetTemplateEditPassthrow show={type === 'passthrow'} setTemplate={setTemplate} template={template} />
                </div>
            </DialogContent>
            <DialogActions>
                <Button disabled={!complete} onClick={onComplete} data-testid='target-create-button-next'>
                    <Typography>NEXT</Typography>
                </Button>
            </DialogActions>
        </>
    );
};

export default TargetEditTemplate;
