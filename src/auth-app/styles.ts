import {makeStyles} from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
    container: {
        display: 'flex',
        margin: 40,
        justifyContent: 'center',
    },
    dialog: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        borderStyle: 'solid',
        borderWidth: 2,
        borderRadius: 16,
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.secondary.light,
        color: theme.palette.common.white
    },
    message: {
        padding: 36,
        justifyContent: 'center'
    },
    messageText: {
        color: theme.palette.common.white,
        fontSize: 22
    }
}));

export default useStyles;