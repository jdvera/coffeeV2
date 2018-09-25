import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Main from "./pages/Main";
import FourOhFour from "./pages/FourOhFour";



class App extends Component {
  render() {
    return (
      <Router>
				<Switch>
					<Route exact path="/" component={Main} />
					<Route path="/join" component={Main} />
					<Route component={FourOhFour} />
				</Switch>
			</Router>
    );
  }
}

export default App;
