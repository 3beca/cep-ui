import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/CloseOutlined';
import IconAdd from '@material-ui/icons/AddOutlined';
import IconDelete from '@material-ui/icons/DeleteOutline';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';

import { useStyles } from './styles';
import { useCreate, ENTITY } from '../../../../services/api-provider/use-api';
import { APIError } from '../../../../utils/fetch-api';
import { cutString } from '../../../../utils';
import { Target, ServiceError, TargetBody, TargetHeader } from '../../../../services/api';
import IconDialog, { useIconDialog } from '../../../../components/icon-dialog';
import { Divider } from '@material-ui/core';

import { ArrayHeader } from './target-edit-headers';
import TargetEditURL from './target-edit-url';
import { isValidURL } from '../../../../utils';
import TargetEditHeaders from './target-edit-headers';

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

export type TargetType = 'passthrow' | 'custom' | 'template';
export type TargetTypeSelectorProps = {
    show: boolean;
    type?: TargetType;
    setType: (type: TargetType) => void;
    onComplete: () => void;
    onCancel: () => void;
};
const TargetTypeSelector: React.FC<TargetTypeSelectorProps> = ({ show, type, setType, onComplete, onCancel }) => {
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
                <Button disabled={false} onClick={onComplete} data-testid='target-create-button-next'>
                    <Typography>SELECT</Typography>
                </Button>
            </DialogActions>
        </>
    );
};

export type TargetTemplateEditPassthrowProps = {
    show: boolean;
    template?: TargetTemplate;
    setTemplate: (template: TargetTemplate) => void;
};
export const TargetTemplateEditPassthrow: React.FC<TargetTemplateEditPassthrowProps> = ({ show, template, setTemplate }) => {
    const handleURL = React.useCallback(
        (url: string) => {
            setTemplate({ ...template, url });
        },
        [setTemplate, template]
    );
    const handleHeaders = React.useCallback(
        (headers: ArrayHeader) => {
            const url = template?.url ? template.url : '';
            setTemplate({ url, headers });
        },
        [setTemplate, template]
    );
    if (!show) return null;
    return (
        <div>
            <TargetEditHeaders onChange={handleHeaders} headers={template?.headers} />
            <TargetEditURL url={template?.url} onURLChanged={handleURL} show={true} />
        </div>
    );
};
export type TargetTemplateEditorProps = {
    show: boolean;
    type?: TargetType;
    template?: TargetTemplate;
    setTemplate: (template: TargetTemplate) => void;
    onComplete: () => void;
    onPrevious: () => void;
    onCancel: () => void;
};
export const TargetTemplateEditor: React.FC<TargetTemplateEditorProps> = ({ show, type, template, setTemplate }) => {
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
                <Button disabled={false} onClick={() => {}} data-testid='target-create-button-next'>
                    <Typography>EDIT</Typography>
                </Button>
            </DialogActions>
        </>
    );
};
export type TargetResumeProps = {
    show: boolean;
    target?: TargetBody;
    onComplete: () => void;
    onPrevious: () => void;
    onCancel: () => void;
};
export const TargetResume: React.FC<TargetResumeProps> = ({ show, target }) => {
    const styles = useStyles();
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
export type WizzardSections = {
    wizzard_section_select: TargetType;
    wizzard_section_template: TargetTemplate;
    wizzard_section_create: Target;
};
export type WizzardSection = keyof WizzardSections;
export type WizzardActionNext<S extends WizzardSection> = {
    type: S;
    payload: WizzardSections[S];
    action: 'next';
};
export type WizzardActionPrev<S extends WizzardSection> = {
    type: S;
    action: 'prev';
};
export type WizzardActionSetType = {
    type: 'set_type';
    payload: TargetType | undefined;
};
export type WizzardActionSetTemplate = {
    type: 'set_template';
    payload: TargetTemplate;
};

export type WizzardActions<S extends WizzardSection> = WizzardActionNext<S> | WizzardActionPrev<S>;
export type TargetTemplate = {
    url: string;
    headers?: ArrayHeader;
};
export type WizzardState = {
    name: string;
    section: keyof WizzardSections;
    sectionCompleted: boolean;
    action: string;
    type?: TargetType;
    template?: TargetTemplate;
    target?: TargetBody;
};
export const wizzardReducer = <S extends WizzardSection>(
    state: WizzardState,
    action: WizzardActions<S> | WizzardActionSetType | WizzardActionSetTemplate
): WizzardState => {
    switch (action.type) {
        case 'set_type': {
            if (state.section === 'wizzard_section_select') {
                const acc = action as WizzardActionSetType;
                return {
                    ...state,
                    sectionCompleted: !!acc.payload ? true : false,
                    type: action.payload
                };
            }
            return state;
        }
        case 'set_template': {
            if (state.section === 'wizzard_section_template') {
                return {
                    ...state,
                    template: action.payload,
                    sectionCompleted: !!action.payload.url && isValidURL(action.payload.url)
                };
            }
            return state;
        }
        default:
            return state;
    }
};
export const initialWizzardState = (name: string): WizzardState => ({
    name,
    section: 'wizzard_section_select',
    sectionCompleted: false,
    action: 'next'
});
export type TargetCreateProps = {
    disabled?: boolean;
    targetName: string;
    onCreate: (target: Target) => void;
    close: () => void;
};
export const TargetCreate: React.FC<TargetCreateProps> = ({ targetName, onCreate, close, disabled = false }) => {
    const [wizzardState, dispatchWizzardAction] = React.useReducer(wizzardReducer, initialWizzardState(targetName));

    const next = React.useCallback(<S extends WizzardSection>(section: S, payload: WizzardSections[S]) => {
        dispatchWizzardAction({ type: section, payload, action: 'next' });
    }, []);

    const prev = React.useCallback(<S extends WizzardSection>(section: S) => {
        dispatchWizzardAction({ type: section, action: 'prev' });
    }, []);

    return (
        <Dialog open={true} fullWidth={true}>
            <TargetTypeSelector
                type={wizzardState.type}
                show={wizzardState.section === 'wizzard_section_select'}
                onComplete={() => next('wizzard_section_template')}
                onCancel={close}
            />
            <TargetTemplateEditor
                type={wizzardState.type}
                show={wizzardState.section === 'wizzard_section_template'}
                template={wizzardState.template}
                setTemplate={setTemplate}
                onComplete={() => next('wizzard_section_create')}
                onPrevious={() => prev('wizzard_section_select')}
                onCancel={close}
            />
            <TargetResume
                show={wizzardState.section === 'wizzard_section_create'}
                target={wizzardState.target}
                onComplete={(target: Target) => onCreate(target)}
                onPrevious={() => prev('wizzard_section_template')}
                onCancel={close}
            />
        </Dialog>
    );
};

export default TargetCreate;
