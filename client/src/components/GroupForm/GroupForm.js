import React from "react";

const GroupForm = props =>
	<form id="overlay">
		<i id="empty-times" className="fas fa-times"></i>
		<i id="times" onClick={() => this.props.handleOverlay({ optionsDisplay: false })} className="fas fa-times"></i>
		<br />
		<div className="form-group">
			<div className="form-header">Your Screen Name</div>
			<input type="text" className="form-control" placeholder="Screen Name" name="username" value={props.state.username} onChange={props.handleInputChange} />
		</div>
		<div className="form-group">
			<div className="form-header">Password</div>
			<input type="password" className="form-control" placeholder="Password" name="password" value={props.state.password} onChange={props.handleInputChange} />
			{props.state.createNewUser ? <input type="password" id="retype" className="form-control" placeholder="Re-Type Password" name="retype" value={props.state.retype} onChange={props.handleInputChange} /> : ""}
		</div>
		<p id="form-message" style={{ visibility: props.state.formMessage ? "visible" : "hidden" }}> {props.state.formMessage} </p>
		<button id="submit-button" onClick={props.handleGroupSubmit} style={{ background: props.state.currentLocation ? "#0060C0" : "grey" }} >Submit</button>
		<br />
	</form>

export default GroupForm;