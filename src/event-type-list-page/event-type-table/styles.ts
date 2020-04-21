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
        }
    })
  );

  export default useStyles;
