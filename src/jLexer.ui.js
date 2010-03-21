(function($) {

	$(document).ready(function(e){
		JLexerUI.init();
	});

	var JLexerUI;
	JLexerUI = {};

	JLexerUI.init = function() {
		var $this;
		$this = this;
		this.jLexer = new jLexer({});
		$("#input").keypress(function(e){
			if ($this.inputTimeout) {
				clearTimeout($this.inputTimeout);
			}
			$this.inputTimeout = setTimeout(function(){
				$this.parseCodeInput();
			}, 300);
		});
		this.parseCodeInput();
	};

	JLexerUI.parseCodeInput = function parse() {
		var code,
			root,
			renderedModelStream;
		code = $("#input").val();
		//console.time("parseCodeInput");
		this.jLexer.parse(code, "javascript");
		var root = this.jLexer.modelize();
		//console.log(root);
		renderedModelStream = this.jLexer.renderModelStream();
		$("#results .javascript-code").empty()[0].innerHTML = renderedModelStream;
		$("span.code-keyword").hover(function(e){
			e.preventDefault();
			$(e.originalTarget).addClass("focus");
		}, function(e) {
			e.preventDefault();
			$(e.originalTarget).removeClass("focus");
		});
		//console.timeEnd("parseCodeInput");
	};

})(jQuery);




