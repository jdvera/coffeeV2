import React, { Component } from "react";
import "./Results.css";
import Map from "../Map";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { isMobile } from "react-device-detect";

const mapHeight = isMobile ? `250px` : `500px`;

class Results extends Component {

	componentDidMount() {
		this.props.handleOverlay({ optionsDisplay: "url" });
	}

	render() {
		let optionsDisplay;
		switch(this.props.state.optionsDisplay) {
			case ("options"):
				optionsDisplay = 
					<div>
						<i id="times" onClick={() => this.props.handleOverlay({optionsDisplay: false})} class="fas fa-times"></i>
						Options<br />
						<button id="url-button" onClick={() => this.props.handleOverlay({ optionsDisplay: "url" })}>show url</button>
						<br />
						<button id="logout-button" onClick={this.props.handleLogout}>Logout</button>
					</div>;
				break;
			case ("url"):
				optionsDisplay = 
					<div>
						<i id="arrow" onClick={() => this.props.handleOverlay({optionsDisplay: "options"})} class="fas fa-arrow-left"></i>
						<i id="times" onClick={() => this.props.handleOverlay({optionsDisplay: false})} class="fas fa-times"></i>
						<br />
						<p>Share this link with your friends</p>
						<p>{this.props.state.url}</p>
						<CopyToClipboard text={this.props.state.url} onCopy={this.props.handleClipboard}>
							<a>copy to clipboard<i id="clipboard" className="fas fa-clipboard"></i></a>
						</CopyToClipboard>
						<div style={this.props.state.copied ? { visibility: "visible" } : { visibility: "hidden" }}>
							copied.
						</div>
						<br />
					</div>;
				break;
			default:
				break;
			
		}

		return (
			<div className="results-container">
				<div id="top-buttons">
					<div id="first-button">
						<button id="url-button" onClick={() => this.props.handleOverlay({ optionsDisplay: "options" })}>options</button>
					</div>
				</div>

				<div className="my-map">
					<Map
						state={this.props.state}
						handleCenterChanged={this.props.handleCenterChanged}
						loadFirebase={this.props.loadFirebase}
						updateMapObject={this.props.updateMapObject}
						showPlaceInfo={this.props.showPlaceInfo}
						loadingElement={<div style={{ height: `100%` }} />}
						containerElement={<div style={{ height: mapHeight }} />}
						mapElement={<div style={{ height: `100%` }} />}
					/>
					<p>{this.props.state.mapMessage}</p>
				</div>

				<div id="people-container" className="row">
					<div id="online">
						Online:
						<ul id="people" style={(this.props.state.votesAllArr.length > 0 && this.props.state.locationSubmitted) ? { borderRightStyle: "solid", borderRightRadius: "2px", borderColor: "black" } : {}}>
							{this.props.state.onlineArr.map((e, i) => <li key={i}>{e}</li>)}
						</ul>
					</div>

					{(this.props.state.votesAllArr.length > 0 && this.props.state.locationSubmitted) &&
						<div id="votes-container">
							Votes:
							{this.props.state.votesAllArr.map(e => {
								this.props.state.nearbyArr.forEach(element => {
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

				{this.props.state.placeKey !== null && <div className="row">
					<div id="info-container">
						Location Information <br />
						{this.props.state.placeInfo.map((info, key) => <span key={key}>{ key === 3 ? <a href={info} target="_blank">Directions on Google</a> : info }<br/></span>)}
						<button id="vote-button" onClick={this.props.handleVote}>Vote</button>
					</div>
				</div>}

				<div className="row">
					<button name="locationSubmitted" onClick={this.props.handleLocationSubmit} style={this.props.state.waitingForResponse ? { background: "grey" } : { background: "#0060C0" }}>{this.props.state.locationSubmitted ? "Change Location" : "Submit Location"}</button>
					{ this.props.state.showCancel ? <button name="cancelBtn" onClick={this.props.handleCancelLocation}>Cancel</button> : "" }
					<p id="message" style={this.props.state.message === "" ? { visibility: "hidden" } : { visibility: "visible" }}> {this.props.state.message} </p>
				</div>

				<div id="overlay">
					{ optionsDisplay }
				</div>

				<div id="overlay-background" onClick={() => this.props.handleOverlay({ optionsDisplay: false })}></div>
			</div>
		);
	}
}

export default Results;
