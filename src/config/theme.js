import { createMuiTheme } from "@material-ui/core/styles";

export const colorList = [
  '#a2539c',
  '#e33714',
  '#6fa1b6',
  '#995446',
  '#ff0065',
  '#87cc14',
  '#7d6d26',
];

export default createMuiTheme({
  typography: {
    fontSize: 11,
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
    indicators: {
      bad: 'red',
      badText: 'white',
      warning: 'orange',
      warningText: 'black',
      ok: 'lightgreen',
      okText: 'green',
      benign: 'lightblue',
      benignText: 'blue',
      off: 'white',
      offText: '#ddd',
    },
    jobs: {
      workplace: '#a2539c',
      stack: '#e33714',
      other: '#6fa1b6',
      noise: '#995446',
      meth: '#ff0065',
      bio: '#87cc14',
      asbestos: '#7d6d26',
    },
    colorList: [
      '#a2539c',
      '#e33714',
      '#6fa1b6',
      '#995446',
      '#ff0065',
      '#87cc14',
      '#7d6d26',
    ],
    app: {
      hover: '#eee',
      hoverHighlight: '#eec',
      highlight: '#ffd',
      disabled: '#ddd',
      shaded: '#aaa',
      shadedHighlighted: '#004c2f',
    },
    stages: {
      start: '#dae9ec',
      startText: 'black',
      received: '#b6d3d9',
      receivedText: 'black',
      workInProgress: '#92bdc6',
      workInProgressText: 'black',
      workComplete: '#6ea7b3',
      workCompleteText: 'white',
      readyForIssue: '#388697',
      readyForIssueText: 'white',
    },
    stagesGreen: {
      start: '#e7f1ee',
      startText: 'black',
      received: '#b9d7cc',
      receivedText: 'black',
      workInProgress: '#73af99',
      workInProgressText: 'black',
      workComplete: '#2e8766',
      workCompleteText: 'white',
      readyForIssue: '#006d44',
      readyForIssueText: 'white',
    },
  },
  overrides: {
    MuiTooltip: {
      tooltip: {
        fontSize: 12,
      },
    },
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
