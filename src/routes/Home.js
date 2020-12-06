import React, {Component} from 'react';
import MeetingCalendar from '../components/MeetingCalendar.js';
import db from '../base';
import MeetingList from "../components/MeetingList";


const Home = () => {
    return (

        <div>
            <h1>Home</h1>
            <div>
                <MeetingList/>
            </div>
        </div>
    )
};

export default Home;