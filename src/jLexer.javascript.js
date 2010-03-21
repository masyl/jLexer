/*

	jLexer Javascript Language Definition

*/
(function(jLexer) {

	var javascript = {
		id: "javascript",
		meta : {
			label: "Javascript"
		},
		types : {
			statement : {
				id: "statement",
				label: "Statement"
			},
			globalproperty : {
				id: "globalproperty",
				label: "Global property"
			},
			globalmethod : {
				id: "globalmethod",
				label: "Global method"
			},
			string : {
				id: "string",
				label: "String"
			},
			comment : {
				id: "comment",
				label: "Comment",
				notcode: true
			},
			operator : {
				id: "operator",
				label: "Operator"
			},
			syntax : {
				id: "syntax",
				label: "Syntax"
			},
			variable : {
				id: "variable",
				label: "Variable"
			},
			predefinedobject : {
				id: "predefinedobject",
				label: "Predefined object"
			},
			predefinedclass : {
				id: "predefinedclass",
				label: "Predefined class"
			},
			attribute : {
				id: "attribute",
				label: "Attribute"
			},
			argument : {
				id: "argument",
				label: "Argument"
			},
			regexp : {
				id: "regexp",
				label: "Regular expressions"
			},
			reserved : {
				id: "reserved",
				label: "Reserved keywords"
			},
			whitespace : {
				id: "whitespace",
				label: "Whitespace",
				notcode: true
			}
		},
		states : {
			whitespace: {
				default: true, // This state is the default fallback
				label: "whitespace",
				defaultType: "whitespace",
				hasLinefeeds: true
			},
			number : {
				label: "number",
				tokensIn : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "."],
				tokensOut : null
			},
			keyword : {
				label: "keyword",
				tokensIn : ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
				"k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "_"],
				tokensMiddle : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
				tokensOut : null,
				tokens : {
					"function" : {label: "function", token : "function", type: "statement", controller: "function"},
					"else" : {label: "else", token : "else", type: "statement", controller: "if"},
					"if" : {label: "if", token : "if", type: "statement", controller: "if"},
					"throw" : {label: "throw", token : "throw", type: "statement", controller: "throw"},
					"catch" : {label: "catch", token : "catch", type: "statement", controller: "throw"},
					"do" : {label: "do", token : "do", type: "statement"},
					"while" : {label: "while", token : "while", type: "statement"},
					"return" : {label: "return", token : "return", type: "statement"},
					"typeof" : {label: "typeof", token : "typeof", type: "statement"},
					"var" : {label: "var", token : "var", type: "statement"},
					"try" : {label: "try", token : "try", type: "statement"},
					"this" : {label: "this", token : "this", type: "statement"},
					"split" : {label: "split", token : "split", type: "statement"},
					"shift" : {label: "shift", token : "shift", type: "statement"},
					"empty" : {label: "empty", token : "empty", type: "statement"},
					"finally" : {label: "finally", token : "finally", type: "statement"},
					"case" : {label: "case", token : "case", type: "statement"},
					"break" : {label: "break", token : "break", type: "statement"},
					"switch" : {label: "switch", token : "switch", type: "statement"},
					"continue" : {label: "continue", token : "continue", type: "statement"},
					"default" : {label: "default", token : "default", type: "statement"},
					"for" : {label: "for", token : "for", type: "statement", controller: "for"},
					"if" : {label: "if", token : "if", type: "statement"},
					"in" : {label: "in", token : "in", type: "statement"},
					"true" : {label: "true", token : "true", type: "constant"},
					"false" : {label: "false", token : "false", type: "constant"},
					"arguments" : {label: "arguments", token : "arguments", type: "globalobject"},
					"with" : {label: "with", token : "with", type: "statement"},
					"new" : {label: "new", token : "new", type: "undefined"},
					"void" : {label: "void", token : "void", type: "reserved"},
					"delete" : {label: "delete", token : "delete", type: "reserved"},
				},
				defaultType: "variable",
				defaultController: "variable"
			},
			singlequotestring: {
				label: "singlequotestring",
				tokensIn: ["'"],
				tokensOut: ["'"],
				hasLinefeeds: true,
				defaultType: "string"
			},
			doublequotestring: {
				label: "doublequotestring",
				tokensIn: ['"'],
				tokensOut: ['"'],
				hasLinefeeds: true,
				defaultType: "string"
			},
			operator: {
				label: "operator",
				tokensIn: ['+', '-', '/', '=', '!', '|', '*', '&'],
				tokensOut: null, // state is broken by token not in "tokenIn"
				defaultType: "operator",
				tokens : {
					plus : {label: "Plus", token : "+", type: "operator"},
					minus : {label: "Minus", token : "-", type: "operator"},
					divided : {label: "Divided", token : "/", type: "operator"},
					assignement : {label: "Assignement", token : "=", type: "operator"},
					equal : {label: "Equal", token : "==", type: "operator"},
					tripleEqual : {label: "Equal", token : "===", type: "operator"},
					notEqual : {label: "Equal", token : "!=", type: "operator"},
					tripleNotEqual : {label: "Equal", token : "!==", type: "operator"},
					multiply : {label: "Multiply", token : "*", type: "operator"},
					not : {label: "Not", token : "!", type: "operator"},
					and : {label: "And", token : "&&", type: "operator"},
					or : {label: "Or", token : "||", type: "operator"}
				}
			},
			statementSeparator: {
				label: "statementseparator",
				defaultType: "syntax",
				tokensIn: [';'],
				tokensOut: null, // state is broken by token not in "tokenIn",
				tokens : {
					// TODO: tokens this state
				}
			},
			syntax: {
				label: "syntax",
				tokensIn: ['(', ')', '{', '}', '[', ']', ','],
				tokensOut: null, // state is broken by token not in "tokenIn"
				defaultType: "syntax",
				tokens : {
					//TODO: find name for this syntax... switch : {token : "?"},
					openingParens : {label: "Opening parens", token : "(", type: "operator"},
					closingParens : {label: "Closing parens", token : ")", type: "operator"},
					openingSquiggle : {label: "Opening squiggle", token : "{", type: "operator"},
					closingSquiggle : {label: "Closing squiggle", token : "}", type: "operator"},
					openingBracket : {label: "Opening bracket", token : "[", type: "operator"},
					closingBracket : {label: "Closing bracket", token : "]", type: "operator"},
				},
			},
			comment: {
				label: "comment",
				defaultType: "comment",
				tokensIn: ['//'],
				tokensOut: ["\n"], //TODO: options to NOT include the tokenOut in the token
				hasLinefeeds: true
			},
			commentblock: {
				label: "commentblock",
				defaultType: "comment",
				tokensIn: ['/*'],
				tokensOut: ['*/'],
				hasLinefeeds: true
			},
			regexp: {
				label: "regexp",
				defaultType: "regexp",
				tokenIn: ['/'],
				tokenOut: ['/'] //TODO: how to handle modifiers?
			}
		},
		enclosures : {
			"expression": {
				openToken: "(",
				closeToken: ")"
			},
			"routine": {
				openToken: "{",
				closeToken: "}"
			},
			"array": {
				openToken: "[",
				closeToken:"]"
			},
		},
		controllers : {
			// filled with controller functions below
		},
		elements : {
			// filled with elements object contructors below
		}
	}

	javascript.elements.undefined = function(token) {
		this.token = token;
		this.summary = "undefined code fragment";
	}

	javascript.elements.variable = function(token) {
		this.token = token;
		this.summary = "<strong>variable</strong>";
	}

	javascript.elements.function = function(token) {
		this.token = token;
		this.summary = "<strong>function</strong> (<em>params</em>) {<em>code block</em>};";
	}

	javascript.elements.if = function(token) {
		this.token = token;
		this.summary = "<strong>if</strong> (<em>condition</em>) {<em>code block</em>} <strong>else</strong> {<em>code block</em>};";
	}

	javascript.elements.for = function(token) {
		this.token = token;
		this.summary = "<strong>for</strong> (<em>init</em>, <em>contition</em>, <em>increment</em>) {<em>code block</em>};";
	}
	/* The root element is not an instruction in itself, but rather the master container
		at the base of the code tree. It is responsible to create the initial model */
	javascript.elements.root = function() {
		this.token = null;
		this.childs = [];
		this.summary = "Javascript code";
	}


	javascript.controllers.root = function(stream) {
		//console.log(stream);
		/*
		behavior:
			This is the root controller, the first controller called
		*/
		var elem,
			root,
			controller,
			controllers,
			token,
			stateToken;
		root = new javascript.elements.root();
		// Todo: see if this assignement could be made global!
		controllers = stream.language.controllers;
		while (!stream.isEnd()) {
			//token = stream.step(1, true); // Do not parse non-code ragments 
			token = stream.current();
			// Fetch the specific or default controller
			// token.state.tokens[token.content].controller
			state = token.state;
			if (state.tokensCollectionCount > 0) {
				stateToken = state.tokensCollection[token.content];
				//console.log("stateToken", stateToken);
//				console.log("token.content", token.content);
				if (stateToken) {
//					console.log("a", typeof(stateToken.controller));
					if (typeof(stateToken.controller) === "undefined" ) {
						//console.log("token.content", token.content);
						//console.log("state", state);
						//console.log("state.defaultController", state.defaultController);
						if (typeof(state.defaultController) === "undefined") {
							controller = controllers.default;
						} else {
							controller = controllers[state.defaultController];
						}
					} else {
						controller = controllers[stateToken.controller];
					}
				} else {
					//console.log("b");
					if (typeof(state.defaultController) === "undefined") {
						controller = controllers.default;
					} else {
						controller = controllers[state.defaultController];
					}
				}
				//console.log("controller", controller);
			} else {
				controller = controllers.default;
			}
			// parse the token using its controller
			elem = controller(stream, token, root, root);
			// Add the resulting element to the collection of child elements
			// TODO: instead of a blunt push, a "add" method should be created
			root.childs.push(elem);

			stream.step(1, false);
		}
		return root;
	};

	javascript.controllers.default = function(stream, token, parent, root) {
		/*
		behavior:
			Simply add the token to the model as an undefined code segment
		*/
		var elem = new stream.language.elements.undefined(token);
		return elem;
	};

	javascript.controllers.if = function(stream, token, parent, root) {
		return stream.language.controllers.default(stream, token, parent, root);
	};

	javascript.controllers.for = function(stream, token, parent, root) {
		/*
		behavior:
			"for": clear whitespaces following, expect a statements block {} to becomes the sequence parrent, otherwise raise a parsing error.
		*/
		return stream.language.controllers.default(stream, token, parent, root);
	};

	javascript.controllers.throw = function(stream, token, parent, root) {
		return stream.language.controllers.default(stream, token, parent, root);
	};

	javascript.controllers.function = function(stream, token, parent, root) {
		/*
		behavior:
			Simply add the token to the model as an undefined code segment
		*/
		var elem = new stream.language.elements.function(token);
		return elem;
	};
	javascript.controllers.variable = function(stream, token, parent, root) {
		/*
		behavior:
			Simply add the token to the model as an undefined code segment
		*/
		var elem = new stream.language.elements.variable(token);
		return elem;
	};

	javascript.controllers.catch = function(stream, token, parent, root) {
		return stream.language.controllers.default(stream, token, parent, root);
	};

	if (typeof(jLexer) === "function") {
		jLexer.addLanguage(javascript);
	}


})(window.jLexer);



