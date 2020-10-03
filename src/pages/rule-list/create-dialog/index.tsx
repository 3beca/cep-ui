import * as React from 'react';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Avatar from '@material-ui/core/Avatar';
import { Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import { NOOP } from '../../../utils';
import { RuleTypes } from '../../../services/api';
import { colorTypeSelector, mapRuleTypeName } from '../rule-card';
import { useStyles } from './styles';
import { useStyles as useCardStyles } from '../rule-card/styles';
import { useHistory } from 'react-router-dom';

type RuleTypesText = { [key in RuleTypes]: string[] };
type RuleTypesSamples = { [key in RuleTypes]: string[][] };
const subtitles: RuleTypesText = {
    realtime: [
        'This rule executes one time for each event',
        'On event payload of a given type, each rule will be evaluated to determinate if the event payload match the rule filter or does not.'
    ],
    sliding: [
        'This rule executes one time for each event aggregating previous events',
        'On event payload of a given type, sliding rule evaluates a filter match based on an aggregation of a given time window. Aggregation operators supported are max, min, count, avg, stdDevPop, stdDevSample.'
    ],
    tumbling: [
        'This rule executes in fixed time intervals aggregating events reveived inside each interval',
        'As sliding rules, tumbling rules perform an aggregation of a given time window. However, in spite of realtime and slinding rules, tumbling rules got executed on a given time interval. This time interval matches the time window'
    ],
    hopping: [
        'This rule executes each custom time interval aggregatting events occurred in a fixed time interval',
        'compute windowing with...'
    ]
};
const samples: RuleTypesSamples = {
    realtime: [
        [
            'temperature > 10',
            'Checks temperature is great than 10 for each temperature received'
        ],
        [
            'distance(location) > 50',
            'Checks a locations is great than 5 meters'
        ],
        [
            'battery < 30 and windSpeed > 5',
            'Checks battery is less than 30 and windSpeed great than 5'
        ]
    ],
    sliding: [
        [
            'avg(temperature) > 35 last hour',
            'Checks temperature average is greater than 35 degrees on the last hour'
        ],
        [
            'sum(count) > 100 last 30 seconds',
            'Checks count sum is greater than 100 on the last 30 seconds'
        ],
        [
            'max(prints) < 10 last 90 minutes',
            'Checks max prints is less than 10 on the last 90 minutes'
        ]
    ],
    tumbling: [
        [
            'count(temperature) = 0 last 5 minutes',
            'Checks no events of temperature has arrived every 5 minutes'
        ],
        [
            'avg(temperature) > 30 last 5 minutes',
            'Checks average of temperature of temperature is great than 30 every 5 minutes'
        ],
        [
            'max(temperature) > 10 last 5 minutes',
            'Checks max value of temperature is great than 30 every 5 minutes'
        ]
    ],
    hopping: [
        [
            'count(temperature) = 0 each 5 minutes in 10 minutes',
            'Checks no events of temperature has arrived every 5 minutes'
        ],
        [
            'avg(temperature) > 30 each 15 minutes in 1 hour',
            'Checks average of temperature of temperature is great than 30 every 15 minutes in a 1 hour window'
        ],
        [
            'max(temperature) > 10 each 5 seconds in 1 minute',
            'Checks max value of temperature is great than 30 every 5 seconds in a 1 minute window'
        ]
    ]
};

export type RuleTypeCardProp = {
    selected?: boolean;
    type: RuleTypes;
    ariaLabel: string;
    onClick(): void;
};
const RuleTypeCard: React.FC<RuleTypeCardProp> = ({
    selected,
    type,
    ariaLabel,
    onClick
}) => {
    const styles = useStyles();
    const stylesCard = useCardStyles();
    return (
        <div
            className={selected ? styles.cardButtonSelected : styles.cardButton}
            aria-label={ariaLabel}
            onClick={onClick}
        >
            <div className={styles.rulesTypeHeader}>
                <Avatar
                    aria-label='avatar rule type'
                    className={`${styles.ruleAvatar} ${colorTypeSelector(
                        type,
                        stylesCard
                    )}`}
                >
                    {mapRuleTypeName(type).slice(0, 1).toUpperCase()}
                </Avatar>
                <Typography className={styles.ruleTypeTextTitle}>
                    {mapRuleTypeName(type).toUpperCase()}
                </Typography>
            </div>
        </div>
    );
};

export type CreateRuleDialogProps = { isOpen: boolean; onClose?(): void };
export const CreateRuleDialog: React.FC<CreateRuleDialogProps> = ({
    isOpen,
    onClose = NOOP
}) => {
    const styles = useStyles();
    const [type, setType] = React.useState<RuleTypes | null>(null);
    const selectType = React.useCallback(
        (type: RuleTypes) => setType(type),
        []
    );
    const history = useHistory();
    const fireSelected = React.useCallback(() => {
        history.push(`/rules/create/${type}`);
        onClose();
        setType(null);
    }, [history, onClose, type]);
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            fullWidth={true}
            maxWidth='md'
            id='create-rule-dialog'
            scroll='paper'
            aria-label='create rule dialog'
        >
            <DialogTitle aria-label='title create rule'>
                What kind of rule do you need?
            </DialogTitle>
            <DialogContent
                dividers={true}
                className={styles.dialogContent}
                aria-label='kind of rules description'
            >
                <RuleTypeCard
                    type='realtime'
                    ariaLabel='create rule real time card'
                    selected={type === 'realtime'}
                    onClick={() => selectType('realtime')}
                />
                <RuleTypeCard
                    type='sliding'
                    ariaLabel='create rule sliding card'
                    selected={type === 'sliding'}
                    onClick={() => selectType('sliding')}
                />
                <RuleTypeCard
                    type='tumbling'
                    ariaLabel='create rule tumbling card'
                    selected={type === 'tumbling'}
                    onClick={() => selectType('tumbling')}
                />
                <RuleTypeCard
                    type='hopping'
                    ariaLabel='create rule hopping card'
                    selected={type === 'hopping'}
                    onClick={() => selectType('hopping')}
                />
            </DialogContent>
            <DialogContent>
                <div className={styles.samplesBox}>
                    {type != null && (
                        <div>
                            <Typography className={styles.ruleTypeTextSubtitle}>
                                {subtitles[type][0]}
                            </Typography>
                            <Typography
                                className={styles.ruleTypeTextDescription}
                            >
                                {subtitles[type][1]}
                            </Typography>
                        </div>
                    )}
                    {type != null &&
                        samples[type].map((text, idx) => (
                            <div className={styles.ruleSample} key={idx}>
                                <Typography
                                    className={styles.ruleTypeTextSampleTitle}
                                >
                                    {text[0]}
                                </Typography>
                                <Typography
                                    className={
                                        styles.ruleTypeTextSampleDescription
                                    }
                                >
                                    {text[1]}
                                </Typography>
                            </div>
                        ))}
                    {type === null && (
                        <div className={styles.ruleSample}>
                            <Typography
                                className={styles.ruleTypeTextSampleTitle}
                            >
                                You need to select one type of Rule.
                            </Typography>
                            <Typography
                                className={styles.ruleTypeTextSampleDescription}
                            >
                                Each type of rule has a diferent behaivior and
                                can supply diferent use cases.
                            </Typography>
                        </div>
                    )}
                </div>
            </DialogContent>
            <Divider />
            <DialogActions aria-label='actions'>
                <Button onClick={onClose} aria-label='close button'>
                    Close
                </Button>
                <Button
                    onClick={fireSelected}
                    disabled={!type}
                    className={styles.selectButton}
                    aria-label='select button'
                >
                    Select
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CreateRuleDialog;
