import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import { BrowserRouter } from "react-router-dom";
import injectTapEventPlugin from 'react-tap-event-plugin'
import firebase from 'firebase';


injectTapEventPlugin();

const config = {
    apiKey: "AIzaSyB1lRbR7xaPOYz3uqcnsPsGPaMGB5ZNts0",
    authDomain: "wda-2-login.firebaseapp.com",
    databaseURL: "https://wda-2-login.firebaseio.com",
    projectId: "wda-2-login",
    storageBucket: "wda-2-login.appspot.com",
    messagingSenderId: "161724634984"
};

firebase.initializeApp(config);
ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    , document.getElementById('root'));


registerServiceWorker();
