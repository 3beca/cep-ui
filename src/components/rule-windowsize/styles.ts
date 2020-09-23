import {makeStyles} from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        padding: 6
    },
    unitContainer: {
        padding: 10
    },
    unitContainerSelected: {
        padding: 10,
        backgroundColor: 'pink'
    }
}));

export default useStyles;