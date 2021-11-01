/* Copyright 2020 by Brigham Young University - Idaho. All rights reserved. */
"use strict";

/* The url object modifies all <a> tags (links) so that
 * 1. Visits to external links and links with the download attribute are
 * recorded when the user clicks them. All other links (links to
 * internal, non-downloaded documents) are recorded when the document
 * loads.
 * 2. All links except ones with the download attribute open in a new
 * window. */

cse111.url.openDoc = function() {
	this.writeView(document.referrer, window.location.href);
};


cse111.url.byuicse = /(file:\/\/\/.+\/docs\/|https:\/\/byui-cse\.github\.io\/cse111-course\/)/;
cse111.url.protocol = /[^:]+:\/+/;


/** Records that a user viewed a document. */
cse111.url.writeView = function(source, target) {
	try {
		const byuicse = this.byuicse;
		const protocol = this.protocol;

		const abbreviate = function(url) {
			let remove = byuicse.test(url) ? byuicse : protocol;
			let abbrev = url.replace(remove, '');
			return abbrev;
		};

		source = this.encodeURL(abbreviate(source));
		target = this.encodeURL(abbreviate(target));
		const tzo = new Date().getTimezoneOffset();

		let db = this.initDatabase();
		let ref = db.ref('/views/' + target);
		let obj = {
			'referrer':source,
			'when':firebase.database.ServerValue.TIMESTAMP,
			'tzo':tzo
		};
		ref.push(obj);
		setTimeout(function() { db.goOffline(); }, 2000);
	}
	catch (ex) {
		console.log('Error: ' + ex.toString());
	}
};


/** Modifies all <a> tags (links) so that they perform as described at
 * the top of this file. */
cse111.url.modifyLinks = function() {
	const self = this;

	const openSolutionLink = function(event) {
		// Cancel the default action of the <a> tag.
		event.preventDefault();

		const link = event.currentTarget;
		const href = link.href;  // Get the absolute href.
		self.readSolution(href);

		// Cancel the default action of the <a> tag.
		return false;
	};

	const openDownloadLink = function(event) {
		// Cancel the default action of the <a> tag.
		event.preventDefault();

		const link = event.currentTarget;
		const href = link.href;  // Get the absolute href.
		self.writeView(window.location.href, href);
		window.open(href);

		// Cancel the default action of the <a> tag.
		return false;
	};

	const openExternalLink = function(event) {
		// Cancel the default action of the <a> tag.
		event.preventDefault();

		const link = event.currentTarget;
		const href = link.href;  // Get the absolute href.
		self.writeView(window.location.href, href);
		window.open(href, '_blank');

		// Cancel the default action of the <a> tag.
		return false;
	};

	const openOtherLink = function(event) {
		// Cancel the default action of the <a> tag.
		event.preventDefault();

		const link = event.currentTarget;
		const href = link.href;  // Get the absolute href.
		window.open(href, '_blank');

		// Cancel the default action of the <a> tag.
		return false;
	};

	const isLocal = /^file:\/\/\//.test(window.location);

	// document.getElementsByTagName returns a live list of elements.
	const links = document.getElementsByTagName('a');

	for (let i = 0;  i < links.length;  ++i) {
		const link = links[i];
		const href = link.href;  // Get the absolute href.

		if (link.classList.contains('solution')) {
			// Process an <a class="solution"> element.

			if (isLocal) {
				// If the user is viewing the CSE 111 files from his
				// local hard drive, there is no reason to have both a
				// view and download link. A standard download link with
				// simply open the file for viewing, so a download link
				// is sufficient.
				link.setAttribute('download', '');
				link.addEventListener('click', openDownloadLink);
			}
			else {
				// Get the relative href.
				const hrefAttr = link.getAttribute('href');

				link.addEventListener('click', openSolutionLink);
				link.setAttribute('title', 'View ' + hrefAttr);

				// Create a new <a download> element.
				let downlink = document.createElement('a');
				downlink.setAttribute('download', '');
				downlink.setAttribute('title', 'Download ' + hrefAttr);
				downlink.setAttribute('href', hrefAttr);
				downlink.innerHTML = '[&darr;]';

				// Insert the new element after the current
				// <a class="solution"> element.
				let parent = link.parentNode;
				let next = link.nextSibling;
				parent.insertBefore(document.createTextNode(' '), next);
				parent.insertBefore(downlink, next);

				// document.getElementsByTagName returns a live list of
				// elements. This means that the newly created element
				// will be processed the next time through this loop.
				// The next time through this loop, the code in this
				// loop will add the openDownloadLink function as a
				// click listener to the newly created element.
			}
		}
		else if (link.hasAttribute('download')) {
			// Process an <a download> element.
			link.addEventListener('click', openDownloadLink);
		}
		else if (!this.byuicse.test(href) && this.protocol.test(href)) {
			// Process an <a> element that links to an external document.
			link.addEventListener('click', openExternalLink);
		}
		else {
			// Process any other <a> element.
			link.addEventListener('click', openOtherLink);
		}
	}
};


