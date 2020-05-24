import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import { useGetListAccumulated } from '../../../services/use-getlist-enhancer';
import Autocomplete from '../../../components/autocomplete/index';
import TargetCreate from './target-create/index';
import {useStyles} from './styles';
import { ENTITY } from '../../../services/api/use-api';
import { Target } from '../../../services/api';

const emptyTarget: Target = {
    id: '',
    name: '',
    url: '',
    createdAt: '',
    updatedAt: ''

};
export const TargetSelector: React.FC<{}> = () => {
    const styles = useStyles();
    const {isLoading, accumulated, changeFilter} = useGetListAccumulated<Target>(ENTITY.TARGETS, 1, 10, '', true);
    const [selected, setSelected] = React.useState<Target|null>(null);
    const handleClearSelection = React.useCallback(() => setSelected(null), []);

    if (selected) {
        return (
            <Paper
                className={styles.container}
                aria-label={`target selector`}>
                <TargetCreate target={selected} clearTarget={handleClearSelection}/>
            </Paper>
        );
    }
    return (
        <Paper
            className={styles.container}
            aria-label={`target selector`}>
            <Autocomplete<Target>
                options={accumulated}
                selected={selected}
                setSelected={setSelected}
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