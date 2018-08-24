import React from "react";
import "./Results.css";
import { CopyToClipboard } from 'react-copy-to-clipboard';

const styles = {

}

const Results = props =>

	<div className="results-container">
		<div id="top-buttons">
			<div id="first-button">
			qwer
			</div>
			<div id="second-button">
			asdf
			</div>
			<div id="third-button">
			<button id="url-button" onClick={props.handleOverlay}>show url</button>
			</div>
		</div>

		<div className="row">
			The Results Page
		</div>



		<div className="row">
			<button onClick={props.handleLogout}>Logout</button>
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