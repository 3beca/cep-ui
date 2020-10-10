import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        padding: 8,
        flexDirection: 'column'
    },
    payloadCreatorHeader: {
        display: 'flex',
        flex: 1,
        alignItems: 'center'
    },
    payloadCreatorHeaderTitle: {
        flex: 1,
        alignItems: 'flex-start',
        fontWeight: 700
    },
    // AddField Styles
    addFieldDialogContent: {
        display: 'flex',
        flex: 1,
        minWidth: 320
    },
    addFieldForm: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    addFieldName: {},
    addfieldSelector: {
        marginTop: 20
    },
    addfieldSelectorLabel: {
        fontWeight: 500
    },
    addFieldIconTypes: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    addFieldIcon: {
        padding: 12,
        color: theme.palette.primary.light,
        cursor: 'pointer'
    },
    addFieldIconSelected: {
        padding: 12,
        color: theme.palette.warning.dark
    },
    selectButton: {
        color: theme.palette.warning.dark
    },
    // FieldView Styles
    paloadFieldView: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        margin: 6,
        paddingLeft: 12,
        paddingRight: 6,
        minHeight: 50,
        borderBottomColor: theme.palette.primary.light,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid'
    },
    payloadFieldViewIcon: {
        display: 'flex'
    },
    payloadFieldViewText: {
        display: 'flex',
        flex: 1,
        paddingLeft: 8
    },
    info: {
        display: 'flex',
        padding: 16
    },
    infoText: {
        fontSize: 14,
        color: theme.palette.info.dark
    }
}));

export default useStyles;
