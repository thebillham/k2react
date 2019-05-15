// import React from 'react';
// import { withStyles } from '@material-ui/core/styles';
// import { styles } from '../../config/styles';
// import { connect } from 'react-redux';
// // import { FormattedDate } from 'react-intl';
// import ReactTable from 'react-table';
// import StaffIcon from '@material-ui/icons/People';
// import ListItem from '@material-ui/core/ListItem';
// import ListItemText from '@material-ui/core/ListItemText';
// import List from '@material-ui/core/List';
// import 'react-table/react-table.css'
// import treeTableHOC from 'react-table/lib/hoc/treeTable';
// import JobCard from './JobCard';
// import { FormattedDate } from 'react-intl';
// // import GoogleMapReact from 'google-map-react';
// import { Map, GoogleApiWrapper, Marker } from 'google-maps-react';
//
// import { fetchWFMJobs, fetchWFMLeads, fetchWFMClients, saveGeocodes, fetchGeocodes, updateGeocodes } from '../../actions/local';
//
// const mapStyles = {
//   width: '100%',
//   height: '100%',
// }
//
// const mapStateToProps = state => {
//   return {
//     wfmJobs: state.local.wfmJobs,
//     wfmLeads: state.local.wfmLeads,
//     wfmClients: state.local.wfmClients,
//     geocodes: state.local.geocodes,
//    };
// };
//
// const mapDispatchToProps = dispatch => {
//   return {
//     fetchWFMJobs: () => dispatch(fetchWFMJobs()),
//     fetchWFMLeads: () => dispatch(fetchWFMLeads()),
//     fetchWFMClients: () => dispatch(fetchWFMClients()),
//     saveGeocodes: (g) => dispatch(saveGeocodes(g)),
//     fetchGeocodes: () => dispatch(fetchGeocodes()),
//     updateGeocodes: (g) => dispatch(updateGeocodes(g)),
//   }
// }
//
// {/*
//   const sharing = `)]}'[[[["116014827704053718107","https://lh6.googleusercontent.com/-ACxOv5b8G5o/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQM8MeUWGyV10IYoIT3EGeCL8Cx1Zg/mo/photo.jpg",null,"Kelly Hutchinson",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIDSgA"],[null,[null,172.6840079,-43.5591395],1550179646944,14,"24/105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCAwoCg",null,["116014827704053718107","https://lh6.googleusercontent.com/-ACxOv5b8G5o/AAAAAAAAAAI/AAAAAAAAAAA/ACevoQM8MeUWGyV10IYoIT3EGeCL8Cx1Zg/mo/photo.jpg","Kelly Hutchinson","Kelly"],0,null,null,null,null,null,[1,100],3],[["113507006967434942504","https://lh3.googleusercontent.com/a-/AAuE7mAPYmoZVX4q9mqW_y1CBS7ob5sqnra6v-9ZCLSz",null,"Maree Pierce",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIHigA"],[null,[null,172.6839364,-43.5592242],1550179335715,16,"105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCB0oCw",null,["113507006967434942504","https://lh3.googleusercontent.com/a-/AAuE7mAPYmoZVX4q9mqW_y1CBS7ob5sqnra6v-9ZCLSz","Maree Pierce","Maree"],1,null,null,null,null,null,[0,56],1],[["105912023859982624237","https://lh3.googleusercontent.com/a-/AAuE7mCaxzo5FZJ5NooypYWoPyngTvBHdSPBP3qd4Okh",null,"James Piesse",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgILygA"],[null,[null,172.6839793,-43.5592335],1550179503334,18,"105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCC4oDA",null,["105912023859982624237","https://lh3.googleusercontent.com/a-/AAuE7mCaxzo5FZJ5NooypYWoPyngTvBHdSPBP3qd4Okh","James Piesse","James"],1,null,null,null,null,null,[0,63],1],[["114788267360977829808","https://lh3.googleusercontent.com/a-/AAuE7mBsqIzdWgYzhRFWAL-Bv112GohpHqMxrfehBrnt",null,"Max Gallagher",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIQCgA"],[null,[null,172.6839407,-43.5592415],1550178003014,22,"24/105 Bamford St, Woolston, Christchurch 8023, Nouvelle-Zélande",null,"NZ",46800000],null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCD8oDQ",null,["114788267360977829808","https://lh3.googleusercontent.com/a-/AAuE7mBsqIzdWgYzhRFWAL-Bv112GohpHqMxrfehBrnt","Max Gallagher","Max"],1,null,null,null,null,null,[0,39],1],[["108182579219510128981","https://lh3.googleusercontent.com/a-/AAuE7mD4E0Hu2CGN2L4f8zsECwy01jMuDz8u1-IJmMz7",null,"Reagan Solodi",null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQvDgIUCgA"],null,null,null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQu4IBCE8oDg",null,["108182579219510128981","https://lh3.googleusercontent.com/a-/AAuE7mD4E0Hu2CGN2L4f8zsECwy01jMuDz8u1-IJmMz7","Reagan Solodi","Reagan"],1]],null,"0ahUKEwihpuSslbzgAhXLto8KHWIkBckQ8ZABCAE","Z91lXOHWEMvtvgTiyJTIDA",null,null,"GvoEAN3tZxiI+V6MU6jCZ6kvJ5tVf4TvC+GsZhuxSNyn1XBEVf3UOg8WRQnsvuViwh2fxbaASV2HVYtZQha+YBRb3NBnwMORsiaW3DZixa57whNBCtP19DKhKKe2R7LAdv728x9wgyrMfFqa0ztOp7DnBQq+dI0PbD0amQPDvgXxC3AulZIIXlsrMf0hTslq6n06EiOiC1Ga1rfhcF+AheAPF0EvMoOyC7pQpWnKVUzERjuzokCJUJwxe10La+PjY69K9x6MSzSp+CEfmGgrqwSbuhorPR8+qGfVgkTQEyKPTA84vhB09H5Fb1bGYTZM9pIiM6j6HunfQEcGv0XtlWr9wN3RrEPby18n3JLFYB+j8oj9Ds6yNin9Mq2SJU8dk50l2oVGN3F89iRPNo6oHKfeth0X1GiD7cWymB+Pj9IGuZaWQnb6d7sOJCpBbTK76kQoxAweiqfqNyotmm10n6zlrS9LXPS2MKXvyF+cfNeO+C2G9Ry337tF4xIWZyWTNwpgK+isZMQYi5RRqUAwsEaGdsqiocGSg/eU6aknmddCKC6Ijjsx6XOjaRqgUbRmUrlvFc0RrQ4pMDBO3k+/+YOcpal5SbL4yW+rPFMBZFmNDjdL9jTlPfp9erUdVCsPFh7wHLsU19m1ytzAB7pdvCOudYcv1IYtzAEeNgqaf93e4EyFBVjNila+0OqyHjK0dTrg+3ox82opRvyWZIZOZ/QgIUGY36W7w3JdNWPb5GgCCazbitcFYtkvSJGeuyHcatZWK5F0ILQbT1yXnW6P0qkB1QiybGHc91kjEROqmXFYZ7U2INxagYHgpC/Ab5QZwXUjZJ7kL8/gk+nAQ",4,1550179688202,[null,[null,[null,172.6792273,-43.5555654],1550179140628,1600,"Woolston, Christchurch, Nouvelle-Zélande",null,"NZ",46800000],"ILfzhtOroM3gbA"]]`;
//
// const proxyURL = 'https://cors-anywhere.herokuapp.com/';
// const locationSharingAddress = 'https://www.google.com/maps/preview/locationsharing/read?authuser=0&hl=en&gl=en&pb=';}*/}
//
// class Jobs extends React.Component {
//   constructor(props) {
//     super(props);
//
//     // Set up stat sheet for new names
//     // Averages in form { number of items, sum, average }
//     var statSheet = {
//       // Totals
//       'jobNeedsBookingTotal': 0,
//       'leadTotal': 0,
//       'completedActions': 0,
//       'overdueActions': 0,
//       'upcomingActions': 0,
//       'valueTotal': 0,
//
//       // Averages
//       'averageActionOverdueDays': [0, 0, 0],
//       'averageCompletedActionOverdueDays': [0, 0, 0],
//       'averageCurrentOverdueDays': [0, 0, 0],
//       'averageLeadAge': [0, 0, 0],
//       'averageJobNeedsBookingAge': [0, 0, 0],
//
//       // List of ages to be graphed
//       'leadAges': [],
//       'jobNeedsBookingAges': [],
//       'actionOverdueDays': [],
//       'completedActionOverdueDays': [],
//     };
//
//     this.state = {
//       leads: [],
//       statSheet: statSheet,
//       staffStats: {
//         'K2': statSheet,
//       },
//       clientStats: {},
//     }
//   }
//
//   componentWillMount() {
//     this.props.fetchWFMJobs();
//     this.props.fetchWFMLeads();
//     this.props.fetchWFMClients();
//     this.props.fetchGeocodes();
//   }
//
//   componentWillUnmount() {
//     console.log(this.props.geocodes);
//     if (this.props.geocodes) this.props.saveGeocodes(this.props.geocodes);
//   }
//
//   processActivityStats = (activities) => {
//     activities.forEach(a => {
//       // Check if activity is completed
//       if (a.completed == 'Yes') {
//         this.addStaffStat(a.responsible, 'completedActions');
//         this.listStaffStat(a.responsible, 'completedActionOverdueDays', a.completedOverdueBy);
//         this.averageStaffStat(a.responsible, 'averageCompletedActionOverdueDays', a.completedOverdueBy);
//       } else {
//         var overdueDays = this.getDaysSinceDate(a.date);
//         if (overdueDays > 0) {
//           // Overdue Action
//           this.addStaffStat(a.responsible, 'overdueActions');
//           this.listStaffStat(a.responsible, 'actionOverdueDays', overdueDays);
//           this.averageStaffStat(a.responsible, 'averageActionOverdueDays', overdueDays);
//         } else {
//           // Action on target
//           this.addStaffStat(a.responsible, 'upcomingActions');
//         }
//       }
//     });
//   }
//
//   displayTimeDifference = (date) => {
//     var timeDifference = new Date() - new Date(date);
//     var divideBy = {
//       d: 86400000,
//       m: 2629800000,
//       y: 31557600000,
//     };
//     var years = Math.floor(timeDifference/divideBy['y']);
//     timeDifference = timeDifference % divideBy['y'];
//     var months = Math.floor(timeDifference/divideBy['m']);
//     timeDifference = timeDifference % divideBy['m'];
//     var days = Math.floor(timeDifference/divideBy['d']);
//     let y = years + ' years ';
//     let m = months + ' months ';
//     let d = days + ' days';
//     if (years === 1) y = years + ' year ';
//     if (months === 1) m = months + ' month ';
//     if (days === 1) d = days + ' day';
//     if (years === 0) y = '';
//     if (months === 0) m = '';
//     return (y + m + d);
//   }
//
//   getDaysSinceDate = (date) => {
//     var timeDifference = new Date() - new Date(date);
//     var divideBy = 86400000;
//     var days = Math.floor(timeDifference/divideBy);
//
//     return days;
//   }
//
//   getDaysBetweenDates = (d1, d2) => {
//     var timeDifference = new Date(d1) - new Date(d2);
//     var divideBy = 86400000;
//     var days = Math.floor(timeDifference/divideBy);
//
//     return days;
//   }
//
//   formatDate = (date) => {
//     return <FormattedDate
//       value={date instanceof Date ? date : new Date(date)}
//       month='long'
//       day='numeric'
//       year='numeric'
//       children={(string) => string}
//     />
//   }
//
//   getCompletionDateFromHistory = (activity, history) => {
//     if (activity.completed == 'No') return activity;
//     var name = activity.subject;
//     var activities = [];
//     // Get only actions that are of activities being completed
//     var actions = history.filter(item => item.type == 'Activity' && item.detail.includes(activity.subject));
//
//     if (actions.length > 0) {
//       activity.completeDate = actions[0].date;
//       activity.completedOverdueBy = this.getDaysBetweenDates(activity.completeDate, activity.date);
//     }
//     return activity;
//   }
//
//   getAddressFromClient = (clientID) => {
//     var client = this.props.wfmClients.filter(client => client.wfmID == clientID);
//     if (client.length > 0) {
//       var address = client[0].city == '' ? client[0].address : client[0].address + ', ' + client[0].city;
//       return address;
//     } else {
//       return '';
//     }
//   }
//
//   handleGeocode = (address, clientAddress, lead) => {
//     lead.clientAddress = clientAddress;
//     // Pick either name or clientAddress to use as the geolocation
//     var address = this.checkAddress(address);
//     if (address == 'NULL') {
//       address = this.checkAddress(clientAddress);
//     }
//
//     if (this.props.geocodes[address] != null) {
//       console.log('Already there');
//       lead.geocode = this.props.geocodes[address];
//       this.state.leads = [...this.state.leads, lead,];
//     } else {
//       let path = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&components=country:NZ&key=${process.env.REACT_APP_GOOGLE_API_KEY}`;
//       fetch(path).then(response => response.json()).then(response => {
//         var gc = this.props.geocodes;
//         gc[address] = this.simplifiedGeocode(response.results[0]);
//         this.props.updateGeocodes(gc);
//         lead.geocode = gc[address];
//         // console.log(lead);
//         this.setState({
//           leads: [
//             ...this.state.leads,
//             lead,
//           ],
//         });
//         return lead;
//       });
//     }
//   }
//
//   checkAddress = (address) => {
//     if (address == '') return "NULL";
//     // if (address.trim().split(/\s+/).length < 2) return "NULL";
//
//     var geo = this.props.geocodes[encodeURI(address)];
//
//     // ignore all addresses that just return the country
//     if (geo != null && geo.address == 'New Zealand') return "NULL";
//
//     // ignore all addresses with blackListed words
//     var blacklist = [
//       'acoustic',
//       'air quality',
//       'testing',
//       'asbestos',
//       'samples',
//       'website',
//       'query',
//       'analysis',
//       'pricing',
//       'biological',
//       'assessment',
//       'dust',
//       'monitoring',
//       'lead',
//       'asbetsos',
//       'survey',
//       'silica',
//       'consulting',
//       'biologial',
//       'emission',
//       'mould',
//       'noise',
//       'stack',
//       'welding',
//     ];
//
//     var blackListed = false;
//
//     blacklist.forEach(w => {
//       if (address.toLowerCase().includes(w)) blackListed = true;
//     });
//
//     if (blackListed) return "NULL";
//
//     return encodeURI(address);
//   }
//
//   simplifiedGeocode = g => {
//     return {
//       address: g.formatted_address,
//       location: [g.geometry.location.lat, g.geometry.location.lng],
//       locationType: g.geometry.location_type,
//       place: g.place_id,
//     }
//   }
//
//   getCompletedActivities = (activities) => {
//     var completedActivities = activities.filter(activity => activity.completed == 'Yes');
//     return completedActivities.sort((a, b) => {
//       return new Date(a.completeDate).getTime() -
//         new Date(b.completeDate).getTime()
//     }).reverse();
//   }
//
//   getUncompletedActivities = (activities) => {
//     var uncompletedActivities = activities.filter(activity => activity.completed == 'No');
//     return uncompletedActivities.sort((a, b) => {
//       return new Date(a.date).getTime() -
//         new Date(b.date).getTime()
//     }).reverse();
//   }
//
//   getLastActionDateFromActivities = (completedActivities, defaultDate) => {
//     if (completedActivities.length === 0) return defaultDate;
//     return completedActivities[0].completeDate;
//   }
//
//   getLastActionTypeFromActivities = (completedActivities) => {
//     if (completedActivities.length === 0) return 'Lead created';
//     return completedActivities[0].subject;
//   }
//
//   getAverageCompletedActionOverdueDays = (completedActivities) => {
//     if (completedActivities.length === 0) return 0;
//     var sum = 0;
//     var total = 0;
//     completedActivities.forEach((a) => {
//       total = total + 1;
//       sum = sum + a.completedOverdueBy;
//     });
//     return Math.floor(sum/total);
//   }
//
//   getNextActionType = (activities) => {
//     var todo = this.getUncompletedActivities(activities);
//     if (todo.length > 0) {
//       return todo[0].subject;
//     } else {
//       return 'Convert to job or add new action';
//     }
//   }
//
//   getNextActionOverdueBy = (activities) => {
//     var todo = this.getUncompletedActivities(activities);
//     if (todo.length > 0) {
//       return this.getDaysSinceDate(todo[0].date);
//     } else {
//       return 0;
//     }
//   }
//
//   addClientStat = (name, stat) => {
//     // Add to client stats
//     if (this.state.clientStats[name]) {
//       this.state.clientStats[name] = {
//         ...this.state.clientStats[name],
//         [stat]: this.state.clientStats[name][stat] + 1,
//       };
//     } else {
//       this.state.clientStats = {
//         ...this.state.clientStats,
//         [name]: this.state.clientStatSheet,
//       };
//       this.state.clientStats[name][stat] = 1;
//     }
//   }
//
//   addStaffStat = (name, stat) => {
//     // Add to total stats
//     this.state.staffStats['K2'] = {
//       ...this.state.staffStats['K2'],
//       [stat]: this.state.staffStats['K2'][stat] + 1,
//     };
//
//     // Add to staff stats
//     if (this.state.staffStats[name]) {
//       this.state.staffStats[name] = {
//         ...this.state.staffStats[name],
//         [stat]: this.state.staffStats[name][stat] + 1,
//       };
//     } else {
//       this.state.staffStats = {
//         ...this.state.staffStats,
//         [name]: this.state.statSheet,
//       };
//       this.state.staffStats[name][stat] = 1;
//     }
//   }
//
//   averageStaffStat = (name, stat, value) => {
//     // Averages in form { number of items, sum, average }
//
//     // Add to total stats
//     var average = this.state.staffStats['K2'][stat];
//
//     if (average[0] > 0) {
//       average[0] = average[0] + 1;
//       average[1] = average[1] + value;
//       average[2] = Math.floor(average[1]/average[0]);
//     } else {
//       average = [1, value, value];
//     }
//
//     this.state.staffStats['K2'] = {
//       ...this.state.staffStats['K2'],
//       [stat]: average,
//     };
//
//     // Add to staff stats
//     if (this.state.staffStats[name]) {
//       var average = this.state.staffStats[name][stat];
//
//       if (average[0] > 0) {
//         average[0] = average[0] + 1;
//         average[1] = average[1] + value;
//         average[2] = Math.floor(average[1]/average[0]);
//       } else {
//         average = [1, value, value];
//       }
//
//       this.state.staffStats[name] = {
//         ...this.state.staffStats[name],
//         [stat]: average,
//       };
//     } else {
//       this.state.staffStats = {
//         ...this.state.staffStats,
//         [name]: this.state.statSheet,
//       };
//       this.state.staffStats[name][stat] = [1, value, value];
//     }
//   }
//
//   listStaffStat = (name, stat, value) => {
//     // Add to total stats
//     this.state.staffStats['K2'] = {
//       ...this.state.staffStats['K2'],
//       [stat]: [...this.state.staffStats[name][stat], value],
//     };
//
//     // Add to staff stats
//     if (this.state.staffStats[name]) {
//       this.state.staffStats[name] = {
//         ...this.state.staffStats[name],
//         [stat]: [...this.state.staffStats[name][stat], value],
//       };
//     } else {
//       this.state.staffStats = {
//         ...this.state.staffStats,
//         [name]: this.state.statSheet,
//       };
//       this.state.staffStats[name][stat] = [value];
//     }
//   }
//
// // Collate Jobs (need booking) and Leads into a set of data that can be displayed nicely
//   collateLeadsData = () => {
//     // this.geocodeAddress('aljflasdfj;l','199 Centaurus Road, Christchurch');
//
//     // Filter only jobs that need booking
//     var jobsNeedBooking = this.props.wfmJobs.filter(job => {
//       return job.state == 'Needs Booking';
//     });
//
//     // Convert jobs into a 'lead' type object
//     jobsNeedBooking.forEach(job => {
//       var lead = {};
//       lead.wfmID = job.wfmID;
//       lead.client = job.client;
//       lead.clientID = job.clientID;
//       lead.name = job.address;
//       lead.owner = job.manager;
//       lead.jobNumber = job.jobNumber;
//       lead.creationDate = job.startDate;
//       lead.category = job.type;
//       lead.currentStatus = job.currentStatus;
//       lead.urgentAction = '';
//       lead.lastActionDate = job.startDate;
//       lead.lastActionType = 'Converted into job';
//       lead.nextActionType = 'Book job';
//       lead.daysOld = this.getDaysSinceDate(lead.creationDate);
//       lead.isJob = true;
//
//       // Get extra client information
//       // lead.clientAddress = this.getAddressFromClient(lead);
//       // lead.geoCode = this.handleGeocode(job.address);
//
//       // Add stats
//       this.addStaffStat(lead.owner, 'jobNeedsBookingTotal', 'sum');
//       this.averageStaffStat(lead.owner, 'averageJobNeedsBookingAge', this.getDaysSinceDate(lead.creationDate));
//       this.listStaffStat(lead.owner, 'jobNeedsBookingAges', this.getDaysSinceDate(lead.creationDate));
//
//       this.handleGeocode(job.address, this.getAddressFromClient(job.clientID), lead);
//     });
//
//     var otherJobs = this.props.wfmJobs.filter(job => {
//       return job.state != 'Needs Booking';
//     });
//
//     // Convert other jobs
//     otherJobs.forEach(job => {
//       var lead = {};
//       lead.wfmID = job.wfmID;
//       lead.client = job.client;
//       lead.clientID = job.clientID;
//       lead.name = job.address;
//       lead.owner = job.manager;
//       lead.jobNumber = job.jobNumber;
//       lead.creationDate = job.startDate;
//       lead.category = job.type;
//       lead.currentStatus = job.currentStatus;
//       lead.urgentAction = '';
//       // lead.lastActionDate = job.startDate;
//       // lead.lastActionType = 'Converted into job';
//       // lead.nextActionType = 'Book job';
//       lead.isJob = true;
//
//       this.handleGeocode(job.address, this.getAddressFromClient(job.clientID), lead);
//     });
//
//     this.props.wfmLeads.forEach(wfmLead => {
//       var lead = {};
//       lead.wfmID = wfmLead.wfmID;
//       lead.client = wfmLead.client;
//       lead.name = wfmLead.name;
//       lead.owner = wfmLead.owner;
//       lead.jobNumber = '-';
//       lead.creationDate = wfmLead.date;
//       lead.category = wfmLead.category;
//       lead.currentStatus = wfmLead.currentStatus;
//       lead.urgentAction = '';
//       lead.value = wfmLead.value;
//
//       // Map actions to history to get completion date of each action
//       if (wfmLead.activities[0] == 'NO PLAN!') {
//         lead.urgentAction = 'Add Milestones to Lead';
//         lead.activities = [];
//       } else if (wfmLead.history[0] == 'No History') {
//         lead.activities = [];
//       } else {
//         lead.activities = wfmLead.activities.map(activity => this.getCompletionDateFromHistory(activity, wfmLead.history));
//       }
//
//       this.processActivityStats(lead.activities);
//
//       lead.completedActivities = this.getCompletedActivities(lead.activities);
//
//       lead.lastActionDate = this.getLastActionDateFromActivities(lead.completedActivities, lead.creationDate);
//       lead.daysSinceLastAction = this.getDaysSinceDate(lead.lastActionDate);
//       lead.lastActionType = this.getLastActionTypeFromActivities(lead.completedActivities);
//
//       lead.daysOld = this.getDaysSinceDate(lead.creationDate);
//       lead.averageCompletedActionOverdueDays = this.getAverageCompletedActionOverdueDays(lead.completedActivities);
//       lead.nextActionType = this.getNextActionType(lead.activities);
//       lead.nextActionOverdueBy = this.getNextActionOverdueBy(lead.activities);
//
//       lead.isJob = false;
//
//       // Get extra client information
//       // lead.clientAddress = this.getAddressFromClient(wfmLead.clientID);
//       // lead.geoCode = this.handleGeocode(wfmLead.name);
//
//       // Add stats
//       this.addStaffStat(lead.owner, 'leadTotal');
//       this.averageStaffStat(lead.owner, 'averageLeadAge', this.getDaysSinceDate(lead.creationDate));
//       this.listStaffStat(lead.owner, 'leadAges', this.getDaysSinceDate(lead.creationDate));
//
//       this.handleGeocode(wfmLead.name, this.getAddressFromClient(wfmLead.clientID), lead);
//     });
//   }
//
//   render() {
//     const K_WIDTH = 40;
//     const K_HEIGHT = 40;
//     const { wfmJobs, wfmLeads, wfmClients, geocodes, } = this.props;
//     if (wfmJobs.length > 0 && wfmLeads.length > 0 && wfmClients.length > 0 && geocodes && this.state.leads.length === 0) this.collateLeadsData();
//     // console.log(this.state.leads);
//     return (
//       <div style={{ height: '100vh', width: '100%', }}>
//           <Map
//             google={this.props.google}
//             zoom={6.27}
//             style={mapStyles}
//             initialCenter={{
//               lat: -40.9261681,
//               lng: 174.4070603
//             }}
//           >
//             {
//               this.state.leads.map(m => {
//                 if (m && m.geocode.address != 'New Zealand')
//                 return(
//                   <Marker
//                     key={m.wfmID}
//                     position={{ lat: m.geocode.location[0], lng: m.geocode.location[1] }}
//                     title={m.client}
//                     />
//                   );
//               })
//             }
//           </Map>
//       </div>
//
//     );
//
// {/*
//
//     return (
//       <div style = {{ marginTop: 80 }}>
//         {wfmLeads &&
//         <ReactTable
//           data={wfmLeads}
//           columns={[
//             {
//               Header: "Name",
//               accessor: "name"
//             },
//             {
//               Header: "Category",
//               accessor: "category"
//             },
//             {
//               Header: "Client",
//               accessor: "client"
//             },
//             {
//               Header: "Owner",
//               accessor: "owner"
//             },
//             {
//               Header: "Date",
//               id: "date",
//               accessor: d => <FormattedDate value={d.date instanceof Date ? d.date : new Date(d.date)} month='long' day='numeric' year='numeric' />
//             },
//             {
//               Header: "How Old",
//               id: "howold",
//               accessor: d => d.date instanceof Date ? this.displayTimeDifference(d.date) : this.displayTimeDifference(new Date(d.date))
//             }
//           ]}
//           defaultSorted={[
//             {
//               id: "ID",
//               desc: true,
//             }
//           ]}
//           defaultPageSize={25}
//           className="-striped -highlight"
//           />
//         }
//       </div>
//     );
// */}
//   }
// }
//
// export default connect(mapStateToProps, mapDispatchToProps)(GoogleApiWrapper({apiKey: process.env.REACT_APP_GOOGLE_API_KEY})(Jobs));
