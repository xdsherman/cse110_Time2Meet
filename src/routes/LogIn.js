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
