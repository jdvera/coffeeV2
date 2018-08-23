import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import './App.css';
import Home from "./pages/Home";
// import Join from "./pages/Join";
import Results from "./pages/Results";
// import New from "./pages/New";
import Loading from "./pages/Loading";
import FourOhFour from "./pages/FourOhFour";



class App extends Component {
  render() {
    return (
      <Router>
				<Switch>
					<Route exact path="/" component={Home} />
					<Route path="/join" component={Home} />
					<Route path="/loading" component={Loading} />
					<Route path="/results" component={Results} />
					<Route component={FourOhFour} />
				</Switch>
			</Router>
    );
  }
}

export default App;
