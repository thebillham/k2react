import moment from "moment";

export const personnelConvert = e => {
  if (e.filter(staff => staff.value === 'Client').length > 0) {
    if (e[e.length - 1].value === 'Client') return [{uid: 'Client', name: 'Client'}];
      else return e.filter(staff => staff.value !== 'Client').map(staff => ({uid: staff.value, name: staff.label}));
  } else return e.map(staff => ({uid: staff.value, name: staff.label}));
}

export const displayTimeDifference = date => {
  var timeDifference = new Date() - dateOf(date);
  var divideBy = {
    d: 86400000,
    m: 2629800000,
    y: 31557600000
  };
  var timeList = [];
  var years = Math.floor(timeDifference / divideBy["y"]);
  timeDifference = timeDifference % divideBy["y"];
  var months = Math.floor(timeDifference / divideBy["m"]);
  timeDifference = timeDifference % divideBy["m"];
  var days = Math.floor(timeDifference / divideBy["d"]);
  if (days < 0) days = 0;
  let y = years + " years";
  let m = months + " months";
  let d = days + " days";
  if (years === 1) y = years + " year";
  if (months === 1) m = months + " month";
  if (days === 1) d = days + " day";
  if (years > 0) {
    timeList.push(y);
    timeList.push(m);
    timeList.push(d);
    return andList(timeList);
  } else if (months > 0) {
    timeList.push(m);
    timeList.push(d);
    return andList(timeList);
  } else return d;
};

export const getDaysSinceDate = date => {
  var timeDifference = new Date() - new Date(date);
  var divideBy = 86400000;
  var days = Math.floor(timeDifference / divideBy);

  return days;
};

export const getDaysBetweenDates = (d1, d2) => {
  var timeDifference = new Date(d1) - new Date(d2);
  var divideBy = 86400000;
  var days = Math.floor(timeDifference / divideBy);

  return days;
};

export const mapsAreEqual = (res1, res2) => {
  console.log(res1);
  console.log(res2);
  console.log(res1 !== res2);
  if (res1 === res2) return true;
  if ((!res1 && res2) || (res1 && !res2)) return false;
  let res = true;
  if (res1 && res2) {
    Object.keys(res1).forEach(k => {
      if (res1[k] !== res2[k]) res = false;
    });
    Object.keys(res2).forEach(k => {
      if (res1[k] !== res2[k]) res = false;
    });
  }
  return res;
}

export const numericAndLessThanOnly = num => {
  if (num) {
    let str = num.replace(/[^$0-9.<]/,'');
    if (num.charAt(0) === '.') return `0${str}`;
    else return str;
  } else return '';
}

export const titleCase = input => {
  let small = ['and','a','an','as','at','but','by','en','for','from','if','is','in','of','on','or','the','to'];
  let parts = input.split(' ');
  let partsList = [];
  let count = 1;
  parts.forEach(word => {
    if (count === 1 || count === parts.length) partsList.push(upper(word));
    else if (small.includes(word.toLowerCase()) && word !== 'A') partsList.push(lower(word))
    else partsList.push(upper(word));
    count++;
  });
  return partsList.join(' ');
}

export const sentenceCase = input => {
  let parts = input.split(' ');
  let partsList = [];
  partsList.push(upper(parts[0]));
  parts.slice(1).forEach(word => {
    partsList.push(lower(word));
  });
  return partsList.join(' ');
}

export const lower = word => {
  let inwordCapitalization = false;
  [...word.substr(1)].forEach(letter => {
    if (letter !== letter.toLowerCase()) inwordCapitalization = true;
  });
  if (inwordCapitalization) return word;
   else return word.toLowerCase();
}

export const upper = word => {
  let inwordCapitalization = false;
  [...word.substr(1)].forEach(letter => {
    if (letter !== letter.toLowerCase()) inwordCapitalization = true;
  });
  if (inwordCapitalization) return word;
   else return word.substr(0,1).toUpperCase() + word.substr(1);
}

export const dateOf = d => {
  if (!d) {
    return null;
  } else if (d instanceof Date) {
    return d;
  } else {
    try {
      return d.toDate();
    } catch (e) {
      return new Date(d);
    }
  }
}

