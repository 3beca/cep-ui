import * as React from 'react';
import { RuleTypes, WindowingSize, WindowingSizeUnits } from '../../services/api';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { useStyles } from './styles';

export const checkIntValue = (value: string) => {
    const valueInt = Number(value);
    return (
        value !== undefined &&
        value !== '' &&
        typeof valueInt === 'number' &&
        !Number.isNaN(valueInt) &&
        valueInt > 0 &&
        Number.isInteger(valueInt)
    );
};
export const showErrorMessage = (value: string) => {
    if (value === undefined || value === '') return false;
    const valueInt = Number(value);
    return !(typeof valueInt === 'number' && !Number.isNaN(valueInt) && valueInt > 0 && Number.isInteger(valueInt));
};
export type RuleWindowSizeProps = {
    type: RuleTypes;
    disabled?: boolean;
    windowSize?: WindowingSize;
    updateWindowSize: (windowSize: WindowingSize | undefined) => void;
};
export const RuleWindowSize: React.FC<RuleWindowSizeProps> = ({ type, windowSize, updateWindowSize, disabled }) => {
    const styles = useStyles();
    const [unit, setUnit] = React.useState<WindowingSizeUnits | undefined>(windowSize?.unit);
    const [value, setValue] = React.useState(windowSize !== undefined ? windowSize.value + '' : '');
    React.useEffect(() => {
        // Check for valid windowSize
        const valueInt = Number(value);
        if (!!unit && checkIntValue(value)) {
            updateWindowSize({ unit, value: valueInt });
        } else {
            //in other case send undefined
            updateWindowSize(undefined);
        }
    }, [unit, value, updateWindowSize]);
    if (type === 'realtime') return null;
    const valueError = showErrorMessage(value);
    return (
        <div aria-label='rule windowsize main container' className={styles.container}>
            <Typography className={styles.titleHeader} variant='caption'>
                Windowing Time Frame
            </Typography>
            <div aria-label='rule windowsize value container' className={styles.timeBox}>
                <TextField
                    fullWidth
                    inputProps={{ 'aria-label': 'rule windowsize input value', className: styles.timeBoxText }}
                    disabled={disabled}
                    label={unit ? `Set time in ${unit}s` : 'Select a unit time'}
                    value={value}
                    onChange={ev => setValue(ev.target.value)}
                    inputMode='numeric'
                    onFocus={ev => ev.target.select()}
                    error={valueError}
                    helperText={valueError ? 'Only positive integers' : ''}
                />
            </div>
            <div aria-label='rule windowsize units container' className={styles.unitContainer}>
                <div
                    aria-label={'rule windowsize unit hour' + (unit === 'hour' ? ' selected' : '')}
                    className={unit === 'hour' ? styles.unitItemSelected : styles.unitItem}
                    onClick={() => !disabled && setUnit('hour')}
                >
                    <Typography variant='caption'>HOUR</Typography>
                </div>
                <div
                    aria-label={'rule windowsize unit minute' + (unit === 'minute' ? ' selected' : '')}
                    className={unit === 'minute' ? styles.unitItemSelected : styles.unitItem}
                    onClick={() => !disabled && setUnit('minute')}
                >
                    <Typography variant='caption'>MINUTE</Typography>
                </div>
                <div
                    aria-label={'rule windowsize unit second' + (unit === 'second' ? ' selected' : '')}
                    className={unit === 'second' ? styles.unitItemSelected : styles.unitItem}
                    onClick={() => !disabled && setUnit('second')}
                >
                    <Typography variant='caption'>SECOND</Typography>
                </div>
            </div>
        </div>
    );
};

export default RuleWindowSize;
