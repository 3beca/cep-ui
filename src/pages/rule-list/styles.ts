import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        root: {
            display: 'flex',
            flexDirection: 'column',
            margin: theme.spacing(6, 0, 3)
        },
        searchBar: {
            display: 'flex',
            justifyContent: 'center',
            margin: 8
        },
        gridCards: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        fabAddRule: {
            position: 'fixed',
            bottom: theme.spacing(5),
            right: theme.spacing(5),
            zIndex: 3
        },
        loadMoreButton: {
            padding: 16
        }
    })
);

 export default useStyles;