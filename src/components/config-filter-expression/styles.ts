import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        marginTop: 40
    },
    addExpressionContent: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    fieldNameSelector: {
        display: 'flex',
        flexDirection: 'column'
    },
    fieldNameTitle: {
        fontWeight: 500
    },
    fieldSelector: {
        margin: 6
    },
    fieldOperatorSelector: {
        marginTop: 20,
        display: 'flex',
        flexDirection: 'column'
    },
    fieldOperatorTitle: {
        fontWeight: 500
    },
    fieldValueBox: {
        display: 'flex',
        marginTop: 20
    },
    addFieldCoordinatesContent: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 20
    },
    addFieldCoordinatesFields: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: 20
    },
    addFieldCoordinatesTitle: {
        fontWeight: 500
    },
    addExpressionButton: {
        color: theme.palette.warning.dark
    }
}));

export default useStyles;
