/* Copyright 2020 by Brigham Young University - Idaho. All rights reserved. */

/** This JavaScript code allows users to click a moon or sun symbol to
 * toggle the colors of an HTML document between dark and light mode. To
 * use this code in an HTML document, the document must do the following:
 *
 * 1. Import this file:  <script src="../site/color.js"></script>
 *
 * 2. Contain at least one div with class="colorCtrl":
 *    <div class="colorCtrl">&nbsp;</div>
 *    This div will contain the moon or sun symbol that the user will
 *    click to toggle dark and light modes.
 */

"use strict";

if (!window.hasOwnProperty('cse111')) {
	window.cse111 = {};
}

cse111.color = {
	addThemeHandler : function() {
		let dark = 'dark';
		let light = 'light';
		let schemeData = {
			dark: {remove:light, symbol:'\u263c', title:'Change to light mode'},
			light: {remove:dark, symbol:'\u263e', title:'Change to dark mode'}
		};

		/** Sets the color scheme. */
		let set = function(clist, scheme) {
			let data = schemeData[scheme];

			// Store the chosen color scheme
			// (light or dark) in local storage.
			localStorage.setItem('colorScheme', scheme);

			// Change the classList for the document body.
			clist.remove(data.remove);
			clist.add(scheme);

			// Change the title and symbol for
			// all color controls in the document.
			let ctrls = document.getElementsByClassName('colorCtrl');
			for (let c = 0;  c < ctrls.length;  ++c) {
				let elem = ctrls[c];
				elem.setAttribute('title', data.title);
				elem.innerHTML = data.symbol;
			}
		};

		/** Toggles the color scheme from light to dark and vice versa. */
		let toggle = function(event) {
			let clist = document.body.classList;
			let scheme = clist.contains(dark) ? light : dark;
			set(clist, scheme);
		};

		// Set the color scheme to the one
		// most recently chosen by the user.
		let clist = document.body.classList;
		let scheme = localStorage.getItem('colorScheme');
		if (!scheme) {
			scheme = clist.contains(dark) ? dark : light;
		}
		set(clist, scheme);

		// Add the toggle function as a click handler
		// to all color controls in the document.
		let ctrls = document.getElementsByClassName('colorCtrl');
		for (let c = 0;  c < ctrls.length;  ++c) {
			ctrls[c].addEventListener('click', toggle);
		}
	},


	/** Add title attributes to consoles and user inputs. Most browsers
	 * will use the titles as small tool tips that display when the user
	 * holds the mouse pointer over an HTML element. */
	addTitles : function() {
		const elems = document.querySelectorAll('pre.console');
		for (let i = 0;  i < elems.length;  ++i) {
			let pre = elems[i];
			pre.setAttribute('title', 'Terminal Window');

			const spans = pre.querySelectorAll('span.input');
			for (let i = 0;  i < spans.length;  ++i) {
				spans[i].setAttribute('title', 'User input');
			}
		}
	},


	addHyperlinkCopyIcons : function() {
		const regex = /#.*/;

		const copyFunc = function(event) {
			const span = event.currentTarget;
			const heading = span.parentElement;
			const url = window.location.href;
			const anchor =  '#' + heading.getAttribute('id');
			const newURL = url.replace(regex, '') + anchor;

			// Copy the new URL to the clipboard.
			const listener = function(event) {
				event.clipboardData.setData('text/plain', newURL);
				event.preventDefault();
			};
			document.addEventListener('copy', listener);
			document.execCommand('copy');
			document.removeEventListener('copy', listener);

			// Load the new URL in the current browser window.
			window.location.assign(anchor);
		};

		const elems = document.querySelectorAll('h2[id], h3[id], h4[id]');
		for (let i = 0;  i < elems.length;  ++i) {
			let span = document.createElement('span');
			span.classList.add('copy');
			span.setAttribute('title', 'Copy URL to the clipboard');
			span.addEventListener('click', copyFunc);
			span.innerText = '¶';

			let heading = elems[i];
			heading.appendChild(span);
		}
	},


	onDOMLoaded : function() {
		cse111.color.addThemeHandler();
		cse111.color.addTitles();
		cse111.color.addHyperlinkCopyIcons();
	}
};

window.addEventListener('DOMContentLoaded', cse111.color.onDOMLoaded);
