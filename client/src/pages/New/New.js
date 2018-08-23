import React, { Component} from "react";
import "./New.css";
import API from "../../utils/API";

class New extends Component {

    state = {
	};

	handleTest = event => {
		event.preventDefault();
		API.getUser().then(res => console.log(res.data)).catch(err => console.log(err));
    };

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
            <div className="main-wrapper">
                Login Successful

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
            </div>
        );
    }
}

export default New;