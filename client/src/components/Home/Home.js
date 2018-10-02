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
					<img src={window.location.origin + "/images/coffeelogoMed.png"} alt="logo" id="img-style" />
				</div>

				<div className="row">
					<div className="" id="font-style">coffee</div>
					<div className="" id="font-style-2">connect</div>
				</div>

				<p id="gen-text-1">{this.props.state.isJoining ? "join the group!" : "create a new group"}</p>
				
				<div className="row">
					<button value="true" onClick={this.props.handleNewUser}>new user</button>
				</div>
				
				<div className="row">
					<button value="false" onClick={this.props.handleNewUser}>login</button>
				</div>

				{this.props.state.isJoining ? <p id="gen-text-2">or <a href="/">create a new group</a></p> : <p id="gen-text-2">to join an existing group, use the url provided to the one who made it"</p>}	

				<GroupForm state={this.props.state} handleGroupSubmit={this.props.handleGroupSubmit} handleInputChange={this.props.handleInputChange} />
				
				<div id="overlay-background" onClick={this.props.handleOverlay}></div>
			</div>
		);
	}
};

export default Home;

//asdfasdf