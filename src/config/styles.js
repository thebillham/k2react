import { fade } from '@material-ui/core/styles/colorManipulator';

const drawerWidth = 240;

const modalStyles = theme => ({
  accentButton: {
    color: theme.palette.secondary.main,
  },

  dialogField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    marginBottom: theme.spacing.unit * 2,
    width: 500,
  },
});

const formStyles = theme => ({

  paper: {
    ...theme.mixins.gutters(),
    display: 'flex',
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    width: 700,
    justifyContent: 'center',
  },

  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    fontSize: 14,
    // marginBottom: theme.spacing.unit * 2,
    width: 500,
  },

  note: {
    marginLeft: theme.spacing.unit,
    fontSize: 12,
    color: '#888',
    // marginBottom: theme.spacing.unit * 2,
  },
  labels: {
    marginTop: theme.spacing.unit * 2,
    marginLeft: theme.spacing.unit,
    fontSize: 16,
    fontWeight: 'bold',
    // marginBottom: theme.spacing.unit * 2,
  },
  container: {
    marginTop: theme.spacing.unit * 10,
    justifyContent: 'center',
  },

  dashboardIcon: {
    color: 'white',
    fontSize: 14,
  },

  formIcon: {
    color: 'black',
    fontSize: 14,
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
});

const styles = theme => ({
  root: {
    display: 'flex',
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
    marginRight: theme.spacing.unit * 2,
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit * 3,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
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
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
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
    width: theme.spacing.unit * 7,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing.unit * 9,
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
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
    paddingLeft: theme.spacing.unit * 10,
  },
  subitem: {
    fontSize: 8,
  },
  fineprint: {
    fontSize: 12,
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
});

export { styles, modalStyles, formStyles };
