import * as React from 'react';
// import Dialog from '@material-ui/core/Dialog';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import AddIcon from '@material-ui/icons/AddOutlined';
// import DownloadIcon from '@material-ui/icons/CloudDownloadOutlined';
// import DeleteIcon from '@material-ui/icons/DeleteOutline';
// import Button from '@material-ui/core/Button';
// import TextField from '@material-ui/core/TextField';
// import LocationIcon from '@material-ui/icons/LocationOnOutlined';
// import NumberIcon from '@material-ui/icons/Filter1Outlined';
// import StringIcon from '@material-ui/icons/FontDownloadOutlined';
// import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
// import Divider from '@material-ui/core/Divider';
// import IconDialog, {useIconDialog} from '../icon-dialog';
import { RuleGroup, RuleTypes } from '../../services/api';
import { EventPayload } from '../event-payload-creator/utils';

import {useStyles} from './styles';


// export type GroupFieldViewDeleteButtonProps= {
//     removeGroupField?: () => void;
//     disabled?: boolean;
// };
// export const GroupFieldViewDeleteButton: React.FC<GroupFieldViewDeleteButtonProps> = ({removeGroupField, disabled = false}) => {
//     if (!removeGroupField) return null;
//     return (
//         <IconButton
//             aria-label='group field button remove'
//             onClick={removeGroupField}
//             disabled={disabled}>
//                 <DeleteIcon/>
//         </IconButton>
//     );
// };
// export const IconByFieldType: React.FC<{type: PayloadTypes}> = ({type}) => {
//     if (type === 'number') return <NumberIcon/>;
//     if (type === 'location') return <LocationIcon/>;
//     return <StringIcon/>;
// };

// export type GroupFieldViewProps = {
//     payloadField: PayloadField;
//     removePayloadField?: () => void;
//     disabled?: boolean;
// };
// export const GroupFieldView: React.FC<GroupFieldViewProps> = ({payloadField, removePayloadField, disabled}) => {
//     const styles = useStyles();
//     return (
//         <div
//             aria-label='payload field'
//             className={styles.paloadFieldView}>
//             <div className={styles.payloadFieldViewIcon}><IconByFieldType type={payloadField.type}/></div>
//             <Typography className={styles.payloadFieldViewText}>{payloadField.name}</Typography>
//             <GroupFieldViewDeleteButton removePayloadField={removePayloadField} disabled={disabled}/>
//         </div>
//     );
// };

// export type GroupSchema = {
//     disabled?: boolean;
//     group?: RuleGroup;
//     setGroup: (group?: RuleGroup) => void;
// };
// export const GroupSchema: React.FC<GroupSchema> = ({disabled, group, setGroup}) => {
//     const styles = useStyles();
//     const removePayloadField = React.useCallback(
//         (index: number) => {
//             const beforeIndex = payload && payload.slice(0, index);
//             const afterIndex = payload && payload.slice(index + 1);
//             setPayload([...beforeIndex, ...afterIndex]);
//         },
//         [setPayload, payload]
//     );
//     if (!group) {
//         return (
//             <div
//                 aria-label='payload creator info message'
//                 className={styles.info}>
//                 <Typography className={styles.infoText}>A Windowing group is required in order to create a Rule. Creating a group require to you to create or download a Payload first.</Typography>
//             </div>
//         );
//     }

//     const fields = payload.map(
//         (payloadField, idx) => (
//             <div key={idx}>
//                 <GroupFieldView
//                     disabled={disabled}
//                     payloadField={payloadField}
//                     removePayloadField={() => removePayloadField(idx)}/>
//             </div>
//         )
//     );
//     return (
//         <div aria-label='payload creator schema'>
//             <Divider/>
//             {fields}
//         </div>
//     );
// };

export type RuleGroupCreatorProps = {
    ruleTpe: RuleTypes;
    payload: EventPayload|null;
    group?: RuleGroup;
    setGroup: (group?: RuleGroup) => void;
    disabled?: boolean;
};
export const RuleGroupCreator: React.FC<RuleGroupCreatorProps> = ({
    ruleTpe,
    payload,
    group,
    setGroup,
    disabled = false
}) => {
    const styles = useStyles();
    if (ruleTpe === 'realtime') return null;
    return (
        <div className={styles.container} aria-label='rule group creator container'>
            <div className={styles.groupCreatorHeader}>
                <Typography variant='caption' className={styles.groupCreatorHeaderTitle}>Windowing Group</Typography>

            </div>

        </div>
    );
};

export default RuleGroupCreator;

/*
    <IconDialog aria-label='rule group creator addfield button open dialog' show={true} disabled={disabled || !payload} icon={<AddIcon aria-label='rule group creator addfield icon'/>}>
        <GroupAddField
            disabled={disabled}
            payload={payload}
            updateGroup={(newPayloadField: PayloadField) => {
                const currentPayload = !payload ? [] : payload;
                const sameFieldName = currentPayload.find(field => field.name === newPayloadField.name);
                if (sameFieldName) {
                    sameFieldName.type = newPayloadField.type;
                    setPayload([...payload]);
                }
                else {
                    setPayload([...currentPayload, newPayloadField]);
                }
            }}/>
    </IconDialog>

    ==============================

    <GroupSchema
        disabled={disabled}
        group={group}
        setGroup={setGroup}/>
*/