//import logo from './logo.svg';
import React from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
//import TeamMembers from './components/TeamMembers.js';
//import DisplayData from './components/DisplayData.js'
import Home from "./routes/Home";
import Login from "./routes/LogIn";
import SignUp from "./routes/SignUp";
import ForgotPassword from "./routes/ForgotPassword"
import PrivateRoute from "./auth/PrivateRoute";
import { AuthProvider } from "./auth/Auth";

function App() {

    return (
        <AuthProvider>
            <Router>
                <div>
                    <PrivateRoute exact path="/" component={Home} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/signup" component={SignUp} />
                    <Route exact path="/forgotpassword" component={ForgotPassword} />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
