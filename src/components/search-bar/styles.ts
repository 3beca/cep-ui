import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    searchContainer: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 400
    },
    searchInput: {
        marginLeft: theme.spacing(1),
        flex: 1
    },
    searchButton: {
        padding: 10
    }
}));

export default useStyles;
