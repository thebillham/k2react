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
    // whiteSpace: 'nowrap',
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

  informationBox: {
    backgroundColor: '#eee',
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(1),
    fontSize: 12,
    margin: theme.spacing(1),
  },

  informationBoxRounded: {
    backgroundColor: '#eee',
    borderRadius: theme.spacing(1),
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(1),
    fontSize: 12,
    margin: theme.spacing(1),
  },

  informationBoxWhite: {
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(1),
    fontSize: 12,
    margin: theme.spacing(1),
  },

  informationBoxWhiteRounded: {
    backgroundColor: '#fff',
    borderRadius: theme.spacing(1),
    borderStyle: 'solid',
    borderWidth: 1,
    padding: theme.spacing(1),
    fontSize: 12,
    margin: theme.spacing(1),
  },

  commentBox: {
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: '#ddd',
    width: '100%',
    borderWidth: 1,
    padding: theme.spacing(2),
    fontSize: 12,
    margin: theme.spacing(1),
  },

  commentBoxNoBorder: {
    width: '100%',
    borderWidth: 1,
    padding: theme.spacing(2),
    fontSize: 12,
    margin: theme.spacing(1),
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

  dialogFieldTall: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
    width: 500,
    minHeight: '50vh',
  },

  textSpaced: {
    lineHeight: 1.5,
  },

  bigInput: {
    fontSize: 48,
    color: '#000',
    backgroundColor: '#fff',
    width: 300,
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
    fontSize: 9,
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

  labelTopBold: {
    marginBottom: theme.spacing(2),
    fontSize: 12,
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
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

  cardHeaderNotice: {
    // height: '4vw',
    // backgroundColor: '#eee',
    borderRadius: 20,
    padding: theme.spacing(1),
  },

  hoverItem: {
      // backgroundColor: "#fff",
      "&:hover": {
          backgroundColor: theme.palette.app.hover
      }
  },

  hoverItemPoint: {
      // backgroundColor: "#fff",
      "&:hover": {
          backgroundColor: theme.palette.app.hover,
          cursor: 'pointer',
      }
  },

  hoverItemFat: {
      // backgroundColor: "#fff",
      height: 60,
      "&:hover": {
          backgroundColor: "#eee"
      },
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

  version: {
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    color: '#555',
    width: '100%',
    maxWidth: drawerWidth - theme.spacing(2),
  },

  versionOld: {
    fontSize: 12,
    marginTop: theme.spacing(2),
    marginLeft: theme.spacing(2),
    color: 'red',
    width: '100%',
    maxWidth: drawerWidth - theme.spacing(2),
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

  bottomDottedStyle: {
    borderBottomStyle: 'dotted',
    borderBottomWidth: 1,
  },

  bottomBorder: {
    borderBottomStyle: 'solid',
    borderBottomWidth: 2,
    paddingBottom: theme.spacing(1),
  },

  noticeCard: {
    minWidth: 50,
    minHeight: 300,
    borderRadius: 20,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },

  title: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: 600
  },

  subtitle: {
    marginBottom: 0,
    fontSize: 12,
    fontStyle: "italic"
  },

  noItems: {
    marginTop: theme.spacing(1),
    fontSize: 14,
    color: '#ccc',
  },

  underline: {
    fontWeight: 500,
    textDecoration: 'underline',
    marginBottom: 6,
  },

  details: {
    fontSize: 12,
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
  },

  noticeComments: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    wordWrap: 'break-word',
    whiteSpace: 'pre-wrap',
    padding: 12,
  },

  whosRead: {
    fontSize: 12
  },

  formIcon: {
    color: "black",
    fontSize: 12
  },

  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)"
  },

  // Icon Styles

  iconRegular: {
    fontSize: 20,
    margin: 6,
    color: 'grey',
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

  avatarRegularGreen: {
    fontSize: 25,
    margin: 6,
    color: 'white',
    backgroundColor: 'green',
  },

  avatarRegularOrange: {
    fontSize: 25,
    margin: 6,
    color: 'yellow',
    backgroundColor: 'black',
  },

  avatarRegularRed: {
    fontSize: 25,
    margin: 6,
    color: 'white',
    backgroundColor: 'red',
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

  buttonViewMore: {
    marginTop: 24,
    marginLeft: 128,
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

  bold: {
    fontWeight: 'bold',
  },

  headingInline: {
    fontSize: 11,
    fontWeight: 500,
  },

  infoLight: {
    fontSize: 11,
    fontWeight: 250,
  },

  textLabel: {
    fontSize: 9,
    marginLeft: theme.spacing(4),
    marginBottom: 0,
    fontWeight: 50,
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

  timesSymbol: {
    fontWeight: 450,
    fontSize: 12,
  },

  noTextDecoration: {
    textDecoration: 'none',
  },

  // Colors
  colorAccent: {
    color: theme.palette.secondary.main,
  },

  colorsDivBad: {
    borderRadius: 5,
    margin: 2,
    backgroundColor: theme.palette.indicators.bad,
  },

  colorsButtonBad: {
    margin: 3,
    color: theme.palette.indicators.badText,
  },

  colorsDivOk: {
    borderRadius: 5,
    margin: 2,
    backgroundColor: theme.palette.indicators.ok,
  },

  colorsButtonOk: {
    margin: 3,
    color: theme.palette.indicators.okText,
  },

  colorsDivBenign: {
    borderRadius: 5,
    margin: 2,
    backgroundColor: theme.palette.indicators.benign,
  },

  colorsButtonBenign: {
    margin: 3,
    color: theme.palette.indicators.benignText,
  },

  colorsDivOff: {
    borderRadius: 5,
    margin: 2,
    backgroundColor: theme.palette.indicators.off,
  },

  colorsButtonOff: {
    margin: 3,
    color: theme.palette.indicators.offText,
  },

  colorsStart: {
    backgroundColor: theme.palette.stages.start,
    color: theme.palette.stages.startText,
  },

  colorsReceived: {
    backgroundColor: theme.palette.stages.received,
    color: theme.palette.stages.receivedText,
  },

  colorsWorkInProgress: {
    backgroundColor: theme.palette.stages.workInProgress,
    color: theme.palette.stages.workInProgressText,
  },

  colorsWorkComplete: {
    backgroundColor: theme.palette.stages.workComplete,
    color: theme.palette.stages.workCompleteText,
  },

  colorsReadyForIssue: {
    backgroundColor: theme.palette.stages.readyForIssue,
    color: theme.palette.stages.readyForIssueText,
  },

  // TEXT BOXES

  highlightBoxBlack: {
    marginBottom: theme.spacing(1),
    backgroundColor: '#eee',
  },

  boxDark : {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.stages.readyForIssue,
    color: '#000',
  },

  circle: {
    minWidth: 40,
    maxWidth: 40,
    height: 40,
    borderRadius: 20,
    marginRight: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
  },

  circleShaded: {
    minWidth: 40,
    maxWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.app.shaded,
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  circleShadedOk: {
    minWidth: 40,
    maxWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.indicators.ok,
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  circleShadedBad: {
    minWidth: 40,
    maxWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.indicators.bad,
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  circleShadedDisabled: {
    minWidth: 40,
    maxWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.app.disabled,
    padding: theme.spacing(1),
    marginRight: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  circleShadedHighlighted: {
    minWidth: 40,
    maxWidth: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.palette.app.shadedHighlighted,
    marginRight: theme.spacing(1),
    // marginLeft: theme.spacing(1),
    color: "#fff",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShaded: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.app.shaded,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: 'white',
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedDisabled: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.app.disabled,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: 'white',
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedComplete: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.stages.readyForIssue,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.stages.readyForIssueText,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonLongBlank: {
    width: 200,
    height: 40,
    borderRadius: 10,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedGreen: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.indicators.ok,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.indicators.okText,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedRed: {
    width: 80,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.indicators.bad,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.indicators.badText,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedLong: {
    width: 200,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.app.shaded,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: 'white',
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedLongDisabled: {
    width: 200,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.app.disabled,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: 'white',
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedLongGreen: {
    width: 200,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.indicators.ok,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.indicators.okText,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedLongRed: {
    width: 200,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.indicators.bad,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    color: theme.palette.indicators.badText,
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    fontWeight: "bold"
  },

  roundButtonShadedInput: {
    width: 120,
    height: 40,
    borderRadius: 10,
    backgroundColor: theme.palette.app.shaded,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    padding: theme.spacing(2),
    justifyContent: 'flex-end',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },

  roundButtonShadedInputText: {
    color: 'white',
    textAlign: 'right',
  },

  popupPhoneNumber: {
    borderRadius: 20,
    display: "inline-flex",
    backgroundColor: "darkgrey",
    color: "white",
    whiteSpace: "nowrap",
    fontSize: 96,
    padding: 48,
    margin: -8
  },

  // TABLES

  headingRow: {
    backgroundColor: "darkgrey",
    color: "white",
    fontWeight: 600,
    padding: theme.spacing(1),
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: 1,
  },

  entryRow: {
    backgroundColor: "white",
    color: "black",
    fontWeight: 300,
    padding: theme.spacing(1),
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: 1,
  },

  firstColumn: {
    backgroundColor: "lightgrey",
    fontWeight: 600,
    padding: theme.spacing(1),
    borderStyle: "solid",
    borderWidth: 1,
  },

  numberColumn: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-end',
    borderStyle: "solid",
    borderWidth: 1,
  },

  textColumn: {
    padding: theme.spacing(1),
    display: 'flex',
    justifyContent: 'flex-start',
    borderStyle: "solid",
    borderWidth: 1,
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

  formSelectDateTime: {
    width: '200px',
  },


  formSelectClient: {
    width: '300px',
  },

  formSelectStaff: {
    width: '200px',
  },

  formInputNumber: {
    width: 45,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },

  formInputSmall: {
    width: 100,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },

  formInputMedium: {
    width: 175,
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },

  formInputLarge: {
    width: 500,
    marginBottom: 10,
  },

  selectTight: {
    margin: theme.spacing(1),
    // height: 20,
  },

  select: {
    margin: theme.spacing(2),
  },

  // PADDING/MARGINS

  marginsAllSmall: {
    margin: theme.spacing(1),
  },

  paddingAllSmall: {
    padding: theme.spacing(1),
  },

  marginsAllMedium: {
    margin: theme.spacing(2),
  },

  paddingAllMedium: {
    padding: theme.spacing(2),
  },

  paddingSidesSmall: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },

  paddingSidesMedium: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },

  verticalCenter: {
    padding: theme.spacing(1),
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },

  marginLeftSmall: {
    marginLeft: theme.spacing(1),
  },

  marginRightSmall: {
    marginRight: theme.spacing(1),
  },

  marginLeftBottomSmall: {
    marginLeft: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  marginRightBottomSmall: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },

  marginTopBottomSmall: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },

  marginSidesSmall: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },

  marginTopSmall: {
    marginTop: theme.spacing(1),
  },

  marginTopStandard: {
    marginTop: 80,
  },

  marginBottomStandard: {
    marginBottom: 80,
  },

  marginTopLarge: {
    marginTop: 90,
  },

  marginBottomSmall: {
    marginBottom: theme.spacing(1),
  },

  spacerSmall: {
    width: theme.spacing(1),
  },

  spacerMedium: {
    width: theme.spacing(2),
  },

  // SIZES

  fullWidth: {
    width: '100%',
    maxWidth: '1800px',
  },

  columnSmall: {
    width: 80,
  },

  columnMedSmall: {
    width: 180,
  },

  columnMed: {
    width: 220,
  },

  columnMedLarge: {
    width: 250,
  },

  columnLarge: {
    width: 350,
  },

  columnExtraLarge: {
    width: 500,
  },

  columnExtraExtraLarge: {
    width: 600,
  },

  // CONTAINERS
  paperWidth: {
    position: "relative",
    width: "80vw",
  },

  flexRow: {
    display: 'flex',
    flexDirection: 'row',
  },

  paperFlexRow: {
    display: "flex",
    justifyContent: "center",
  },

  flexRowCenter: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center'
  },

  flexRowBox: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: theme.spacing(4),
    margin: theme.spacing(1),
  },

  flexRowHoverButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    flexDirection: 'row',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover,
        cursor: 'pointer',
    },
  },

  hoverButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    // flexDirection: 'row',
    // display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover,
        cursor: 'pointer',
    },
  },

  flexRowHover: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover
    },
  },

  flexRowHoverPretty: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    flexDirection: 'row',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover,
    },
  },

  hoverPretty: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    // flexDirection: 'row',
    // display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover,
    },
  },

  flexRowTotals: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    flexDirection: 'row',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    fontWeight: 600,
    backgroundColor: theme.palette.app.hover,
  },

  flexRowHoverDisabled: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    flexDirection: 'row',
    display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    color: theme.palette.app.disabled,
  },

  hoverDisabled: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    // flexDirection: 'row',
    // display: 'flex',
    borderRadius: 12,
    alignItems: 'center',
    color: theme.palette.app.disabled,
  },

  // flexRowHoverDisabledFat: {
  //   minHeight: 60,
  //   flexDirection: 'row',
  //   display: 'flex',
  //   color: theme.palette.app.disabled,
  //   alignItems: 'center',
  //   "&:hover": {
  //       backgroundColor: theme.palette.app.hover
  //   },
  // },

  flexRowHoverMed: {
    minHeight: 50,
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover
    },
  },

  flexRowHoverPadded: {
    flexDirection: 'row',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    "&:hover": {
        backgroundColor: theme.palette.app.hover
    },
  },

  flexRowHoverHighlighted: {
    flexDirection: 'row',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.app.highlight,
    "&:hover": {
        backgroundColor: theme.palette.app.hoverHighlight
    },
  },

  flexRowLeftAlignEllipsis: {
    textOverflow: "ellipsis",
    // whiteSpace: "nowrap",
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    overflow: "hidden",
  },

  flexRowLeftDown: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },

  flexRowRightAlign: {
    width: '100%',
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

  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  flexRowEvenlySpaced: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  flexColumn: {
    display: 'flex',
    flex: 'auto',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    flexDirection: 'column',
  },

  // DISPLAY

  cursorDefault: {
    cursor: 'default',
  },

  // COLOUR PICKER

  colorPickerSwatch: {
    padding: '5px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
    display: 'inline-block',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
  },

  colorPickerPopover: {
    position: 'fixed',
    top: '45%',
    left: '45%',
    zIndex: '2',
  },

  colorPickerCover: {
    position: 'fixed',
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  },

  colorPickerColor: {
    width: '36px',
    height: '14px',
    borderRadius: '12px',
  },
});

export { styles, };
