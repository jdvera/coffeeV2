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

				<div className="row">
						<img src={window.location.origin + "/images/coffeelogoMed.png"} alt="logo" id="imgStyle" />
				</div>

				<div className="row">
					<div className="" id="fontStyle">coffee</div>
					<div className="" id="fontStyle2">connection</div>
				</div>

				<p id="genText1">{this.props.state.isJoining ? "join the group!" : "create a new group"}</p>
				
				<div className="row">
					<button value="true" onClick={this.props.handleNewUser}>new user</button>
				</div>
				
				<div className="row">
					<button value="false" onClick={this.props.handleNewUser}>login</button>
				</div>

				<p id="genText2">{this.props.state.isJoining ? "" : "to join an existing group, use the url provided to the one who made it"}</p>	

				<div id="overlay">
					<br />
					<GroupForm state={this.props.state} handleGroupSubmit={this.props.handleGroupSubmit} handleInputChange={this.props.handleInputChange} />
					<br />
				</div>

				<div id="overlay-background" onClick={this.props.handleOverlay}></div>
			</div>
		);
	}
};

export default Home;