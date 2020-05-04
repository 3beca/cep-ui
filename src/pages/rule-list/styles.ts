import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        root: {
            display: 'flex',
            flexDirection: 'column',
            margin: theme.spacing(6, 0, 3),
            padding: 16,
        },
        searchBar: {
            display: 'flex',
            justifyContent: 'center',
            margin: 8
        },
        searchContainer: {
            padding: '2px 4px',
            display: 'flex',
            alignItems: 'center',
            width: 400,
        },
        searchInput: {
            marginLeft: theme.spacing(1),
            flex: 1,
        },
        searchButton: {
            padding: 10
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
        },
        ruleCard: {
            width: 300,
            minHeight: 300,
            margin: 24
        },
        ruleCardAvatar: {
            padding: 4,
        },
        ruleCardAvatarRed: {
            backgroundColor: theme.palette.error.dark
        },
        ruleCardAvatarBlue: {
            backgroundColor: theme.palette.secondary.dark
        },
        ruleCardAvatarPurple: {
            backgroundColor: theme.palette.info.dark
        },
        ruleCardAvatarOrange: {
            backgroundColor: theme.palette.warning.dark
        }
    })
);

 export default useStyles;