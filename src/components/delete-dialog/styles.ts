import { makeStyles } from '@material-ui/core/styles';
import {EXTRA_COLORS} from '../../theme';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
        },
        deleteButton: {
            color: theme.palette.warning.dark
        },
        dialogContent: {
            overflowY: 'scroll',
            minHeight: '10vh',
            maxHeight: '30vh',
            minWidth: '30vw'
        },
        elementList: {
            display: 'flex',
            padding: 6,
            flexDirection: 'column'
        },
        elementItemGroup: {
            display: 'flex',
        },
        elementItem: {
            margin: 4
        },
        captionText: {
            color: EXTRA_COLORS.subTitle
        },
        errorText: {
            color: theme.palette.error.dark
        },
        successText: {
            color: theme.palette.success.dark
        }
    })
  );

  export default useStyles;
