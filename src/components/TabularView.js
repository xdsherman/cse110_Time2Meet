import React, {Component} from 'react';

class TabularView extends Component {
    constructor(state) {
        super(state)
        this.state = {
            usernameList: this.props.usernameList,
            emailList: this.props.emailList,
            meetingName: this.props.meetingName,
            meetingDate1: this.props.meetingDate1,
            meetingDate2: this.props.meetingDate2,
            meetingDate3: this.props.meetingDate3,

            // probably extract this from the database
            meetingDecided: this.props.meetingDecided
        }
    }

    sendEmail(selectedDate) {
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
    }

    render() {
        // if meeting has been decided, don't show the table
        var content;
        if (this.state.meetingDecided === true) {
            content = "Meeting has been scheduled already";
        }
        // else show the table and add set meeting buttons
        else {
            content = 
                <ul>
                    <li>
                        {this.state.meetingDate1}
                        <button onClick={() => this.sendEmail(this.state.meetingDate1)}>
                            Set Meeting and Email Participants
                        </button>
                    </li>
                    <li>
                        {this.state.meetingDate2}
                        <button onClick={() => this.sendEmail(this.state.meetingDate2)}>
                            Set Meeting and Email Participants
                        </button>
                    </li>
                    <li>
                        {this.state.meetingDate3}
                        <button onClick={() => this.sendEmail(this.state.meetingDate3)}>
                            Set Meeting and Email Participants
                        </button>
                    </li>
                </ul>
        }

        return (
            <div>
                <h2>Suggested Meeting Times</h2>
                <div id="suggestionsTable">
                    {content}
                </div>
            </div>
        );
    }
}

export default TabularView; 