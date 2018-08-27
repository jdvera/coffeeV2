import React, { Component } from "react";
import "./Main.css";
import API from "../../utils/API";
import Home from "../../components/Home";
import Results from "../../components/Results";

class Main extends Component {


//  ----- State and General Functions
	
	state = {
		username: "",
		password: "",
		retype: "",
		newUser: false,
		message: "",
		groupNum: window.location.pathname.split("/")[2] || null,
		isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
		showResults: false,
		userGroupId: null,
		isCreator: null,
		url: null,
		copied: false,
		currentLocation: null,
		locationSubmitted: false,
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
		const newUserOldValue = this.state.newUser;
		let value = (event.target.value === "true");

		this.setState({ newUser: value }, () => {
			console.log("newUser: " + value);
			
			if(newUserOldValue !== this.state.newUser) {
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

		if(this.state.newUser){
			if(!this.state.username || !this.state.password || !this.state.retype) {
				stateObj = { message: "Please fill in all fields"};
				callback = () => console.log("Some fields left blank");
			}
			else if (this.state.password !== this.state.retype) {
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
		}
		else {
			if(!this.state.username || !this.state.password) {
				stateObj = { message: "Please fill in both fields"};
				callback = () => console.log("Some fields left blank");
			}
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

		console.log("What I'm sending to server");
		console.log(apiObj);

		if(this.state.newUser) {
			apiCall = API.signup;
		}
		else {
			apiCall = API.login;
		}

		apiCall(apiObj).then(res => {
			res.data.showResults = true;
			res.data.url = window.location.origin + "/join/" + res.data.groupNum;
			this.setState(res.data, () => {
				console.log("Updated state with following data:");
				console.log(res.data);
				this.handleOverlay()
			})
			// window.location.replace(res.data);
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

	handleClipboard = () => {
		this.setState({ copied: true });
	};

	handleCenterChanged = latLng => {
		this.setState({ currentLocation: latLng }, () => console.log('currentLocation: ' + latLng));
	}

	handleLocationSubmit = () => {
		let value = !(this.state.locationSubmitted);
		this.setState({ locationSubmitted: value }, () => {
			console.log("locationSubmitted: " + value);

			if(value === true){
				console.log(" --- This is where I send stuff to DB --- ");
			}
		});
	};

	handleLogout = event =>{
		event.preventDefault();
		API.logout().then((res) => {
			console.log("Logout response:", res);
			this.setState({
				username: "",
				password: "",
				retype: "",
				newUser: false,
				message: "",
				groupNum: window.location.pathname.split("/")[2] || null,
				isJoining: window.location.pathname.split("/")[1] === "join" ? true : false,
				showResults: false,
				userGroupId: null,
				isCreator: null,
				url: null,
				copied: false
			}, () => { console.log("Logout successful"); });
        }).catch(err => console.log(err));
	}; 

	

	//  Current Location stuff
	
	success = (pos) => {
		console.log({ lat: pos.coords.latitude, lng: pos.coords.longitude });

		this.setState({
			currentLocation: { lat: pos.coords.latitude, lng: pos.coords.longitude }
		}, () => console.log("location found"));
	};
	  
	error = (err) => {
		console.warn(`ERROR(${err.code}): ${err.message}`);
	};

	componentDidMount = () => {
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
				{ !this.state.showResults ? <Home state={this.state} handleOverlay={this.handleOverlay} handleGroupSubmit={this.handleGroupSubmit} handleInputChange={this.handleInputChange} handleNewUser={this.handleNewUser} />
				: <Results state={this.state} handleInputChange={this.handleInputChange} handleClipboard={this.handleClipboard} handleCenterChanged={this.handleCenterChanged} handleLocationSubmit={this.handleLocationSubmit} handleOverlay={this.handleOverlay} handleLogout={this.handleLogout} /> }
			</div>
		);
	};
}

export default Main;
