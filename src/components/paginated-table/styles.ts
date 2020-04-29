import { makeStyles } from '@material-ui/core/styles';

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
            color: theme.palette.error.dark
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
