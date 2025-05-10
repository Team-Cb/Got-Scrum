import ReactDOM from "react-dom/client";
import Estimation from "./estimation";
import "../../../client/dist/css/common.css"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
// import { CreateRoom } from "./home";
import { useEffect, useState } from "react";
import User from "./User";
import JoinRoom from "./home";
const App = () => { // displays page based on functions and url
	const [clickUid, setClickUid] = useState("");
	const [allClick, setallClick] = useState("");
	let users: User[] = [];
	for (let i = 0; i < 6; i++) {
		if (localStorage.getItem(`user${i}`)) {
			users.push(JSON.parse(localStorage.getItem(`user${i}`)!) as User);
		} else users.push(new User("", ""))
	}
	let connection: WebSocket;
	if (window.location.protocol == "https:") {
		connection = new WebSocket(`wss://${window.location.host.split(":")[0]}:3030`);
	} else {
		connection = new WebSocket(`ws://${window.location.host.split(":")[0]}:3030`);
	}
	useEffect(() => {
		connection.onopen = () => {
			console.log("connection opened to the server...");
		};
		// Handle error
		connection.onerror = () => {
			console.error("WS error");
		};
		// Handle server message
		connection.onmessage = (inMessage: any) => {
			// Split message into underscores
			const messageParts: string[] = inMessage.data.split("_");
			// index 0 is message type
			const messageType = messageParts[0];
			switch (messageType) {
				case "ping":
					sendMessage(`pong`)
					break;
				case "connected":
					let storedUID = localStorage.getItem("UID")

					if (storedUID == null || storedUID == "null") {
						localStorage.setItem("UID", messageParts[1]);
						storedUID = localStorage.getItem("UID");
					}
					sendMessage(`connected_${storedUID}_${(localStorage.getItem("name") === null) ? "" : localStorage.getItem("name")}`)
					break;
				case "update":
					setClickUid(messageParts[1]);
					break;
				case "estimated":
					setallClick(messageParts[1]);
					break;
				case "refresh":
					window.location.reload();
					break;
				case "add-user":
					let need = true;
					if (messageParts[1] == localStorage.getItem("UID")) {
						if (users.at(0)?.uid == messageParts[1] || users.at(0)?.name == "") {
							need = false;
						}
						if (need) {
							users.unshift(new User(messageParts[1], messageParts[2]));
						}
					}
					else {
						if (messageParts[2] == "") {
							need = false;
						}
						users.forEach(user => {
							if (user.getUID() == messageParts[1]) {
								need = false;
							}
						})
						if (need) {
							users.push(new User(messageParts[1], messageParts[2]));
						}
					}
					users.forEach((user, i) => {
						if (i < 6) {
							localStorage.setItem(`user${i}`, JSON.stringify(user))
						}
					})
					if (need) {
						window.location.reload();
					}
					break;
				case "remove":
					users.forEach((user, i) => {
						localStorage.removeItem(`user${i}`)
						if (user.getUID() == messageParts[1]) {
							users.splice(i, 1);
						}
					})
					users.forEach((user, i) => {
						if (i < 6) {
							localStorage.setItem(`user${i}`, JSON.stringify(user))
						}
					})
					window.location.reload();
					break;
				case "voted":
					users.forEach((user, i) => {
						if (messageParts[1] == user.getUID()) {
							user.setPoints(parseInt(messageParts[2]))
							localStorage.setItem(`user${i}`, JSON.stringify(user))
						}
					})
					window.location.reload()
					break;
				case "resetPoints":
					users.forEach((user, i) => {
						user.points = -2
						localStorage.setItem(`user${i}`, JSON.stringify(user))
					})
					window.location.reload();
					break
				default:

					break;
			}
		};
	}, []);

	const sendMessage = (message: string) => {
		if (connection.readyState == connection.OPEN) {
			console.log(`WS message sent: ${message}`);
			connection.send(message);
		}
	};

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<JoinRoom sendMessage={sendMessage} />} />
				{/* <Route path="/create-room" element={<CreateRoom sendMessage={sendMessage} />} /> */}
				<Route path="/estimate" element={<Estimation sendMessage={sendMessage} />} />
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</BrowserRouter>
	)
};
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<App />);
