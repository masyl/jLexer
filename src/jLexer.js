/*

jLexer

jLexer is a javascript "lexing" library.

jLexer takes javascript source code as input and creates an object oriented structure out of it.

Goal Features:
	- Offer an code object model flexible enough to do code analysis
	- Serialize and deserialize javascript code in a lossless manner
	- Can securelly sanitize code and prevent the use of specific keywords, statement or functions (ex.: eval)

*/

(function($) {

	var jLexer = function jLexer(options) {
		this.options = options;
		this.model = {};
		this.code = "";
	};

	jLexer.languages = {};

	jLexer.addLanguage = function addLanguage(language) {
		this.languages[language.id] = language;
	};
	
	jLexer.prototype.parse = function parse(code, languageId) {
		var language,
			typesCollection,
			tokensInCollection,
			codeStream,
			preToken,
			latestCharacter,
			tokenExit,
			token,
			inStateChange,
			inStateChangeExit,
			model,
			state, // The current state of the code stream
			pointer, // The location pointer for the code stream
			defaultState; // Current state of the codeStream: code|string|regexp|commentLine|commentBlock;

		language = this.constructor.languages[languageId];
		if (!language) {
			this.currentLanguage = null;
			return false;
		}
		this.currentLanguage = language;

		this.code = code;

		modelStream = [];
		codeStream = code;
		model = {};
		tokensIn = {};
		state = defaultState;
		typesCollection = {};
		tokensInCollection = {};

		// Find the default state
		//console.log("Find default state");
		$.each(language.states, function(val) {
			if (this.default) {
				defaultState = this;
			}
		});

		for (var iType in language.types) {
			var type = language.types[iType];
			typesCollection[type.id] = type;
		};


		//Build the collection of inTokens
		//console.log("Build the collection of inTokens");
		var states = language.states;
		for (var iState in states) {
			var state = states[iState];
			var tokens = state.tokens;
			var tokensIn = state.tokensIn;
			var tokensOut = state.tokensOut;
			var tokensMiddle = state.tokensMiddle;
			state.tokensCollection = {};
			state.tokensCollectionCount = 0;
			state.tokensOutCollection = {};
			state.tokensMiddleCollection = {};
			state.tokensInCollection = {};
			for (var iToken in tokens) {
				var token = tokens[iToken];
				state.tokensCollection[token.token] = token;
				state.tokensCollectionCount = state.tokensCollectionCount + 1;
			}
			for (var iToken in tokensIn) {
				var token = tokensIn[iToken];
				state.tokensInCollection[token] = tokensInCollection[token] = state;
			}
			for (var iToken in tokensMiddle) {
				var token = tokensMiddle[iToken];
				state.tokensMiddleCollection[token] = state;
			}
			for (var iToken in tokensOut) {
				var token = tokensOut[iToken];
				// Adds the token and adds all shorter permutations as sterile tokens
				// Sterile tokens are token to match only to know you have a real tolen comming up
				for (var i = 0; i <= token.length; i = i + 1) {
					if (!state.tokensOutCollection[token.substr(0, i)] || (i == token.length)) {
						state.tokensOutCollection[token.substr(0, i)] = {
							sterile: (!(i == token.length)) // is sterile unless it is the full string
						};
					}
				}
			}
		}

		preToken = "";
		token = "";
		tokenExit = "";
		state = defaultState;
		pointer = 0;
		inStateChange = false;
		inStateChangeExit = false;
		latestCharacter = "";

		function pushState(state) {
			if (state.state.tokensCollectionCount) {
				var token = state.state.tokensCollection[state.content];
				if (token) {
					state.type = typesCollection[token.type];
				} else {
					// The default type is used instead
					state.type = typesCollection[state.state.defaultType];
				}
			} else {
				state.type = typesCollection[state.state.defaultType];
			}
			modelStream.push(state);
		};

		// This main loop is a non-recursize parsing of the code as
		// a stream of characters parsed into tokens.
		var codeStreamLength = codeStream.length;
		for (pointer = 0; pointer <= codeStreamLength; pointer = pointer + 1) {
			latestCharacter = codeStream[pointer];
			preToken = token;
			// Prevent the last undefined char from being parsed
			if (typeof(latestCharacter) !== "undefined") {
				token = token + latestCharacter;
			}
			if (pointer === codeStreamLength) {
				// If the end of the stream is reached, flush the last token
				// TODO: refactor all push statements into a common function
				pushState({
					content: token,
					state: state || defaultState
				});
				break;
			}
			if (state === defaultState) {
				// Try to find the next state change with tokenIns
				if (inStateChange) {
					if (!tokensInCollection[token]) {
						// If the previous token is an inToken
						// This confirms a state change
						if (tokensInCollection[preToken]) {
							state = tokensInCollection[preToken];
							pointer = pointer - 1; // Put back the latest unmatched token in the stream
							token = preToken; // Resest the tokens
							inStateChange = false;
						}
					}
				} else {
					if (tokensInCollection[latestCharacter]) {
						// If the latest character is an inToken
						// This signals the potential of a stateChage
						// Flush the whitespace if any
						if (preToken) {
							pushState({
								content: preToken,
								state: state
							});
						}
						token = latestCharacter;
						inStateChange = true;
					}
				}
			} else {
				// Try to find the next state change with tokenOuts
				if (state.tokensOut) {
					if (!state.tokensOutCollection[tokenExit + latestCharacter]) {
						if (inStateChangeExit) {
							pushState({
								content: token,
								state: state
							});
							inStateChangeExit = false;
							inStateChange = false;
							tokenExit = "";
							state = defaultState;
							token = "";
							inStateChange = false;
						}
					} else {
						// Another char can be added to the exit token
						inStateChangeExit = true;
						tokenExit = tokenExit + latestCharacter;
					}
				} else {
					// the state is broken when no more tokensIn are found
					if (!(state.tokensInCollection[latestCharacter] || state.tokensMiddleCollection[latestCharacter])) {
						// state is broken
						pointer = pointer - 1; // Put back the latest unmatched token in the stream
						pushState({
							content: preToken,
							state: state
						});
						state = defaultState;
						token = "";
						inStateChange = false;
					}
				}
			}
		}
		this.modelStream = modelStream;
		return this;
	};

	jLexer.TokenStream = function TokenStream(tokensArray, language) {
		var token;
		this.tokens = tokensArray;
		this.language = language;
		this.currentIndex = 0;
		this.goFirst = function goFirst() {
			this.currentIndex = 0;
		}
		this.step = function step(offset, onlyCode) {
			var offsetCount = 0;
			if (!offset) {
				offset = 1;
			}
			if (onlyCode) {
				while (offsetCount < offset) {
					if (this.get(this.currentIndex + offsetCount).type.notcode) {
						//console.log("skip", this.get(this.currentIndex + offsetCount));
						offset = offset + 1;
					}
					offsetCount = offsetCount + 1;
				}
				this.currentIndex = this.currentIndex + offsetCount;
				token = this.tokens[this.currentIndex];
			} else {
				this.currentIndex = this.currentIndex + offset;
				token =  this.tokens[this.currentIndex];
			}
			return token;
		}
		this.get = function current(index, onlyCode) {
			return this.tokens[index];
		}
		this.current = function current() {
			return this.get(this.currentIndex);
		}
		this.next = function next(offset, onlyCode) {
			var offsetCount = 0;
			if (!offset) {
				offset = 1;
			}
			if (onlyCode) {
				while (offsetCount < offset) {
					if (this.get(this.currentIndex + offsetCount).type.nocode) {
						offset = offset + 1;
					}
					offsetCount = offsetCount + 1;
				}
				token = this.get(this.currentIndex + offsetCount);
			} else {
				token = this.get(this.currentIndex + offset);
			}
			return token;
		}
		this.previous = function previous(offset, onlyCode) {
			return this.get(this.currentIndex - offset);
		}
		this.isFirst = function isFirst() {
			return (this.currentIndex == 0) ? true : false;
		}
		this.isLast = function isLast() {
			return (this.currentIndex >= this.tokens.length-1) ? true : false;
		}
		this.isEnd = function isLast() {
			return (this.currentIndex >= this.tokens.length) ? true : false;
		}
	}

	jLexer.prototype.modelize = function modelize() {
		var root,
			rootController;
		rootController = this.currentLanguage.controllers.root;
		var tokenStream = new jLexer.TokenStream(this.modelStream, this.currentLanguage);
		root = rootController(tokenStream, this);
		return root;
	};

	jLexer.prototype.render = function render() {
		var dom = $("<div class='code'></div>");
		//console.dir(this.modelStream);
		//console.log("Rendering model", this.model);
		return dom[0];
	};

	jLexer.prototype.renderModelStream = function renderModelStream() {
		var html,
			iToken,
			token,
			oddEven,
			content,
			stateHTMLPrefix,
			lineNumber,
			label,
			id;

		lineNumber = 1;
		content = ""; 
		stateHTMLPrefix = "";
		stateHTMLSuffix = "</span>";
		html = "<div class='code-line code-line-odd'><span class='code-linenumber'>" + lineNumber + "</span>";

		$.each(this.modelStream, function(val) {
			id = this.state.label;
			label = this.state.label;
			if (this.type) {
				id = this.type.id;
				label = this.type.label;
			};
			if (this.content) {
				content = this.content;
				content = content.replace(/  /g, "&nbsp; "); // Keeps some breakable spaces to ensure word-wrapping
				content = content.replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
				stateHTMLPrefix = "<span title='" + label + "' class='code-" + id + "'>";
				if (this.state.hasLinefeeds) {
					var linefeedRegexp = /\n/;
					var replacementStr = "";
					while (content.match(linefeedRegexp)) {
						lineNumber = lineNumber + 1;
						oddEven = (lineNumber % 2) ? "odd" : "even";
						replacementStr = stateHTMLSuffix + "&nbsp;</div><div class='code-line code-line-" + oddEven + "'><span class='code-linenumber'>" + lineNumber + "</span>" + stateHTMLPrefix;
						content = content.replace(linefeedRegexp, replacementStr);
					}
				}
				html = html + stateHTMLPrefix + content + stateHTMLSuffix;
			}
		});
		html = html + "</div>"
		return html;
	}

	window.jLexer = jLexer

})(jQuery);
