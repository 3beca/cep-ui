import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    // Target Selected
    createDetails: {
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
    },

    // Header List Edit
    targetHeaderEditList: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 320,
        marginTop: 6,
        marginBottom: 6
    },
    targetHeaderEditHeader: {
        display: 'flex',
        alignItems: 'center'
    },
    targetHeaderEditTitle: {
        flex: 1,
        marginLeft: 4,
        fontWeight: 900
    },
    targetHeaderEditListItem: {
        display: 'flex',
        alignItems: 'center'
    },
    targetHeaderEditListItemKey: {
        fontWeight: 500
    },
    targetHeaderEditListItemValue: {
        flex: 1,
        marginLeft: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    targetHeaderAddDialog: {},
    targetHeaderAddDialogKey: {
        margin: 6
    },
    targetHeaderAddDialogValue: {
        margin: 6
    },
    targetHeaderDialogAddButton: {
        color: theme.palette.warning.dark
    }
}));

export default useStyles;
