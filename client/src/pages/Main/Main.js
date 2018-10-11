import React, { Component } from "react";
import "./Main.css";
import API from "../../utils/API";
import firebase from "../../utils/firebase";
import Home from "../../components/Home";
import Results from "../../components/Results";
import { isMobile } from "react-device-detect";

/* 

	---------  THINGS TO DO ---------
	- ask about help modal on mobile
	- make votes part of the online obj to fix these two issues
		- preserve votes if the center doesn't move far
		- if two people vote at the same time, both votes should be recorded
	- guarantee group nums are unique
	- dropdown for user's to change what type of results appear (cafes, bars, etc.)

*/

class Main extends Component {
	//  ----- State and General Functions
	state = {
		// - Home page
		username: "",
		password: "",
		retype: "",
		createNewUser: false,
		formMessage: "Please wait",
		isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
		groupNum: window.location.pathname.split("/")[2] || null,
		showResultsPage: false,
		userId: null,
		userGroupId: null,

		// - Results page
		firebaseKey: null,
		onlineArr: [],
		optionsDisplay: null,
		url: null,
		copied: false,
		currentLocation: null,
		potentialLocation: null,
		map: null,
		mapErrMessage: null,
		mapMessage: null,
		mapCenter: null,
		zoom: 14,
		waitingForResponse: false,
		submitMessage: null,
		groupCenter: null,
		locationSubmitted: false,
		neverSubmitted: true,
		showCancel: false,
		nearbyArr: [],
		hoveredPlaceKey: null,
		hoveredPlaceLocation: null,
		placeKey: null,
		placeInfo: [],
		votedFor: null,
		votesAllArr: []
	};

	handleInputChange = event => {
		let { name, value } = event.target;
		this.setState({
			[name]: value,
			formMessage: this.state.currentLocation ? "" : "Please Wait"
		});
	};

	handleOverlay = overlayInput => {
		const overlayBackground = document.getElementById("overlay-background");
		const overlay = document.getElementById("overlay");

		overlayBackground.style.display = (overlayInput.optionsDisplay) ? "inline-block" : "none";
		overlay.style.display = (overlayInput.optionsDisplay) ? "inline-block" : "none";

		overlayInput.mapErrMessage = "";
		overlayInput.mapMessage = "";
		overlayInput.copied = false;

		this.setState(overlayInput, () => {
			if (overlayInput.logout) {
				this.handleLogout();
			}
		});
	};



	//  ----- Home functions
	handleNewUser = event => {
		event.preventDefault();
		const newUserOldValue = this.state.createNewUser;
		const value = (event.target.value === "true");

		const stateObj = {
			createNewUser: value,
			optionsDisplay: true
		};

		if (newUserOldValue !== value) {
			stateObj.username = "";
			stateObj.password = "";
			stateObj.retype = "";
			stateObj.formMessage = this.state.currentLocation ? "" : "Please Wait";
		}

		this.handleOverlay(stateObj);
	};

	handleGroupSubmit = event => {
		event.preventDefault();
		if (this.state.currentLocation) {
			if (!this.state.username || !this.state.password || (this.state.createNewUser && !this.state.retype)) {
				this.setState({ formMessage: "Please fill in all fields" });
			}
			else if (this.state.createNewUser && this.state.password !== this.state.retype) {
				this.setState({
					formMessage: "Passwords do not match",
					password: "",
					retype: ""
				});
			}
			else {
				this.createGroup();
			}
		}
	};

