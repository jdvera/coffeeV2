import React, { Component } from "react";
import "./Join.css";
import API from "../../utils/API";

class Join extends Component {

    state = {
        screenName: "",
        password: "",
        hashId: window.location.pathname.split("/")[2],
        copied: false,
        submitClicked: false,
        message: "",
        show: false
    };

    componentDidMount = () => {
        console.log(this.state.hashId);
        API.checkUrl({ hashId: this.state.hashId }).then(response => {
            console.log(response.data);
            if(!response.data){
                console.log("page should NOT appear")
                return window.location.replace("/");
            }
            this.setState({ show: true }, () => console.log("page should display"));
        }).catch(err => {
            console.log(err);
            window.location.replace("/");
        });
    };

    handleInputChange = event => {
		event.preventDefault();
		let { name, value } = event.target;
		this.setState({
			[name]: value,
			message: ""
		}, () => {
			console.log(name + ": " + value);
		});
    };
    
    handleSubmit = event => {
        event.preventDefault();
        console.log("submit clicked");
        API.createUser({
            screenName: this.state.screenName,
            hashId: this.state.hashId,
            password: this.state.password
        }).then(response => console.log("response: ", response)).catch(err => console.log("err: ", err));
    };

    handleClipboard = () => {
        this.setState({ copied: true });
    }


    render(){
        return (
            <div>
                { !this.state.show ? <img id="loadingGif" alt="loading gif" src="../images/loading_icon.gif" /> :
                <div className="container">
                    <div className="row">
                    </div>

                    <div className="row">
                            <img src="../images/coffeelogoMed.png" alt="logo" id="imgStyle" />
                    </div>

                    <div className="row">
                        <div className="" id="fontStyle">coffee</div>
                        <div className="" id="fontStyle2">connection</div>
                    </div>
                    
                    <form className="row">
                        <div className="form-group">
                            <div>Screen Name</div>
                            <input type="text" className="form-control" placeholder="Name" autoFocus="yes" name="screenName" value={this.state.screenName} onChange={this.handleInputChange} />
                        </div>
                        <div className="form-group">
                            <div>Password</div>
                            <input type="password" className="form-control" placeholder="Password" name="password" value={this.state.password} onChange={this.handleInputChange} />
                        </div>
                        <p id="message" style={this.state.message === "" ? { visibility: "hidden" } : { visibility: "visible" }}> {this.state.message} </p>
                        <button onClick={this.handleSubmit}>Submit</button>
                    </form>
                </div>}
            </div>
        );
    }
}

export default Join;