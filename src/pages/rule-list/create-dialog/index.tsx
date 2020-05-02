import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import {NOOP} from '../../../utils';
import {useStyles} from './styles';
import {useStyles as useCardStyles} from '../styles';
import { RuleTypes } from '../../../services/api';
import {colorTypeSelector} from '../';

type RuleTypesText = {[key in RuleTypes]: string};
const titles: RuleTypesText = {
    none: 'Real Time',
    sliding: 'Sliding',
    hopping: 'Hopping',
    tumbling: 'Tumbling'
};
const subtitles = {
    none: 'compute one shot events',
    sliding: 'compute windowing with a text hiper large where it explains the main concept of this rule',
    hopping: 'compute windowing with...',
    tumbling: 'compute windowing with...'
};
export type RuleTypeCardProp = {selected?: boolean, type: RuleTypes};
const RuleTypeCard: React.FC<RuleTypeCardProp> = ({selected = false, type}) => {
    const styles = useStyles();
    const stylesCard = useCardStyles();
    return (
        <Button className={styles.cardButton}>
            <Avatar
                aria-label="recipe"
                className={`${styles.ruleAvatar} ${colorTypeSelector(type, stylesCard)}`}>
                {type.slice(0, 1).toUpperCase()}
            </Avatar>
            <div className={styles.rulesTypeText}>
                <div><Typography className={styles.ruleTypeTextTitle}>{titles[type]}</Typography></div>
                <div><Typography variant='caption'>{subtitles[type]}</Typography></div>
            </div>
        </Button>
    );
};

export type CreateRuleDialogProps = {isOpen: boolean; onClose?():void};
export const CreateRuleDialog: React.FC<CreateRuleDialogProps> = ({isOpen, onClose = NOOP}) => {
    const styles = useStyles();
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            id='create-rule-dialog'
            scroll='paper'
            aria-label='create rule dialog'>
            <DialogTitle aria-label='title create rule'>
                What kind of rule do you need?
            </DialogTitle>
            <DialogContent
                dividers={true}
                className={styles.dialogContent}
                aria-label='kind of rules description'>
                <RuleTypeCard type='none'/>
                <RuleTypeCard type='hopping'/>
                <RuleTypeCard type='sliding'/>
                <RuleTypeCard type='tumbling'/>
            </DialogContent>
            <DialogActions aria-label='actions'>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRuleDialog;
