/*global google*/
import React, { Component } from "react";
import "./Main.css";
import API from "../../utils/API";
import firebase from "../../utils/firebase";
import Home from "../../components/Home";
import Results from "../../components/Results";

class Main extends Component {


//  ----- State and General Functions
	
	state = {
		username: "",
		password: "",
		retype: "",
		createNewUser: false,
		message: "",
		groupNum: window.location.pathname.split("/")[2] || null,
		isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
		showResultsPage: false,
		userGroupId: null,
		isCreator: null,
		url: null,
		copied: false,
		currentLocation: null,
		mapCenter: null,
		zoom: 14,
		waitingForResponse: false,
		groupCenter: null,
		locationSubmitted: false,
		nearbyArr: [],
		placeKey: null
	};

	handleInputChange = event => {
		let { name, value } = event.target;
		this.setState({
			[name]: value,
			message: ""
		}, () => console.log(name + ": " + value));
	};

	handleOverlay = () => {
		const overlayBackground = document.getElementById("overlay-background");
		overlayBackground.style.display = (overlayBackground.style.display === "inline-block") ? "none" : "inline-block";
		const overlay = document.getElementById("overlay");
		overlay.style.display = (overlay.style.display === "inline-block") ? "none" : "inline-block";
	};



//  ----- Home-specific fucntions

	handleNewUser = event => {
		event.preventDefault();
		const newUserOldValue = this.state.createNewUser;
		let value = (event.target.value === "true");
		console.log('new createNewUser value', value);

		this.setState({ createNewUser: value }, () => {
			console.log("createNewUser: " + value);
			
			if(newUserOldValue !== this.state.createNewUser) {
				this.setState({
					username: "",
					password: "",
					retype: ""
				}, this.handleOverlay);
			}
			else {
				this.handleOverlay();
			}
		});
	};

	handleGroupSubmit = event => {
		event.preventDefault();

		let stateObj = {};
		let callback = this.createGroup;

		if(!this.state.username || !this.state.password || (this.state.createNewUser && !this.state.retype)) {
			stateObj = { message: "Please fill in all fields"};
			callback = () => console.log("Some fields left blank");
		}
		else if (this.state.createNewUser && this.state.password !== this.state.retype) {
			stateObj = {
				message: "Passwords do not match",
				password: "",
				retype: ""
			};
			callback = () => console.log("Passwords didn't match");
		}
		else {
			stateObj = { message: "" };
		}
		
		this.setState(stateObj, callback);
	};

	createGroup = () => {
		let apiCall;
		const apiObj = {
			username: this.state.username,
			password: this.state.password,
			groupNum: this.state.groupNum,
			isJoining: this.state.isJoining
		};

		if(this.state.createNewUser) {
			apiCall = API.signup;
		}
		else {
			apiCall = API.login;
		}

		apiCall(apiObj).then(res => {
			res.data.showResultsPage = true;
			res.data.url = window.location.origin + "/join/" + res.data.groupNum;
			this.setState(res.data, () => {
				console.log("Updated state with following data:");
				console.log(res.data);
				this.handleOverlay()
			})
		}).catch(err => {
			console.log(err.response);
			if (err.response.status === 422) {
				this.setState({
					message: "That Screen Name is already taken :(",
					username: ""
				}, () => console.log(err.response.data));
			}
			else if (err.response.status === 401) {
				this.setState({
					message: "Screen Name or Password incorrect",
					username: "",
					password: ""
				}, () => console.log(err.response.data));
			}
		});
	};


//  ----- Results-specific functions
	updateMapObject = value => {
		this.setState({ map: value }, () => {
			this.loadFirebase();
		});
	};

	handleClipboard = () => {
		this.setState({ copied: true });
	};

