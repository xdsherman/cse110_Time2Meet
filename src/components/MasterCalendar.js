import React, {Component} from 'react';
import db from '../base';
import TabularView from './TabularView';

class MasterCalendar extends Component {
    constructor(state) {
        super(state)
        this.state = {
            meetingID: this.props.meetingID,
            meetingDays: this.props.meetingDays,
            availabilities: {},
        }
        this.firebaseRef = db.database().ref("availability/"+this.state.meetingID);
        this.hover = this.hover.bind(this);
    }
    componentWillUnmount() {
        this.firebaseRef.off();
    }
    componentDidMount() {
        this.firebaseRef.on('value', (snapshot)=> {
            let avaArray = {};
            if (snapshot.val() != null) {
                for (const [user,ava] of Object.entries(snapshot.val())) {
                    for (const each of Object.values(ava.availability)) {
                        let key = each.day + '-' + each.hour;
                        if (avaArray[key] === undefined) {
                            avaArray[key] = {}
                            avaArray[key]["priority"] = each.priority;
                            avaArray[key]["users"] = [user];
                        } else {
                            avaArray[key]["priority"] += each.priority;
                            avaArray[key]["users"].push(user);
                        }
                    }
                }
                this.setState({
                    availabilities: avaArray
                })
            }
        })
    }

    hover(event){
        let key = event.target.getAttribute('id');
        const {availabilities} = this.state;
        if (key in availabilities){
           alert(availabilities[key]["users"] + ": " + availabilities[key]["priority"]);
        }
    }
    
    render() {
        let slots = {};
        let hours = [];
        Array.from({length: 24}, (_, i) => hours.push(<div>{i+1}</div>));
        // Create individual slot with unique id instead of sharing the same slots array between all columns (this is to create a unique slot to change color, initially all columns were sharing the same slot)
        for (const eachday of this.state.meetingDays){
            var slot = [];
            Array.from({length: 24}, (_, i) =>
                slot.push(<div id ={eachday+'-'+i} style={{backgroundColor: this.state.color}} onClick={this.hover}></div>));
            slots[eachday] = slot;
        }
        let days = this.state.meetingDays.map(day => <div id = {day}><div className="day">{day}</div><div id={day} className= "slots">{slots[day]}</div></div>);
        if (this.state.availabilities.length !== 0) {
            var highest = 1;
            // loop to find the upper bound priority counts in the calendar
            for (const [key,value] of Object.entries(this.state.availabilities)) {
                let priority = value.priority;
                if (priority > highest) {
                    highest = priority;
                }
            }
            // loop again to color timeslots accordingly
            for (const [key,value] of Object.entries(this.state.availabilities)) {
                let day = key.split("-")[0];
                let hour = key.split("-")[1];
                let priority = value.priority;
                // darkest color is rgb(50,50,50), lightest is rgb(200,200,200), range=150
                let stepsize = 150/highest;
                let rgbVal = 200 - (stepsize * priority);
                let color = `rgb(${rgbVal}, ${rgbVal}, ${rgbVal})`;
                // assign color
                let slot = days.find(x => x.props.id === day).props.children[1].props.children[hour];
                slot.props.style.backgroundColor = color;
            }
        }
        return (
            <div>
                <div class="flex-container"><div className="hours">{hours}</div> {days}</div>

                <TabularView 
                    meetingID={this.state.meetingID}
                    usernameList={["Calvin"]}
                    emailList={["cac006@ucsd.edu"]}
                    meetingName={"Team Meeting"}
                    userID="xx"
                    meetingCreatorID="xx"
                />
            </div>
        );
    }
}
export default MasterCalendar;