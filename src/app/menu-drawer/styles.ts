import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            marginTop: 75,
            width: 200
        },
        selected: {
            color: theme.palette.secondary.dark
        },
        unselected: {
            color: theme.palette.primary.dark
        }
    })
);

 export default useStyles;