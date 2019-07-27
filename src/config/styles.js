import { fade } from '@material-ui/core/styles/colorManipulator';
import { makeStyles } from '@material-ui/styles';

const drawerWidth = 240;

// Login Page
const loginTopOffset = 194;
const loginHeightPadding = 24;
const loginImageDiameter = 272;
const loginCircleDiameter = 330;
const loginFirebaseWidth = 250;
const loginLogOutWidth = 250;
const loginLogOutHeight = 45;

const styles = theme => ({
  // SIGN IN OBJECTS
  signInCircle: {
    position: 'absolute',
    left: `calc(50% - ${loginCircleDiameter/2}px)`,
    top: `${loginTopOffset}px`,
  },

  signInImage: {
    position: 'absolute',
    left: `calc(50% - ${loginImageDiameter/2}px)`,
    top: `${loginTopOffset + loginCircleDiameter/2 - loginImageDiameter/2}px`,
    width: `${loginImageDiameter}px`,
    height: `${loginImageDiameter}px`,
    pointerEvents: 'none',
  },

  signInFirebase: {
    position: 'absolute',
    left: `calc(50% - ${loginFirebaseWidth/2}px)`,
    top: `${loginTopOffset + loginCircleDiameter}px`,
    height: 'auto',
  },

  signInLogOut: {
    position: 'absolute',
    left: `calc(50% - ${loginLogOutWidth/2}px)`,
    top: `${loginTopOffset + loginCircleDiameter + loginHeightPadding}px`,
    width: `${loginLogOutWidth}px`,
    height: `${loginLogOutHeight}px`,
    fontVariant: 'small-caps',
  },

  signInWarning: {
    position: 'absolute',
    top: `${loginTopOffset + loginCircleDiameter + loginHeightPadding + loginLogOutHeight + loginHeightPadding}px`,
  },

  // MAIN SCREEN NAV

  paper: {
    ...theme.mixins.gutters(),
    display: 'flex',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    width: 700,
    justifyContent: 'center',
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

  root: {
    display: 'flex',
  },

  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },

  menuButton: {
    marginLeft: 12,
    marginRight: 36,
  },

  menuButtonHidden: {
    display: 'none',
  },

  pageTitle: {
    flexGrow: 1,
    fontSize: 20,
    fontWeight: 500,
    // fontVariant: 'small-caps',
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

  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
    height: '100vh',
    overflow: 'auto',
  },

  // DRAWER

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

  drawerNested: {
    paddingLeft: theme.spacing(5),
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

  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
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

  button: {
    color: "#fff",
  },

  avatar: {
    margin: 10,
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

  notificationIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  notificationIconUrgent: {
    color: '#ff5733',
    fontSize: 16,
    marginRight: 10,
  },

  // Button Styles

  buttonGo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#aaa",
    margin: theme.spacing(1),
    color: "#fff",
    justifyContent: "center",
    alignItems: "center",
    fontWeight: "bold"
  },

  buttonIconText: {
    fontSize: 10,
    borderRadius: 15,
  },

  redBg: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: 'red',
  },

  greenBg: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: 'lightgreen',
  },

  blueBg: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: 'lightblue',
  },

  greyBg: {
    margin: 5,
    backgroundColor: 'white',
  },

  redFg: {
    margin: 5,
    color: 'white',
  },

  greenFg: {
    margin: 5,
    color: 'green',
  },

  blueFg: {
    margin: 5,
    color: 'mediumblue',
  },

  greyFg: {
    margin: 5,
    color: '#ddd',
  },

  redIcon: {
    color: 'red',
    fontSize: 20,
    margin: 6,
  },

  greenIcon: {
    color: 'green',
    fontSize: 20,
    margin: 6,
  },

  orangeIcon: {
    color: 'orange',
    fontSize: 20,
    margin: 6,
  },

  greyIcon: {
    color: '#ddd',
    fontSize: 20,
    margin: 6,
  },

  // TEXT STYLES

  subHeading: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },

  headingInline: {
    fontSize: 11,
    fontWeight: 500,
  },

  infoLight: {
    fontSize: 11,
    fontWeight: 250,
  },

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

  // Colors
  colorAccent: {
    color: theme.palette.secondary.main,
  },

  colorBad: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.bad,
    color: theme.palette.indicators.badText,
  },

  colorWarning: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.warning,
    color: theme.palette.indicators.warningText,
  },

  colorOK: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.ok,
    color: theme.palette.indicators.okText,
  },

  colorBenign: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.benign,
    color: theme.palette.indicators.benignText,
  },

  colorOff: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.off,
    color: theme.palette.indicators.offText,
  },

  colorsDivBad: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.bad,
  },

  colorsButtonBad: {
    margin: 5,
    color: theme.palette.indicators.badText,
  },

  colorsDivOk: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.ok,
  },

  colorsButtonOk: {
    margin: 5,
    color: theme.palette.indicators.okText,
  },

  colorsDivBenign: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.benign,
  },

  colorsButtonBenign: {
    margin: 5,
    color: theme.palette.indicators.benignText,
  },

  colorsDivOff: {
    borderRadius: 5,
    margin: 5,
    backgroundColor: theme.palette.indicators.off,
  },

  colorsButtonOff: {
    margin: 5,
    color: theme.palette.indicators.offText,
  },

  // TEXT BOXES

  highlightBoxBlack: {
    marginBottom: theme.spacing(1),
    backgroundColor: '#eee',
  },

  circleShaded: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#aaa",
    marginRight: theme.spacing(1),
    color: "#fff",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  // SEARCH BOXES
  searchBoxRoot: {
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ccc",
    padding: theme.spacing(1),
  },

  searchBoxShortTextInput: {
    width: 150,
    marginRight: theme.spacing(1),
  },

  // FORMS
  formSelectDate: {
    width: '140px',
  },

  formSelectClient: {
    width: '300px',
  },

  formSelectStaff: {
    width: '200px',
  },

  // PADDING/MARGINS

  marginLeftSmall: {
    marginLeft: theme.spacing(1),
  },

  marginLeftBottomSmall: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  marginTopBottomSmall: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  marginTopSmall: {
    marginTop: theme.spacing(1),
  },

  marginBottomSmall: {
    marginBottom: theme.spacing(1),
  },

  spacerSmall: {
    width: theme.spacing(1),
  },

  spaceMedium: {
    width: theme.spacing(2),
  },

  // SIZES

  fullWidth: {
    width: '100%',
    maxWidth: '1800px',
  },

  // CONTAINERS
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },

  flexRowLeftAlignEllipsis: {
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: "hidden",
  },

  flexRowRightAlign: {
    width: '100%',
    justify: 'flex-end',
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
