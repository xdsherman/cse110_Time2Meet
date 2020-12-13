import React, {Component} from 'react';
import MeetingList from "../components/MeetingList";
import logo from "./resource/time2meet_logo.png";

const Home = () => {
    return (
        <div>
            <img src={logo} alt=""></img>
            <div>
                <MeetingList/>
            </div>
        </div>
    )
};

export default Home;