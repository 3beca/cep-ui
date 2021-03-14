import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';

import { Target, TargetBody } from '../../../../services/api';

import { isValidURL } from '../../../../utils';
import { parseTargetHeaders } from './target-edit-headers';

import { TargetTypeSelector, TargetType } from './target-type-selector';
import { TargetEditTemplate, TargetTemplate } from './target-edit-template';
import { TargetCreator } from './target-creator';

import { useStyles } from './styles';

export type WizzardSections = {
    wizzard_section_select: TargetType;
    wizzard_section_template: TargetTemplate;
    wizzard_section_create: Target;
};
export type WizzardSection = keyof WizzardSections;
export type WizzardActionNext = {
    type: WizzardSection;
    action: 'next';
};
export type WizzardActionPrev = {
    type: WizzardSection;
    action: 'prev';
};
export type WizzardActionSetType = {
    type: 'set_type';
    payload: TargetType;
};
export type WizzardActionSetTemplate = {
    type: 'set_template';
    payload: Partial<TargetTemplate>;
};

export type WizzardActions = WizzardActionNext | WizzardActionPrev | WizzardActionSetType | WizzardActionSetTemplate;

export type WizzardState = {
    name: string;
    section: keyof WizzardSections;
    sectionCompleted: boolean;
    action: string;
    type?: TargetType;
    template?: TargetTemplate;
    target?: TargetBody;
};
export const wizzardReducer = (state: WizzardState, action: WizzardActions): WizzardState => {
    switch (action.type) {
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
                const template = state.template ? state.template : { url: '' };
                const newTemplate = { ...template, ...action.payload };
                return {
                    ...state,
                    template: newTemplate,
                    sectionCompleted: !!newTemplate.url && isValidURL(newTemplate.url)
                };
            }
            return state;
        }
        case 'wizzard_section_template': {
            if (state.section === 'wizzard_section_select') {
                if (action.action === 'next' && !!state.type) {
                    return {
                        ...state,
                        section: 'wizzard_section_template',
                        sectionCompleted: !!state.template?.url && isValidURL(state.template.url)
                    };
                }
            }
            return state;
        }
        case 'wizzard_section_create': {
            if (state.section === 'wizzard_section_template') {
                if (action.action === 'next' && !!state.type && !!state.template?.url && isValidURL(state.template.url)) {
                    return {
                        ...state,
                        section: 'wizzard_section_create',
                        sectionCompleted: false,
                        target: { name: state.name, url: state.template.url, headers: parseTargetHeaders(state.template.headers) }
                    };
                }
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

    const next = React.useCallback((section: WizzardSection) => {
        dispatchWizzardAction({ type: section, action: 'next' });
    }, []);

    const prev = React.useCallback((section: WizzardSection) => {
        dispatchWizzardAction({ type: section, action: 'prev' });
    }, []);

    const setType = React.useCallback((targetType: TargetType) => {
        dispatchWizzardAction({ type: 'set_type', payload: targetType });
    }, []);

    const setTemplate = React.useCallback((template: Partial<TargetTemplate>) => {
        dispatchWizzardAction({ type: 'set_template', payload: template });
    }, []);

    console.log('Wizzard', wizzardState);
    // MARK : Render Wizzard
    return (
        <Dialog open={true} fullWidth={true}>
            <TargetTypeSelector
                type={wizzardState.type}
                setType={setType}
                show={wizzardState.section === 'wizzard_section_select'}
                completed={wizzardState.sectionCompleted}
                onComplete={() => next('wizzard_section_template')}
                onCancel={close}
            />
            <TargetEditTemplate
                type={wizzardState.type}
                show={wizzardState.section === 'wizzard_section_template'}
                template={wizzardState.template}
                setTemplate={setTemplate}
                complete={wizzardState.sectionCompleted}
                onComplete={() => next('wizzard_section_create')}
                onPrevious={() => prev('wizzard_section_select')}
                onCancel={close}
            />
            <TargetCreator
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
