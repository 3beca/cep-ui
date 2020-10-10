import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        padding: 6,
        maxWidth: 320
    },
    titleHeader: {
        flex: 1,
        alignItems: 'flex-start',
        fontWeight: 700
    },
    unitContainer: {
        display: 'flex',
        padding: 10
    },
    unitItem: {
        display: 'flex',
        flex: 1,
        padding: 4,
        cursor: 'pointer',
        justifyContent: 'center',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: 20
    },
    unitItemSelected: {
        display: 'flex',
        flex: 1,
        padding: 4,
        justifyContent: 'center',
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.common.white,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'transparent',
        borderRadius: 20
    },
    timeBox: {
        display: 'flex'
    },
    timeBoxText: {
        display: 'flex',
        textAlign: 'center',
        fontSize: 24
    }
}));

export default useStyles;
