import React, { Component} from "react";
import "./Results.css";
import API from "../../utils/API";
import { CopyToClipboard } from 'react-copy-to-clipboard';

class New extends Component {

    state = {
        url: window.location.origin + "/join/" + window.location.pathname.split("/")[2],
        copied: false,
        show: false
	};

    componentDidMount = () => {
        API.checkUrl({ hashId: window.location.pathname.split("/")[2] }).then(response => {
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

    handleClipboard = () => {
        this.setState({ copied: true });
    }

	handleLogout = event =>{
		event.preventDefault();
		API.logout().then(res => {
            if (res.data) {
                console.log("Logout successful");
                window.location.href = "/";
            }
            else {
                console.log("New.js - handleLogout - 'Something went wrong'");
            }
        }).catch(err => console.log(err));
	}
    
    render(){
        return (
            <div>
                { !this.state.show ? <img id="loadingGif" alt="loading gif" src="../images/loading_icon.gif" /> :
                <div className="container">
                    <div className="row">
                        <div className="" id="fontStyle">coffee</div>
                        <div className="" id="fontStyle2">connection</div>
                    </div>


                    <div className="row">
                        <p>Send this link to your friends!</p>
                        <a id="groupUrl">{this.state.url}</a><br />
                        <CopyToClipboard text={this.state.url} onCopy={this.handleClipboard}>
                            <a>Copy to clipboard<i className="fas fa-clipboard"></i></a>
                        </CopyToClipboard>
                        <div style={this.state.copied ? { visibility: "visible" } : { visibility: "hidden" }}>
                            Copied.
                        </div>
                    </div>

                    <div className="row">
                        <div className="">
                            <div className="row">
                                <button name="get" onClick={this.handleTest}>test GET</button>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="">
                            <div className="row">
                                <button name="get" onClick={this.handleLogout}>logout group</button>
                            </div>
                        </div>
                    </div>
                </div>}
            </div>
        );
    }
}

export default New;