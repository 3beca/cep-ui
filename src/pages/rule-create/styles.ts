import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            display: 'flex',
            marginTop: 40,
            flexWrap: 'wrap'
        },
        sections: {
            flex: 1,
            margin: 16,
            minWidth: 300
        }
    })
);

 export default useStyles;