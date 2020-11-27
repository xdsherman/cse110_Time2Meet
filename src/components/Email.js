import React, {Component} from 'react';

class Email extends Component {
    constructor(props) {
        super(props);
    }

    sendEmail() {
        var http = new XMLHttpRequest();
        var url = 'https://api.emailjs.com/api/v1.0/email/send';
        var data = {
            service_id: 'service_5z6owfz',
            template_id: 'contact_form',
            user_id: 'user_afExeUlzmWRabJUP88WuS',
            template_params: {
                'username': this.props.usernameList[0],
                'to_email': this.props.emailList[0],
                'meeting_name': this.props.meetingName,
                'meeting_date': this.props.meetingDate
            }
        }
        http.open('POST', url, true);
        http.setRequestHeader('Content-type', 'application/json');
        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                alert(http.responseText);
            }
        }
        http.send(JSON.stringify(data));
    }

    render() {
        return (
            <button onClick={this.sendEmail.bind(this)}>Send email</button>
        );
    }
}

export default Email;