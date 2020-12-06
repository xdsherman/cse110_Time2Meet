import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./routes/Home"
import MeetingCalendar from "./components/MeetingCalendar"
import Meeting from "./components/Meeting";
import MeetingList from "./components/MeetingList";
import Login from "./routes/LogIn"
import SignUp from "./routes/SignUp"
import PrivateRoute from "./auth/PrivateRoute";
import { AuthProvider } from "./auth/Auth";

function App() {
    return (
        <AuthProvider>
            <Router>
                <div>
                    <PrivateRoute exact path="/calendar" component={MeetingCalendar} />
                    <PrivateRoute exact path="/createMeeting" component={Meeting} />
                    <PrivateRoute exact path="/" component={MeetingList} />
                    <Route exact path="/login" component={Login} />
                    <Route exact path="/signup" component={SignUp} />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
