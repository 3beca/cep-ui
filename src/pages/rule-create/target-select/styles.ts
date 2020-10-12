import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        maxWidth: 400,
        padding: 12
    },
    autocomplete: {},

    // Target Header
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

    // Target Selected
    targetSelectedDetails: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    targetSelectedDetailsActions: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    targetSelectedDetailsActionsType: {
        display: 'flex',
        flex: 1,
        alignItems: 'flex-start',
        fontWeight: 700
    },
    targetSelectedDetailsName: {
        display: 'flex'
    },
    targetSelectedDetailsMessage: {
        display: 'flex'
    },
    targetSelectedDetailsURL: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 4
    },
    targetSelectedDetailsURLHeader: {
        fontWeight: 900
    },
    targetSelectedDetailsURLText: {
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
}));

export default useStyles;
