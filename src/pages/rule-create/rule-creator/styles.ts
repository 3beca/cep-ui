import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            display: 'flex',
            padding: 20,
            flexDirection: 'column'
        },
        ruleName: {
            display: 'flex'
        },
        skipConsecutives: {
            display: 'flex'
        }
    })
);

 export default useStyles;