import React, {Component} from 'react';
import db from '../base';
import DayPicker, { DateUtils } from 'react-day-picker';
import 'react-day-picker/lib/style.css';
//https://react-day-picker.js.org/examples/selected-multiple/
import { Redirect } from "react-router-dom";

class Meeting extends Component {
    constructor(props) {
        super(props);
        this.firebaseRef = db.database().ref("meetings");
        this.handleDayClick = this.handleDayClick.bind(this);
        this.pushToFirebase = this.pushToFirebase.bind(this);
        this.state = {
            meetingID: '00',
            setDate: '',
            setTime: '',
            meetingLength: '',
            meetingDays: [],
            eventLink: '',
            decided: false,
            recurring: 0,
            userID: []
        };
    }
    //TODO: invite users


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
    }

    componentWillUnmount() {
        this.firebaseRef.off();
    }

    pushToFirebase(event) {
        const {meetingID, setDate, setTime, meetingLength, meetingDays,
            eventLink, decided, recurring} = this.state;
        event.preventDefault();

        //TODO: check if meetingDays is empty
        for (const [index, value] of meetingDays.entries()) {
            meetingDays[index] = meetingDays[index].toLocaleDateString();
        }
        this.firebaseRef.child(meetingID).set({meetingID, setDate, setTime, meetingLength, meetingDays,
            eventLink, decided, recurring});
        console.log(this.firebaseRef.child(meetingID));
        this.setState({
            meetingID: '00',
            setDate: '',
            setTime: '',
            meetingLength: '',
            meetingDays: [],
            eventLink: '',
            decided: false,
            recurring: '0'
        });

        this.createMeeting();
    }

    createMeeting(){
        this.props.history.push({
            pathname:"/Calendar",
            state:{
                meetingID: this.state.meetingID,
                meetingDays: this.state.meetingDays
            }
        });
        return <Redirect to="/Calendar" />;
    }

    render(){
        return(
            <div>
                <label>Select Meeting Days</label>
                {/*TODO: select week*/}
                <DayPicker
                    selectedDays={this.state.meetingDays}
                    onDayClick={this.handleDayClick}
                />
                {/*TODO: checkbox first*/}
                <label>How many times will this meeting recur?</label>
                <input onChange= {e =>this.setState({recurring : e.target.value})} />
                <br />
                <button onClick={this.pushToFirebase}>Create Meeting</button>
            </div>
        );
    }



}

export default Meeting;

