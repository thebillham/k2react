import React from "react";
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";

import {
  getJobIcon,
} from "../../../actions/jobs";

const mapStyles = {
  marginTop: 20,
  flexGrow: 1,
  overflow: "auto",
  // width: '90%',
  height: "100%"
};

class JobsMapContainer extends React.Component {
  getOffset = n => {
    var o = 20;
    var s = Math.floor((n - 1) / 8) + 1;
    var mod = (n % 9) + (s - 1);
    if (n === 0) mod = 0;
    // if (n>0) //console.log('n: ' + n + ', s: ' + s + ', mod: ' + mod);
    switch (mod) {
      case 0:
        return [0, 0];
      case 1:
        return [s * o, 0];
      case 2:
        return [0, -s * o];
      case 3:
        return [-s * o, 0];
      case 4:
        return [0, s * o];
      case 5:
        return [s * o, s * o];
      case 6:
        return [s * o, -s * o];
      case 7:
        return [-s * o, -s * o];
      case 8:
        return [-s * o, s * o];

      default:
        return [0, 0];
    }
  };

  render() {
    const { jobList, that, google } = this.props;

    console.log('Job Map Container');
    var addresses = {};
    return (
      <Map
        google={google}
        zoom={6.27}
        style={mapStyles}
        initialCenter={{
          lat: -40.9261681,
          lng: 174.4070603
        }}
      >
        {jobList && Object.values(jobList).map(m => {
          if (that.filterLabels(m)) {
            if (addresses[m.geocode.address] >= 0) {
              addresses[m.geocode.address] =
                addresses[m.geocode.address] + 1;
              // //console.log(m.jobNumber + ': ' + m.geocode.address + ' (' + addresses[m.geocode.address] + ')');
            } else {
              addresses[m.geocode.address] = 0;
            }
            var url = getJobIcon(m.category);
            return (
              <Marker
                // animation={this.props.google.maps.Animation.DROP}
                key={m.wfmID}
                onClick={(props, marker, e) => {
                  that.onMarkerClick(marker, m);
                }}
                position={{
                  lat: m.geocode.location[0],
                  lng: m.geocode.location[1]
                }}
                title={`${m.jobNumber}: ${m.client}`}
                icon={{
                  url: url,
                  anchor: new google.maps.Point(
                    16 + this.getOffset(addresses[m.geocode.address])[0],
                    16 + this.getOffset(addresses[m.geocode.address])[1]
                  ),
                  scaledSize: new google.maps.Size(32, 32)
                }}
              />
            );
          } else {
            return false;
          }
        })}
        {that.state.m && <InfoWindow
          marker={that.state.activeMarker}
          visible={that.state.showingInfoWindow}
        >
          {that.state.m && that.props.that.getJobDetails(that.state.m, true)}
        </InfoWindow>}
      </Map>
    );
  }
}

export default GoogleApiWrapper({ apiKey: (process.env.REACT_APP_GOOGLE_MAPS_KEY) })(JobsMapContainer);