	loadFirebase = () => {
		const groupRef = firebase.database().ref('group/' + this.state.groupNum);
		groupRef.on('value', snapshot => {
			if(snapshot.val()) {
				const newObj = {
					lat: snapshot.val().latAvg,
					lng: snapshot.val().lngAvg
				};
				this.setState({
					waitingForResponse: false,
					groupCenter: newObj
				}, () => {
					console.log("groupCenter updated");
					
					const request = {
						location: this.state.groupCenter,
						radius: 500,
						type: ['cafe']
					};
					const service = new google.maps.places.PlacesService(this.state.map.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
					service.nearbySearch(request, (results, status) => {
						if (status === google.maps.places.PlacesServiceStatus.OK) {
							console.log("Places results below");
							for (var i = 0; i < results.length; i++) {
								console.log(results[i].name + "'s location: " + results[i].geometry.location);
							}
							if (results[0]) {
								console.log(results[0]);
							}
							
							this.setState({nearbyArr: results}, () => console.log("Places Results updated"));
						}
						else {
							console.log("FIREBASE - PlacesService Issue");
						}
					});
				});
			}
		});
	};

	showPlaceInfo = key => {
		this.setState({ key: key }, () => console.log("key:", key))
	}

	handleCenterChanged = latLng => {
		let stateObj = { mapCenter: latLng };
		if (!this.state.locationSubmitted){
			stateObj.currentLocation = latLng;
		}
		this.setState(stateObj);
	}

	handleLocationSubmit = () => {
		if(!this.state.waitingForResponse) {
			let stateObj = {
				locationSubmitted: !(this.state.locationSubmitted),
				zoom: 14
			}

			if(stateObj.locationSubmitted === true) {
				stateObj.waitingForResponse = true;
				stateObj.zoom = 16;
			}

			this.setState(stateObj, () => {
				console.log("locationSubmitted: " + stateObj.locationSubmitted);

				if(stateObj.locationSubmitted === true){
					const apiObj = {
						currentLocation: this.state.currentLocation,
						userGroupId: this.state.userGroupId,
						groupNum: this.state.groupNum
					};

					API.updateLocation(apiObj).then(() => {
							this.setState({ message: "Location submitted successfully" }, () => setTimeout(() => this.setState({ message: "" }), 2500));
					}).catch(err => console.log(err));
				}
			});
		}
	};

	handleLogout = event => {
		event.preventDefault();
		API.logout().then((res) => {
			console.log("Logout response:", res);
			this.setState({
				username: "",
				password: "",
				retype: "",
				createNewUser: false,
				message: "",
				groupNum: window.location.pathname.split("/")[2] || null,
				isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
				showResultsPage: false,
				userGroupId: null,
				isCreator: null,
				url: null,
				copied: false,
				currentLocation: null,
				mapCenter: null,
				waitingForResponse: false,
				groupCenter: null,
				locationSubmitted: false,
				nearbyArr: []
			}, () => { console.log("Logout successful"); });
        }).catch(err => console.log(err));
	}; 

	

	//  Current Location stuff
	
	success = pos => {
		this.setState({
			currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude },
			mapCenter: { lat: pos.coords.latitude, lng: pos.coords.longitude }
		}, () => console.log("location found"));
	};
	  
	error = err => console.warn(`ERROR(${err.code}): ${err.message}`);

	getUserLocation = () => {
		const options = {
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		};

		navigator.geolocation.getCurrentPosition(this.success, this.error, options);
	};




	render() {
		return (
			<div className="main-container">
				{ !this.state.showResultsPage ? <Home state={this.state} handleOverlay={this.handleOverlay} getUserLocation={this.getUserLocation} handleGroupSubmit={this.handleGroupSubmit} handleInputChange={this.handleInputChange} handleNewUser={this.handleNewUser} />
				: <Results state={this.state} handleInputChange={this.handleInputChange} handleClipboard={this.handleClipboard} showPlaceInfo={this.showPlaceInfo} updateMapObject={this.updateMapObject} handleCenterChanged={this.handleCenterChanged} loadFirebase={this.loadFirebase} handleLocationSubmit={this.handleLocationSubmit} handleOverlay={this.handleOverlay} handleLogout={this.handleLogout} /> }
			</div>
		);
	};
}

export default Main;
