import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            display: 'flex'
        },
        fieldSelector: {
            margin: 6,
            minWidth: 280
        }
    })
);

 export default useStyles;