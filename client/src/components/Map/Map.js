import React, { Component } from "react";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps"

class Map extends Component {

  constructor() {
    super()
    this.state = {
      map: null
    }
  }

  mapLoaded = map => {
    if(!this.state.map) this.setState({ map: map }, console.log("updated map state"));
  };

  getCenter = () => {
    if (!this.props.state.locationSubmitted) this.props.handleCenterChanged(this.state.map.getCenter());
  };

  render() {
    return (
      <GoogleMap
        ref={this.mapLoaded.bind(this)}
        defaultZoom={10}
        defaultCenter={this.props.state.currentLocation}
        onCenterChanged={this.getCenter.bind(this)}
      >
        <Marker position={this.props.state.currentLocation} />
      </GoogleMap>
    );
  }
};

export default withGoogleMap(Map);