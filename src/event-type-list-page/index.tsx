import * as React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import DeleteIcon from '@material-ui/icons/Delete';
import IconDialog from '../components/icon-dialog';
import DeleteDialog from './delete-dialog';
import { TableEventType } from './event-type-table';
import { useStyles } from './styles';
import { EventType } from '../services/event-type';

export type EventTypeListPageProps = {};
export const EventTypeListPage: React.FC<EventTypeListPageProps> = function CEPList() {
    const styles = useStyles();
    const [selecteds, setSelecteds] = React.useState<EventType[]>([]);
    const show = (Array.isArray(selecteds) && selecteds.length > 0) ? true : false;
    return (
        <div className={styles.root}>
            <div className={styles.tabletitle}>
                <Toolbar>
                    <Typography variant='h6' className={styles.tablename}>List of Event Types</Typography>
                    <IconDialog
                        show={show}
                        icon={<DeleteIcon className={styles.deleteIcon} aria-label='delete-icon'/>}>
                        <DeleteDialog eventTypes={selecteds}/>
                    </IconDialog>
                </Toolbar>
            </div>
            <TableEventType onSelected={setSelecteds}/>
        </div>
    );
}

export default EventTypeListPage;
