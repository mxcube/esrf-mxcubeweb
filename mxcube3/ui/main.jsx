import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, Link } from 'react-router'
import SampleViewContainer from './containers/SampleViewContainer'
import SampleGridMain from './components/SampleGridMain'
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import rootReducer from './reducers/main'
import NavBar from './components/NavBar'
require("file?name=[name].[ext]!index.html")
import { samples_list } from './test-samples-list'

let store = createStore(rootReducer);
window.samples_list = samples_list;

ReactDOM.render((
  <Provider store={store}>
	  <Router>
		  <Route path="/" component={NavBar}>
			  <Route path="samplegrid" component={SampleGridMain}/>
			  <Route path="datacollection" component={SampleViewContainer}/>
		  </Route>
	  </Router>
  </Provider>
), document.getElementById("main"));

