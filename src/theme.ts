import { red, orange, blue, grey, cyan, deepPurple, blueGrey } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

export const EXTRA_COLORS = {
  subTitle: grey.A700,
  ligthText: '#FFF'
};

// A custom theme for this app
export const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#329EB6',
      light: blueGrey.A400,
      dark: blueGrey.A700,
      contrastText: 'white'
    },
    secondary: blue,
    success: cyan,
    warning: orange,
    error: red,
    info: deepPurple,
    background: {
      default: EXTRA_COLORS.ligthText,
      paper: EXTRA_COLORS.ligthText
    },
    type: 'light',
  },
  typography: {
    fontSize: 16
  }
});

export default theme;
