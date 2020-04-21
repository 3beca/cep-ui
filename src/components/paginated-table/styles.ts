import { makeStyles } from '@material-ui/core/styles';
import { blueGrey, lightGreen } from '@material-ui/core/colors';

export const useStyles = makeStyles(
    (theme) => ({
        loadingView: {
            color: lightGreen.A700
        },
        errorView: {
            color: blueGrey.A700
        }
    })
  );

  export default useStyles;