	createGroup = () => {
		let apiCall;
		const apiObj = {
			username: this.state.username,
			password: this.state.password,
			groupNum: this.state.groupNum,
			isJoining: this.state.isJoining
		};

		if (this.state.createNewUser) {
			apiCall = API.signup;
		}
		else {
			apiCall = API.login;
		}

		apiCall(apiObj).then(res => {
			res.data.formMessage = "";
			res.data.showResultsPage = true;
			res.data.url = `${window.location.origin}/join/${res.data.groupNum}`;
			this.handleOverlay(res.data);
		}).catch(err => {
			console.log('err', err);
			let stateObj;

			switch (err.response.status) {
				case 422:
					stateObj = {
						formMessage: "That Screen Name is already taken :(",
						username: ""
					};
					break;
				case 401:
					stateObj = {
						formMessage: "Screen Name or Password incorrect",
						username: "",
						password: ""
					};
					break;
				case 409:
					stateObj = {
						formMessage: "You are already logged into this group"
					}
					break;
				default:
					window.location.href = `${window.location.origin}/fourohfour`;
					break;
			}

			if (stateObj.formMessage) {
				this.setState(stateObj);
			}
		});
	};



	//  ----- Results functions
	updateMapObject = value => {
		this.setState({ map: value }, this.loadFirebase);
	};

	handleClipboard = () => {
		this.setState({ copied: true });
	};

	loadFirebase = () => {
		//  -- Center listener
		firebase.database().ref(`group/${this.state.groupNum}/center`).on('value', centerSnap => {
			if (centerSnap.val()) {
				console.log("firebase Center");
				const googleResults = centerSnap.val().googleResults || [];
				const { avgLatLng } = centerSnap.val();

				const stateObj = {
					waitingForResponse: false,
					nearbyArr: googleResults,
					mapErrMessage: "",
					mapMessage: ""
				};

				if (this.state.neverSubmitted) {
					stateObj.groupCenter = avgLatLng;
				}
				else if (!this.state.groupCenter) {
					stateObj.groupCenter = avgLatLng;
					stateObj.zoom = isMobile ? 15 : 16;
				}
				else if (this.state.groupCenter.lat !== centerSnap.val().avgLatLng.lat || this.state.groupCenter.lng !== centerSnap.val().avgLatLng.lng) {
					console.log("This user has submitted stuff");
					let foundPlace = false;
					let foundVote = false;
					console.log("google found " + googleResults.length + " results");
					googleResults.forEach((i, index) => {
						console.log(" - Looking at " + i.name);
						if (i.id === this.state.votedFor) {
							console.log(" --- This user voted for this place");
							foundVote = true;
						}
						if (this.state.placeKey !== null) {
							console.log(" --- This user was looking at " + this.state.nearbyArr[this.state.placeKey].name);
							console.log(" --- Its id", this.state.nearbyArr[this.state.placeKey].id)
							console.log(' --- i.id: ', i.id);
							if (i.id === this.state.nearbyArr[this.state.placeKey].id) {
								console.log(` --- ${this.state.nearbyArr[this.state.placeKey].name} is still here --- `)
								foundPlace = index;
							}
							if(!foundPlace && !foundVote) {
								console.log(" --- " + this.state.nearbyArr[this.state.placeKey].name + " is gone");
							}
						}
					});
					stateObj.groupCenter = avgLatLng;
					stateObj.votedFor = foundVote ? this.state.votedFor : null;
					stateObj.zoom = 14;
					stateObj.placeInfo = foundPlace !== false ? this.state.placeInfo : [];
					stateObj.placeKey = foundPlace !== false ? foundPlace : null;
					stateObj.mapMessage = "Group Center Changed";

					if (this.state.locationSubmitted) {
						stateObj.zoom = isMobile ? 15 : 16;
					}
				}
				else if (this.state.waitingForResponse) {
					stateObj.zoom = isMobile ? 15 : 16;
					stateObj.mapMessage = "New location submitted, but center didn't change.";
				}

				if (!googleResults.length) {
					stateObj.mapErrMessage = "No places found.  Please submit a new location or wait for others to join";
				}

				this.setState(stateObj, () => { setTimeout(() => this.setState({ mapMessage: "" }), 3000) });
			}
		});

		//  -- Votes listener
		firebase.database().ref(`group/${this.state.groupNum}/votes`).on('value', snapshot => {
			this.setState({
				votesAllArr: snapshot.val() || []
			});
		});

		//  -- Online listener
		firebase.database().ref(`group/${this.state.groupNum}/online`).on('value', snapshot => {
			if (snapshot.val()) {
				const stateObj = {
					onlineArr: []
				};
				for (const item in snapshot.val()) {
					if (!this.state.firebaseKey && snapshot.val()[item] === this.state.username) {
						stateObj.firebaseKey = item;
					}
					stateObj.onlineArr.push(snapshot.val()[item]);
				}
				this.setState(stateObj);
			}
		});
	};

