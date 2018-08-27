import React from "react";
import "./Home.css";
import GroupForm from "../GroupForm";

const Home = props =>

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

		<p id="genText1">{props.state.isJoining ? "join the group!" : "create a new group"}</p>
		
		<div className="row">
			<button value="true" onClick={props.handleNewUser}>new user</button>
		</div>
		
		<div className="row">
			<button value="false" onClick={props.handleNewUser}>login</button>
		</div>

		<p id="genText2">{props.state.isJoining ? "" : "to join an existing group, use the url provided to the one who made it"}</p>	

		<div id="overlay">
			<br />
			<GroupForm state={props.state} handleGroupSubmit={props.handleGroupSubmit} handleInputChange={props.handleInputChange} />
			<br />
		</div>

		<div id="overlay-background" onClick={props.handleOverlay}></div>
	</div>

export default Home;