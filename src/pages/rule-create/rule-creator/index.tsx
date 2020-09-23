import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import {useStyles} from './styles';

export type RuleHeader = {
    name: string;
    skipOnConsecutivesMatches: boolean;
};
export type RuleCreatorProps = {
    ruleHeader: Partial<RuleHeader>;
    updateRuleHeader(rule: Partial<RuleHeader>): void;
    disabled?: boolean;
};
export const RuleCreator: React.FC<RuleCreatorProps> = ({ruleHeader, updateRuleHeader, disabled = false}) => {
    const styles = useStyles();
    return (
        <Paper className={styles.container} aria-label={`rule creator${disabled ? ' disabled' : ''}`}>
            <TextField
                disabled={disabled}
                required={true}
                placeholder='Enter rule name'
                inputProps={{
                    'aria-label': 'rule creator name',
                }}
                value={ruleHeader.name}
                onChange={(ev) => updateRuleHeader({name: ev.target.value})}/>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Switch
                                disabled={disabled}
                                size='medium'
                                color='primary'
                                checked={ruleHeader.skipOnConsecutivesMatches ? true : false}
                                onChange={(ev) => updateRuleHeader({skipOnConsecutivesMatches: ev.target.checked})}
                                aria-label='rule creator skip consecutives'/>
                        }
                        title='Skip Consecutives'
                        label='Skip Consecutives'
                        labelPlacement='end'
                    />
                </FormGroup>
        </Paper>
    );
};

export default RuleCreator;