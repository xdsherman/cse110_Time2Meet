import React, {Component} from 'react';
import MeetingCalendar from '../components/MeetingCalendar.js';
import db from '../base';
import Meeting from "../components/Meeting";
import email from "../components/email";


const Home = () => {
    return (
        <div>
            <h1>Home</h1>
            <div>
                <Meeting/>
                <MeetingCalendar/>
            </div>
        </div>
    )
};

export default Home;