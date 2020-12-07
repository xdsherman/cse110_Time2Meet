import React, {useContext} from "react";
import '../App.css';

import {AuthContext} from "../auth/Auth";
import { Redirect } from "react-router-dom";
//import db from "../base";
import db , { provider2 } from "../base"
const Login = ({history}) => {

    const handleLogin = (event) => {
        event.preventDefault();
        const { email, password } = event.target.elements;

        try{
            db
                .auth()
                .signInWithEmailAndPassword(email.value,
                    password.value);
            history.push("/");
        } catch(error){
            alert(error);
        }
    }
    const handleLoginWithGoogle = () => {
        let meetingIDs = [];
        let userIDs = [];
        try{
            db
                .auth()
                .signInWithPopup(provider2).then(function(user){
                    if (user.additionalUserInfo.isNewUser){
                db.database().ref("UserInfo").child(db.auth().currentUser.uid).set({
                    id: db.auth().currentUser.uid,
                    name: db.auth().currentUser.displayName,//db.auth().currentUser.displayName,
                    email: db.auth().currentUser.email,//db.auth().currentUser.email
                    meeting: []
                })}
                db.database().ref("UserInfo").once('value').then((snapshot) => {
                    if (snapshot.val() != null && snapshot.child("invitations").val()!= null) {
                        if(snapshot.child(db.auth().currentUser.uid) != null && snapshot.child(db.auth().currentUser.uid).child("meetingIDs").val()!= null){
                            meetingIDs = snapshot.child(db.auth().currentUser.uid).child("meetingIDs").val();
                        }
                        let invitations = Object.entries(snapshot.child("invitations").val());
                        let datasnapshot = snapshot.child("invitations").val()
                        console.log(invitations)
                        console.log(datasnapshot)
                        for (const id in invitations) {
                            console.log(id);

                            const meetingID = invitations[id];
                            //meetingID[0] is the meeting id
                            //meetingID[1] is the array of {'ivEmail' : ...}
                            //meetingID[1].invEmail is the array of emails
                            //console.log(meetingID[0])
                            //console.log(meetingID[1])
                            //console.log(meetingID[1].invEmail)
                            const isEmail = (element) => element == db.auth().currentUser.email;
                            const index = meetingID[1].invEmail.findIndex(isEmail);
                            if(index !== -1){
                                //console.log("signup");
                                //console.log(meetingID[0]);
                                meetingIDs.push(meetingID[0]);
                                db.database().ref("meetings").once('value').then((snapshot) => {
                                    if (snapshot.val() != null && snapshot.child(meetingID[0]).val() != null) {
                                        if(snapshot.child(meetingID[0]).child("userIDs").val() != null){
                                            userIDs= snapshot.child(meetingID[0]).child("userIDs").val();
                                        }
                                    }
                                    //console.log("current");
                                    //console.log(userIDs);
                                    userIDs.push(db.auth().currentUser.uid);
                                    db.database().ref("meetings").child(meetingID[0]).update({userIDs});
                                })
                                //console.log(invitations[id])
                                datasnapshot[meetingID[0]].invEmail.splice(index, 1);
                                //invitations[id][1].invEmail.splice(index, 1);
                                if(datasnapshot[meetingID[0]].invEmail.length == 0){
                                    datasnapshot.splice(id, 1);
                                    //invitations.splice(id, 1);
                                }
                            }
                        }

                        //console.log(invitations.values())
                        db.database().ref("UserInfo/").update({invitations: datasnapshot});
                        db.database().ref("UserInfo/"+db.auth().currentUser.uid).update({meetingIDs});
                    }
                })
            }).catch(function(error) {
                alert(error);
            });
            history.push("/");
        } catch (error){
            alert(error);
        }
    }

    const redirectSignUp = () => {
        history.push("/signup")
    }
    const redirectForgotPassword = () => {
        history.push("/forgotpassword")
    }

    const { currentUser } = useContext(AuthContext);
    if (currentUser) {
        return <Redirect to="/" />;
    }

    return(
        <div className="centered">
            <div className="row">
                <h1>Log In</h1>
                <form onSubmit={handleLogin}>
                    <label>
                        Email
                        <input name="email" type="email" placeholder="Email" />
                    </label>
                    <label>
                        Password
                        <input name="password" type="password" placeholder="Password" />
                    </label>

                    <button type="submit"> Log In</button>

                </form>
                <button onClick={handleLoginWithGoogle}>Log In with Google</button>
                <button onClick={redirectSignUp}>Sign UP</button>
                <button onClick={redirectForgotPassword}>Forgot Password</button>
            </div>
        </div>
    );
};

export default Login;
