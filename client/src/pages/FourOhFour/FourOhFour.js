import React, { Component} from "react";
import "./FourOhFour.css";

class FourOhFour extends Component {
    render(){
        return (
            <div className="container">
                <div className="row">
                    <img src="./images/coffeebrokenNEW.png" alt="404" id="imgStyle" />
                </div>	
                
                <div className="row" id="fontStyle">
                    oops!
                </div>
                
                <div className="row" id="fontStyle3">
                    <h2>you broke the internet!</h2>
                </div>
                    
                <div className="row">
                    <a href="/"><button>home</button></a>
                </div>
            </div>
        );
    }
}

export default FourOhFour;