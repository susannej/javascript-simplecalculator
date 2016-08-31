// started from: https://github.com/jquery-boilerplate/jquery-boilerplate/blob/master/src/jquery.boilerplate.js 
// with some additions for the "$.fn[pluginName] = function(options)" part from: https://github.com/acanimal/jQuery-Plugin-Boilerplate
// and implemented some code from: http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery/946556#946556
//
// FIXME: Still some known errors:
// 1: CE is not working as expected! (deletes always the last character of the string, but should replace the element-string with the last one before the last edit!)
// 2: every number should be scanned for leading zeroes and they should be deleted when ENTER or '=' is pressed
// 3: try to use a "local" for the decimal-point "replace" part
//
// 4: rounding of the result should be added!
//	 function runden(x) {
//  		var k = (Math.round(x * 100) / 100).toString();
//  		k += (k.indexOf('.') == -1)? '.00' : '00';
//  		return k.substring(0, k.indexOf('.') + 3);
//	}


;(function ($, window, document, undefined) {
	var pluginName = "simplecalculator",
		defaults = {
			propertyName: "value"
		};

        key = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };

	// Plugin constructor
	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, defaults, options);
		this.defaults = defaults;
		this.name = pluginName;
		this.init();
	}

	Plugin.prototype = {
		init: function() {
			var element = this.element;
			
			// Remove autocomplete attribute to prevent native suggestions:
			element.setAttribute('autocomplete', 'off');
			
			var calcId = 'simplecalculator_' + $(element).attr('id');
			$('body').append('<div id="' + calcId + '" class="calculator" style="display: none; z-index: 9999; position: absolute;"><table id="' + calcId + '_table" class="calculator"></table></div>');
			$.each('789/C 456*c 123-= 0.+'.split(' '), function(index, value) {
				var line = $('<tr/>');
				$.each(value.split(''), function(index2, value2) {
					var td = $('<td align="middle"/>');
					switch (value2) {
						case 'C': var button = $('<button/>', {text: 'C', click: function() {
								$(element).val('');
							}}).addClass("calculator-button-c").appendTo(td);
							break;
						case 'c': var button = $('<button/>', {text: 'CE', click: function() {
								$(element).val($(element).val().replace(/.$/, ''));
							}}).addClass("calculator-button-c").appendTo(td);
							break;
						case '0': var button = $('<button/>', {text: value2, click: function() {
								$(element).simplecalculator('insertAtCaret', value2);
							}}).addClass("calculator-button-0").appendTo(td);
							$(td).attr("colspan", 2);
							break;
						case '/':
						case '*':
						case '+':
						case '-':
						case '.': var button = $('<button/>', {text: value2, click: function() {
								$(element).simplecalculator('insertAtCaret', value2);
							}}).addClass("calculator-button-bold").appendTo(td);
							break;
						case '=': var button = $('<button/>', {text: value2, click: function() {
								try {
									$(element).val(eval($(element).val().replace(/,/g,'.')).toString().replace('.',','));
									$(element).focus();
									$('#' + calcId).hide();
								} catch (e) { $(element).val('ERROR'); }
							}}).addClass("calculator-button-eq").appendTo(td);
							$(td).attr("rowspan", 2);
							break;
						default: var button = $('<button/>', {text: value2, click: function() {
								$(element).simplecalculator('insertAtCaret', value2);
							}}).addClass("calculator-button").appendTo(td);
					}
					td.appendTo(line);
				});
				line.appendTo('#' + calcId + '_table');
			});
			$('#' + calcId).keydown(function(event) {
				if (event.which == key.TAB || event.which == key.ESC) {
					$(element).focus();
					if (event.which == key.TAB) {
						$(element).trigger(event);
					}
					$('#' + calcId).hide();
				}
			});
			$(element).keydown(function(event) {
				switch (event.which) {
					case key.RETURN:			// Enter
						try {
							$(this).val(eval($(this).val().replace(/,/g,'.')).toString().replace('.',','));
						} catch (e) { $(this).val('ERROR'); }
						event.preventDefault();
						break;
					case key.TAB:				// TAB
					case key.ESC: $('#' + calcId).hide();	// Escape
						break;
					case key.DOWN: $('#' + calcId).show();	// Cursor down
						break;
				}
			});

			$(this.element).focus(function() {
				var pos, height;
				pos = $(this).offset();
				height = $(this).outerHeight();
				if ($('#' + calcId).is(":hidden")) {
					$(this).select();
				}
				$('#' + calcId).css({ display: "block", top: (pos.top + height) + "px", left: pos.left + "px" });
			});
			$(document).on('click.' + calcId, function(event) {
				if(!$(event.target).closest('#' + calcId).length && !$(event.target).closest(element).length) {
					if($('#' + calcId).is(":visible")) {
						$('#' + calcId).hide()
					}
				} 
			});

		},
		insertAtCaret: function(myValue) {
		    if (document.selection) {
		        //For browsers like Internet Explorer
		        this.element.focus();
		        var sel = document.selection.createRange();
		        sel.text = myValue;
		        this.element.focus();
		      } else if (this.element.selectionStart || this.element.selectionStart == '0') {
		        //For browsers like Firefox and Webkit based
		        var startPos = this.element.selectionStart;
		        var endPos = this.element.selectionEnd;
		        var scrollTop = this.element.scrollTop;
		        this.element.value = this.element.value.substring(0, startPos)+myValue+this.element.value.substring(endPos,this.element.value.length);
		        this.element.focus();
		        this.element.selectionStart = startPos + myValue.length;
		        this.element.selectionEnd = startPos + myValue.length;
		        this.element.scrollTop = scrollTop;
		      } else {
		        this.element.value += myValue;
		        this.element.focus();
		      }
		},
		yourOtherFunction: function(el, options) {
		}
	};

	$.fn[pluginName] = function(options) {
		var args = arguments;

		if (options === undefined || typeof options === 'object') {
			return this.each(function() {
				if (!$.data(this, "plugin_" + pluginName)) {
					$.data(this, "plugin_" + pluginName, new Plugin(this, options));
				}
			});
		} else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {
            return this.each(function() {
                var instance = $.data(this, 'plugin_' + pluginName);
                if (instance instanceof Plugin && typeof instance[options] === 'function') {
                    instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
            });
		}
	};

})(jQuery, window, document);
