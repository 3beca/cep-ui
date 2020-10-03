import * as React from 'react';
import { useStyles } from './styles';

export const EventLogListPage: React.FC<{}> = () => {
    const styles = useStyles();
    return (
        <div className={styles.root}>
            <h1>Event List</h1>
            {Array.from({ length: 10 }, (_, idx) => (
                <div key={idx} aria-label='element row event logs'>
                    Event Log {idx}
                </div>
            ))}
        </div>
    );
};

export default EventLogListPage;
