import React from "react";
import "./Results.css";
import Map from "../Map";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const Results = props =>

	<div className="results-container">
		<div id="top-buttons">
			<div id="first-button">
				{/* intentionally blank */}
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
			loadingElement={<div style={{ height: `100%` }} />}
			containerElement={<div style={{ height: `400px` }} />}
			mapElement={<div style={{ height: `100%` }} />} />
		</div>

		<div className="row">
			<button name="locationSubmitted" onClick={props.handleLocationSubmit}>{props.state.locationSubmitted ? "Change Location" : "Submit Location"}</button>
		</div>

		<div className="row">
			<button id="logout-button" onClick={props.handleLogout}>Logout</button>
		</div>

		<div id="overlay">
			<br />
			<p>Share this link with your friends</p>
			<p>{props.state.url}</p>
			<CopyToClipboard text={props.state.url} onCopy={props.handleClipboard}>
				<a>Copy to clipboard<i className="fas fa-clipboard"></i></a>
			</CopyToClipboard>
			<div style={props.state.copied ? { visibility: "visible" } : { visibility: "hidden" }}>
				Copied.
			</div>
			<br />
		</div>

		<div id="overlay-background" onClick={props.handleOverlay}></div>
	</div>

export default Results;