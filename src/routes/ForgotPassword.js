import React, { useContext } from "react";
import db from "../base";
import "./style/forgotPassword.css";
import logo from "./resource/time2meet_logo.png";

const ForgotPassword = ({ history }) => {
	const handleForgotPassword = (event) => {
		//console.log("Hello");
		event.preventDefault();
		const { email } = event.target.elements;
		try {
			db.auth().sendPasswordResetEmail(email.value).catch(function(error) {
				alert(error["message"]);
				history.push("/forgotpassword");
            });
			history.push("/");
		} catch (error) {
			alert(error);
		}
	};

	const redirectLogIn = () => {
		history.push("/");
	};

	return (
		<form className="login" onSubmit={handleForgotPassword}>
			<img src={logo} alt=""></img>
			<input type="text" name="email" placeholder="user email" />
			<input
				type="submit"
				value="Reset Password"
			></input>
			<div className="link" onClick={redirectLogIn}>
				Go back to log in
			</div>
		</form>
	);
};

export default ForgotPassword;