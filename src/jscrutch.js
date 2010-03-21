/*
	jsCrutch 
	Assisted javascript for better stability and reabilitation of broken code

	jsCrush is a javascript utility used to apply a layer of monitoring and control
	over the execution of existing javascript functions. It is usefull both while coding and
	debuging an application and while running the code in production in order to manage
	gracefull code failures.

	Author:
		Mathieu Sylvain, 2009

	Features:
		- Trap unforseen javascript errors and prevent general script execution failure
		- Log exceptions gracefully with more environment information
		- Log function call with environment information
		- Time the execution of function calls to monitor performance

	Usage:
		Usage is recommended during development of new code or when debugging existing code without
		invasive changes. This is similar to using Firebug to debug, but crutches are less volatile
		than usual watches and breakpoints and can even become permanent fixtures of your code.
		
		Crutches can become especially usefull when a site goes through the activation of a series
		of indepedent piece of code which might fail at any moment because of external dependencies
		or the use of plugins which have not been tested for all possible situations or browsers
		(it is usually the case). In these cases, you can instruct a crutched routine to fail gracefully
		without breaking the rest of the site. This will trap any exception and raise them only if
		the used has activated a debugging console on his machine. This means that even in production
		your code can fail with very little noise and still be easy to debug.
		
		To use, first instantiate a crutch object, then use the crutch function to take control
		over the desired code. Options can be passed both during instantiation of the class
		and when crutching individual pieces of code.
		
		Also, it is recommended that if you plan to remove crutched before going to production,
		you should be crutch options declarations in a separate js file or code block that is easy
		to comment out in block.
		
		Make sure to run your scripts through JSLint to ensure that crutched code runs without
		weird behaviors.

	Philosophical reminders
		- Dont fail to expect failure in your code.
		- Crutches are for safety, monitoring and debugging, its not an event management library.
		- Crutches help, but ideally you code should run smooth even when crutches are removed.
		- Its ok to leave crutches in production but not at the expense of performance

	Sample:
		var crutch = new Crutch(options);
		function helloWorld() {
			alert("hello world!");
		};
		helloWorld.crutch = {
		}
		crutch.crutch(helloWorld);
		someFunction();

	Special note:
		- The main Crutch constructor can be used as either a function or a constructor with exactly identical results
			i.e.: var crutch = Crutch()   or   var crutch = new Crutch()

	Crutch class instantiation options:
		console - object - A console object compatible with the Firebug Console. If no console is provided, logging and timing is disabled.
		time - boolean - Wether function calls should be timed. A console object is required. (false by default)
		log - boolean - Wether function calls (successfull or not) should be logged to the console. : (false by default)
		onError - 

	Crutch function meta options:
		label - string - The label of the function. Can be used as a short description or a full qualified function name. Ex.: "myClass.helloWorld()",
		action - string - A short phrase stating the action taken by the code. Use for friendly loggin. Ex.: "Writing hello world",
		desc - string - A more complete description of the code which could be usefull by someone investigating errors or debuggin code. Ex.: "This function write the hello world message using the systems alert funcion",
		hush - boolean - Determines wether catched errors should be re-thrown or not. Setting it to "true" will prevent broken code from stopping the script execution on the rest of the page (false by default)
		time - boolean - Wether function calls should be timed. A console object is required. (false by default)
		log - boolean - Wether function calls (successfull or not) should be logged to the console. : (false by default)

	About performance:
		Using firefox on my netbook, going through 100000 function calls with a crutch activated
		took 1800 milliseconds, compared to 24 without. This equates to about 20 MICROseconds of
		performance taxation per function calls.
		
		These measurements take for granted that all logging were turned off. This means that only
		under extreme cases would the inclusion of Crutch in your project would degrade performance
		in any noticable way
		
		Also, once compressed, the source code is under 3kb, which is a meager sacrifice for a definitive gain. 

	Available features:
		- Ability to create multiple crutch instances with different options and scope coverage 
		- Define hooks using literal notation
		- Enable or disable crutches via options parameter
		- Enable or disable individual hooks via options parameter
		- Access to a registry of enabled crutches and their original function call 
			crutch.hooks array (does not include self crutched functions)
		- Find a way to bubble up or make visible errors in routines marked as "safe" without causing JS interuption
		  (maybe a silent error counter? how could it be triggered?) 
		- Hook single function via a function call
			Done via C.crutch() function
		- Support for either function based or constructor based instantiation
		- Unhook all enabled hooks. (detach, detachAll)
		- Conditionnal logging, warn or function intercept
		- Custom callback upon errors/exceptions to be used with server side logging (Google Analytics Support)
		- Enable or disable crutches via console presence
		- Default settings for the main Crutch object and individual hooks
		- Override crutch and hook default options with an "options" arguments

	Upcomming features:
		- Override hook default options with function "crutch" attribute
		- Override crutch default options with querystring parameters
		- Override crutch default options with cookie
		- Keep a count of silent errors which have been bubbled up. 

	Ideas Out of Scope: 
		- Ability to activate logging of the full time taken for the page load cycle for logging purposes.

*/
/*global window */
/*jslint white: true, onevar: true, browser: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, strict: true, newcap: true, immed: true */
/*members Crutch, U, action, apply, arguments, attach, attachAll, 
	call, caller, console, env, crutch, defaults, detach, detachAll, 
	enabled, error, exception, extend, function, functionName, 
	hasOwnProperty, hook, hookDefaults, hooks, hush, info, isCrutchProxy, 
	leaf, length, log, onError, options, parent, proxy, push, return, scope, 
	selfCrutch, shift, split, this, time, timeEnd, warn
*/
"use strict";
(function () {
	// TODO: Ensure that "options" is compressed across all code
	window.Crutch = function (options) {
		var U, // Utility class
			C, // Main Crutch function
			Defaults,
			HookDefaults,
			Options,
			Console, // The global console object
			undefined="undefined", // Constant
			N; // A function which does "Nothing"

		/*
		The main crutch object which is used both as the statefull object
		and the main function call.
		*/
		// Todo: consider using "C/c" as private vars for optimization Could save up to 600 bytes
		C = function Crutch(scope) {
			if (Options.enabled) {
				C.attachAll(scope);
			}
		};

		/*
		Class U
		
		Utility class used internally
		*/
		U = {}; 

		/*
		Function: U.extend

		Recursively extend a first object with the attributes of subsequent objects passed
		as arguments. Ex.: extend({}, defaultOptions, options);
		Used to merge values from defaults, options arguments cookies or querystring
		*/
		U.extend = function extend(obj, extObj) {
			var i;
			if (arguments.length > 2) {
				for (i = 1; i < arguments.length; i = i + 1) {
					extend(obj, arguments[i]);
				}
			} else {
				for (i in extObj) {
					if (extObj.hasOwnProperty(i)) {
						obj[i] = extObj[i];
					}
				}
			}
			return obj;
		};

		/*
		Function: U.leaf

		Recursively finds the leaf object by interpretting the object string
		*/
		U.leaf = function leaf(scope, chain, chainHistory) {
			var newObj, varLabel;
			if (typeof(scope) !== undefined) {
				if (chain.length > 1) {
					varLabel = chain.shift();
					newObj = scope[varLabel];
					if (typeof(newObj) !== undefined) {
						if (chainHistory !== "") {
							chainHistory = chainHistory + ".";
						}
						return leaf(newObj, chain, chainHistory + varLabel);
					} else {
						throw ("var not in scope: " + varLabel + " in " + chainHistory);
					}
				} else {
					if (typeof(scope[chain[0]]) !== undefined) {
						return [scope, chain[0]];
					} else {
						throw ("var not found: " + chain[0] + " on " + chainHistory);
					}
				}
			} else {
				throw ("Scope is empty");
			}
		};


		// Default options for the crutch instance
		Defaults = {
			enabled: true, // If enabled or not
			warn: true, // Wether or not errors should be logged to the console
			log: true, // Wether or not successfull execution should be logged to the console
			hooks: {} // A literal object containing the individual hooks composing the crutch 
		};

		// Default options for hooks
		HookDefaults = {
			enabled: true, // If the hook is enabled or not
			warn: true, // Wether or not errors should be logged to the console
			time: false, // Wether or not successfull execution should be timed and results logged to the console
			log: false, // Wether or not successfull execution should be logged to the console
			hush: false, // Wether or not errors/exceptions should be hushed and only made visible to the console.
			selfCrutch : false // Internal option for crutching functions internal to this library
		};

		/*
		Various Setup
		Set default attributes
		Set the console
		Set the default options
		*/
		//TODO: Encapsulate in some setup or init function
		// Set the default options and extend with the option argument
		// Todo: consider using "O" instead of options as private Could save up to 300 bytes
		Options = U.extend({}, Defaults, options);
		C.hooks = [];

	
		// Set the console if necessary
		N = function () {};
		/*
		if (Options.console) {
			Console = Options.console;
		} else {
			Console = {
				log: N,
				error: N,
				time: N,
				timeEnd: N
			};
		}*/
		Console = (Options.console) ? Options.console : {
			log: N,
			error: N,
			time: N,
			timeEnd: N
		}

		/*
		Function: C.attachAll

		Process in batch all the hooks provided in the options when
		the crutch has been constructed, while using the specified scope
		*/
		C.attachAll = function attachAll(scope) {
			for (var hook in Options.hooks) {
				if (Options.hooks.hasOwnProperty(hook)) {
					C.attach(hook, Options.hooks[hook], scope);
				}
			}
		};

		/*
		Function: C.attach

		Process a single hook, while using the provided scope
		*/
		// Todo: This method and the crutch method should be merged into a single one.
		C.attach = function attach(hook, options, scope) {
			var hookOptions, $this, scopeAndObj, chain, oldFunc;
			$this = this;
			// Applies all the hooks
			hookOptions = U.extend({}, HookDefaults, options);
			if (hookOptions.enabled !== false) {
				//TODO: The scope var should come either from param or from original options
				chain = hook.split(".");
				scopeAndObj = U.leaf(scope, chain, "");
				if (scopeAndObj.length > 0) {
					oldFunc = scopeAndObj[0][scopeAndObj[1]];
					scopeAndObj[0][scopeAndObj[1]] = function proxyCall() {
						return C.proxy.call(scopeAndObj[0], oldFunc, arguments, hook, hookOptions);
					};
					// Add the successfull crutch to the "hooks" registry
					if (oldFunc && !hookOptions.selfCrutch) {
						C.hooks.push({
							"hook" : hook,
							"options" : hookOptions,
							"parent" : scopeAndObj[0],
							"fnName" : scopeAndObj[1],
							"fn" : oldFunc,
							"scope" : scope
						});
					}
					return oldFunc;
				}
			}
		};

		/*
		Function: C.detach
		*/
		C.detach = function detach(hook) {
			if (hook) {
				hook.parent[hook.fnName] = hook.fn;
			}
		};

		/*
		Function: C.detachAll
		*/
		C.detachAll = function detachAll() {
			while (C.hooks.length > 0) {
				C.detach(C.hooks.shift());
			}
		};


		/*
		Function: C.env

		Returns a detailed environment object that can be used when debugging or inspecting code
		*/
		C.env = function env(hook, returnValue, isThis, options, func, args, exception) {
			return {
				"hook": hook,
				"return": returnValue,
				"this": isThis,
				"options": options,
				"function": func,
				"arguments": args,
				"exception": exception
			};
		};

		/*
		Function: C.proxy

		The proxy call which is used to intercept function call and "manage" their outcomes 
		*/
		//Todo: bring back option overrigind with argument
		//Todo: Merge the default options and local options and meta options into a single object
		C.proxy = function proxy(func, args, hook, options) {
			var returnValue,
				label, // The function label to use for logging
				caller; // Used when moving up the call stack
			if (options.time) {
				Console.time("Timed " + options.action);
			}
			label = (options.action || hook + "()");
			try {
				returnValue = func.apply(this, args);
				if (proxy.error) {
					throw (proxy.error);
				}
				if (options.log) {
					//TODO: Is there really access to Crutch here ? 
					Console.info("Ok upon " + label, C.env(hook, returnValue, this, options, func, args));
				}
			} catch (e) {
				if (options.log || options.warn) {
					Console.error("Error upon " + label, C.env(hook, returnValue, this, options, func, args, e));
				}
				// Trigger the onError callback if needed, and provide the environment summary object as the single argument 
				if (typeof(Options.onError) === "function") {
					Options.onError(C.env(hook, returnValue, this, options, func, args, e));
				}
				if (!options.hush) {
					throw (e);
				} else {
					// Raise a silent error to the next crutch function 
					// Crawl back the scopeChain recursivelly
					caller = proxy.caller;
					while (caller) {
						if (caller.isCrutchProxy) {
							break;
						}
						caller = caller.caller;
					}
					if (caller) {
						caller.error = e;
					}
				}
			} finally {
				if (options.time) {
					Console.timeEnd("Timed " + label);
				}
				return returnValue;
			}
		};
		// A special attribute to differentiate the proxy from other functions in the call stack
		C.proxy.isCrutchProxy = true;

		/*
		Function: C.crutch

		Applies a single hook to a function call
		This function can be called directly and is called by "C.attach" upons initialisation  
		This returns the function call that has successfully been hooked
		*/
		/*
		C.crutch = function crutch(hook, options, scope) {
			var $this, scopeAndObj, chain, oldFunc;
			$this = this;
			chain = hook.split(".");
			scopeAndObj = U.leaf(scope, chain, "");
			if (scopeAndObj.length > 0) {
				oldFunc = scopeAndObj[0][scopeAndObj[1]];
				scopeAndObj[0][scopeAndObj[1]] = function proxyCall() {
					return C.proxy.call(scopeAndObj[0], oldFunc, arguments, hook, options);
				};
				// Add the successfull crutch to the "hooks" registry
				if (oldFunc && !options.selfCrutch) {
					C.hooks.push({
						"hook" : hook,
						"options" : options,
						"parent" : scopeAndObj[0],
						"functionName" : scopeAndObj[1],
						"function" : oldFunc,
						"scope" : scope
					});
				}
				return oldFunc;
			}
			return null;
		};
		*/

		function selfCrutch() {
			/*
			Applies self crutching of the crutch and leaf fucntions
			Is a sort of "eat your own dog food" approach
			*/
			var hooks;
			hooks = [
				"U.extend",
				"U.leaf",
				"C.attach",
				"C.attachAll",
				"C.detach",
				"C.detachAll",
				"C.crutch"
			];
			while (hooks.length) {
				//console.log("C", C);
				C.attach(
					hooks.shift,
					{
						"hush" : true,
						"selfCrutch" : true
					},
					{
						C : C,
						U : U
					}
				);
			}
		}

//		selfCrutch();
		// Return the core Crutch function instead of an object
		return C;
	};

}());