	showInfoWindow = (event, hoveredPlaceKey) => {
		this.setState({
			hoveredPlaceKey,
			hoveredPlaceLocation: event.latLng
		});
	}

	hideInfoWindow = () => {
		this.setState({
			hoveredPlaceKey: null,
			hoveredPlaceLocation: null
		});
	}

	showPlaceInfo = placeKey => {
		const thisPlace = this.state.nearbyArr[placeKey];

		const personLoc = (typeof this.state.currentLocation.lat === "number")
			? this.state.currentLocation
			: {
				lat: this.state.currentLocation.lat(),
				lng: this.state.currentLocation.lng()
			};

		const placeInfo = [
			`Name: ${thisPlace.name}`,
			`Open Now: ${thisPlace.opening_hours ? (thisPlace.opening_hours.open_now ? "Yes!" : "No...") : "Unknown"}`,
			`Rating: ${thisPlace.rating || "Unknown"}`,
			`https://www.google.com/maps/dir/?api=1&origin=${personLoc.lat},${personLoc.lng}&destination=${thisPlace.vicinity}`
		];

		this.setState({ placeKey, placeInfo });
	}

	handleVote = () => {

		if (this.state.votedFor !== this.state.nearbyArr[this.state.placeKey].id) {
			API.vote({
				groupNum: this.state.groupNum,
				prevVote: this.state.votedFor,
				thisVote: this.state.nearbyArr[this.state.placeKey].id
			}).then(() => {
				this.setState({
					submitMessage: "Vote Submitted",
					votedFor: this.state.nearbyArr[this.state.placeKey].id
				}, () => { setTimeout(() => this.setState({ submitMessage: "" }), 3000) });
			}).catch(err => console.log("err:", err));
		}
	}

	handleCenterChanged = latLng => {
		const stateObj = { mapCenter: latLng };
		if (!this.state.locationSubmitted) {
			stateObj.potentialLocation = latLng;
		}
		this.setState(stateObj);
	}

	handleLocationSubmit = () => {
		if (!this.state.waitingForResponse) {
			if (this.state.locationSubmitted) {
				this.prepNewLocation();
			}
			else {
				this.submitLocation();
			}
		}
	}

	prepNewLocation = () => {
		const stateObj = {
			locationSubmitted: false,
			showCancel: true,
			submitMessage: "Submit a new location",
			placeKey: null,
			zoom: 14
		};
		this.setState(stateObj);
	}

	submitLocation = () => {
		const stateObj = {
			locationSubmitted: true,
			showCancel: false,
			waitingForResponse: true,
			neverSubmitted: false,
			currentLocation: this.state.potentialLocation,
			nearbyArr: []
		};

		this.setState(stateObj, () => {
			const apiObj = {
				currentLocation: this.state.currentLocation,
				userGroupId: this.state.userGroupId,
				groupNum: this.state.groupNum
			};

			API.updateLocation(apiObj).then(res => {
				const stateObj = {
					submitMessage: ""
				};

				if (res.data.success) {
					stateObj.submitMessage = "Location submitted successfully";
				}
				else {
					stateObj.submitMessage = "Something went wrong";
				}

				this.setState(stateObj, () => {
					setTimeout(() => this.setState({ submitMessage: "" }), 2500);
					setTimeout(() => {
						if (this.state.waitingForResponse) {
							this.setState({ mapErrMessage: "Google's slow sometimes, just give it a sec :)" });
						}
					}, 1750);
				});
			}).catch(err => console.log("err: ", err));
		});
	}

