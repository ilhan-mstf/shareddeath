/*! 
 * Copyright (c) 2013 Mustafa İlhan released under the MIT license
 */

(function(){

	//------------------------------
	// Shared
	//------------------------------
	var SERVER_URL = "http://shareddeath.nodejitsu.com"
	  , LANGUAGE = "en"
	  , SOCKET_TYPE = "tweet_en";
	
	window.exitApp = function() {};
	window.refreshApp = function() {};
	//window.bgAnimation = { pause, resume };

	// Hides mobile browser's address bar when page is done loading.
    window.addEventListener('load', function(e) {
    	setTimeout(function() { window.scrollTo(0, 1); }, 1);
    }, false);

	// Check for touch device behaviour and events for touch device
    if (!!('ontouchstart' in window)) {
    	$(".right-icons .icon").css({ display: "none" });
    	$(".language-selection").css({ "margin-right": 0, opacity: 1 });
	}

	function _(id) {
		return document.getElementById(id);
	}

	function changeLanguage(lang) {
		if (lang != LANGUAGE) {
			LANGUAGE = lang;
			if (LANGUAGE == "en") {
				SOCKET_TYPE = "tweet_en";
				_('langEN').className = 'language active';
				_('langTR').className = 'language';

				_('app1Title').innerHTML = "GRAVESTONE";
				_('app2Title').innerHTML = "TWO-DOOR INN";
				_('app3Title').innerHTML = "TOMB";
				_('aboutTitle').innerHTML = "ABOUT";
				_('aboutBody').innerHTML = 'Shared Death is a web-based artwork which filters shared thoughts containing keywords like "death", "dying" from the Twitter in real time. It is purpose is to help people better understand how other people thinks and feels about the shared destiny of all living things in the planet. You can participate in this experiment by sending tweet with #death keyword. <a target="_blank" href="http://goo.gl/sBvUa">Read More</a><br />Mustafa İlhan - <a target="_blank" href="https://twitter.com/mustilica">@mustilica</a>';

			} else {
				SOCKET_TYPE = "tweet_tr";
				_('langTR').className = 'language active';
				_('langEN').className = 'language';

				_('app1Title').innerHTML = "MEZAR TAŞI";
				_('app2Title').innerHTML = "İKİ KAPILI HAN";
				_('app3Title').innerHTML = "MAKBER";
				_('aboutTitle').innerHTML = "HAKKINDA";
				_('aboutBody').innerHTML = 'Paylaşılan Ölüm gerçek zamanlı olarak Twitter\'da içinde "ölüm", "ölüyorum" gibi anahtar kelimeleri içeren düşüncelerin filtrelenerek gösterildiği web tabanlı bir sanat uygulamasıdır. Amacı kullanıcıya diğer insanların gezegende yaşayan tüm canlıların ortak kaderi -ölüm- hakkında ne düşündüklerini ve nasıl hissettiklerini anlatmaya yardımcı olmaktır. Siz de #ölüm anahtar kelimesini içeren bir tweet atarak bu deneye katılabilirsiniz. <a target="_blank" href="http://goo.gl/sBvUa">Devamı</a><br />Mustafa İlhan - <a target="_blank" href="https://twitter.com/mustilica">@mustilica</a>';
			}
		}
	}

	//------------------------------
	// Home
	//------------------------------
	function openApp(app) {
		$("#home").fadeOut("easing-out", function() {
			$("#container").fadeOut("easing-out", function() {
				window.bgAnimation.pause();
				window.exitApp = app();
			});
		});
	}

	function goBackToHome() {
		window.bgAnimation.resume();
		
		$("#backIcon, #refreshIcon").css("display", "none");
		$("#rightIcons").css("display", "inline");

		$("#container").fadeIn("easing-out", function() {
			$("#home").fadeIn("easing-out", function() {

			});
		});
	}

	//------------------------------
	// App1
	//------------------------------
	function mezarTasi() {
		// Display scren
		$("#app1").css("display", "block");
		$("#backIcon").css("display", "inline");
		$("#refreshIcon").css("display", "none");
		$("#rightIcons").css("display", "none");

		var queue = []
		  ,	waiting = true // isWaiting to display a tweet.
		  ,	waitTextTimeout
		  ,	writeTextTimeout
		  ,	textTime = 64 // msec.
		  ,	animationTime = 400 // msec.
		  ,	tweetList = $('ul')
		  ,	listElementHeight = 0
		  ,	socket = io.connect(SERVER_URL, {'force new connection':true})
		  ,	maxIndexCount = Math.floor(tweetList.width() / (parseInt($("li").css("font-size").substring(0,2), 10)/2) ) - 1; // TODO Window resizeda tekrar kontrol et.
 			
		/**
		 * Display first tweet of queue.
		 */ 
		function displayTwit() {
			if (queue.length) {
				var data = queue.shift();
				if (typeof data != 'undefined') {
					writeText(data, 1);
					waiting = false;
				} else {
					console.warn("data is undefined.");
				}
			} else {
				// if queue is empty then wait for new tweets.
				waiting = true;
			}
		}

		/**
		 * Writes tweets to the page.
		 */
		function writeText(data, index) {
			// Stop waitText animation
			clearTimeout(waitTextTimeout);
			// Get current list element
			var current = $("#current");

			if (typeof current[0] == 'undefined') {
				console.warn("current is undefined");
				return;
			}
			
			// Write text
			current.text(data.text.substring(0, index));

			if (index <= data.text.length - 1) {

				// Animtion check for multiple line tweets
				if (index % maxIndexCount == 0) {
					
					if (!listElementHeight) {
						// Calculate list element height
						listElementHeight = current.outerHeight();
					}

					// If tweet is multiple line animate it.
					current.animate({height: current.height() + listElementHeight}, animationTime, function() {
						writeTextTimeout = setTimeout(writeText, textTime, data, index+1);
					});
					return;
				}

				// Call for the next index.
				writeTextTimeout = setTimeout(writeText, textTime, data, index+1);

			} else {
				// Writing tweet finished.
				// Change style and animate list element.
				current.removeAttr('id');
				current.delay(animationTime).animate({opacity: .6}, animationTime, function () {
					// Insert new one
					tweetList.prepend('<li id="current" class="active">&nbsp;</li>');
					$("#current").delay(textTime).slideDown(animationTime, function () {
						waitText(true);
						displayTwit();
					});
				});
			}
		}

		/**
		 * Waiting animation until new tweet comes.
		 */
		function waitText(state) {
			var current = $("#current");
			state ? current[0].innerHTML = "|" : current[0].innerHTML = "&nbsp;";
			waitTextTimeout = setTimeout(waitText, animationTime, !state);
			// TODO fade-in fade-out
		}

		/**
		 * Exit function to stop ongoing executions.
		 */
		function exit() {
			// Disconnect from server.
 			socket.disconnect();
 			
 			queue = [];
 			waiting = false;
			// Stop current animations
 			clearTimeout(waitTextTimeout);
 			clearTimeout(writeTextTimeout);

			// Fade-out screen and open homescreen
 			$("#app1").fadeOut("easing-out", function() {
	 			// Empty tweets and insert initial 
	 			tweetList.empty().append('<li id="current" class="active" style="display: block">&nbsp;</li>');
 				goBackToHome();
 			});
 		}

		// Start
 		waitText(true);

		// Get tweets from server.
		socket.on(SOCKET_TYPE, function (data) {
			queue.push(data);
			if (waiting && queue.length == 1) {
				displayTwit();
			}
		}); 

 		return exit;
	}

	//------------------------------
	// App2
	//------------------------------
	function ikiKapiliHan() {
		// Display scren
		$("#app2").css("display", "block");
		$("#backIcon").css("display", "inline");
		$("#refreshIcon").css("display", "none");
		$("#rightIcons").css("display", "none");

		var queue = []
		  ,	paused = true
		  ,	tweetList = $('#tweets-app2')
		  ,	socket = io.connect(SERVER_URL, {'force new connection':true});

		var options = {
		  	duration: 5000			// Time (ms) each blurb will remain on screen
		  , rearrangeDuration: 1000	// Time (ms) a character takes to reach its position
		  , effect: 'fadeIn'		// Animation effect the characters use to appear
		  , centered: true			// Centers the text relative to its container
		};

		/**
		 * Exit function to stop ongoing executions.
		 */
		function exit() {
			// Disconnect from server.
 			socket.disconnect();
			// Stop current animations
 			tweetList.textualizer('stop');

			// Fade-out screen and open homescreen
 			$("#app2").fadeOut("easing-out", goBackToHome);
 		}

		tweetList.textualizer(queue, options); // textualize it!

		tweetList.on('textualizer.changed', function(event, args) {
		  	// Check if it's the last index in the array
		  	//console.log("args.index: " + args.index + ", queue.length" + queue.length)
		  	if (args.index == queue.length - 1) {
		    	tweetList.textualizer('pause');
		    	paused = true;
		    	console.log("paused");
		  	}
		});

		socket.on(SOCKET_TYPE, function (data) {
			var text = data.text
			queue.push(text);
			
			if (paused && queue.length < 2) {
				tweetList.textualizer('start');
				paused = false;
				console.log("started");
			}
		}); 

 		return exit;
	}

	//------------------------------
	// App3
	//------------------------------
	function makber() {
		// Display scren
		$("#app3").fadeIn();
		$("#backIcon, #refreshIcon").css("display", "inline");
		$("#rightIcons").css("display", "none");

		var width = $(window).width()
		  , height = $(window).height()
		  , fontSize;

		if (width > 2200) {
			fontSize = "58px";
		} else if (width > 1600) {
			fontSize = "40px";
		} else if (width > 1024) {
			fontSize = "32px";
		} else if (width > 640) {
			fontSize = "24px";
		} else {
			fontSize = "16px";
		}

		var tweetList = $('#tweets-app3')
		  ,	socket = io.connect(SERVER_URL, {'force new connection':true});

		/**
		 * Display tweet on the screen
		 */
		function displayTweet(text) {
			var element = jQuery('<div />')
					.text(text)
						.attr('class', 'tweet')
						.css(getPositions(height, width));
			tweetList.prepend(element);
			element.animate({'font-size': fontSize, 'letter-spacing': '1px'}, 400);
		}

		/**
		 * Calculate and return the position of tweet.
		 */
		function getPositions(height, width) {
			var direction = Math.floor(Math.random() * 10) % 2
			  , css = {};
			
			// Top or bottom
			if (direction) {
				css.top = Math.floor((Math.random()*10000) % height);
			} else {
				css.bottom = Math.floor((Math.random()*10000) % height);
			}

			direction = Math.floor(Math.random() * 10) % 2;
			// Left or right
			if (direction) {
				css.left = Math.floor((Math.random()*10000) % width);
			} else {
				css.right = Math.floor((Math.random()*10000) % width);
			}
			return css;
		}

		/**
		 * Clears the screen
		 */
		function clearScreen() {
			tweetList.empty();
		}

		/**
		 * Exit function to stop ongoing executions.
		 */
		function exit() {
 			// Disconnect from server.
 			socket.disconnect();

			// Fade-out screen and open homescreen
 			$("#app3").fadeOut("easing-out", function() {
 				clearScreen();
 				goBackToHome();
 			});
 		}

 		window.refreshApp = clearScreen;

		socket.on(SOCKET_TYPE, function (data) {
			displayTweet(data.text);
		}); 

		return exit;
	}

	//------------------------------
	// Listeners
	//------------------------------
	_('mezarTasi').addEventListener("click", function() { openApp(mezarTasi); }, false);
	_('ikiKapiliHan').addEventListener("click", function() { openApp(ikiKapiliHan); }, false);
	_('makber').addEventListener("click", function() { openApp(makber); }, false);

	_('backIcon').addEventListener("click", function() { exitApp(); }, false);
	_('refreshIcon').addEventListener("click", function() { refreshApp(); }, false);

	_('langEN').addEventListener("click", function() { changeLanguage('en'); }, false);
	_('langTR').addEventListener("click", function() { changeLanguage('tr'); }, false);

})();
