import React, { useCallback } from "react";
import db from "../base";
import '../App.css';

const SignUp = ({ history }) => {

    const handleSignUp = (event) => {
        event.preventDefault();
        const { email, password,preferred_name } = event.target.elements;
        let meetingIDs = [];
        let userIDs = [];
        try{
            db
                .auth()
                .createUserWithEmailAndPassword(email.value,
                    password.value).then(function(user){
                db.auth().currentUser.updateProfile({
                    displayName: preferred_name.value
                });

                db.database().ref("UserInfo").child(db.auth().currentUser.uid).set({
                    id: db.auth().currentUser.uid,
                    name: preferred_name.value,//db.auth().currentUser.displayName,
                    email: db.auth().currentUser.email,//db.auth().currentUser.email
                    //meeting: []
                })

                db.database().ref("UserInfo").once('value').then((snapshot) => {
                    if (snapshot.val() != null && snapshot.child("invitations").val()!= null) {
                        let invitations = Object.entries(snapshot.child("invitations").val());
                        for (const id in invitations) {
                            const meetingID = invitations[id];
                            const isEmail = (element) => element == db.auth().currentUser.email;
                            const index = meetingID[1].invEmail.findIndex(isEmail);
                            if(index !== -1){
                                console.log("signup");
                                console.log(meetingID[0]);
                                meetingIDs.push(meetingID[0]);
                                db.database().ref("meetings").once('value').then((snapshot) => {
                                    if (snapshot.val() != null && snapshot.child(meetingID[0]).val() != null) {
                                        if(snapshot.child(meetingID[0]).child("userIDs").val() != null){
                                            userIDs= snapshot.child(meetingID[0]).child("userIDs").val();
                                        }
                                    }
                                    console.log("current");
                                    console.log(userIDs);
                                    userIDs.push(db.auth().currentUser.uid);
                                    db.database().ref("meetings").child(meetingID[0]).update({userIDs});
                                })
                                invitations[id][1].splice(index, 1);
                                if(invitations[id][1].length == 0){
                                    invitations.splice(id, 1);
                                }
                            }
                        }
                        db.database().ref("UserInfo/").update({invitations});
                        db.database().ref("UserInfo/"+db.auth().currentUser.uid).update({meetingIDs});
                    }
                })
            }).catch(function(error) {
                console.log(error);
            });
            history.push("/");



        } catch(error){
            alert(error);
        }
    }



    const redirectLogIn = () =>{
        history.push("/")
    }
    return(
        <div className="centered">
            <h1>Sign Up</h1>
            <form onSubmit={handleSignUp}>
                <label>
                    Email
                    <input name="email" type="email" placeholder="Email" />
                </label>
                <label>
                    Password
                    <input name="password" type="password" placeholder="Password" />
                </label>
                <label>
                    Preferred Name
                    <input name="preferred_name" type="preferred_name" placeholder="Preferred name" />
                </label>
                <button type="submit" > Sign Up</button>
            </form>
            <button onClick={redirectLogIn}>Log In</button>
        </div>
    );

};

export default SignUp;