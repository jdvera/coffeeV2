import React, { Component} from "react";
import "./Loading.css";
import API from "../../utils/API";

class Loading extends Component {

    state = {
	};

    componentWillMount() {
        API.userData().then(res => {
            if (res.data) console.log("New.js - componentWillMount - you good");
        }).catch(err => {
            console.log(err);
            window.location.href = "/";
        });
    }






    render(){
        return (
            <div className="loading-wrapper">
                Loading Screen
                <br />
                <img alt="loading gif" src="./images/loading_icon.gif" />
            </div>
        );
    }
}

export default Loading;