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
    addFieldForm: {
        minWidth: 320
    },
    addFieldName: {},
    addFieldOperator: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'column'
    },
    addfieldOperatorTitle: {
        fontWeight: 500
    },
    operatorField: {
        minWidth: 130
    },
    addfieldTarget: {
        display: 'flex',
        marginTop: 20
    },
    targetSelector: {
        display: 'flex',
        flex: 1,
        flexDirection: 'column'
    },
    targetValue: {
        display: 'flex',
        marginTop: 20
    },
    targetValueText: {
        display: 'flex',
        textAlign: 'center'
    },
    addfieldTargetSelectorTitle: {
        fontWeight: 500
    },
    selectButton: {
        color: theme.palette.warning.dark
    },
    // FieldView Styles
    payloadFieldView: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        margin: 6,
        paddingLeft: 12,
        paddingRight: 6,
        borderBottomColor: theme.palette.primary.light,
        borderBottomWidth: 1,
        borderBottomStyle: 'solid'
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
    schemaGroupFieldViewText: {
        display: 'flex',
        flex: 1
    }
}));

export default useStyles;
