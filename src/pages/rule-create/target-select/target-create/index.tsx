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
};
const TargetTypeSelector: React.FC<TargetTypeSelectorProps> = ({ show, type, setType }) => {
    if (!show) return null;
    return (
        <div>
            <div data-testid='target-create-type-selector'>
                <div data-testid='target-create-type-passthrow' onClick={() => setType('passthrow')}>
                    Passthrow
                </div>
            </div>
            <div data-testid={`target-create-type-${type ? type : ''}-details`}></div>
        </div>
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
            setTemplate({ url });
        },
        [setTemplate]
    );
    if (!show) return null;
    return (
        <div>
            <TargetEditURL url={template?.url} onURLChanged={handleURL} show={true} />
        </div>
    );
};
export type TargetTemplateEditorProps = {
    show: boolean;
    type?: TargetType;
    template?: TargetTemplate;
    setTemplate: (template: TargetTemplate) => void;
};
export const TargetTemplateEditor: React.FC<TargetTemplateEditorProps> = ({ show, type, template, setTemplate }) => {
    if (!type || !show) return null;
    return (
        <div data-testid='target-template-container'>
            {type === 'passthrow' ? 'PASSTHROW Target' : type === 'custom' ? 'CUSTOM Target Template' : 'Predefined Target Template'}
            <TargetTemplateEditPassthrow show={type === 'passthrow'} setTemplate={setTemplate} template={template} />
        </div>
    );
};
export type WizzardSections = 'wizzard_section_select' | 'wizzard_section_template' | 'wizzard_section_create';
export type WizzardActionNext = {
    type: 'next';
};
export type WizzardActionPrev = {
    type: 'prev';
};
export type WizzardActionSetType = {
    type: 'set_type';
    payload: TargetType | undefined;
};
export type WizzardActionSetTemplate = {
    type: 'set_template';
    payload: TargetTemplate;
};

export type WizzardActions = WizzardActionNext | WizzardActionPrev | WizzardActionSetType | WizzardActionSetTemplate;
export type TargetTemplate = {
    url: string;
    headers?: ArrayHeader;
};
export type WizzardState = {
    section: WizzardSections;
    sectionCompleted: boolean;
    action: string;
    type?: TargetType;
    template?: TargetTemplate;
};
export const wizzardReducer = (state: WizzardState, action: WizzardActions): WizzardState => {
    switch (action.type) {
        case 'next': {
            return {
                ...state,
                section: state.section === 'wizzard_section_select' ? 'wizzard_section_template' : state.section,
                sectionCompleted: false
            };
        }
        case 'prev': {
            return state;
        }
        case 'set_type': {
            if (state.section === 'wizzard_section_select') {
                return {
                    ...state,
                    sectionCompleted: !!action.payload ? true : false,
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
export const initialWizzardState: WizzardState = { section: 'wizzard_section_select', sectionCompleted: false, action: 'next' };
export type TargetCreateProps = {
    disabled?: boolean;
    targetName: string;
    onCreate: (target: Target) => void;
    close: () => void;
};
export const TargetCreate: React.FC<TargetCreateProps> = ({ targetName, onCreate, close, disabled = false }) => {
    const styles = useStyles();
    // const [url, setURL] = React.useState('');
    // const [headers, setHeaders] = React.useState<ArrayHeader>([]);
    // const newBody = React.useMemo((): TargetBody => {
    //     return { name: targetName, url, headers: parseTargetHeaders(headers) };
    // }, [targetName, url, headers]);
    // const { isLoading, response, error, request } = useCreate<Target>(ENTITY.TARGETS, newBody, false);
    // const addHeader = React.useCallback((name: string, value: string) => {
    //     setHeaders(headers => [...headers.filter(header => header.name !== name), { name, value }]);
    // }, []);
    // const deleteHeader = React.useCallback((name: string) => {
    //     setHeaders(headers => headers.filter(header => header.name !== name));
    // }, []);
    // React.useEffect(() => {
    //     if (!isLoading && !error && !!response?.data) {
    //         onCreate(response.data);
    //     }
    // }, [isLoading, error, response, onCreate]);
    const [wizzardState, dispatchWizzardAction] = React.useReducer(wizzardReducer, initialWizzardState);
    const next = React.useCallback(() => {
        dispatchWizzardAction({ type: 'next' });
    }, []);
    const setType = React.useCallback((type: TargetType) => {
        dispatchWizzardAction({ type: 'set_type', payload: type });
    }, []);
    const setTemplate = React.useCallback((template: TargetTemplate) => {
        dispatchWizzardAction({ type: 'set_template', payload: template });
    }, []);

    return (
        <Dialog open={true} fullWidth={true}>
            <DialogContent data-testid='target-create-wizzard' className={styles.container}>
                <TargetTypeSelector type={wizzardState.type} setType={setType} show={wizzardState.section === 'wizzard_section_select'} />
                <TargetTemplateEditor
                    type={wizzardState.type}
                    show={wizzardState.section === 'wizzard_section_template'}
                    template={wizzardState.template}
                    setTemplate={setTemplate}
                />
            </DialogContent>
            <DialogActions>
                <Button disabled={disabled || !wizzardState.sectionCompleted} onClick={next} data-testid='target-create-button-next'>
                    <Typography>{wizzardState.action}</Typography>
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TargetCreate;
