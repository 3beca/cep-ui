import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        head: {
            backgroundColor: theme.palette.primary.dark
        },
        headText: {
            color: theme.palette.primary.contrastText,
            fontWeight: 700,
            fontSize: theme.typography.fontSize + 2
        },
        mainCheck: {
            color: theme.palette.primary.contrastText
        },
        deleteIcon: {
            color: theme.palette.primary.contrastText
        }
    })
  );

  export default useStyles;
