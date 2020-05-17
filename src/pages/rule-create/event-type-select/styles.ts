import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            display: 'flex',
            maxWidth: 400
        },
        autocomplete: {
            padding: 8
        },
        details: {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            padding: 8
        },
        detailsActions: {
            display: 'flex',
            justifyContent: 'flex-end'
        },
        detailsName: {
            display: 'flex'
        },
        detailsURL: {
            display: 'flex'
        }
    })
);

 export default useStyles;