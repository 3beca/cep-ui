import { makeStyles } from '@material-ui/core/styles';
import { blueGrey } from '@material-ui/core/colors';

export const useStyles = makeStyles(
    (theme) => ({
        loadingView: {
            display: 'flex',
            justifyContent: 'center'
        },
        loadingSpinner: {
            color: theme.palette.primary.dark,
            margin: 2,
            padding: 8
        },
        errorView: {
            color: blueGrey.A700
        },
        emptyView: {
            margin: 8,
            padding: 8,
            color: theme.palette.primary.dark
        },
        paginatorRow: {
            display: 'flex',
            justifyContent: 'flex-end'
        }
    })
  );

  export default useStyles;
