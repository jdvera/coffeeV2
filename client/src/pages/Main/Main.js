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
		isCreator: null
	};

	handleInputChange = event => {
		event.preventDefault();
		let { name, value } = event.target;
		const newUserOldValue = this.state.newUser;
		if(name === "newUser") {
			value = (value === "true");
		}
		this.setState({
			[name]: value,
			message: ""
		}, () => {
			console.log(name + ": " + value);
			if(name === "newUser") {
				this.checkNewUserVal(newUserOldValue);
			}
		});
	};

	checkNewUserVal = newUserOldValue => {
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
	};


//  ----- Home-specific fucntions

	handleOverlay = () => {
		const overlayBackground = document.getElementById("overlay-background");
		overlayBackground.style.display = (overlayBackground.style.display === "inline-block") ? "none" : "inline-block";
		const overlay = document.getElementById("overlay");
		overlay.style.display = (overlay.style.display === "inline-block") ? "none" : "inline-block";
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

		if(this.state.newUser) {
			apiCall = API.signup;
		}
		else {
			apiCall = API.login;
		}

		apiCall(apiObj).then(res => {
			res.data.showResults = true;
			this.setState(res.data, () => {
				console.log("Updated state with following data:");
				console.log(res.data);
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
				isCreator: null
			}, () => { console.log("Logout successful"); });
        }).catch(err => console.log(err));
	};


	render() {
		return (
			<div className="main-container">
				{ !this.state.showResults ? <Home state={this.state} handleOverlay={this.handleOverlay} handleGroupSubmit={this.handleGroupSubmit} handleInputChange={this.handleInputChange} />
				: <Results state={this.state} handleInputChange={this.handleInputChange} handleLogout={this.handleLogout} /> }
			</div>
		);
	};
}

export default Main;
