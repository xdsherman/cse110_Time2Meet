import React, {Component} from 'react';
import db from '../base';
import "../style.css";
import { Redirect } from "react-router-dom";

class MeetingCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingID: this.props.location.state.meetingID,
            meetingDays: this.props.location.state.meetingDays,
            userID: 'xx',
            availability: [],
            color: "#f1f1f1",
            edit: false
        };
        this.firebaseRef = db.database().ref("availability/"+this.state.meetingID+"/"+this.state.userID);
        console.log(this.firebaseRef);
        this.addAvailability = this.addAvailability.bind(this);
        this.pushToFirebase = this.pushToFirebase.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
    }

    componentWillUnmount() {
        this.firebaseRef.off();
    }

    pushToFirebase(event) {
        if(this.state.edit){
            const { availability } = this.state;
            event.preventDefault();
            let ava = availability[0];
            console.log(ava);
            this.firebaseRef.set({availability});
            this.setState({
                availability: [],
                edit: false
            });
        }else{
            //TODO: retrieve data
            this.setState({
                edit: true
            });
        }

    }

    addAvailability(event){
        if(this.state.edit){
            const { availability } = this.state;
            let hourID = event.target.getAttribute('id');
            let dayID = event.target.parentElement.getAttribute('id');
            let ava = <Availability hour = {hourID} day = {dayID} />;
            availability.push(ava.props);
            this.setState({color: "#f1ffff", availability});
        }else{
            //TODO: display available participants
        }

    }

    handleCreate(event){
        this.props.history.push("/");
        return <Redirect to="/" />;
    }

    render() {
        let slots = [];
        let hours = [];

        //TODO: start time window, displays 1-12, half hour, 7 days per window
        Array.from({length: 24}, (_, i) => hours.push(<div>{i+1}</div>));
        Array.from({length: 24}, (_, i) =>
            slots.push(<div id = {i} style={{backgroundColor: this.state.color}} onClick={this.addAvailability}></div>));
        let days = this.state.meetingDays.map(day => <div id = {day}><div className="day">{day}</div><div id={day} className= "slots">{slots}</div></div>);
        return (
            <div>
            <div class="flex-container"><div className="hours">{hours}</div> {days}</div>
                <button className="save" onClick={this.pushToFirebase}>{this.state.edit ? 'Save' : 'Edit'}</button>
                <button className="create" onClick={this.handleCreate}>Create Another Meeting</button>
            </div>
        );
    }
}

class Availability extends MeetingCalendar{
    constructor(props) {
        super(props);
        this.state = {
            day: this.props.day,
            hour: this.props.hour,
            priority: 0
        };
    }
}

export default MeetingCalendar;