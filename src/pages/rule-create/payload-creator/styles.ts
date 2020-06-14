import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
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
            flexWrap: 'wrap',
            justifyContent: 'center',
            overflowY: 'scroll',
            maxHeight: '40vh',
        },
        addFieldForm: {},
        addFieldName: {},
        addfieldSelector: {
            marginTop: 10
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
            alignItems: 'center',
            margin: 6,
            paddingLeft: 12,
            borderColor: theme.palette.primary.light,
            borderWidth: 1,
            borderStyle: 'solid'
        },
        payloadFieldViewIcon: {
            display: 'flex'
        },
        payloadFieldViewText: {
            display: 'flex',
            flex: 1,
            paddingLeft: 8,
        }
    })
);

 export default useStyles;