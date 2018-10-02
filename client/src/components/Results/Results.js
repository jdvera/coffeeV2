import React from "react";
import "./Results.css";
import Map from "../Map";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { isMobile } from "react-device-detect";

const mapHeight = isMobile ? `250px` : `500px`;

const Results = props =>

	<div className="results-container">
		<div id="top-buttons">
			<div id="first-button">
				<button id="logout-button" onClick={props.handleLogout}>Logout</button>
			</div>
			<div id="fourth-button">
				<button id="url-button" onClick={props.handleOverlay}>show url</button>
			</div>
		</div>

		<div className="my-map">
			<Map
				state={props.state}
				handleCenterChanged={props.handleCenterChanged}
				loadFirebase={props.loadFirebase}
				updateMapObject={props.updateMapObject}
				showPlaceInfo={props.showPlaceInfo}
				loadingElement={<div style={{ height: `100%` }} />}
				containerElement={<div style={{ height: mapHeight }} />}
				mapElement={<div style={{ height: `100%` }} />}
			/>
			<p>{props.state.mapMessage}</p>
		</div>

		<div id="people-container" className="row">
			<div id="online">
				Online:
				<ul id="people" style={(props.state.votesAllArr.length > 0 && props.state.locationSubmitted) ? { borderRightStyle: "solid", borderRightRadius: "2px", borderColor: "black" } : {}}>
					{props.state.onlineArr.map((e, i) => <li key={i}>{e}</li>)}
				</ul>
			</div>

			{(props.state.votesAllArr.length > 0 && props.state.locationSubmitted) &&
				<div id="votes-container">
					Votes:
					{props.state.votesAllArr.map(e => {
						props.state.nearbyArr.forEach(element => {
							if(e.placeId === element.id) {
								e.name = element.name;
								e.letter = element.letter;
							}
						});
						return e;
					}).filter(e => e.name && e.val).sort((a, b) => b.val - a.val).map((e, i) => 
						<div className="place-votes" key={i}>
							{`${e.letter}. ${e.name}: ${e.val}`}
						</div>
					)}
				</div>
			}
		</div>

		{props.state.placeKey !== null && <div className="row">
			<div id="info-container">
				Location Information <br />
				{props.state.placeInfo.map((info, key) => <span key={key}>{ key === 3 ? <a href={info} target="_blank">Directions on Google</a> : info }<br/></span>)}
				<button id="vote-button" onClick={props.handleVote}>Vote</button>
			</div>
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
