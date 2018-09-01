/*global google*/

import React, { Component } from "react";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps"

class Map extends Component {

    componentDidMount = () => this.props.loadFirebase();

    mapLoaded = map => {
        if (!this.props.state.map) {
            this.props.updateMapObject(map);
        }
    };

    getCenter = () => {
        this.props.handleCenterChanged(this.props.state.map.getCenter());
    };

    render() {
        const mapOptions = {
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false
        };

        return (
            <GoogleMap
                ref={this.mapLoaded.bind(this)}
                defaultZoom={13}
                defaultCenter={this.props.state.currentLocation}
                onCenterChanged={this.getCenter.bind(this)}
                defaultOptions={mapOptions}
            >
                <Marker position={this.props.state.currentLocation} />
                {this.props.state.groupCenter &&
                    <Marker position={this.props.state.groupCenter}
                        icon={{ url: window.location.origin + "/images/blue_pin.png", scaledSize: new google.maps.Size(28, 46) }}
                    />}
                {console.log(this.props.state.nearbyArr)}
                
                    
            </GoogleMap>
        );
    }
};

export default withGoogleMap(Map);