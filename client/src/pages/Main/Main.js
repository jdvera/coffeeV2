/*global google*/
import React, { Component } from "react";
import "./Main.css";
import API from "../../utils/API";
import firebase from "../../utils/firebase";
import Home from "../../components/Home";
import Results from "../../components/Results";

/* 
	---------  THINGS TO DO ---------
	- make "group center changed" message appear consistantly
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
		message: "",
		isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
		groupNum: window.location.pathname.split("/")[2] || null,
		showResultsPage: false,
		userId: null,
		userGroupId: null,
		isCreator: null,

		// - Results page
		firebaseKey: null,
		onlineArr: [],
		optionsDisplay: null,
		url: null,
		copied: false,
		currentLocation: null,
		potentialLocation: null,
		map: null,
		mapMessage: null,
		mapCenter: null,
		zoom: 14,
		waitingForResponse: false,
		groupCenter: null,
		locationSubmitted: false,
		neverSubmitted: true,
		showCancel: false,
		nearbyArr: [],
		placeKey: null,
		placeInfo: [],
		votedFor: null,
		votesAll: {},
		votesAllArr: []
	};

	handleInputChange = event => {
		let { name, value } = event.target;
		this.setState({
			[name]: value,
			message: ""
		});
	};

	handleOverlay = overlayInput => {
		const overlayBackground = document.getElementById("overlay-background");
		const overlay = document.getElementById("overlay");

		overlayBackground.style.display = (overlayInput.optionsDisplay) ? "inline-block" : "none";
		overlay.style.display = (overlayInput.optionsDisplay) ? "inline-block" : "none";

		this.setState(overlayInput);
	};



//  ----- Home-specific fucntions
	handleNewUser = event => {
		event.preventDefault();
		const newUserOldValue = this.state.createNewUser;
		const value = (event.target.value === "true");

		const stateObj = {
			createNewUser: value,
			optionsDisplay: true
		};

		if(newUserOldValue !== value) {
			stateObj.username = "";
			stateObj.password = "";
			stateObj.retype = "";
			stateObj.message = "";
		}

		this.handleOverlay(stateObj);
	};

	handleGroupSubmit = event => {
		event.preventDefault();

		if(!this.state.username || !this.state.password || (this.state.createNewUser && !this.state.retype)) {
			this.setState({ message: "Please fill in all fields"});
		}
		else if (this.state.createNewUser && this.state.password !== this.state.retype) {
			this.setState({
				message: "Passwords do not match",
				password: "",
				retype: ""
			});
		}
		else {
			this.createGroup();
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

		if(this.state.createNewUser) {
			apiCall = API.signup;
		}
		else {
			apiCall = API.login;
		}

		apiCall(apiObj).then(res => {
			console.log('res.data', res.data);
			res.data.message = "";
			res.data.showResultsPage = true;
			res.data.url = window.location.origin + "/join/" + res.data.groupNum;
			res.data.optionsDisplay = "url";
			this.handleOverlay(res.data);
		}).catch(err => {
			console.log('err', err);
			let stateObj;

			switch(err.response.status) {
				case 422:
					stateObj = {
						message: "That Screen Name is already taken :(",
						username: ""
					};
					break;
				case 401:
					stateObj = {
						message: "Screen Name or Password incorrect",
						username: "",
						password: ""
					};
					break;
				case 409:
					stateObj = {
						message: "You are already logged into this group"
					}
					break;
				default:
					window.location.href = window.location.origin + "/fourohfour";
					break;
			}

			if(stateObj.message) {
				this.setState(stateObj);
			}
		});
	};



//  ----- Results-specific functions
	updateMapObject = value => {
		this.setState({ map: value }, this.loadFirebase);
	};

	handleClipboard = () => {
		this.setState({ copied: true });
	};

	loadFirebase = () => {
		//  -- Center listener
		firebase.database().ref('group/' + this.state.groupNum + '/center').on('value', snapshot => {
			if(snapshot.val()) {
				const latLng = {
					lat: snapshot.val().latAvg,
					lng: snapshot.val().lngAvg
				};
				const stateObj = {
					waitingForResponse: false,
					groupCenter: latLng,
					votedFor: null,
					votesAll: {},
					zoom: 14,
					votesAllArr: [],
					placeInfo: [],
					nearbyArr: [],
					placeKey: null,
					mapMessage: "Group Center Changed"
				};
				const request = {
					location: latLng,
					radius: 500,
					type: ['cafe']
				};

				if(this.state.locationSubmitted === true) {
					stateObj.zoom = 16;
					
					const service = new google.maps.places.PlacesService(this.state.map.context.__SECRET_MAP_DO_NOT_USE_OR_YOU_WILL_BE_FIRED);
					service.nearbySearch(request, (results, status) => {
						if (status === google.maps.places.PlacesServiceStatus.OK) {
							const labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
							let labelIndex = 0;

							const letteredResults = results.map(place => {
								place.letter = labels[labelIndex];
								labelIndex = (labelIndex >= labels.length - 1) ? 0 : labelIndex + 1;
								return place;
							});

							stateObj.nearbyArr = letteredResults;
							stateObj.mapMessage = "";
						}
						else {
							stateObj.nearbyArr = [];
							stateObj.mapMessage = "No places found.  Please submit a new location or wait for others to join";
						}

						this.setState(stateObj, () => {setTimeout(() => this.setState({ mapMessage: "" }), 2500)});
					});
				}
				else {
					this.setState(stateObj, () => {setTimeout(() => this.setState({ mapMessage: "" }), 2500)});
				}
			}
		});

		//  -- Votes listener
		firebase.database().ref('group/' + this.state.groupNum + '/votes').on('value', snapshot => {
			if(snapshot.val()) {
				const votesAllArr = [];
				for (const place in snapshot.val()) {
					const newObj = {
						placeId: place,
						val: snapshot.val()[place]
					};
					votesAllArr.push(newObj);
				}

				this.setState({
					votesAll: snapshot.val(),
					votesAllArr: votesAllArr
				});
			}
		});

		//  -- Online listener
		firebase.database().ref('group/' + this.state.groupNum + '/online').on('value', snapshot => {
			if(snapshot.val()) {
				const stateObj = {};
				const onlineArr = [];
				for(const item in snapshot.val()){
					if (this.state.firebaseKey === null && snapshot.val()[item] === this.state.username) {
						stateObj.firebaseKey = item;
					}
					onlineArr.push(snapshot.val()[item]);
				}
				stateObj.onlineArr = onlineArr;
				this.setState(stateObj, () => console.log(stateObj));
			}
		});
	};

	showPlaceInfo = placeKey => {
		const thisPlace = this.state.nearbyArr[placeKey];

		const personLoc = (typeof this.state.currentLocation.lat === "number")
			? this.state.currentLocation
			: {
				lat: this.state.currentLocation.lat(),
				lng: this.state.currentLocation.lng()
			}

		let stateArr = [null, null, null, null];
		stateArr[0] = "Name: " + thisPlace.name;
		stateArr[1] = "Open Now: " + (thisPlace.opening_hours ? (thisPlace.opening_hours.open_now ? "Yes!" : "No...") : "Unknown");
		stateArr[2] = "Rating: " + (thisPlace.rating || "Unknown");
		stateArr[3] = `https://www.google.com/maps/dir/?api=1&origin=${personLoc.lat},${personLoc.lng}&destination=${thisPlace.vicinity}`;

		this.setState({ placeKey: placeKey, placeInfo: stateArr });
	}

	handleVote = event => {
		event.preventDefault();
		const prevVote = this.state.votedFor;
		const thisVote = this.state.nearbyArr[this.state.placeKey].id;
		if (prevVote !== thisVote) {
			const votesAll = this.state.votesAll;
			if (prevVote !== null) {
				votesAll[prevVote]--;
			}
			votesAll[thisVote] = votesAll[thisVote] ? votesAll[thisVote] + 1 : 1;
			
			const stateObj = {
				votedFor: thisVote,
				votesAll: votesAll
			};

			this.setState(stateObj, () => {
				firebase.database().ref('group/' + this.state.groupNum + '/votes').set(votesAll);
			})

		}
	}

	handleCenterChanged = latLng => {
		let stateObj = { mapCenter: latLng };
		if (!this.state.locationSubmitted){
			stateObj.potentialLocation = latLng;
		}
		this.setState(stateObj);
	}

	handleLocationSubmit = () => {
		if(!this.state.waitingForResponse) {
			if(this.state.locationSubmitted) {
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
			message: "Submit a new location",
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
			currentLocation: this.state.potentialLocation
		};

		this.setState(stateObj, () => {
			const apiObj = {
				currentLocation: this.state.currentLocation,
				userGroupId: this.state.userGroupId,
				groupNum: this.state.groupNum
			};

			API.updateLocation(apiObj).then(res => {
				console.log(res.data);
				let message;

				if(res.data.success) {
					message = {
						message: "Location submitted successfully"
					};
				}
				else {
					message = { message: "Something went wrong" };
				}
				
				this.setState(message, () => {
					setTimeout(() => this.setState({ message: "" }), 2500);
					setTimeout(() => {
						if(this.state.waitingForResponse) {
							this.setState({ mapMessage: "Google's slow sometimes, just give it a sec :)" }, () => setTimeout(() => this.setState({ mapMessage: "" }), 5000));
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
			message: "",
			zoom: 16
		});
	}

	handleLogout = event => {
		event.preventDefault();
		if(this.state.showResultsPage){
			const allVotes = this.state.votesAll;
			for(const p in allVotes) {
				if (allVotes[p] === this.state.votedFor) {
					allVotes[p]--;
				}
			}
			firebase.database().ref('group/' + this.state.groupNum + '/votes').set(allVotes);
	
			API.logout(this.state.groupNum, this.state.firebaseKey, this.state.userId).then(res => {
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
					firebaseKey: null,
					onlineArr: [],
					optionsDisplay: null,
					url: null,
					copied: false,
					currentLocation: null,
					potentialLocation: null,
					map: null,
					mapMessage: null,
					mapCenter: null,
					zoom: 14,
					waitingForResponse: false,
					groupCenter: null,
					locationSubmitted: false,
					neverSubmitted: true,
					showCancel: false,
					nearbyArr: [],
					placeKey: null,
					placeInfo: [],
					votedFor: null,
					votesAll: {},
					votesAllArr: []
				});
			}).catch(err => console.log("err: ", err));
		}
	};

	componentDidMount() {
		if (this.state.isJoining) {
			API.checkGroup(this.state.groupNum).then(res => {
				if(!res.data) {
					window.location.href = window.location.origin + "/fourohfour";
				}
			}).catch(err => console.log("err: ", err));
		}
		window.addEventListener("beforeunload", this.handleLogout);
	}

	componentWillUnmount() {
		window.removeEventListener("beforeunload", this.handleLogout)
	}

	

	//  Current Location stuff
	success = pos => {
		const locObj = { lat: pos.coords.latitude, lng: pos.coords.longitude };
		if(pos.coords.latitude < 28 || pos.coords.latitude > 32) {
			locObj.lat = 30.2672;
		}
		if(pos.coords.longitude < -99 || pos.coords.longitude > -95) {
			locObj.lng = -97.7431;
		}
		
		this.setState({
			currentLocation: locObj,
			potentialLocation: locObj,
			mapCenter: locObj
		});
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
			handleInputChange: this.handleInputChange,
			handleClipboard: this.handleClipboard,
			showPlaceInfo: this.showPlaceInfo,
			updateMapObject: this.updateMapObject,
			handleCenterChanged: this.handleCenterChanged,
			loadFirebase: this.loadFirebase,
			handleLocationSubmit: this.handleLocationSubmit,
			handleCancelLocation: this.handleCancelLocation,
			handleVote: this.handleVote,
			handleOverlay: this.handleOverlay,
			handleLogout: this.handleLogout
		};
		
		return (
			<div className="main-container">
				{ this.state.showResultsPage ? <Results {...resultsProps} /> : <Home {...homeProps} /> }
			</div>
		);
	};
}

export default Main;