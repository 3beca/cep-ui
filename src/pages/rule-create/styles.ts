import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            display: 'flex',
            marginTop: 40,
            flexWrap: 'wrap'
        },
        sectionSearch: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        sections: {
            margin: 16,
            minWidth: 380
        }
    })
);

 export default useStyles;