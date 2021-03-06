import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    ruleCardFilterContainer: {
        display: 'flex',
        flexDirection: 'column',
        margin: 3,
        borderStyle: 'solid',
        borderColor: '#CCC',
        borderWidth: 1
    },
    ruleCardFilterContainerHeader: {
        display: 'flex',
        justifyContent: 'center',
        paddingTop: 20
    },
    ruleCardFilterContainerHeaderText: {
        marginTop: -31,
        backgroundColor: theme.palette.common.white,
        fontWeight: 700,
        fontSize: 14
    },
    ruleCardFilterExpressionPassthrow: {
        display: 'flex',
        justifyContent: 'center',
        fontSize: 14
    },
    ruleCardFilterExpressionField: {
        fontSize: 14
    },
    ruleCardFilterExpressionOperator: {
        marginLeft: 10,
        marginRight: 10,
        fontSize: 14
    },
    ruleCardFilterExpressionValue: {
        fontSize: 14
    },
    ruleCardFilterExpressionLine: {
        display: 'flex',
        flex: 1,
        alignItems: 'center'
    },
    ruleCardFilterExpression: {
        display: 'flex',
        marginLeft: 32,
        flex: 1
    },
    ruleCardFilterExpressionDistance: {
        marginLeft: 10,
        marginRight: 10,
        fontSize: 14
    },
    ruleCardActionsButtons: {
        display: 'flex',
        justifyContent: 'flex-end'
    }
}));

export default useStyles;
