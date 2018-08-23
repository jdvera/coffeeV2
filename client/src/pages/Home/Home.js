import React, { Component } from "react";
import "./Home.css";
import API from "../../utils/API";
import GroupForm from "../../components/GroupForm";

class Home extends Component {

	state = {
		username: "",
		password: "",
		retype: "",
		newUser: false,
		message: "",
		groupNum: window.location.pathname.split("/")[2] || null
	};

	handleInputChange = event => {
		event.preventDefault();
		let { name, value } = event.target;
		if(name === "newUser") {
			value = (value === "true");
		}
		this.setState({
			[name]: value,
			message: ""
		}, () => {
			console.log(name + ": " + value);
			if(name === "newUser") {
				this.handleOverlay();
			}
		});
	};

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
			password: this.state.password
		};

		if(this.state.newUser) {
			apiCall = API.signup;
		}
		else {
			apiCall = API.login;
		}

		console.log(this.state.groupNum);

		apiCall(apiObj).then(res => {
			window.location.replace(res.data);
		}).catch(err => {
			if (err.response.status === 422) {
				this.setState({
					message: "That Screen Name is already taken :(",
					username: ""
				}, () => console.log(err.response.data));
			}
		});
	};

	handleLogout = event =>{
		event.preventDefault();
		API.logout().then(res => {
			console.log(res.data);
            if (res.data) {
                console.log("Logout successful");
                window.location.href = "/";
            }
            else {
                console.log("Home.js - handleLogout - 'Something went wrong'");
            }
        }).catch(err => console.log(err));
	};

	render() {
		return (
			<div className="container">

				<div className="row">
						<img src="./images/coffeelogoMed.png" alt="logo" id="imgStyle" />
				</div>

				<div className="row">
					<div className="" id="fontStyle">coffee</div>
					<div className="" id="fontStyle2">connection</div>
				</div>

				<p id="genText1">create a new group</p>
				
				<div className="row">
					<button name="newUser" value="true" onClick={this.handleInputChange}>new user</button>
				</div>
				
				<div className="row">
					<button name="newUser" value="false" onClick={this.handleInputChange}>login</button>
				</div>
				
				{/* <div className="row">
					<button name="get" onClick={this.handleLogout}>logout group</button>
				</div> */}

				<p id="genText2">to join an existing group, use the url provided to the one who made it</p>	

				<div id="overlay">
					<br />
					<GroupForm state={this.state} handleGroupSubmit={this.handleGroupSubmit} handleInputChange={this.handleInputChange} />
					<br />
				</div>

				<div id="overlay-background" onClick={this.handleOverlay}>
				</div>
			</div>
		);
	};
}

export default Home;
