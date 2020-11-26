import React, {Component} from 'react';
import emailjs from 'emailjs-com';

export default function email() {

    // need to access db to get names, emails, meeting name, meeting date
    var usernameList = ["Calvin", "Calvin2"];
    var emailList = ["cac006@ucsd.edu", "moistbanana123@gmail.com"];
    var meetingName = "Test Meeting";
    var meetingDate = "12/12/2020";

    function sendEmail(e) {
        e.preventDefault();

        // populate formfields to send email
        document.getElementById("meeting_name_field").value = meetingName;
        document.getElementById("meeting_date_field").value = meetingDate;
        for (let i = 0; i < emailList.length; i++) {
            // change username and email for each email
            document.getElementById("username_field").value = usernameList[i];
            document.getElementById("email_field").value = emailList[i];
            
            // send email
            emailjs.sendForm('service_5z6owfz', 'contact_form', e.target, 'user_afExeUlzmWRabJUP88WuS')
            .then((result) => {
                console.log(result.text);
            }, (error) => {
                console.log(error.text);
            });
        }
    }

    // hidden form field with submit button
    return (
        <form className="contact-form" onSubmit={sendEmail}>
        <input id="username_field" type="hidden" name="username"/>
        <input id="email_field" type="hidden" name="to_email"/>
        <input id="meeting_name_field" type="hidden" name="meeting_name"/>
        <input id="meeting_date_field" type="hidden" name="meeting_date"/>
        <input type="submit" value="Set Meeting and Email Participants" />
        </form>
  );
}