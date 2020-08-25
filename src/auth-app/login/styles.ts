import {makeStyles} from '@material-ui/core';

export const useStyles = makeStyles((theme) => ({
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
        minWidth: 380,
        borderWidth: 2,
        borderRadius: 16,
        backgroundColor: theme.palette.common.white
    },
    title: {
        borderWidth: 2,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 8,
        color: theme.palette.common.white,
        backgroundColor: theme.palette.primary.dark,
        textAlign: 'center'
    },
    infoMessage: {
        color: theme.palette.warning.dark,
        padding: 8,
        textAlign: 'center'
    },
    errorMessage: {
        color: theme.palette.error.dark,
        padding: 8,
        textAlign: 'center'
    },
    content: {
        paddingLeft: 32,
        paddingRight: 32,
        paddingTop: 32,
    },
    divider: {
        marginTop: 10
    }
}));

export default useStyles;