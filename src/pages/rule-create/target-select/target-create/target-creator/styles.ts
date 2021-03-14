import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    // Target Creator
    container: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    createDetailsActions: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    createDetailsActionsType: {
        display: 'flex',
        flex: 1,
        alignItems: 'flex-start',
        fontWeight: 700
    },
    createDetailsName: {
        display: 'flex'
    },
    createDetailsURL: {
        display: 'flex'
    },
    createDetailsURLButton: {
        marginLeft: 10
    },
    createDetailsStatus: {
        display: 'flex',
        padding: 6,
        flexDirection: 'column'
    },
    createDetailsStatusLoading: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        marginRight: 12,
        color: theme.palette.primary.main
    },
    createDetailsStatusLoadingText: {
        marginRight: 8
    },
    createDetailsStatusError: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        marginRight: 12,
        color: theme.palette.error.dark
    }
}));

export default useStyles;
