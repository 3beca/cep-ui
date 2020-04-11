import { red, orange, blueGrey, blue } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

// A custom theme for this app
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: blueGrey.A700,
    },
    secondary: {
      main: blue.A700,
    },
    warning: {
      main: orange.A700
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
});

export default theme;
