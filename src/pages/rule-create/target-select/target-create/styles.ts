import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    details: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    detailsActions: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    detailsActionsType: {
        display: 'flex',
        flex: 1,
        alignItems: 'flex-start',
        fontWeight: 700
    },
    detailsName: {
        display: 'flex'
    },
    detailsMessage: {
        display: 'flex'
    },
    detailsURL: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 4
    },
    detailsURLHeader: {
        fontWeight: 900
    },
    detailsURLText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    detailsCreateURL: {
        display: 'flex'
    },
    detailsCreateURLButton: {
        marginLeft: 10
    },
    detailsStatus: {
        display: 'flex',
        padding: 6,
        flexDirection: 'column'
    },
    detailsStatusLoading: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        marginRight: 12,
        color: theme.palette.primary.main
    },
    detailsStatusLoadingText: {
        marginRight: 8
    },
    detailsStatusError: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        marginRight: 12,
        color: theme.palette.error.dark
    },

    // Header List
    targetHeaderList: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 320,
        marginTop: 6,
        marginBottom: 6
    },
    targetHeaderTitle: {
        fontWeight: 900
    },
    targetHeaderListItem: {
        display: 'flex'
    },
    targetHeaderListItemKey: {
        fontWeight: 500
    },
    targetHeaderListItemValue: {
        marginLeft: 4,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
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
