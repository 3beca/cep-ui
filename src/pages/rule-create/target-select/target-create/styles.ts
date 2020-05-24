import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        details: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column'
        },
        detailsActions: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        detailsActionsType: {
            display: 'flex',
            flex: 1,
            alignItems: 'flex-start',
            fontWeight: 700
        },
        detailsName: {
            display: 'flex'
        },
        detailsMessage: {
            display: 'flex'
        },
        detailsURL: {
            display: 'flex'
        },
        detailsCreateURL: {
            display: 'flex'
        },
        detailsCreateURLButton: {
            marginLeft: 10
        },
        detailsStatus: {
            display: 'flex',
            padding: 6,
            flexDirection: 'column'
        },
        detailsStatusLoading: {
            display: 'flex',
            flex: 1,
            justifyContent: 'flex-end',
            marginRight: 12,
            color: theme.palette.primary.main
        },
        detailsStatusLoadingText: {
            marginRight: 8
        },
        detailsStatusError: {
            display: 'flex',
            flex: 1,
            justifyContent: 'center',
            marginRight: 12,
            color: theme.palette.error.dark
        }
    })
);

 export default useStyles;