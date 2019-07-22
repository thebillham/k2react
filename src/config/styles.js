import { fade } from '@material-ui/core/styles/colorManipulator';

const drawerWidth = 240;

const styles = theme => ({
  accentButton: {
    color: theme.palette.secondary.main,
  },

  hoverItem: {
      // backgroundColor: "#fff",
      "&:hover": {
          backgroundColor: "#eee"
      }
  },

  informationBox: {
    backgroundColor: '#eee',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 12,
    fontSize: 12,
    margin: 12,
  },

  subheading: {
    marginTop: 20,
    marginBottom: 16,
    fontWeight: 300,
    color: '#888',
  },

  roundedBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    borderStyle: 'solid',
    padding: 48,
    margin: 12,
  },

  heading: {
    marginTop: 20,
    marginBottom: 16,
    fontWeight: 500,
    fontSize: 16,
    color: '#333',
  },

  dialogField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    width: 500,
  },

  root: {
    display: 'flex',
  },

  paper: {
    ...theme.mixins.gutters(),
    display: 'flex',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: 700,
    justifyContent: 'center',
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    fontSize: 12,
    // marginBottom: theme.spacing(2),
    width: 500,
  },

  note: {
    marginLeft: theme.spacing(1),
    fontSize: 14,
    color: '#444',
    // marginBottom: theme.spacing(2),
  },

  labels: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: theme.spacing(2),
  },

  container: {
    marginTop: theme.spacing(10),
    justifyContent: 'center',
  },

  dashboardIcon: {
    color: 'white',
    fontSize: 14,
  },

  formIcon: {
    color: 'black',
    fontSize: 18,
  },

  warningIcon: {
    color: 'red',
    fontSize: 14,
  },

  cardHeaderType: {
    color: '#fff',
    fontWeight: 500,
    fontSize: 16,
  },

  hoverItem: {
      // backgroundColor: "#fff",
      "&:hover": {
          backgroundColor: "#eee"
      }
  },

  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },

  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },

  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(3),
      width: 'auto',
    },
  },

  searchIcon: {
    width: theme.spacing(9),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputRoot: {
    color: 'inherit',
    width: '100%',
  },

  inputInput: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    paddingLeft: theme.spacing(10),
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: 200,
    },
  },

  appBar: {
    background: theme.palette.primary.main,
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },

  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  accentButton: {
    color: theme.palette.secondary.main,
  },

  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },

  menuButtonHidden: {
    display: 'none',
  },

  title: {
    flexGrow: 1,
  },

  labels: {
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(1),
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: theme.spacing(2),
  },

  drawerPaper: {
    background: '#fff',
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },

  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },

  appBarSpacer: theme.mixins.toolbar,

  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: '100vh',
    overflow: 'auto',
  },

  chartContainer: {
    marginLeft: -22,
  },

  tableContainer: {
    height: 320,
  },

  button: {
    color: "#fff",
  },

  avatar: {
    margin: 10,
  },

  nested: {
    paddingLeft: theme.spacing(5),
  },

  subitem: {
    fontSize: 8,
  },

  fineprint: {
    fontSize: 12,
  },

  paleLarge: {
    fontSize: 48,
    fontWeight: 100,
    color: '#bbb',
  },

  notifications: {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'row',
  },

  todo: {
    fontSize: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },

  notificationIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  notificationIconUrgent: {
    color: '#ff5733',
    fontSize: 16,
    marginRight: 10,
  },

  cardHeaderType: {
    color: '#fff',
    fontWeight: 500,
    fontSize: 16,
  },

  cardHeader: {
    backgroundColor: theme.palette.primary.light
  },

  dashboardIcon: {
    color: 'white',
    fontSize: 12,
  },

  cardHeaderAlt: {
    backgroundColor: theme.palette.secondary.dark
  },

  // Icon Styles

  iconRegular: {
    fontSize: 20,
    margin: 6,
  },

  iconRegularRed: {
    fontSize: 20,
    margin: 6,
    color: 'red',
  },

  iconRegularGreen: {
    fontSize: 20,
    margin: 6,
    color: 'green',
  },

  iconRegularOrange: {
    fontSize: 20,
    margin: 6,
    color: 'orange',
  },

  // Button Styles

  buttonTextRegular: {
    fontSize: 12,
    fontVariant: 'small-caps',
    margin: 6,
  },

  // Text Styles

  warningTextLight: {
    color: '#a0a0a0',
    fontWeight: 100,
    fontSize: 12,
  },

  boldSmallText: {
    marginLeft: 12,
    marginRight: 12,
    fontSize: 12,
    fontVariant: 'small-caps',
    fontWeight: 500,
  },

  boldRedWarningText: {
    fontWeight: 'bold',
    marginLeft: 12,
    color: 'red'
  },

  lightMild: {
    fontWeight: 300,
  },

  boldRed: {
    fontWeight: 600,
    color: 'red',
  },

  boldGreen: {
    fontWeight: 600,
    color: 'green',
  },

  boldOrange: {
    fontWeight: 600,
    color: 'orange',
  },

  boldBlack: {
    fontWeight: 600,
    color: 'black',
  },

  // Text Boxes

  highlightBoxBlack: {
    marginBottom: 12,
    backgroundColor: '#eee',
  },

  circleShaded: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#aaa",
    marginRight: 10,
    color: "#fff",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  // Padding/Margins

  marginLeftSmall: {
    marginLeft: 6,
  },

  marginTopBottom: {
    marginTop: 12,
    marginBottom: 12,
  },

  spacerSmall: {
    width: 30,
  },

  // Sizes

  fullWidth: {
    width: '100%',
    maxWidth: '1800px',
  },

  // Container
  flexRowLeftAlignEllipsis: {
    textOverflow: "ellipsis",
    // whiteSpace: "nowrap",
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: "hidden",
  },

  flexRowRightAlign: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },

  flexRowCentered: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80.0,
  },
});

export { styles, };
