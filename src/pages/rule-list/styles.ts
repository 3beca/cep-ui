import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        root: {
            display: 'flex',
            flexDirection: 'column',
            margin: theme.spacing(6, 0, 3),
            padding: 16,
        },
        gridCards: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center'
        },
        fabAddRule: {
            position: 'fixed',
            bottom: theme.spacing(5),
            right: theme.spacing(10),
        },
        ruleCard: {
            minWidth: 280,
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