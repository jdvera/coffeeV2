import React from "react";
import "./Results.css";
import Map from "../Map";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { isMobile } from "react-device-detect";

const mapHeight = isMobile ? `200px` : `500px`;

const Results = props =>

	<div className="results-container">
		<div id="top-buttons">
			<div id="first-button">
				<button id="logout-button" onClick={props.handleLogout}>Logout</button>
			</div>
			<div id="second-button">
				{/* intentionally blank */}
			</div>
			<div id="third-button">
				<button id="url-button" onClick={props.handleOverlay}>show url</button>
			</div>
		</div>

		<div className="row my-map">
			<Map state={props.state}
			handleCenterChanged={props.handleCenterChanged}
			loadFirebase={props.loadFirebase}
			updateMapObject={props.updateMapObject}
			showPlaceInfo={props.showPlaceInfo}
			loadingElement={<div style={{ height: `100%` }} />}
			containerElement={<div style={{ height: mapHeight }} />}
			mapElement={<div style={{ height: `100%` }} />} />
			<p>{props.state.mapMessage}</p>
		</div>

		{(props.state.votesAllArr.length > 0 && props.state.locationSubmitted) &&
			<div id="votes-container">{
				props.state.votesAllArr.map(e => {
					console.log("Updating votes Display");
					props.state.nearbyArr.forEach(element => {
						if(e.placeId === element.id) {
							console.log("Found a voted on thing");
							e.name = element.name;
							e.letter = element.letter;
						}
					});
					return e;
				}).filter(e => e.name).map((e, i) => 
					<div key={i}>
						{`${e.letter}. ${e.name}: ${e.val}`}
					</div>
				)
			}</div>}

		{props.state.locationSubmitted && <div className="row" id="info-container">
			Location Information <br />
			{props.state.placeInfo.map((info, key) => <span key={key}>{info}<br/></span>)}
			{props.state.placeKey !== null && <button id="vote-button" onClick={props.handleVote}>Vote</button>}
		</div>}

		<div className="row">
			<button name="locationSubmitted" onClick={props.handleLocationSubmit} style={props.state.waitingForResponse ? { background: "grey" } : { background: "#0060C0" }}>{props.state.locationSubmitted ? "Change Location" : "Submit Location"}</button>
			{ props.state.showCancel ? <button name="cancelBtn" onClick={props.handleCancelLocation}>Cancel</button> : "" }
			<p id="message" style={props.state.message === "" ? { visibility: "hidden" } : { visibility: "visible" }}> {props.state.message} </p>
		</div>

		<div id="overlay">
			<br />
			<p>Share this link with your friends</p>
			<p>{props.state.url}</p>
			<CopyToClipboard text={props.state.url} onCopy={props.handleClipboard}>
				<a>copy to clipboard<i className="fas fa-clipboard"></i></a>
			</CopyToClipboard>
			<div style={props.state.copied ? { visibility: "visible" } : { visibility: "hidden" }}>
				copied.
			</div>
			<br />
		</div>

		<div id="overlay-background" onClick={props.handleOverlay}></div>
	</div>

export default Results;