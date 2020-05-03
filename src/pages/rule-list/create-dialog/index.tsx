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
type RuleTypesSamples = {[key in RuleTypes]: string[][]};
const titles: RuleTypesText = {
    none: 'Real Time',
    sliding: 'Sliding',
    hopping: 'Hopping',
    tumbling: 'Tumbling'
};
const subtitles: RuleTypesText = {
    none: 'Rule executes on any event matching filter on its event data.',
    sliding: 'compute windowing with a text hiper large where it explains the main concept of this rule',
    hopping: 'compute windowing with...',
    tumbling: 'Rules executes on an interval matching aggregation over each interval of time.'
};
const samples: RuleTypesSamples = {
    none: [
        ['temperature > 10', 'checks temperature is great than 10 for each temperature received'],
        ['distance(location) > 50', 'checks a locations is great than 5 meters'],
        ['battery < 30 and windSpeed > 5', 'checks battery is less than 30 and windSpeed great than 5']
    ],
    sliding: [
        ['Example 1', 'explanation example 1'],
        ['Example 2', 'explanation example 2'],
        ['Example 3', 'explanation example 3']
    ],
    hopping: [
        ['Example 1', 'explanation example 1'],
        ['Example 2', 'explanation example 2'],
        ['Example 3', 'explanation example 3']
    ],
    tumbling: [
        ['count(temperature) last 5 minutes = 0', 'Checks no events of temperature has arrived every 5 minutes'],
        ['avg(temperature) last 5 minutes > 30', 'Checks average of temperature of temperature is great than 30 every 5 minutes'],
        ['max(temperature) last 5 minutes > 10', 'Checks max value of temperature is great than 30 every 5 minutes'],
    ]
};

export type RuleTypeCardProp = {selected?: boolean, type: RuleTypes, ariaLabel: string, onClick():void};
const RuleTypeCard: React.FC<RuleTypeCardProp> = ({selected, type, ariaLabel, onClick}) => {
    const styles = useStyles();
    const stylesCard = useCardStyles();
    return (
        <div className={selected ? styles.cardButtonSelected : styles.cardButton} aria-label={ariaLabel} onClick={onClick}>
            <div className={styles.rulesTypeHeader}>
                <Avatar
                    aria-label="recipe"
                    className={`${styles.ruleAvatar} ${colorTypeSelector(type, stylesCard)}`}>
                    {type.slice(0, 1).toUpperCase()}
                </Avatar>
                <Typography className={styles.ruleTypeTextTitle}>{titles[type].toUpperCase()}</Typography>
            </div>
        </div>
    );
};

export type CreateRuleDialogProps = {isOpen: boolean; onClose?():void; onSelect?(type: RuleTypes):void;};
export const CreateRuleDialog: React.FC<CreateRuleDialogProps> = ({isOpen, onClose = NOOP, onSelect = NOOP}) => {
    const styles = useStyles();
    const [type, setType] = React.useState<RuleTypes|null>(null);
    const selectType = React.useCallback((type: RuleTypes) => setType(type), []);
    const fireSelected = React.useCallback(() => {
        onSelect(type!);
        onClose();
        setType(null);
    }, [onSelect, onClose, type]);
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullWidth={true}
            maxWidth='md'
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
                <RuleTypeCard type='none' ariaLabel='create rule real time card' selected={type === 'none'} onClick={() => selectType('none')}/>
                <RuleTypeCard type='hopping' ariaLabel='create rule hopping card' selected={type === 'hopping'} onClick={() => selectType('hopping')}/>
                <RuleTypeCard type='sliding' ariaLabel='create rule sliding card' selected={type === 'sliding'} onClick={() => selectType('sliding')}/>
                <RuleTypeCard type='tumbling' ariaLabel='create rule tumbling card' selected={type === 'tumbling'} onClick={() => selectType('tumbling')}/>
            </DialogContent>
            <DialogContent>

                <div className={styles.samplesBox}>
                    {
                        type != null && (<Typography className={styles.ruleTypeTextSubtitle}>{subtitles[type]}</Typography>)
                    }
                    {
                        type != null && samples[type].map((text, idx) => (
                            <div className={styles.ruleSample} key={idx}>
                                <Typography className={styles.ruleTypeTextSampleTitle}>{text[0]}</Typography>
                                <Typography className={styles.ruleTypeTextSampleDescription}>{text[1]}</Typography>
                            </div>
                        ))
                    }
                    {
                        type === null && (
                            <div className={styles.ruleSample}>
                                <Typography className={styles.ruleTypeTextSampleTitle}>You need to select one type of Rule.</Typography>
                                <Typography className={styles.ruleTypeTextSampleDescription}>Each type of rule has a diferent behaivior and can supply diferent use cases.</Typography>
                            </div>
                        )
                    }
                </div>
            </DialogContent>
            <DialogActions aria-label='actions'>
                <Button onClick={fireSelected} disabled={!type}>Select</Button>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRuleDialog;
