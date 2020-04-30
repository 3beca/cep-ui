import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            marginTop: 75,
            width: 250
        },
        selected: {
            color: theme.palette.secondary.dark
        },
        unselected: {
            color: theme.palette.primary.dark
        },
        avatar: {
            width: '200px',
            height: '200px',
            padding: 16
        }
    })
);

 export default useStyles;