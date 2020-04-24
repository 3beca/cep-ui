import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        head: {
            backgroundColor: theme.palette.primary.dark
        },
        headText: {
            color: 'white'
        },
        mainCheck: {
            color: 'white'
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
            color: 'white'
        },
        deleteIcon: {
            color: 'white'
        }
    })
  );

  export default useStyles;
