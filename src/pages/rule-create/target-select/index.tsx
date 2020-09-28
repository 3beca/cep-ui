import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { useGetListAccumulated } from '../../../services/use-getlist-enhancer';
import Autocomplete from '../../../components/autocomplete/index';
import TargetCreate from './target-create/index';
import {useStyles} from './styles';
import { ENTITY } from '../../../services/api-provider/use-api';
import { Target } from '../../../services/api';

export const emptyTarget: Target = {
    id: '',
    name: '',
    url: '',
    createdAt: '',
    updatedAt: ''

};
export type TargetSelectorProps = {
    selected: Target|null;
    onSelected: (target: Target|null) => void;
    disabled?: boolean;
};
export const TargetSelector: React.FC<TargetSelectorProps> = ({selected, onSelected, disabled = false}) => {
    const styles = useStyles();
    const {isLoading, accumulated, changeFilter} = useGetListAccumulated<Target>(ENTITY.TARGETS, 1, 10, '', !disabled && !selected);
    const handleClearSelection = React.useCallback(() => onSelected(null), [onSelected]);
    if (selected) {
        return (
            <Paper
                className={styles.container}
                aria-label={`target selector${disabled ? ' disabled' : ''}`}>
                <TargetCreate target={selected} clearTarget={handleClearSelection} setTarget={onSelected} disabled={disabled}/>
            </Paper>
        );
    }
    return (
        <Paper
            className={styles.container}
            aria-label={`target selector${disabled ? ' disabled' : ''}`}>
            <Autocomplete<Target>
                disabled={disabled}
                options={accumulated}
                selected={selected}
                setSelected={onSelected}
                emptyElement={emptyTarget}
                isLoading={isLoading}
                changeFilter={changeFilter}
                ariaLabel='target name'
                placeholderText='Search a Target'
                loadingText='Loading Targets'
            />
        </Paper>
    );
};

export default TargetSelector;