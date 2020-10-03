import { makeStyles } from '@material-ui/core';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        height: '90vh',
        margin: 40,
        justifyContent: 'center',
        alignItems: 'center'
    }
}));

export default useStyles;
