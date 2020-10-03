import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        padding: 8,
        flexDirection: 'column'
    },
    groupCreatorHeader: {
        display: 'flex',
        flex: 1,
        alignItems: 'center'
    },
    groupCreatorHeaderTitle: {
        flex: 1,
        alignItems: 'flex-start',
        fontWeight: 700
    },
    // AddField Styles
    addFieldDialogContent: {
        display: 'flex',
        flex: 1,
        flexWrap: 'wrap',
        justifyContent: 'center',
        overflowY: 'scroll',
        maxHeight: '40vh'
    },
    addFieldForm: {},
    addFieldName: {},
    addFieldOperator: {
        marginTop: 10
    },
    addfieldTarget: {},
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
        borderColor: theme.palette.primary.light,
        borderWidth: 1,
        borderStyle: 'solid'
    },
    groupFieldViewIcon: {
        display: 'flex'
    },
    groupFieldViewText: {
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
    },
    schemaGroupFieldViewText: {}
}));

export default useStyles;
