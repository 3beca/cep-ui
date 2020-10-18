import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
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
