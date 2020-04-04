class Log {
	static status(...msg) {
		if (!window.logStatus) {
			const logStatusDiv = document.body.appendChild(document.createElement("div"));
			logStatusDiv.style.display = "flex";
			const logStatusText = logStatusDiv.appendChild(document.createElement("div"));
			const logStatusCount = logStatusDiv.appendChild(document.createElement("div"));
			logStatusCount.style.marginLeft = "10px";
			logStatusCount.style.color = "#007700";

			window.game.engine.addEventListener("loop", now => {
				logStatusText.innerText = "";
				logStatusCount.innerText = "";
				for (let msg in window.logStatus.messages) {
					logStatusText.innerText += `${msg}\n`;
					logStatusCount.innerText += `${window.logStatus.messages[msg].count>1 ? window.logStatus.messages[msg].count : ""}\n`;
					if (window.logStatus.messages[msg].tagged > 100) {
						delete window.logStatus.messages[msg];
					} else {
						window.logStatus.messages[msg].tagged ++;
					}
				}
			});
			window.logStatus = {
				messages: {},
			};
		}
		const newMessage = msg.join(" ");
		if (window.logStatus.messages[newMessage]) {
			window.logStatus.messages[newMessage].count++;
			window.logStatus.messages[newMessage].tagged = 0;
		} else {
			window.logStatus.messages[newMessage] = {
				tagged: 0,
				count: 1,
			};
		}
	}
}