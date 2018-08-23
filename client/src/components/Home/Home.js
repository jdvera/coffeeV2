import React from "react";
import "./Home.css";
import GroupForm from "../GroupForm";

const Home = props =>

	<div className="container">
		<div className="row">
				<img src={window.location.origin + "/images/coffeelogoMed.png"} alt="logo" id="imgStyle" />
		</div>

		<div className="row">
			<div className="" id="fontStyle">coffee</div>
			<div className="" id="fontStyle2">connection</div>
		</div>

		<p id="genText1">create a new group</p>
		
		<div className="row">
			<button name="newUser" value="true" onClick={props.handleInputChange}>new user</button>
		</div>
		
		<div className="row">
			<button name="newUser" value="false" onClick={props.handleInputChange}>login</button>
		</div>

		<p id="genText2">to join an existing group, use the url provided to the one who made it</p>	

		<div id="overlay">
			<br />
			<GroupForm state={props.state} handleGroupSubmit={props.handleGroupSubmit} handleInputChange={props.handleInputChange} />
			<br />
		</div>

		<div id="overlay-background" onClick={props.handleOverlay}></div>
	</div>

export default Home;