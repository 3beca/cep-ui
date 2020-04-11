import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        root: {
            display: 'flex',
            height: '100vh',
            flexDirection: 'column'
        }
    })
  );

  export default useStyles;

