import React, {Component} from 'react';
import db from '../base';
import DayPicker, { DateUtils } from 'react-day-picker';
import "../style.css";
//import 'react-day-picker/lib/style.css';
//https://react-day-picker.js.org/examples/selected-multiple/
import { Redirect } from "react-router-dom";
import Invite from "./Invite";

class Meeting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: this.props.location.state.userID,
            creatorID: this.props.location.state.creatorID,
            meetingID: '',
            meetingIDs: this.props.location.state.meetingIDs,
            meetingName: '',
            meetingNames: this.props.location.state.meetingNames,
            setDate: '',
            setTime: '',
            startTime: 9,
            endTime: 24,
            meetingDays: [],
            decided: false,
            decidedM: this.props.location.state.decidedM,
            showF: false,
            showT: false
        };


        //console.log(this.state.meetingIDs);
        this.handleDayClick = this.handleDayClick.bind(this);
        this.pushToFirebase = this.pushToFirebase.bind(this);
        this.redirectHome = this.redirectHome.bind(this);
        this.handleWeekClick = this.handleWeekClick.bind(this);
        this.handleMenu = this.handleMenu.bind(this);
        this.setWindow = this.setWindow.bind(this);
        this.convertTo12Hr = this.convertTo12Hr.bind(this)


    }

    componentDidMount() {
        this.firebaseRef_U = db.database().ref("UserInfo/"+this.state.creatorID);
        this.firebaseRef = db.database().ref("meetings");
        this.firebaseRef.once('value').then((snapshot) => {
            if (snapshot.val() != null && snapshot.child("MEETINGID").val() != null) {
                this.setState({
                    meetingID: snapshot.child("MEETINGID").val(),
                });
            }
        })
    }

    handleDayClick(day, { selected }) {
        const { meetingDays } = this.state;
        if (selected) {
            const selectedIndex = meetingDays.findIndex(selectedDay =>
                DateUtils.isSameDay(selectedDay, day)
            );
            meetingDays.splice(selectedIndex, 1);
        } else {
            meetingDays.push(day);
        }
        this.setState({ meetingDays});
        //console.log(meetingDays);
    }

    handleWeekClick = (weekNumber, days, e) => {
        const { meetingDays } = this.state;
        //console.log(weekNumber)
        let weekIncluded = true;
        let included = [];

        for(const day of days){
            const dayIndex = meetingDays.findIndex(selectedDay =>
                DateUtils.isSameDay(selectedDay, day));
            if(dayIndex == -1){
                included.push(false);
                weekIncluded = false;
            }else{
                included.push(true);
            }
        }

        if(weekIncluded){
            for(const day of days){
                const dayIndex = meetingDays.findIndex(selectedDay =>
                    DateUtils.isSameDay(selectedDay, day));
                meetingDays.splice(dayIndex, 1);
            }
        }else{
            for(let id = 0; id < days.length; id++){
                if(!included[id]){
                    meetingDays.push(days[id]);
                }
            }
        }

        this.setState({ meetingDays});
        //console.log(this.state.meetingDays)
    };

    handleMenu(event){
        let id = event.target.getAttribute('id');
        if(id == 0){
            this.setState({
                showF: true,
                showT: false,
            });
        }else{
            this.setState({
                showF: false,
                showT: true,
            });
        }
    }

    setWindow(event){
        const{ startTime, endTime } = this.state;

        let id = Number(event.target.getAttribute('id'));
        let parent = event.target.parentElement.getAttribute('id');

        //console.log(startTime)
        //console.log(endTime)
        //console.log(id)
        //console.log(parent)
        if(parent == 0){
            if(id >= endTime){
                alert("???Your meeting window end time is earlier than start time")
            }else{
                this.setState({
                    startTime: id,
                })
            }

        }else{
            if(startTime >= id){
                alert("///Your meeting window end time is earlier than start time")
            }else{
                this.setState({
                    endTime: id,
                })
            }

        }
    }

    convertTo12Hr(hour) {
        hour = Number(hour);
        var AMPM = (hour < 12) ? " AM" : (hour == 24) ? " AM" : " PM";
        var h = (hour % 12) || 12;
        return h + AMPM;
    }

    componentWillUnmount() {
        this.firebaseRef.off();
        this.firebaseRef_U.off();
    }

    pushToFirebase(event) {

        const {creatorID, meetingID, meetingIDs, meetingName, meetingNames, setDate, setTime, startTime, endTime, meetingDays,
            decided, decidedM} = this.state;
        event.preventDefault();

        //check if meetingDays is empty
        if (meetingDays.length === 0){
            alert("You must pick at least one day");
            return;
        }
        if(meetingName == null){
            alert("You must enter a meeting name");
            return;
        }
        for (const [index, value] of meetingDays.entries()) {
            meetingDays[index] = meetingDays[index].toLocaleDateString();
        }
        //sort meetingDays
        //sort meetingDays
        meetingDays.sort(function (a,b) {
            a = a.split('/').reverse();
            if (a[1] < 10){
                a[1] = '0'+a[1];
            }
            a = a[0]+a[2]+a[1];
            b = b.split('/').reverse();
            if (b[1] < 10){
                b[1] = '0'+b[1];
            }
            b = b[0]+b[2]+b[1];
            return a > b ? 1 : a < b ? -1 : 0;
        })
        let MEETINGID = String(Number(meetingID)+1);
        this.firebaseRef.update({MEETINGID});

        this.firebaseRef.child(meetingID).update({creatorID, meetingID, meetingName, setDate, setTime, startTime, endTime, meetingDays,
            decided});

        this.setState({
            meetingIDs: meetingIDs.push(meetingID),
            meetingNames: meetingNames.push(meetingName),
            decidedM: decidedM.push(decided)
        })
        this.firebaseRef_U.update({meetingIDs});

        this.setState({
            creatorID: '',
            meetingID: '',
            meetingIDs: [],
            meetingName: '',
            meetingNames: [],
            setDate: '',
            setTime: '',
            startTime: '',
            endTime: '',
            meetingDays: [],
            decided: false,
            decidedM: [],
            showF: false,
            showT: false
        });

        this.createMeeting();
    }

    createMeeting(){
        this.props.history.push({
            pathname:"/Calendar",
            state:{
                creatorID: this.state.creatorID,
                meetingID: this.state.meetingID,
                userID: this.state.userID,
            }
        });
        return <Redirect to="/Calendar" />;
    }

    redirectHome(){
        this.props.history.push("/");
        return <Redirect to="/" />;
    }

    render(){
        let AM = []
        let PM = []
        Array.from({length: 24}, (_, i) => AM.push(<div className="dropdown-button" id = {i+1} onClick={this.setWindow}>{this.convertTo12Hr(i+1)}</div>));
        //Array.from({length: 12}, (_, i) => PM.push(<button id = {i+13} onClick={this.setWindow}>{i+1}PM</button>));

        return(
            <div className = "select">
                <label className="listObject">Select Meeting Days</label>
                <div><DayPicker
                    showWeekNumbers
                    selectedDays={this.state.meetingDays}
                    onDayClick={this.handleDayClick}
                    onWeekClick={this.handleWeekClick}
                /></div>

                <div className="dropdown" >
                    <button className="dropbtn">From: {this.convertTo12Hr(this.state.startTime)}</button>
                    <div className="dropdown-content" id = {0}>{AM}{PM}</div>
                </div>
                <div className="dropdown" >
                    <button className="dropbtn">To: {this.convertTo12Hr(this.state.endTime)}</button>
                    <div className="dropdown-content" id = {1}>{AM}{PM}</div>
                </div>
                <br />
                <div>
                    <label className="listObject">What is the name of this meeting?</label>
                    <input onChange= {e =>this.setState({meetingName : e.target.value})} />
                </div>

                <button onClick={this.pushToFirebase}>Create Meeting</button>
                <button onClick={this.redirectHome}>Cancel</button>
            </div>
        );
    }



}

export default Meeting;
