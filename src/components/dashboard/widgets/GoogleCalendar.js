import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { styles } from "../../../config/styles";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CardHeader from "@material-ui/core/CardHeader";

import { FormattedDate } from "react-intl";
import Add from "@material-ui/icons/Add";
import Close from "@material-ui/icons/Close";
import Edit from "@material-ui/icons/Edit";

// Replace with an actual GoogleCalendar API response
// This response is from here: https://developers.google.com/calendar/v3/reference/events/list#try-it
const dummyList = {
  kind: "calendar#events",
  etag: '"p32cf197jqjvtq0g"',
  summary: "beth.scarrow.k2@gmail.com",
  updated: "2018-10-12T00:38:29.503Z",
  timeZone: "Pacific/Auckland",
  accessRole: "reader",
  defaultReminders: [],
  nextPageToken:
    "EjYKKzMzaWw5MWJobXVvbmRvazZpOG1uNW5mdTZjXzIwMTgwNzEyVDIwMDAwMFoYgIC87s2b3AI=",
  items: [
    {
      kind: "calendar#event",
      etag: '"3060460700378000"',
      id: "4l4t82300tf67sdmq6l6qlh966",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NGw0dDgyMzAwdGY2N3NkbXE2bDZxbGg5NjYgYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-06-28T23:59:09.000Z",
      updated: "2018-06-28T23:59:10.189Z",
      summary: "T1140 - detailed",
      location: "31A Hartford Ave, Papamoa Beach, Papamoa 3118, New Zealand",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-04T12:00:00+12:00"
      },
      end: {
        dateTime: "2018-07-04T13:45:00+12:00"
      },
      iCalUID: "4l4t82300tf67sdmq6l6qlh966@google.com",
      sequence: 0,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3061165541448000"',
      id: "6b3rkuocebipdnv8u1mb6mav9c",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NmIzcmt1b2NlYmlwZG52OHUxbWI2bWF2OWMgYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-07-03T01:52:49.000Z",
      updated: "2018-07-03T01:52:50.724Z",
      summary: "Occ health training with Tim",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "hgdokast6q8fum42sdlsi2mm18@group.calendar.google.com",
        displayName: "K2 AKL OPS"
      },
      start: {
        dateTime: "2018-07-05T10:30:00+12:00"
      },
      end: {
        dateTime: "2018-07-05T14:00:00+12:00"
      },
      iCalUID: "6b3rkuocebipdnv8u1mb6mav9c@google.com",
      sequence: 0,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        },
        {
          email: "tim.hayward.k2@gmail.com",
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3062188463168000"',
      id: "5me7maq6a454a6lnnvinfe02rk_20180708T203000Z",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NW1lN21hcTZhNDU0YTZsbm52aW5mZTAycmtfMjAxODA3MDhUMjAzMDAwWiBiZXRoLnNjYXJyb3cuazJAbQ",
      created: "2018-07-05T21:59:52.000Z",
      updated: "2018-07-08T23:57:11.584Z",
      summary: "T1179 - 82 Alfred St, Fairfield, Hamilton TBC",
      location: "82 Alfred St, Fairfield, Hamilton 3214, New Zealand",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-09T08:30:00+12:00"
      },
      end: {
        dateTime: "2018-07-09T10:00:00+12:00"
      },
      recurringEventId: "5me7maq6a454a6lnnvinfe02rk",
      originalStartTime: {
        dateTime: "2018-07-09T08:30:00+12:00"
      },
      iCalUID: "5me7maq6a454a6lnnvinfe02rk@google.com",
      sequence: 1,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3061527316298000"',
      id: "7cfalnqe6rff2e13mkh7ft0etd",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=N2NmYWxucWU2cmZmMmUxM21raDdmdDBldGQgYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-07-05T04:07:37.000Z",
      updated: "2018-07-05T04:07:38.149Z",
      summary: "AS 181659 - fire survey",
      location: "73 Snell Dr, Chartwell, Hamilton 3210, New Zealand",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-09T11:00:00+12:00"
      },
      end: {
        dateTime: "2018-07-09T12:00:00+12:00"
      },
      iCalUID: "7cfalnqe6rff2e13mkh7ft0etd@google.com",
      sequence: 0,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3062217852444000"',
      id: "5idc06ko8ioqm30q6027me5hsp",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NWlkYzA2a284aW9xbTMwcTYwMjdtZTVoc3AgYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-05-30T21:42:09.000Z",
      updated: "2018-07-09T04:02:06.222Z",
      summary: "Tokoroa school survey",
      location: "Maraetai Road, Maraetai Rd, Tokoroa, New Zealand",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-10T07:45:00+12:00"
      },
      end: {
        dateTime: "2018-07-10T15:15:00+12:00"
      },
      iCalUID: "5idc06ko8ioqm30q6027me5hsp@google.com",
      sequence: 2,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3062391337778000"',
      id: "3j4fq9p8k3qb1pcdg6gjll2l6a",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=M2o0ZnE5cDhrM3FiMXBjZGc2Z2psbDJsNmEgYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-07-08T23:55:18.000Z",
      updated: "2018-07-10T04:07:48.889Z",
      summary: "Drop of background pumps",
      location: "6201 Great S Rd, Horotiu 3288, New Zealand",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-11T09:30:00+12:00"
      },
      end: {
        dateTime: "2018-07-11T10:30:00+12:00"
      },
      iCalUID: "3j4fq9p8k3qb1pcdg6gjll2l6a@google.com",
      sequence: 1,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3062395574440000"',
      id: "5224dmka1gt3r2ih0s3nedg0i8",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NTIyNGRta2ExZ3QzcjJpaDBzM25lZGcwaTggYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-07-10T04:43:07.000Z",
      updated: "2018-07-10T04:43:07.220Z",
      summary: "pick up meth swabs",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      start: {
        dateTime: "2018-07-11T14:00:00+12:00"
      },
      end: {
        dateTime: "2018-07-11T15:00:00+12:00"
      },
      iCalUID: "5224dmka1gt3r2ih0s3nedg0i8@google.com",
      sequence: 0,
      extendedProperties: {
        private: {
          everyoneDeclinedDismissed: "-1"
        }
      },
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3062391343784000"',
      id: "3edrl3f8gt4msujto6lo2psc6t",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=M2VkcmwzZjhndDRtc3VqdG82bG8ycHNjNnQgYmV0aC5zY2Fycm93LmsyQG0",
      created: "2018-07-08T23:55:35.000Z",
      updated: "2018-07-10T04:07:51.892Z",
      summary: "Pick up BGS/stage 3",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-11T16:00:00+12:00"
      },
      end: {
        dateTime: "2018-07-11T17:00:00+12:00"
      },
      iCalUID: "3edrl3f8gt4msujto6lo2psc6t@google.com",
      sequence: 1,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3062188483520000"',
      id: "5me7maq6a454a6lnnvinfe02rk_20180711T203000Z",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=NW1lN21hcTZhNDU0YTZsbm52aW5mZTAycmtfMjAxODA3MTFUMjAzMDAwWiBiZXRoLnNjYXJyb3cuazJAbQ",
      created: "2018-07-05T21:59:52.000Z",
      updated: "2018-07-08T23:57:21.760Z",
      summary: "T1179 - 82 Alfred St, Fairfield, Hamilton TBC",
      location: "82 Alfred St, Fairfield, Hamilton 3214, New Zealand",
      creator: {
        email: "beth.scarrow.k2@gmail.com",
        self: true
      },
      organizer: {
        email: "iuhueear3cbtdl4nk9koo5dkno@group.calendar.google.com",
        displayName: "k2 Hamilton jobs"
      },
      start: {
        dateTime: "2018-07-12T09:15:00+12:00"
      },
      end: {
        dateTime: "2018-07-12T10:45:00+12:00"
      },
      recurringEventId: "5me7maq6a454a6lnnvinfe02rk",
      originalStartTime: {
        dateTime: "2018-07-12T08:30:00+12:00"
      },
      iCalUID: "5me7maq6a454a6lnnvinfe02rk@google.com",
      sequence: 2,
      attendees: [
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        }
      ],
      reminders: {
        useDefault: true
      }
    },
    {
      kind: "calendar#event",
      etag: '"3055597131950000"',
      id: "33il91bhmuondok6i8mn5nfu6c_20180712T200000Z",
      status: "confirmed",
      htmlLink:
        "https://www.google.com/calendar/event?eid=MzNpbDkxYmhtdW9uZG9rNmk4bW41bmZ1NmNfMjAxODA3MTJUMjAwMDAwWiBiZXRoLnNjYXJyb3cuazJAbQ",
      created: "2017-08-10T19:53:45.000Z",
      updated: "2018-05-31T20:29:25.975Z",
      summary: "Friday Morning Meeting",
      creator: {
        email: "james.piesse.k2@gmail.com"
      },
      organizer: {
        email: "fua8uif2eq83uj81nsokg7ijf4@group.calendar.google.com",
        displayName: "K2 CHCH OPs"
      },
      start: {
        dateTime: "2018-07-13T08:00:00+12:00"
      },
      end: {
        dateTime: "2018-07-13T08:30:00+12:00"
      },
      recurringEventId: "33il91bhmuondok6i8mn5nfu6c",
      originalStartTime: {
        dateTime: "2018-07-13T08:00:00+12:00"
      },
      iCalUID: "33il91bhmuondok6i8mn5nfu6c@google.com",
      sequence: 1,
      attendees: [
        {
          email: "ben.dodd.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "stuart.keer.keer.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "rachel.scullion.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "samwoodk2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "k2.lance.nz@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "max.gallagher.k2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "stephen.nouwens.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "aaron.davidson.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "ben.potter.k2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "shona.huffadine.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "jason.lang.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "kelly.hutchinson.k2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "alex.baboshko.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "jenny.thompson.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "max.van.den.oever.k2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "carol.keer.keer.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "jason.dickson.k2@gmail.com",
          displayName: "Jason Dickson",
          responseStatus: "needsAction"
        },
        {
          email: "clinton.poole.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "reagansolodik2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "richard.duggan.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "beth.scarrow.k2@gmail.com",
          self: true,
          responseStatus: "needsAction"
        },
        {
          email: "charles.mccutcheon.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "jessie.newcombe.k2@gmail.com",
          displayName: "Jess Newcombe",
          responseStatus: "accepted"
        },
        {
          email: "james.piesse.k2@gmail.com",
          responseStatus: "accepted"
        },
        {
          email: "steph.keer.keer.k2@gmail.com",
          responseStatus: "needsAction"
        },
        {
          email: "melissa.fletcher.k2@gmail.com",
          responseStatus: "accepted"
        }
      ],
      reminders: {
        useDefault: true
      }
    }
  ]
};

function GoogleCalendar(props) {
  const { classes } = props;

  return (
    <Card className={classes.card}>
      <CardHeader
        style={{
          background: "linear-gradient(to right bottom, #338a69, #fff)"
        }}
        title={
          <Typography className={classes.cardHeaderType} color="textSecondary">
            Upcoming Events
          </Typography>
        }
        action={
          <div>
            <IconButton>
              <Add className={classes.dashboardIcon} />
            </IconButton>
            <IconButton>
              <Edit className={classes.dashboardIcon} />
            </IconButton>
            <IconButton>
              <Close className={classes.dashboardIcon} />
            </IconButton>
          </div>
        }
      />
      <CardContent>
        {dummyList.items
          .reverse()
          .slice(0, 5)
          .map(event => {
            return (
              <div key={event.updated} className={classes.fineprint}>
                <b>{event.summary}</b>
                <br />
                {event.location}
                <br />
                <FormattedDate
                  value={event.updated}
                  month="long"
                  day="numeric"
                  weekday="short"
                  hour="numeric"
                  minute="numeric"
                />
                <hr />
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}

export default withStyles(styles)(GoogleCalendar);
