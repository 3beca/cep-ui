import * as React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import { TableEventType } from './event-type-table';
import { useStyles } from './styles';
import { EventType } from '../services/event-type';

export type EventTypeListPageProps = {};
export const EventTypeListPage: React.FC<EventTypeListPageProps> = function CEPList() {
    const styles = useStyles();
    const [selecteds, setSelecteds] = React.useState<EventType[]>([]);
    return (
        <div className={styles.root}>
            <div className={styles.tabletitle}>
                <Toolbar>
                    <Typography variant='h6' className={styles.tablename}>List of Event Types</Typography>
                    {
                        selecteds.length > 0 &&
                        <IconButton aria-label='delete-icon'><DeleteIcon className={styles.deleteIcon}/></IconButton>
                    }
                </Toolbar>
            </div>
            <TableEventType onSelected={setSelecteds}/>
        </div>
    );
}

export default EventTypeListPage;
