import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        root: {
            margin: theme.spacing(6, 0, 3),
            padding: 16
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
