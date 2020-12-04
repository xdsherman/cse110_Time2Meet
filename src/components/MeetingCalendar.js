import React, {Component} from 'react';
import db from '../base';
import "../style.css";
import { Redirect } from "react-router-dom";
import Meeting from './Meeting';
import MasterCalendar from './MasterCalendar';

class MeetingCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            meetingID: this.props.location.state.meetingID,
            meetingDays: this.props.location.state.meetingDays,
            userID: 'xz',
            availability: [],
            color: "#f1f1f1",
            edit: false,
            retrieved: [],
            priority: 3
        };
        this.firebaseRef = db.database().ref("availability/"+this.state.meetingID+"/"+this.state.userID);
        this.addAvailability = this.addAvailability.bind(this);
        this.pushToFirebase = this.pushToFirebase.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.changePriority = this.changePriority.bind(this);
        this.retrieveData = this.retrieveData.bind(this);
        this.checkData = this.checkData.bind(this);
        // Get the availabilities at start up

    }

    componentWillUnmount() {
        this.firebaseRef.off();
    }
    componentDidMount(){
        this.firebaseRef.once('value').then((snapshot) => {
            if (snapshot.child('availability').val() != null) {
                this.setState({
                    retrieved: snapshot.child('availability').val()
                });
            }
        })
    }

    pushToFirebase(event) {
        if(this.state.edit){
            const {availability}  = this.state;
            event.preventDefault();
            let ava = availability[0];

            if (availability.length !== 0)
                this.firebaseRef.set({availability});
/*            for (const value of Object.values(availability)){
                console.log(value.day.replace(/\//g,'')+value.hour+value.priority)
                this.firebaseRef.child(value.day.replace(/\//g,'')+value.hour+value.priority).set(value);
            }*/

            this.setState({
                availability: [],
                edit: false
            });
        }else{
            //TODO: retrieve data
            this.retrieveData();
            this.setState({
                edit: true
            });
/*            // db.database().ref("availability/"+this.state.meetingID).once('value').then((snapshot) => {
            //     console.log(snapshot.val())
            // });*/
        }

    }
    retrieveData(event){
        this.firebaseRef.on('value', (snapshot) => {
            if (snapshot.child('availability').val() != null) {
                this.setState({
                    retrieved: snapshot.child('availability').val()
                });
            }
        })
    }
    checkData(){

    }

    addAvailability(event){
        if(this.state.edit){
            var color
            if (this.state.priority === 1)
                color = "#aafcfd"
            else if (this.state.priority === 2)
                color = '#31f9fc'
            else
                color = '#018788'
            event.target.style.backgroundColor = color;
            const { availability } = this.state;
            // id of the target div is in the format {hour+'-'+day}
            let hourID = event.target.getAttribute('id').split('-')[0];
            let dayID = event.target.parentElement.getAttribute('id');
            let priorityVal = this.state.priority;
            let ava = <Availability hour = {hourID} day = {dayID} priority = {priorityVal}/>;
            // Check if you have already marked this slot
            var included = false;
            for (const value of Object.values(availability)){
                if (value.hour === hourID && value.day === dayID && value.priority === priorityVal){
                    included = true;
                }
                else if (value.hour === hourID && value.day ===dayID){
                    const index = availability.indexOf(value);
                    const removed = availability.splice(index,1);
                }
            }
            if (!included)
                availability.push(ava.props);
            this.setState(availability);
        }else{
            //TODO: display available participants
        }

    }

    changePriority(event){
        if(this.state.priority === 1)
            this.setState({
                priority: 2
            });
        else if(this.state.priority === 2)
            this.setState({
                priority: 3
            });
        else if(this.state.priority === 3)
            this.setState({
                priority: 1
            });
    }

    handleCreate(event){
        this.props.history.push("/");
        return <Redirect to="/" />;
    }

    render() {
        let slots = {};
        // slots is an object with days as keys and an array of slots as value
        let hours = [];
        //console.log(this.state.retrieved)

        //TODO: start time window, displays 1-12, half hour, 7 days per window
        Array.from({length: 24}, (_, i) => hours.push(<div>{i+1}</div>));
        // Create individual slot with unique id instead of sharing the same slots array between all columns (this is to create a unique slot to change color, initially all columns were sharing the same slot)
        for (const eachday of this.state.meetingDays){
            var slot = [];
            Array.from({length: 24}, (_, i) =>
                slot.push(<div id ={i+'-'+eachday} style={{backgroundColor: this.state.color}} onClick={this.addAvailability}></div>));
            slots[eachday] = slot;
        }
        let days = this.state.meetingDays.map(day => <div id = {day}><div className="day">{day}</div><div id={day} className= "slots">{slots[day]}</div></div>);
        //console.log(days[0].props.children[1].props.children[0].props);
        // retrieved is an array of availabilities
        // Update the color based what's in retrieved

        if (this.state.retrieved.length !== 0 && !this.state.edit) {
            for (const value of Object.values(this.state.retrieved)) {
                var day = value.day;
                var hour = value.hour;
                var color
                if (value.priority === 1)
                    color = "#aafcfd"
                else if (value.priority === 2)
                    color = '#31f9fc'
                else
                    color = '#018788'
                //console.log(days.find(x => x.props.id === day));
                // Change color by getting the day column, then hour column to reach in the individual slot
                days.find(x => x.props.id === day).props.children[1].props.children[hour].props.style.backgroundColor = color;

            }
        }
        return (
            <div>
            <div class="flex-container"><div className="hours">{hours}</div> {days}</div>
                <button className="save" onClick={this.pushToFirebase}>{this.state.edit ? 'Save' : 'Edit'}</button>
                <button className="create" onClick={this.handleCreate}>Create Another Meeting</button>
                <button className="changePriority" onClick = {this.changePriority}>Priority : {this.state.priority}</button>

                <MasterCalendar
                    meetingID = {this.state.meetingID}
                    meetingDays = {this.state.meetingDays}
                />
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
            priority: this.props.priority,
        };
    }
}

export default MeetingCalendar;