import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route } from "react-router-dom";

import MeetingCalendar from "./components/MeetingCalendar"
import Meeting from "./components/Meeting";

function App() {
    return (
        <Router>
            <div>
                <Route exact path="/calendar" component={MeetingCalendar} />
                <Route exact path="/" component={Meeting} />
            </div>
        </Router>
    );
}

export default App;
