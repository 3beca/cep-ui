import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles(theme => ({
    // Header List Edit
    targetEditorURL: {
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 320,
        marginTop: 6,
        marginBottom: 6
    }
}));

export default useStyles;
