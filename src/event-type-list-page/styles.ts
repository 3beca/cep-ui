import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        root: {
            margin: theme.spacing(6, 0, 3),
        }
    })
  );

  export default useStyles;
