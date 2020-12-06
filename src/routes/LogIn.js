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
                        for (const meetingID of Object.entries(snapshot.child("invitations").val())) {
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
                            }
                        }
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
