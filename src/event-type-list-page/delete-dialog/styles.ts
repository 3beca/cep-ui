import { makeStyles } from '@material-ui/core/styles';
import {red, blue, grey} from '@material-ui/core/colors';

export const useStyles = makeStyles(
    (theme) => ({
        container: {
            backgroundColor: 'white'
        },
        deleteButton: {
            color: red.A400
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
            color: grey.A700
        },
        errorText: {
            color: red.A700
        },
        successText: {
            color: blue.A400
        }
    })
  );

  export default useStyles;
