import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        ruleCard: {
            display: 'flex',
            flexDirection: 'column',
            width: 400,
            maxWidth: 400,
            minHeight: 300,
            margin: 24
        },
        ruleCardHeader: {
        },
        ruleCardContent: {
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
        },
        ruleCardBody: {
            display: 'flex',
            flexDirection: 'column',
            padding: 6
        },
        ruleCardBodyLabel: {
            display: 'flex',
            fontSize: 12,
            fontWeight: 700
        },
        ruleCardBodyName: {
            display: 'flex',
            marginLeft: 32,
            flex: 1
        },
        ruleCardFilters: {
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 300,
            padding: 6,
            overflowY: 'scroll',
            flex: 1
        },
        ruleCardStatus: {
            display: 'flex',
            backgroundColor: theme.palette.common.white,
            padding: 8,
            color: theme.palette.primary.dark
        },
        ruleCardStatusDate: {
            display: 'flex',
            alignItems: 'flex-end',
            flex: 1
        },
        ruleCardStatusOneShot: {
            display: 'flex',
            alignItems: 'flex-end',
            marginRight: 8
        },
        ruleCardAvatar: {
            padding: 4,
            fontWeight: 700
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