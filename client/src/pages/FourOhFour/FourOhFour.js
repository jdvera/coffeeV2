import React, { Component} from "react";
import "./FourOhFour.css"

class FourOhFour extends Component {
    render(){
        return (
            <div className="error-container">
                <div className="row">
                    {/* intentionally left blank */}
                </div>

                <div className="row">
                    <img src={window.location.origin + "/images/coffeebrokenNEW.png"} alt="404" id="img-style" />
                </div>	
                
                <div className="row" id="err-style-1">
                    oops!
                </div>
                
                <div className="row">
                    <p id="err-style-2">you are likely trying to join a group that no longer exist</p>
                    <span>try going to the homepage and making a new group</span>
                </div>
                    
                <div className="row">
                    <a href="/"><button>home</button></a>
                </div>
            </div>
        );
    }
}

export default FourOhFour;