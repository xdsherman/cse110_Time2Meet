import React, {Component} from 'react';
import db from '../base';

class TabularView extends Component {
    constructor(state) {
        super(state)
        this.state = {
            meetingID: this.props.meetingID,
            usernameList: this.props.usernameList,
            emailList: this.props.emailList,
            meetingName: this.props.meetingName,

            userID: this.props.userID,
            meetingCreatorID: this.props.meetingCreatorID,

            meetingData: [],

            // for calculating top 3 suggested meetingtimes
            availabilities: {},
            bestTimes: []
        }
        
        this.firebaseMeetingsRef = db.database().ref("meetings/"+this.state.meetingID);
        this.firebaseAvailabilitiesRef = db.database().ref("availability/"+this.state.meetingID);
    }
    componentWillUnmount() {
        this.firebaseMeetingsRef.off();
        this.firebaseAvailabilitiesRef.off();
    }
    componentDidMount() {
        // read meeting table in database
        this.firebaseMeetingsRef.on('value', (snapshot) => {
            this.setState({
                meetingData: snapshot.val()
            });
        });

        // calculate top 3 times
        this.firebaseAvailabilitiesRef.on('value', (snapshot)=> {
            let avaArray = {};
            if (snapshot.val() != null) {
                for (const [user,ava] of Object.entries(snapshot.val())) {
                    for (const each of Object.values(ava.availability)) {
                        let key = each.day + ' ' + this.convertTo12Hr(each.hour);
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
                var sortable = [];
                for (let key in avaArray) {
                    sortable.push([key, avaArray[key]["priority"]]);
                }
                sortable.sort(function (a, b) {
                    return b[1] - a[1];
                });
                sortable = sortable.slice(0, 3);
                var bestTimes = [];
                for (let key in sortable) {
                    bestTimes.push(sortable[key][0]);
                }
                this.setState({
                    bestTimes: bestTimes,
                    availabilities: avaArray
                })
            }
        });
    }

    convertTo12Hr(hour) {
        var AMPM = (hour < 12) ? "AM" : "PM";
        var h = (hour % 12) || 12;
        return h + AMPM;
    }

    sendEmail(selectedDate) {
        var split = selectedDate.split(' ');
        var date = split[0];
        var time = split[1];
        // set the date and time in the database
        db.database().ref('meetings/' + this.state.meetingID).update({
            decided: true,
            setDate: date,
            setTime: time
        });

        // uncomment this for email functionality
        /*
        // send emails to each user in the meeting through emailjs API
        for (let i = 0; i < this.state.usernameList.length; i++) {
            // create http post request
            var http = new XMLHttpRequest();
            var url = 'https://api.emailjs.com/api/v1.0/email/send';
            var data = {
                service_id: 'service_5z6owfz',
                template_id: 'contact_form',
                user_id: 'user_afExeUlzmWRabJUP88WuS',
                template_params: {
                    'username': this.state.usernameList[i],
                    'to_email': this.state.emailList[i],
                    'meeting_name': this.state.meetingName,
                    'meeting_date': selectedDate
                }
            }
            http.open('POST', url, true);
            http.setRequestHeader('Content-type', 'application/json');
            http.onreadystatechange = function() {
                // if successful, remove suggestions table
                if(http.readyState === 4 && http.status === 200) {
                    document.getElementById("suggestionsTable").innerText = 
                        "Participants emailed successfully! Meeting has been scheduled for: " + selectedDate;
                }
            }
            http.send(JSON.stringify(data));
        }
        */
    }
    
    render() {
        var meeting1, meeting2, meeting3;

        // if meeting has been decided, don't show the table
        if (this.state.meetingData.decided === true) {
            document.getElementById("suggestionsTable").innerText =
                `This meeting has been scheduled for ${this.state.meetingData.setDate} at ${this.state.meetingData.setTime}.`;
        }
        // else render the table
        else {
            if (this.state.bestTimes[0] != null) {
                meeting1 = 
                    <li>
                        {this.state.bestTimes[0]}
                        <button onClick={() => this.sendEmail(this.state.bestTimes[0])}>
                            Set Meeting and Email Participants
                        </button>
                    </li>;
            }
            if (this.state.bestTimes[1] != null) {
                meeting2 = 
                    <li>
                        {this.state.bestTimes[1]}
                        <button onClick={() => this.sendEmail(this.state.bestTimes[1])}>
                            Set Meeting and Email Participants
                        </button>
                    </li>;
            }
            if (this.state.bestTimes[2] != null) {
                meeting3 = 
                    <li>
                        {this.state.bestTimes[2]}
                        <button onClick={() => this.sendEmail(this.state.bestTimes[2])}>
                            Set Meeting and Email Participants
                        </button>
                    </li>;
            }
        }

        return (
            <div>
                <h2>Suggested Meeting Times</h2>
                <div id="suggestionsTable">
                    <ul>
                        {meeting1}
                        {meeting2}
                        {meeting3}
                    </ul>
                </div>
            </div>
        );
    }
}

export default TabularView; 