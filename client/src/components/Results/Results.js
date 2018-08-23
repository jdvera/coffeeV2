import React from "react";
import "./Results.css";

const Results = props =>

	<div className="container">
		<div className="row">
			The Results Page
		</div>

		<div className="row">
			<button onClick={props.handleLogout}>Logout</button>
		</div>
	</div>

export default Results;