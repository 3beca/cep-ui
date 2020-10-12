import * as React from 'react';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/CloseOutlined';
import Divider from '@material-ui/core/Divider';

import { useGetListAccumulated } from '../../../services/use-getlist-enhancer';
import Autocomplete from '../../../components/autocomplete/index';
import TargetCreate from './target-create';
import { useStyles } from './styles';
import { ENTITY } from '../../../services/api-provider/use-api';
import { Target, TargetHeader } from '../../../services/api';
import { cutString } from '../../../utils';

export const emptyTarget: Target = {
    id: '',
    name: '',
    url: '',
    createdAt: '',
    updatedAt: ''
};

export type HeaderItemProps = {
    headerKey: String;
    headerValue: string;
};
export const HeaderItem: React.FC<HeaderItemProps> = ({ headerKey, headerValue }) => {
    const styles = useStyles();
    return (
        <div aria-label='target creating headers item' className={styles.targetHeaderListItem}>
            <Typography aria-label='target selected key header' variant='caption' className={styles.targetHeaderListItemKey}>
                {headerKey}
            </Typography>
            <Typography variant='caption'>{' : '}</Typography>
            <Typography aria-label='target selected value header' variant='caption' className={styles.targetHeaderListItemValue}>
                {headerValue}
            </Typography>
        </div>
    );
};
export type HeaderListProps = {
    headers?: TargetHeader;
};
export const HeaderList: React.FC<HeaderListProps> = ({ headers }) => {
    const styles = useStyles();
    if (!headers) return null;
    const headersKey = Object.keys(headers);
    if (!Array.isArray(headersKey) || headersKey.length === 0) return null;
    return (
        <div aria-label='target selected headers list' className={styles.targetHeaderList}>
            <Divider />
            <Typography variant='caption' className={styles.targetHeaderTitle}>
                Headers
            </Typography>
            {headersKey.map(header => (
                <HeaderItem key={header} headerKey={header} headerValue={headers[header]} />
            ))}
            <Divider />
        </div>
    );
};

export type TargetSelectedProps = {
    target: Target;
    clearTarget: () => void;
    setTarget(target: Target): void;
    disabled?: boolean;
};
export const TargetSelected: React.FC<TargetSelectedProps> = ({ target, clearTarget, setTarget, disabled = false }) => {
    const styles = useStyles();
    const [currentTarget, setCurrentTarget] = React.useState(target);
    React.useEffect(() => {
        if (currentTarget.id) {
            setTarget(currentTarget);
        }
    }, [currentTarget, setTarget]);
    if (!currentTarget.id && !disabled) {
        return <TargetCreate targetName={target.name} onCreate={setCurrentTarget} close={clearTarget} />;
    }
    return (
        <div className={styles.targetSelectedDetails} aria-label='target selected block'>
            <div className={styles.targetSelectedDetailsActions}>
                <Typography className={styles.targetSelectedDetailsActionsType} variant='caption'>
                    Target
                </Typography>
                <IconButton disabled={disabled} onClick={clearTarget} aria-label='target selected clear'>
                    <IconClose fontSize='small' />
                </IconButton>
            </div>
            <div className={styles.targetSelectedDetailsName} aria-label='target selected name'>
                <Typography variant='h5'>{currentTarget.name}</Typography>
            </div>
            <HeaderList headers={currentTarget.headers} />
            <div className={styles.targetSelectedDetailsURL} aria-label='target selected url'>
                <Typography variant='caption' className={styles.targetSelectedDetailsURLHeader}>
                    URL
                </Typography>
                <Typography variant='caption' className={styles.targetSelectedDetailsURLText}>
                    {cutString(currentTarget.url, 40)}
                </Typography>
            </div>
        </div>
    );
};

export type TargetSelectorProps = {
    selected: Target | null;
    onSelected: (target: Target | null) => void;
    disabled?: boolean;
};
export const TargetSelector: React.FC<TargetSelectorProps> = ({ selected, onSelected, disabled = false }) => {
    const styles = useStyles();
    const { isLoading, accumulated, changeFilter } = useGetListAccumulated<Target>(ENTITY.TARGETS, 1, 10, '', !disabled && !selected);
    const handleClearSelection = React.useCallback(() => onSelected(null), [onSelected]);
    if (selected) {
        return (
            <Paper className={styles.container} aria-label={`target selector${disabled ? ' disabled' : ''}`}>
                <TargetSelected target={selected} clearTarget={handleClearSelection} setTarget={onSelected} disabled={disabled} />
            </Paper>
        );
    }
    return (
        <Paper className={styles.container} aria-label={`target selector${disabled ? ' disabled' : ''}`}>
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
