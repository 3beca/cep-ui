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
        ruleCardFilters: {
            display: 'flex',
            maxHeight: 300,
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
            flex: 1
        },
        ruleCardStatusOneShot: {
            display: 'flex',
            alignItems: 'center'
        },
        onShotLabel: {
            width: 18,
            height: 18,
            marginLeft: 6,
            borderWidth: 1,
            borderColor: theme.palette.primary.dark,
            borderStyle: 'solid',
            borderRadius: 9
        },
        onShotLabelOn: {
            backgroundColor: theme.palette.secondary.light
        },
        onShotLabelOff: {
            backgroundColor: theme.palette.error.light
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