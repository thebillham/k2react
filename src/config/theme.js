import { createMuiTheme } from "@material-ui/core/styles";

export default createMuiTheme({
  typography: {
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
    }
  },
  overrides: {
    MuiTab: {
      root: {
        indicatorColor: "#FF2D00",
        textColorPrimary: "white"
      }
    }
  }
});
