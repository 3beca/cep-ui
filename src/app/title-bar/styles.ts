import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    root: {
        padding: 0,
        display: 'flex'
    },
    icon: {
        marginRight: theme.spacing(2),
        color: theme.palette.primary.contrastText,
        fontSize: 32
    }
}));

export default useStyles;
