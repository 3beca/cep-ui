import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconClose from '@material-ui/icons/CloseOutlined';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';


import {useStyles} from './styles';
import { useCreate, ENTITY } from '../../../../services/api/use-api';
import { APIError } from '../../../../utils/fetch-api';
import {cutString} from '../../../../utils';
import { Target, ServiceError } from '../../../../services/api';

const TargetCreatorLoader: React.FC<{show: boolean}> = ({show}) => {
    const styles = useStyles();
    if (!show) return null;
    return (
        <div
            className={styles.detailsStatusLoading}
            aria-label='target creating loading'>
            <Typography variant='caption' className={styles.detailsStatusLoadingText}>Creating Target</Typography>
            <CircularProgress color='primary' size={24}/>
        </div>
    );
};

const TargetCreatorError: React.FC<{error: APIError<ServiceError>|undefined}> = ({error}) => {
    const styles = useStyles();
    if (!error) return null;
    return (
        <div
            className={styles.detailsStatusError}
            aria-label='target creating error'>
            <Typography variant='caption'>{error.error?.message}</Typography>
        </div>
    );
};

const TargetCreatorSuccess: React.FC<{target: Target|undefined}> = ({target}) => {
    const styles = useStyles();
    if (!target) return null;
    return (
        <div
            className={styles.detailsURL}
            aria-label='target creating url'>
            <Typography variant='caption'>{cutString(target.url, 40)}</Typography>
        </div>
    );
};

export const TargetCreateURL: React.FC<{show: boolean; url: string; setURL: (url: string) => void; createTarget: () => void;}> = ({show, url, setURL, createTarget}) => {
    const styles = useStyles();
    const changeURL = React.useCallback((ev: React.ChangeEvent<HTMLInputElement>) => {
        setURL(ev.target.value);
    }, [setURL]);
    if(!show) return null;
    return (
        <div className={styles.detailsCreateURL}>
            <TextField
                fullWidth={true}
                value={url}
                onChange={changeURL}
                label='URL (http/https)'
                helperText='URL to send events when rule matchs'
                inputProps={{'aria-label': 'target creating input url'}}/>
            <Button
                className={styles.detailsCreateURLButton}
                aria-label='target creating button url'
                disabled={!url.startsWith('http')}
                title='Create target'
                onClick={createTarget}>
                <Typography>Create</Typography>
            </Button>
        </div>

    );
};

const TargetCreator: React.FC<{targeteBody: Partial<Target>; resolve: (target: Target) => void; close: () => void;}> = ({targeteBody, resolve, close}) => {
    const styles = useStyles();
    const [url, setURL] = React.useState('');
    const {isLoading, response, error, request} = useCreate<Target>(ENTITY.TARGETS, {name: targeteBody.name, url}, false);

    React.useEffect(
        () => {
            if(!isLoading && !error && !!response?.data) {
                resolve(response.data);
            }
        }, [isLoading, error, response, resolve]
    );

    return (
        <div
            className={styles.details}
            aria-label='target creating block'>
            <div className={styles.detailsActions}>
                <Typography className={styles.detailsActionsType} variant='caption'>Target</Typography>
                <IconButton
                    disabled={isLoading}
                    onClick={close}
                    aria-label='target creating clear'>
                    <IconClose fontSize='small'/>
                </IconButton>
            </div>
            <div
                className={styles.detailsName}
                aria-label='target creating name'>
                <Typography variant='h5'>{targeteBody.name}</Typography>
            </div>
            <div
                className={styles.detailsStatus}
                aria-label='target creating action'>
                <TargetCreateURL show={!isLoading && !response} url={url} setURL={setURL} createTarget={request}/>
                <TargetCreatorLoader show={isLoading}/>
                <TargetCreatorError error={error}/>
                <TargetCreatorSuccess target={response?.data}/>
            </div>
        </div>
    );
};

export type TargetCreateProps = {
    target: Target;
    clearTarget: () => void;
};
export const TargetCreate: React.FC<TargetCreateProps> = ({target, clearTarget}) => {
    const styles = useStyles();
    const targetBody = React.useRef<Partial<Target>>({name: target.name});
    const [currentTarget, setCurrentTarget] = React.useState(target);

    if(!currentTarget.id) {
        return <TargetCreator targeteBody={targetBody.current} resolve={setCurrentTarget} close={clearTarget}/>
    }
    return (
        <div
            className={styles.details}
            aria-label='target selected block'>
            <div className={styles.detailsActions}>
                <Typography className={styles.detailsActionsType} variant='caption'>Target</Typography>
                <IconButton
                    onClick={clearTarget}
                    aria-label='target selected clear'>
                    <IconClose fontSize='small'/>
                </IconButton>
            </div>
            <div
                className={styles.detailsName}
                aria-label='target selected name'>
                <Typography variant='h5'>{currentTarget.name}</Typography>
            </div>
            <div
                className={styles.detailsURL}
                aria-label='target selected url'>
                <Typography variant='caption'>{cutString(currentTarget.url, 40)}</Typography>
            </div>
        </div>
    );
};

export default TargetCreate;