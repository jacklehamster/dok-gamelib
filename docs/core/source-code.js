class SourceCode {
	render(config) {
		const sourceCode = document.getElementById("source-code");
		sourceCode.innerText = config;
	}
}