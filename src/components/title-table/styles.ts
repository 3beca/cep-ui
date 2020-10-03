import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    tabletitle: {
        flexGrow: 1,
        flex: 1,
        backgroundColor: theme.palette.primary.main,
        borderStyle: 'solid',
        borderWidth: 0,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12
    },
    tablename: {
        flexGrow: 1,
        color: theme.palette.primary.contrastText
    }
}));

export default useStyles;
