import React, { Component } from "react";
import "./Home.css";
import GroupForm from "../GroupForm";

class Home extends Component {

	componentDidMount = () => {
		this.props.getUserLocation();
	}

	render() {
		return (
			<div className="home-container">
				<div className="row">
					{/* intentionally left blank */}
				</div>

				<div className="row logo">
					<img src={window.location.origin + "/images/coffeelogoMed.png"} alt="logo" id="img-style" />
				</div>

				<div className="row">
					<div id="font-style-1">coffee</div>
					<div id="font-style-2">connect</div>
				</div>

				<div className="row">
					<p id="gen-text">{this.props.state.isJoining ? "join the group!" : "create a new group"}</p>
				</div>

				<div className="row">
					<button value="true" onClick={this.props.handleNewUser}>new user</button>
				</div>

				<div className="row">
					<button value="false" onClick={this.props.handleNewUser}>login</button>
				</div>

				<div className="row">
					{this.props.state.isJoining ? <p>or <a href="/">create a new group</a></p> : <p>to join an existing group, use the url provided to the one who made it</p>}
				</div>

				<GroupForm state={this.props.state} handleGroupSubmit={this.props.handleGroupSubmit} handleInputChange={this.props.handleInputChange} handleOverlay={this.props.handleOverlay} />
			</div>
		);
	}
};

export default Home;