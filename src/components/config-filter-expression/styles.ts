import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        marginTop: 40,
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    fieldSelector: {
        margin: 6,
        minWidth: 280
    }
}));

export default useStyles;
