import React, {Component} from 'react';
import db from '../base';
import "../style.css";
import { Redirect } from "react-router-dom";
import Invite from "./Invite";
import MasterCalendar from "./MasterCalendar";
import TabularView from "./TabularView";

class MeetingCalendar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: this.props.location.state.userID,
            creatorID: '',
            meetingID: this.props.location.state.meetingID,
            meetingName: '',
            meetingDays: '',
            startTime: '',
            endTime: '',
            userIDs: [],
            availability: [],
            decided: '',
            edit: false,
            priority: 3,
            index: 0
        };


        this.addAvailability = this.addAvailability.bind(this);
        this.pushToFirebase = this.pushToFirebase.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.handleHome = this.handleHome.bind(this);
        this.changePriority = this.changePriority.bind(this);
        this.toggle = this.toggle.bind(this);
        this.convertTo12Hr = this.convertTo12Hr.bind(this);
        //this.checkData = this.checkData.bind(this);
    }

    componentDidMount() {
        this.firebaseRef = db.database().ref("availability/"+this.state.meetingID+"/"+this.state.userID);
        //console.log(this.firebaseRef);
        // Get the availabilities at start up
        this.firebaseRef.once('value').then((snapshot) => {
            if (snapshot.val() != null && snapshot.child("availability").val()!=null) {
                this.setState({
                    availability: snapshot.child("availability").val()
                });
            }
        })

        //retrieve data of meeting
        this.firebaseRef_M = db.database().ref("meetings");
        //console.log(this.firebaseRef);

        this.firebaseRef_M.on('value', snapshot => {
            if (snapshot.val() != null && snapshot.child(this.state.meetingID).val() != null) {
                this.setState({
                    creatorID: snapshot.child(this.state.meetingID).child("creatorID").val(),
                    meetingName: snapshot.child(this.state.meetingID).child("meetingName").val(),
                    startTime: snapshot.child(this.state.meetingID).child("startTime").val(),
                    endTime: snapshot.child(this.state.meetingID).child("endTime").val(),
                    meetingDays: snapshot.child(this.state.meetingID).child("meetingDays").val(),
                    userIDs: snapshot.child(this.state.meetingID).child("userIDs").val(),
                    decided: snapshot.child(this.state.meetingID).child("decided").val(),
                });
            }
        })
    }

    componentWillUnmount() {
        this.firebaseRef.off();
        this.firebaseRef_M.off();
    }

    pushToFirebase(event) {
        if(this.state.edit){
            const { availability } = this.state;
            event.preventDefault();
            this.firebaseRef.set({availability});
            this.setState({
                edit: false
            });
        }else{
            if(!this.state.decided){
                this.setState({
                    edit: true
                });
            }

        }

    }

    convertTo12Hr(hour) {
        var AMPM = (hour < 12) ? "AM" : "PM";
        var h = (hour % 12) || 12;
        return h + AMPM;
    }

    toggle(event) {
        let direction = event.target.getAttribute('id');
        if (direction === 'next' & this.state.index < Math.floor(this.state.meetingDays.length/8)){
            this.setState({
                index: this.state.index+1
            })
        } else if (direction === 'prev' & this.state.index > 0){
            this.setState({
                index: this.state.index-1
            })
        }
    }

    addAvailability(event){
        if(this.state.edit && !this.state.decided){
            let { availability } = this.state;
            let hourID = event.target.getAttribute('id').split('-')[0];
            let dayID = event.target.parentElement.getAttribute('id');
            let priorityVal = this.state.priority;
            let ava = <Availability hour = {hourID} day = {dayID} priority = {priorityVal}/>;
            // Check if you have already marked this slot
            let included = false
            for (const index in availability){
                let value = availability[index]
                if (value.hour === hourID && value.day === dayID){
                    included = true
                    availability.splice(index, 1);
                    if(value.priority != priorityVal){
                        //console.log(value.priority)
                        //console.log(priorityVal)
                        availability.push(ava.props);
                    }
                }
            }
            if(!included){
                availability.push(ava.props);
            }
            this.setState({availability});
        }
    }

    changePriority(event){
        let priority = event.target.getAttribute('id');
        //console.log(priority);
        if(priority == 1)
            this.setState({
                priority: 1
            });
        else if(priority == 2)
            this.setState({
                priority: 2
            });
        else if(priority == 3)
            this.setState({
                priority: 3
            });
        //console.log(this.state.priority);
    }

    handleCreate(event){
        this.props.history.push({
            pathname:"/createMeeting",
            state:{
                creatorID: this.state.ID,
                meetingID: this.state.meetingID,
            }
        });
        return <Redirect to="/createMeeting" />;
    }

    handleHome(event){
        this.props.history.push("/");
        return <Redirect to="/" />;
    }

    render() {
        let slots = [];
        let hours = [];
        let days = [];
        let time = Number(this.state.startTime);
        let windowLength = this.state.endTime - this.state.startTime;
        //start time window, displays 1-12, half hour, 7 days per window
        Array.from({length: windowLength}, (_, i) => hours.push(<div>{this.convertTo12Hr(i+time)}</div>));

        for (const eachday of this.state.meetingDays){
            let slot = [];
            Array.from({length: windowLength}, (_, i) =>
                slot.push(<div id ={i+Number(this.state.startTime)+'-'+eachday} style={{backgroundColor: this.state.color}} onClick={this.addAvailability}></div>));
            slots[eachday] = slot;
        }
        if(this.state.meetingDays.length != 0){
            days = this.state.meetingDays.map(day => <div id = {day}><div className="day">{day}</div><div id={day} className= "slots">{slots[day]}</div></div>);
        }



        if (Object.keys(this.state.availability).length !== 0 && days.length !== 0) {
            for (const value of Object.values(this.state.availability)) {
                let day = value.day;
                let hour = value.hour;
                let color = 0;
                if (value.priority === 1)
                    color = "#aafcfd"
                else if (value.priority === 2)
                    color = '#31f9fc'
                else
                    color = '#018788'
                //console.log(day,hour);
                //console.log(days.find(x => x.props.id === day).props.children[1]);
                // Change color by getting the day column, then hour column to reach in the individual slot
                //days.find(x => x.props.id === day).props.children[1].props.children.find(x => x.props.id === hour).props.style.backgroundColor = color;
                days.find(x => x.props.id === day).props.children[1].props.children.find(x => x.props.id.split('-')[0] === hour).props.style.backgroundColor = color;
            }
        }

        let daysOut = [];
        daysOut.push(days.slice(this.state.index*7, this.state.index*7+7));

        return (
            <div>
            <div className="flex-container">
                <div className="changePriority">
                    <p>meeting id:{this.state.meetingID}</p>
                    <p>meeting name:{this.state.meetingName}</p>
                    <p> Mark your preferences</p>
                    <button className="changePriority_2" id={3} onClick={this.changePriority}>High</button>
                    <button className="changePriority_1" id={2} onClick={this.changePriority}>Middle</button>
                    <button className="changePriority_0" id={1} onClick={this.changePriority}>Low</button>
                </div>
                {this.state.index !== 0 && <button id = 'prev' onClick = {this.toggle}>Previous</button>}
                {hours.length ? <div className="hours">{hours}</div> : null}{daysOut}
                {this.state.index !== Math.floor(this.state.meetingDays.length/8) && <button id = 'next' onClick = {this.toggle}>Next</button>}
            </div>
                <button className="save" onClick={this.pushToFirebase}>{this.state.edit ? 'Save' : 'Edit'}</button>
                <button className="create" onClick={this.handleHome}>Home</button>
                {this.state.userID == this.state.creatorID ?
                    <div>
                        <Invite creatorID={this.state.creatorID}
                                meetingID={this.state.meetingID}
                                meetingName={this.state.meetingName}
                                showT={true}
                                showI={this.state.decided}/>
                    </div> : null}
                {this.state.meetingDays ?
                    <div><MasterCalendar
                        meetingID = {this.state.meetingID}
                        meetingDays = {this.state.meetingDays}
                        startTime = {this.state.startTime}
                        endTime = {this.state.endTime}
                    /></div>
                    : null}

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