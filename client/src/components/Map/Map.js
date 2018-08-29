/*global google*/

import React, { Component } from "react";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps"

class Map extends Component {

    constructor() {
        super()
        this.state = {
            map: null
        }
    }

    componentDidMount = () => this.props.loadFirebase();

    mapLoaded = map => {
        if (!this.state.map) {
            this.setState({ map: map }, console.log("updated map state"));
        }
    };

    findPlaces = () => {
        const request = {
            location: this.props.state.currentLocation,
            type: ['cafe']
        };
        const service = new google.maps.places.PlacesService(this.state.map);
        this.state.service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log(results);
                // updatePlaces(results);
            }
        });
    };

    getCenter = () => {
        this.props.handleCenterChanged(this.state.map.getCenter());
    };

    render() {
        return (
            <GoogleMap
                ref={this.mapLoaded.bind(this)}
                defaultZoom={13}
                defaultCenter={this.props.state.currentLocation}
                onCenterChanged={this.getCenter.bind(this)}
            >
                <Marker position={this.props.state.currentLocation} />
                {this.props.state.groupCenter &&
                    <Marker position={this.props.state.groupCenter}
                        icon={{ url: window.location.origin + "/images/blue_pin.png", scaledSize: new google.maps.Size(28, 46) }}
                    />}
            </GoogleMap>
        );
    }
};

export default withGoogleMap(Map);