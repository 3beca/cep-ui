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
        tabletitle: {
            flexGrow: 1,
            flex: 1,
            backgroundColor: theme.palette.primary.dark,
            borderStyle: 'solid',
            borderWidth: 0,
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12
        },
        tablename: {
            flexGrow: 1,
            color: theme.palette.primary.contrastText
        },
        deleteIcon: {
            color: theme.palette.primary.contrastText
        }
    })
  );

  export default useStyles;
