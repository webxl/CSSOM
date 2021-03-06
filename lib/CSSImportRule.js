//.CommonJS
var CSSOM = {
	CSSRule: require("./CSSRule").CSSRule,
	CSSStyleSheet: require("./CSSStyleSheet").CSSStyleSheet,
	MediaList: require("./MediaList").MediaList
};
///CommonJS


/**
 * @constructor
 * @see http://dev.w3.org/csswg/cssom/#cssimportrule
 * @see http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSImportRule
 */
CSSOM.CSSImportRule = function CSSImportRule() {
	this.href = "";
	this.media = new CSSOM.MediaList;
	this.styleSheet = new CSSOM.CSSStyleSheet;
};

CSSOM.CSSImportRule.prototype = new CSSOM.CSSRule;
CSSOM.CSSImportRule.prototype.constructor = CSSOM.CSSImportRule;
CSSOM.CSSImportRule.prototype.type = 3;

(function() {
	function getImportRule() {
		var mediaText = this.media.mediaText;
		return "@import url(" + this.href + ")" + (mediaText ? " " + mediaText : "") + ";";
	}
	function setImportRule(cssText) {
		var i = 0;

		/**
		 * @import url(partial.css) screen, handheld;
		 *        ||               |
		 *        after-import     media
		 *         |
		 *         url
		 */
		var state = '';

		var buffer = '';
		var index;
		var mediaText = '';
		for (var character; character = cssText.charAt(i); i++) {

			switch (character) {
				case ' ':
				case '\t':
				case '\r':
				case '\n':
				case '\f':
					if (state == 'after-import') {
						state = 'url';
					} else {
						buffer += character;
					}
					break;

				case '@':
					if (!state && cssText.indexOf('@import', i) == i) {
						state = 'after-import';
						i += 'import'.length;
						buffer = '';
					}
					break;

				case 'u':
					if (state == 'url' && cssText.indexOf('url(', i) == i) {
						index = cssText.indexOf(')', i + 1);
						if (index == -1) {
							throw i + ': ")" not found';
						}
						i += 'url('.length;
						var url = cssText.slice(i, index);
						if (url[0] === url[url.length - 1]) {
							if (url[0] == '"' || url[0] == "'") {
								url = url.slice(1, -1);
							}
						}
						this.href = url;
						i = index;
						state = 'media';
					}
					break;

				case '"':
					if (state == 'url') {
						index = cssText.indexOf('"', i + 1);
						if (!index) {
							throw i + ": '\"' not found";
						}
						this.href = cssText.slice(i + 1, index);
						i = index;
						state = 'media';
					}
					break;

				case "'":
					if (state == 'url') {
						index = cssText.indexOf("'", i + 1);
						if (!index) {
							throw i + ': "\'" not found';
						}
						this.href = cssText.slice(i + 1, index);
						i = index;
						state = 'media';
					}
					break;

				case ';':
					if (state == 'media') {
						if (buffer) {
							this.media.mediaText = buffer.trim();
						}
					}
					break;

				default:
					if (state == 'media') {
						buffer += character;
					}
					break;
			}
		}
	}

	if (typeof CSSOM.CSSImportRule.prototype.__defineGetter__ != 'undefined') {
		CSSOM.CSSImportRule.prototype.__defineGetter__("cssText", getImportRule);
		CSSOM.CSSImportRule.prototype.__defineSetter__("cssText", setImportRule);
	} else {
		Object.defineProperty(CSSOM.CSSImportRule, 'cssText', {
		  get: getImportRule, 
			set: setImportRule
		});
	}
})();

//.CommonJS
exports.CSSImportRule = CSSOM.CSSImportRule;
///CommonJS