	handleCancelLocation = event => {
		event.preventDefault();
		this.setState({
			locationSubmitted: true,
			showCancel: false,
			potentialLocation: this.state.currentLocation,
			submitMessage: "",
			zoom: isMobile ? 15 : 16
		});
	}

	handleLogout = () => {
		if (this.state.showResultsPage) {
			API.logout(this.state.groupNum, this.state.firebaseKey, this.state.userId, this.state.votedFor).then(() => {
				this.setState({
					username: "",
					password: "",
					retype: "",
					createNewUser: false,
					formMessage: "Please wait",
					isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
					groupNum: window.location.pathname.split("/")[2] || null,
					showResultsPage: false,
					userId: null,
					userGroupId: null,
					firebaseKey: null,
					onlineArr: [],
					optionsDisplay: null,
					url: null,
					copied: false,
					currentLocation: null,
					potentialLocation: null,
					map: null,
					mapErrMessage: null,
					mapMessage: null,
					submitMessage: null,
					mapCenter: null,
					zoom: 14,
					waitingForResponse: false,
					groupCenter: null,
					locationSubmitted: false,
					neverSubmitted: true,
					showCancel: false,
					nearbyArr: [],
					hoveredPlaceKey: null,
					hoveredPlaceLocation: null,
					placeKey: null,
					placeInfo: [],
					votedFor: null,
					votesAllArr: []
				});
			}).catch(err => console.log("err: ", err));
		}
	}

	componentDidMount() {
		if (this.state.isJoining) {
			firebase.database().ref(`group/${this.state.groupNum}`).once("value").then(snapshot => {
				if (!snapshot.val()) {
					window.location.href = window.location.origin + "/fourohfour";
				}
			});
		}
		window.addEventListener("beforeunload", this.handleLogout);
	}

	componentWillUnmount() {
		window.removeEventListener("beforeunload", this.handleLogout)
	}



	//  Current Location stuff
	success = pos => {
		console.log("location found");
		const locObj = { lat: pos.coords.latitude, lng: pos.coords.longitude };

		// -----  Was using this when navigator api was putting me in TN -----
		// if (pos.coords.latitude < 28 || pos.coords.latitude > 32) {
		// 	locObj.lat = 30.2672;
		// }
		// if (pos.coords.longitude < -99 || pos.coords.longitude > -95) {
		// 	locObj.lng = -97.7431;
		// }

		this.setState({
			currentLocation: locObj,
			potentialLocation: locObj,
			mapCenter: locObj,
			formMessage: null
		});
	};

	error = err => console.warn(`ERROR(${err.code}): ${err.message}`);

	getUserLocation = () => {
		const options = {
			enableHighAccuracy: true,
			timeout: 20000,
			maximumAge: 60000
		};

		navigator.geolocation.getCurrentPosition(this.success, this.error, options);
	};



	render() {
		const homeProps = {
			state: this.state,
			getUserLocation: this.getUserLocation,
			handleGroupSubmit: this.handleGroupSubmit,
			handleInputChange: this.handleInputChange,
			handleNewUser: this.handleNewUser,
			handleOverlay: this.handleOverlay
		};
		const resultsProps = {
			state: this.state,
			handleClipboard: this.handleClipboard,
			showInfoWindow: this.showInfoWindow,
			hideInfoWindow: this.hideInfoWindow,
			showPlaceInfo: this.showPlaceInfo,
			updateMapObject: this.updateMapObject,
			handleCenterChanged: this.handleCenterChanged,
			handleLocationSubmit: this.handleLocationSubmit,
			handleCancelLocation: this.handleCancelLocation,
			handleVote: this.handleVote,
			handleOverlay: this.handleOverlay,
			handleLogout: this.handleLogout
		};

		return (
			<div className="main-container">
				{this.state.showResultsPage ? <Results {...resultsProps} /> : <Home {...homeProps} />}

				<div id="overlay-background" onClick={() => this.handleOverlay({ optionsDisplay: false })}></div>
			</div>
		);
	};
}

export default Main;
