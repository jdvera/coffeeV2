/*global google*/

import React, { Component } from "react";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps"

class Map extends Component {

    mapLoaded = map => {
        if (!this.props.state.map) {
            this.props.updateMapObject(map);
        }
    };

    getCenter = () => {
        this.props.handleCenterChanged(this.props.state.map.getCenter());
    };

    returnValue = key => {
        this.props.showPlaceInfo(key);
    }

    render() {
        const mapOptions = {
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false
        };

        const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let labelIndex = 0;

        return (
            <GoogleMap
                ref={this.mapLoaded.bind(this)}
                defaultZoom={14}
                zoom={this.props.state.zoom}
                defaultCenter={this.props.state.currentLocation}
                center={this.props.state.locationSubmitted ? this.props.state.groupCenter : this.props.state.currentLocation}
                onCenterChanged={this.getCenter.bind(this)}
                defaultOptions={mapOptions}
            >
                {(this.props.state.groupCenter && !this.props.state.waitingForResponse) &&
                    <Marker position={this.props.state.groupCenter}
                        icon={{ url: window.location.origin + "/images/blue_pin.png", scaledSize: new google.maps.Size(28, 46) }}
                    />}
                {(this.props.state.nearbyArr.length > 0) 
                    ? this.props.state.nearbyArr.map((place, index) => {
                        const thisLable = labels[labelIndex];
                        labelIndex = (labelIndex >= labels.length - 1) ? 0 : labelIndex + 1;
                        return <Marker key={index} position={place.geometry.location} label={thisLable} onClick={() => this.returnValue(index)} />
                    })
                    : <Marker position={this.props.state.currentLocation} />
                }
            </GoogleMap>
        );
    }
};

export default withGoogleMap(Map);