export const milliToDHM = (t, verbose, businessTime) => {
  var cd = businessTime ? 9 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
      ch = 60 * 60 * 1000,
      d = Math.floor(t / cd),
      h = Math.floor( (t - d * cd) / ch),
      m = Math.round( (t - d * cd - h * ch) / 60000),
      pad = function(n){ return n < 10 ? '0' + n : n; };
  if( m === 60 ){
    h++;
    m = 0;
  }
  if( h === 24 ){
    d++;
    h = 0;
  }
  if (verbose) {
    var dateArray = [];
    if (d > 0) d === 1 ? dateArray.push('1 day') : dateArray.push(`${d} days`);
    if (h > 0) h === 1 ? dateArray.push('1 hour') : dateArray.push(`${h} hours`);
    if (m > 0) m === 1 ? dateArray.push('1 minute') : dateArray.push(`${m} minutes`);
    return andList(dateArray);
  } else return [d, pad(h), pad(m)].join(':');
}

export const writeDates = (objects, field) => {
  let dates = [];
  let dateMap = {};
  let sortedMap = {};
  Object.values(objects).forEach(obj => {
    if (obj[field]) dates.push(dateOf(obj[field]));
  });
  if (dates.length === 0) return "N/A";
  dates.forEach(date => {
    let formatDate = moment(date).format('D MMMM YYYY');
    dateMap[formatDate] = true;
  });

  // return Object.keys(dateMap).join(', ');

  // TODO: Join Dates in Prettier Way

  Object.keys(dateMap).sort((b, a) => {
    return new Date(b - a);
  }).forEach(date => {
    let year = moment(date).format('YYYY');
    let month = moment(date).format('MMMM');
    let day = moment(date).format('D');
    sortedMap[year] = sortedMap[year] ? sortedMap[year] : {};
    sortedMap[year][month] = sortedMap[year][month] ? sortedMap[year][month] : {};
    sortedMap[year][month][day] = true;
  });

  var monthNames = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
  };

  let dateList = [];
  Object.keys(sortedMap).forEach(year => {
    let monthsList = [];
    Object.keys(sortedMap[year]).sort((a, b) => {
      return monthNames[a] - monthNames[b];
    }).forEach(month => {
      let lastDay = null;
      let firstDay = null;
      let daysList = [];
      Object.keys(sortedMap[year][month]).sort((a, b) => {
        return parseInt(a) - parseInt(b);
      }).forEach(day => {
        // console.log(day);
        if (!firstDay) firstDay = day;
        if (lastDay === null || parseInt(day) - parseInt(lastDay) === 1) {
          // console.log(`Add ${day} to range`);
          // day is either the first or only one after the one before
          lastDay = day;
        } else {
          // day is further than one away, add the previous range to the list
          if (parseInt(firstDay) === parseInt(lastDay)) {
            daysList.push(firstDay);
            // console.log(`Just add ${firstDay}`);
          } else {
            daysList.push(`${firstDay}-${lastDay}`);
            // console.log(`Add range ${firstDay}-${lastDay}`);
          }
          firstDay = day;
          lastDay = day;
        }
      })
      if (lastDay === null || parseInt(firstDay) === parseInt(lastDay)) {
        daysList.push(firstDay);
        // console.log(`Just add ${firstDay} at end`);
      } else {

        daysList.push(`${firstDay}-${lastDay}`);
        // console.log(`Add range ${firstDay}-${lastDay} at end`);
      }
      monthsList.push(`${andList(daysList)} ${month}`);
    });
    dateList.push(`${andList(monthsList)} ${year}`);
  });

  //console.log(dateList.join(', '));
  // 17 August 2017, 6, 10, 12, 21, 31 August and 19 September 2019

  return andList(dateList);

  // //console.log(dateMap);
};

export const andList = (list) => {
  if (list.length === 0) return ''
  else if (list.length === 1) return list[0]
  else return list.slice(0, -1).join(', ') + ' and ' + list.slice(-1);
}

export const sendSlackMessage = (message, json) => {
  let text;
  if (json) text = message;
  else text = { text: message };
  fetch(process.env.REACT_APP_SLACK_WEBHOOK, {
    method: "POST",
    body: JSON.stringify(text)
  });
};