cse111.url.readSolution = function(href) {
	const self = this;
	fetch(href)
	.then(function(response) {
		if (response.ok) {
			response.text()
			.then(function(text) {
				self.showCode(href, text);
			})
			.catch(function(error) {
				console.log('Error: ' + error);
			});
		}
		else {
			throw Error(response.statusText);
		}
	})
	.catch(function(error) {
		console.log('Error: ' + error);
	});
};


/** Shows the code that was retrieved by the
 * readSolution function in a new tab. */
cse111.url.showCode = function(href, code) {
	this.writeView(window.location.href, href);

	/** Converts the characters &, <, and > to HTML entities and
	 * converts non-ascii charaters to HTML entity sequences. */
	const entityFromChar = function(plain) {
		const symbols = {
			'&':'&amp;', '<':'&lt;', '>':'&gt;',
			'\u2018':'&lsquo;', '\u2019':'&rsquo;',
			'\u201c':'&ldquo;', '\u201d':'&rdquo;'
		};
		const keys = Object.keys(symbols).join('');
		const regex = new RegExp('[' + keys + ']', 'g');

		// Encode characters in symbols as HTML entities.
		let intermed = plain.replace(regex,
				function(match0) { return symbols[match0]; });

		// Encode non-ascii characters as HTML entities.
		let encoded = intermed.replace(/[^\t\n\r -~]/g,
				function(match0) {
					var pt = match0.charCodeAt(0);
					var hex = pt.toString(16);
					return '&#x' + '0000'.substring(hex.length) + hex + ';';
				});

		return encoded;
	};

	const regex = /^(.+)\/([^\/]+)\/([^\/]+)$/;
	const base = href.replace(regex, '$1');
	const lesson = href.replace(regex, '$2');
	const filename = href.replace(regex, '$3');
	const icon = base + '/site/icon.png';
	const style = base + '/site/style.css';
	const codestyle = base + '/site/hljs/vscode.css';
	const color = base + '/site/color.js';
	const linenums = base + '/site/linenums.js';
	const hljs = base + '/site/hljs/highlight.pack.js';
	const index = base + '/index.html';

	code = entityFromChar(code.trim());

	const html =
['data:text/html;charset=utf8,',
'<!DOCTYPE html>',
'<!-- Copyright 2020, Brigham Young University - Idaho. All rights reserved. -->',
'<html lang="en-us">',
'<head>',
'\t<meta charset="UTF-8">',
'\t<meta name="viewport" content="width=device-width, initial-scale=1.0">',
'\t<meta http-equiv="X-UA-Compatible" content="ie=edge">',
'\t<title>' + filename + '</title>',
'\t<link rel="icon" type="image/png" href="' + icon + '">',
'\t<link rel="stylesheet" type="text/css" href="' + style + '">',
'\t<link rel="stylesheet" type="text/css" href="' + codestyle + '">',
'\t<script src="' + color + '"></script>',
'\t<script src="' + linenums + '"></script>',
'\t<script src="' + hljs + '"></script>',
'</head>',
'',
'<body>',
'<header>',
'\t<div class="colorCtrl">&nbsp;</div>',
'\t<a class="logo" href="https://www.byui.edu">',
'\t\t<div>BYU</div>',
'\t\t<div>Idaho</div>',
'\t</a>',
'\t<h2><a href="https://byui.instructure.com">CSE 111</a> |',
'\t\t<a href="' + index + '">Programming with Functions</a></h2>',
'</header>',
'',
'<article class="solution">',
'\t<h1>' + lesson + '/' + filename + ' <a download title="Download ' + filename + '" href="' + href + '">[&darr;]</a></h1>',
'\t<div class="pre">',
'<pre class="linenums"></pre>',
'<pre class="python">' + code + '</pre>',
'\t</div>',
'</article>',
'',
'<footer>',
'\t<small>Copyright &copy; 2020, Brigham Young University - Idaho. All',
'\trights reserved.</small>',
'</footer>',
'</body>',
'</html>'].join('\n');
	const win = window.open(html);
	//const doc = win.document;
	//doc.open();
	//doc.write(html);
	//doc.close();
};


window.addEventListener('DOMContentLoaded', function(){cse111.url.openDoc();});
window.addEventListener('DOMContentLoaded', function(){cse111.url.modifyLinks();});
