import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        height: '90vh',
        margin: 40,
        justifyContent: 'center',
        alignItems: 'center'
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
        backgroundColor: theme.palette.warning.light
    },
    message: {
        padding: 16,
        justifyContent: 'center'
    },
    messageText: {
        color: theme.palette.common.black
    }
}));

export default useStyles;
