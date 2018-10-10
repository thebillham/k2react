import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme(
  {
    palette: {
      primary: {main: '#006D44'},
      secondary: { main: '#FF2D00'}
    },
    overrides: {
      MuiTab: {
        root: {
          indicatorColor: '#FF2D00',
          textColorPrimary: 'white',
        }
      }
    },
  }
);
