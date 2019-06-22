import { createMuiTheme } from "@material-ui/core/styles";

export default createMuiTheme({
  typography: {
    fontSize: 12,
    useNextVariants: true
  },
  palette: {
    primary: {
      dark: "#004c2f",
      main: "#006D44",
      light: "#338a69"
    },
    secondary: {
      dark: "#b21f00",
      main: "#FF2D00",
      light: "#ff5733"
    },
    jobs: {
      workplace: '#a2539c',
      stack: '#e33714',
      other: '#6fa1b6',
      noise: '#995446',
      meth: '#ff0065',
      bio: '#87cc14',
      asbestos: '#7d6d26',
    }
  },
  overrides: {
    MuiFormControlLabel: {
      label: {
        fontSize: 12,
      },
    },
    MuiInputLabel: {
      root: {
        fontSize: 12,
      },
    },
    MuiButton: {
      root: {
        fontSize: 10,
      }
    },
    MuiListItemText: {
      primary: {
        fontSize: 12,
        color: '#333',
      },
    },
    MuiTab: {
      root: {
        indicatorColor: "#FF2D00",
        textColorPrimary: "white"
      }
    }
  }
});
