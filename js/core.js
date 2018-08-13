// core.js
$.ajaxSetup({
	type: 'POST',
	timeout: 5000
});
TweenMax.defaultEase = Quad.easeOut;
var g = {
	reloadGame: false,
	attackTimer: 0,
	splitAttackTimer: 0,
	cannonTimer: 0,
	missileTimer: 0,
	nukeTimer: 0,
	Msg: document.getElementById('Msg'),
	msgTimer: new TweenMax.delayedCall(0, ''),
	camel: function(str){
		str = str.split("-");
		for (var i=1, len=str.length; i<len; i++){
			str[i] = str[i].charAt(0).toUpperCase() + str[i].substr(1);
		}
		return str.join("");
	},
	msg: function(msg, d) {
		if (!msg.trim()) return;
		if (d === 0){
			TweenMax.set(g.Msg, {
				overwrite: 1,
				startAt: {
					opacity: 1
				}
			});
		}
		else {
			if (d === undefined || d < 2){
				d = 2;
			}
			g.msgTimer.kill();
			g.msgTimer = TweenMax.to(g.Msg, d, {
				startAt: {
					scaleY: 1,
					opacity: 1
				},
				onComplete: function(){
					g.msgClose();
				}
			});
		}
		if (msg) {
			g.Msg.innerHTML = msg;
		}
		// split text animation
		var tl = new TimelineMax(),
			split = new SplitText(g.Msg, {
				type: "words,chars"
			}),
			chars = split.chars;

		tl.staggerFromTo(chars, .01, {
			immediateRender: true,
			alpha: 0
		}, {
			delay: .1,
			alpha: 1
		}, .01);
	},
	msgClose: function() {
		TweenMax.to(g.Msg, .3, {
			scaleY: 0
		});
	},
	gameDuration: 0,
	spectateStatus: 0,
	modalSpeed: .5,
	friends: [],
	ignore: [],
	color: [
		"#02063a",
		"#bb0000",
		"#0077ff",
		"#a5a500",
		"#006000",
		"#b06000",
		"#33ddff",
		"#b050b0",
		"#5500aa",
		"#660000",
		"#0000bb",
		"#663300",
		"#33dd33",
		"#222222",
		"#00ff99",
		"#ff6666",
		"#ff00ff",
		'#e4e4e4',
		'#220088',
		'#404000',
		'#888888'
	],
	rankedMode: 0,
	teamMode: 0,
	joinedGame: false,
	searchingGame: false,
	defaultTitle: 'Firmament Wars',
	titleFlashing: false,
	name: "",
	password: "",
	speed: 12,
	focusUpdateNationName: false,
	focusGameName: false,
	view: "title",
	sfxFood: false,
	sfxCulture: false,
	chatOn: false,
	overlay: document.getElementById("overlay"),
	over: 0,
	showSpectateButton: 1,
	victory: false,
	startTime: Date.now(),
	keyLock: false,
	loadAttempts: 0,
	upgradeCost: [40, 50, 60],
	isModalOpen: false,
	lock: function(clear){
		g.overlay.style.display = "block";
		g.overlay.style.opacity = clear === void 0 ? 0 : 1;
		g.keyLock = true;
	},
	unlock: function(clear){
		g.overlay.style.display = "none";
		clear ? g.overlay.style.opacity = 0 : g.overlay.style.opacity = 1;
		g.keyLock = false;
	},
	unlockFade: function(d){
		if (!d){
			d = 1;
		}
		TweenMax.to(g.overlay, d, {
			startAt: {
				opacity: 1,
			},
			ease: Power3.easeIn,
			opacity: 0,
			onComplete: function(){
				g.overlay.style.display = 'none';
			}
		});
	},
	TDC: function(){
		return new TweenMax.delayedCall(0, '');
	},
	screen: {
		resizeMap: function(){
			// set worldWrap CSS
			$("#mapStyle").remove();
			var css =
				'<style id="mapStyle">#worldWrap{ '+
					'position: absolute; '+
					'top: 0%; '+
					'left: 0%; '+
					'width: ' + ((g.map.sizeX / window.innerWidth) * 100) + '%; '+
					'height: ' + ((g.map.sizeY / window.innerHeight) * 100) + '%; '+
				'}</style>';
			$DOM.head.append(css);
			setTimeout(applyBounds);
		}
	},
	mouse: {
		x: 0,
		y: 0,
		zoom: 100,
		mouseTransX: 50,
		mouseTransY: 50
	},
	map: {
		sizeX: 5099,
		sizeY: 2627,
		name: 'Alpha Earth',
		key: 'AlphaEarth',
		tiles: 143
	},
	updateUserInfo: function(){
		if (location.host !== 'localhost'){
			$.ajax({
				async: true,
				type: 'GET',
				dataType: 'jsonp',
				url: 'https://geoip-db.com/json/geoip.php?jsonp=?'
			}).done(function(data){
				data.latitude += '';
				data.longitude += '';
				g.geo = data;
				$.ajax({
					url: app.url + 'php/updateUserInfo.php',
					data: {
						location: g.geo
					}
				}).done(function(){
					localStorage.setItem('geo', JSON.stringify(g.geo));
					localStorage.setItem('geoSeason', 1);
					localStorage.setItem('geoTime', Date.now());
				});
				//console.info('loc: ', g.geo);
			});
		}
	},
	checkPlayerData: function(){
		var geo = localStorage.getItem(my.account+ '_geo'),
			geoTime = localStorage.getItem(my.account+ '_geoTime'),
			geoSeason = localStorage.getItem(my.account+ '_geoSeason');

		if (geoTime !== null || geoSeason === null){
			// longer than 90 days?
			if ((Date.now() - geoTime) > 7776000 || geoSeason === null){
				g.updateUserInfo();
			}
		}
		else if (geo === null){
			g.updateUserInfo();
		}
		// ignore list
		var ignore = localStorage.getItem('ignore');
		if (ignore !== null){
			g.ignore = JSON.parse(ignore);
		} else {
			// first time user... open configure nation
			app.isApp && title.configureNation();
			var foo = [];
			localStorage.setItem('ignore', JSON.stringify(foo));
		}
		var bible = localStorage.getItem('bible') * 1;
		$("#bible-status").prop('checked', !!bible);
		stats.setBibleMode(bible);
	},
	config: {
		audio: {
			musicVolume: 10,
			soundVolume: 20
		}
	},
	geo: {},
	keepAlive: function(){
		$.ajax({
			type: 'GET',
			url: app.url + "php/keepAlive.php"
		}).always(function() {
			setTimeout(g.keepAlive, 120000);
		});
	},
	removeContainers: function(){
		$("#firmament-wars-logo-wrap, #mainWrap").remove();
	},
	notification: {},
	sendNotification: function(data){
		if (!document.hasFocus() && g.view !== 'game' && typeof Notification === 'function'){
			
			Notification.requestPermission().then(function(permission){
				if (permission === 'granted'){
					// it's a player message
					var type = ' says: ';
					if (data.flag && (data.msg || data.message)){
						// sent by a player
						if (data.type === 'chat-whisper'){
							type = ' whispers: ';
						}
						var prefix = data.account + type;
						g.notification = new Notification(prefix, {
							icon: 'images/flags/' + flagFile,
							tag: "Firmament Wars",
							body: data.msg ? data.msg : data.message
						});
						g.notification.onclick = function(){
							window.focus();
						}
						// title flash
						if (!g.titleFlashing){
							g.titleFlashing = true;
							(function repeat(toggle){
								if (!document.hasFocus()){
									if (toggle % 2 === 0){
										document.title = prefix;
									} else {
										document.title = g.defaultTitle;
									}
									setTimeout(repeat, 3000, ++toggle);
								}
							})(0);
						}
						audio.play('chat');
					}
				}
			});
		}
	},
	chat: function(msg, type){
		var o = {
			message: msg,
			type: type
		};
		if (g.view === 'title'){
			title.chat(o);
		} else if (g.view === 'lobby'){
			lobby.chat(o);
		} else {
			game.chat(o);
		}
	},
	getRandomFlag: function(){
		var a = [],
			i = 0;
		for (var key in g.flagData){
			g.flagData[key].name.forEach(function(flag){
				a[i++] = flag;
			});
		}
		var len = a.length,
			ind = ~~(Math.random() * len);
		return a[ind];
	},
	flagData: {
		Africa: {
			group: "Africa",
			name: ['Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'The Comoros', 'The Congo', 'Democratic Republic of the Congo', 'Djibouti', 'Equatorial Guinea', 'Eritrea', 'Gabon', 'The Gambia', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda', 'Sao Tome and Príncipe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Swaziland', 'Tanzania', 'Togo', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe']
		},
		Asia: {
			group: "Asia",
			name: ['Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China', 'East Timor', 'Hong Kong', 'India', 'Indonesia', 'Japan', 'Laos', 'Malaysia', 'Maldives', 'Mongolia', 'Myanmar', 'Nepal', 'North Korea', 'Pakistan', 'Philippines', 'Republic of Korea', 'Singapore', 'Sri Lanka', 'Suriname', 'Taiwan', 'Thailand', 'Vietnam']
		},
		CentralAsia: {
			group: "Central Asia",
			name: ['Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Kyrgyzstan', 'Tajikistan', 'Turkmenistan', 'Uzbekistan']
		},
		Europe: {
			group: "Europe",
			name: ['Albania', 'Andorra', 'Austria', 'Belarus', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'England', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macedonia', 'Malta', 'Moldova', 'Monaco', 'Montenegro', 'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Scotland', 'Serbia', 'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom', 'Vatican City']
		},
		Historic: {
			group: "Historic",
			name: ['Benin Empire', 'Byzantine Empire', 'Confederate Flag', 'Flanders', 'Gadsden Flag', 'Holy Roman Empire', 'Isle of Man', 'Rising Sun Flag', 'NSDAP Flag', 'NSDAP War Ensign', 'Ottoman Empire', 'Rhodesia', 'Roman Empire', 'Shahanshahi', 'USSR', 'Veneto', 'Welsh']
		},
		MiddleEast: {
			group: "Middle East",
			name: ['Afghanistan', 'Bahrain', 'Iran', 'Iraq', 'Israel', 'Jerusalem', 'Jordan', 'Kurdistan', 'Kuwait', 'Lebanon', 'Oman', 'Palestine', 'Qatar', 'Saudi Arabia', 'Syria', 'Turkey', 'United Arab Emirates', 'Yemen']
		},
		Miscellaneous: {
			group: "Miscellaneous",
			name: ['Anarcho-Capitalist', 'Anarcho-Syndicalist', 'Antifa', 'Cascadia', 'Christian', 'European Union', 'High Energy', 'ISIS', 'Jefferson State', 'Jolly Roger', 'Kekistan', 'Northwest Front', 'Pan-African Flag', 'pol', 'Rainbow Flag', 'Sicily', 'United Nations']
		},
		NorthAmerica: {
			group: "North America",
			name: ['Antigua and Barbuda', 'Bahamas', 'Barbados', 'Belize', 'Canada', 'Costa Rica', 'Cuba', 'Dominica', 'Dominican Republic', 'El Salvador', 'Grenada', 'Guatemala', 'Jamaica', 'Haiti', 'Honduras', 'Mexico', 'Panama', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Trinidad and Tobago', 'United States']
		},
		Oceania: {
			group: "Oceania",
			name: ['Australia', 'Fiji', 'Kiribati', 'Marshall Islands', 'Federated States of Micronesia', 'Nauru', 'New Zealand', 'Palau', 'Papua New Guinea', 'Samoa', 'Solomon Islands', 'Tonga', 'Tuvalu', 'Vanuatu']
		},
		SouthAmerica: {
			group: "South America",
			name: ['Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia', 'Ecuador', 'Guyana', 'Nicaragua', 'Paraguay', 'Peru', 'Uruguay', 'Venezuela']
		},
		US_States: {
			group: "State Flags",
			name: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia State', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming']
		},
		US_Territories: {
			group: "US Territories",
			name: ['American Samoa', 'District of Columbia', 'Guam', 'Johnston Atoll', 'Midway Islands', 'Navassa Island', 'Northern Mariana Islands', 'Palmyra Atoll', 'Puerto Rico', 'Virgin Islands', 'Wake Island']
		},
	},
	initGameCallback: function(data) {
		// handle hiding/showing menu based on environment
		if (app.isApp) {
			$("#logout").remove();

			if (localStorage.getItem('disconnects')) {
				$.ajax({
					type: 'GET',
					url: app.url + 'php/disconnect.php'
				});
				localStorage.setItem('disconnects', null);
			}
		}
		else {
			$("#logout").css('display', 'inline-block');
		}
		lang.updateIndexHtml();
		TweenMax.staggerTo(document.getElementsByClassName('action-btn'), .5, {
			startAt: { x: -30 },
			x: 0,
			opacity: 1
		}, .1);

		console.info('init-game', data.account, data);
		var lastChannel = localStorage.getItem('channel') === null ?
			'usa-1' : localStorage.getItem('channel');
		my.channel = lastChannel;
		$('.actionButtons').tooltip({
			animation: false,
			placement: 'left',
			container: 'body'
		});
		$('[title]').tooltip({
			animation: false,
			placement: 'bottom',
			container: 'body'
		});
		if (data.account) {
			app.account = data.account; // for global reference
			isLoggedIn = 1;
			$('#logout').text('Logout ' + data.account);
			app.isApp && $("#login-modal").remove();
			// people playing firmament wars:
			/*title.chat({
				message: 'There are '+ data.currentPlayers +' people playing Firmament Wars.'
			});*/
			// set flag
			document.getElementById('updateNationFlag').src = 'images/flags/'+ data.flag;
			document.getElementById('selectedFlag').textContent = data.flagShort;
			// initChatId
			my.account = data.account;
			my.flag = data.flag;
			my.rating = data.rating;
			my.nation = data.nation;
			g.checkPlayerData();
			title.friendGetCallback(data.friends);
			g.msgClose();
		}
		else {
			notLoggedIn();
		}
		// animate logo
		/* blur(5px) hue-rotate(360deg) brightness(100%) contrast(100%) shadow(100%) (chrome not supported?) grayscale(100%) invert(100%) opacity(100%) saturate(100%) sepia(100%) */
		var e = document.getElementById('firmamentWarsLogo');
		function applyFilter(o) {
			e.style.filter =
				'drop-shadow(0px 0px '+ o.shadow +'px #048) ' +
				'brightness('+ o.brightness +'%)';
		}
		var o = {
			shadow: 2,
			brightness: 100
		};
		TweenMax.to(o, 3, {
			overwrite: 1,
			shadow: 12,
			brightness: 150,
			repeat: -1,
			yoyo: true,
			ease: Power4.easeIn,
			onUpdate: function() {
				applyFilter(o);
			}
		});
		// handle setting accounts and config nation for new players
		console.info('setAccountName', data.setAccountName);
		(function repeat() {
			if (typeof socket === 'object') {
				socket.init();
			}
			else {
				setTimeout(repeat, 100);
			}
		})();
		data.isNewAccount && title.configureNation();
	}
};
g.init = (function(){
	g.lock();
	if (app.isApp) {
		$("#exit-game").on('click', function() {
			title.exitGame();
		});
	}
	$("#reset-game").on('click', function() {
		location.reload();
	});
	TweenMax.to('#title-stars-1', 50, {
		startAt: { backgroundPosition: '0'},
		force3D: true,
		backgroundPosition: '-1920px',
		repeat: -1,
		ease: Linear.easeNone
	});
	TweenMax.to('#title-stars-2', 75, {
		startAt: { backgroundPosition: '200px -200px'},
		backgroundPosition: '-1720px -200px',
		repeat: -1,
		ease: Linear.easeNone
	});
	TweenMax.to('#title-stars-3', 100, {
		startAt: { backgroundPosition: '400px -400px'},
		backgroundPosition: '-1520px -400px',
		repeat: -1,
		ease: Linear.easeNone
	});
	TweenMax.to('#title-backdrop', 12, {
		startAt: { scale: 1, transformOrigin: '0% 100%' },
		scale: 3,
		repeat: -1,
		yoyo: true,
		ease: Power1.easeInOut
	});
	TweenMax.to('#firmamentWarsBG', 1, {
		startAt: { y: '-47%' },
		y: '-50%',
		onComplete: function() {
			TweenMax.to('#firmamentWarsBG', 10, {
				startAt: { scale: 1 },
				scale: 1.08,
				repeat: -1,
				yoyo: true,
				ease: Power1.easeInOut
			});
		}
	});
	// default
	my.lang = 'english';
	if (app.isApp) {
		g.lock(1);
		// app login, check for steam ticket
		var greenworks = require('./greenworks'),
			steam = {
				screenName: '',
				steamid: '',
				handle: 0
			};

		if (greenworks.initAPI()) {
			greenworks.init();
			var langPref = greenworks.getCurrentUILanguage(),
				z = greenworks.getSteamId();

			var index = lang.alternateSupportedLanguages.indexOf(langPref);
			/*title.chat({
				message: 'Detected language: ' + langPref
			});*/
			if (index > -1) {
				my.lang = lang.alternateSupportedLanguages[index];
			}

			g.msg(lang[my.lang].verifyingSteam);

			steam.screenName = z.screenName;
			steam.steamid = z.steamId;
			greenworks.getAuthSessionTicket(function (data) {
				steam.handle = data.handle;
				$.ajax({
					type: 'POST',
					url: app.url + 'php/init-game.php',
					data: {
						version: app.version,
						screenName: steam.screenName,
						steamid: steam.steamid,
						ticket: data.ticket.toString('hex')
					}
				}).done(function(data) {
					greenworks.cancelAuthTicket(steam.handle);
					g.initGameCallback(data);
				}).fail(function(data) {
					g.lock(1);
					data.responseText && g.msg(data.responseText, 0);
				});
			});
		}
		else {
			g.lock(1);
			g.msg(lang[my.lang].steamNotFound, 0);
		}
	}
	else {
		// non-app login
		$.ajax({
			type: "POST",
			url: app.url + 'php/init-game.php',
			data: {
				version: app.version,
				screenName: '',
				steamid: '',
				ticket: ''
			}
		}).done(function(data) {
			g.initGameCallback(data);
		}).fail(function(data) {
			g.lock(1);
			data.responseText && g.msg(data.responseText, 0);
		});
	}

	// TODO separate this confusing logic a bit
	if (location.hostname === 'localhost'){
		if (location.hash === '#stop') {
			stats.delete();
		}
		else {
			g.reloadGame = true;
			$.ajax({
				type: "GET",
				url: app.url + 'php/rejoinGame.php' // check if already in a game
			}).done(function(data) {
				console.info('rejoin ', data.gameId, data.team);
				if (data.gameId > 0){
					my.player = data.player;
					my.playerColor = data.player;
					g.teamMode = data.teamMode;
					g.rankedMode = data.rankedMode;
					my.team = data.team;
					game.id = data.gameId;
					g.map = data.mapData;
					// g.speed = data.speed;
					// join lobby in progress
					setTimeout(function(){
						lobby.init(data);
						lobby.join(0); // autojoin
						initResources(data); // setResources(data);
						my.government = data.government;
						lobby.updateGovernmentWindow(my.government);
						socket.joinGame();
					}, 111);
				}
				else {
					stats.delete();
				}
			}).fail(function(data){
				g.msg(data.responseText);
			});
		}
	}
	else {
		stats.delete();
	}
})();
var game = {
	name: '',
	tiles: [],
	initialized: false,
	presence: {
		list: {},
		hb: function(data) {
			data.timestamp = Date.now();
			console.log('%c gameHeartbeat: ', 'background: #0f0; color: #f00');
			console.info(data);
			this.update(data);
			this.audit(data.timestamp);
		},
		update: function(data) {
			this.list[data.account] = data;
		},
		remove: function(data) {
			console.log("remove: ", data.account, data.player);
			this.list[data.account] = void 0;
			var z = document.getElementById('diplomacyPlayer' + data.player);
			if (z !== null){
				z.parentNode.removeChild(z);
			}
		},
		reset: function() {
			this.list = {};
		},
		audit: function(now) {
			for (var key in this.list) {
				this.list[key] !== void 0 &&
					now - this.list[key].timestamp > 5000 &&
					this.remove(this.list[key]);
			}
		}
	},
	toggleGameWindows: function(){
		var x = $("#ui2-head").css('visibility') === 'visible';
		TweenMax.set(DOM.gameWindows, {
		  	visibility: x ? 'hidden' : 'visible'
		});
		if (x) {
			TweenMax.to('#hotkey-ui', .5, {
				startAt: {
					opacity: 0,
					visibility: 'visible'
				},
				opacity: 1
			});
		}
		else {
			TweenMax.set('#hotkey-ui', {
				visibility: 'hidden'
			});
		}
	},
	toggleFlags: function(){
		var x = $("#diplomacy-body").css('display') === 'block';
		TweenMax.set('#diplomacy-body', {
		  	display: x ? 'none' : 'block'
		});
	},
	player: [0,0,0,0,0,0,0,0,0], // cached values on client to reduce DB load
	initMap: function(){
		(function(d, len){
			for (var i=0; i<len; i++){
				DOM['land' + i] = d.getElementById('land' + i);
				DOM['flag' + i] = d.getElementById('flag' + i);
				DOM['unit' + i] = d.getElementById('unit' + i);
			}
		})(document, game.tiles.length);
	},
	chat: function(data){
		while (DOM.chatContent.childNodes.length > 10) {
			DOM.chatContent.removeChild(DOM.chatContent.firstChild);
		}
		var z = document.createElement('div');
		if (data.type){
			z.className = data.type;
		}
		z.innerHTML = data.message;
		DOM.chatContent.appendChild(z);
		setTimeout(function(){
			if (z !== undefined){
				if (z.parentNode !== null){
					TweenMax.to(z, .125, {
						alpha: 0,
						onComplete: function(){
							z.parentNode !== null && z.parentNode.removeChild(z);
						}
					});
				}
			}
		}, 12000);
	},
	eliminatePlayer: function(data){
		// player eliminated
		var i = data.player,
			playerCount = 0,
			cpuCount = 0,
			teams = [];

		game.player[i].alive = false;
		// count alive players remaining
		game.player.forEach(function(e, index){
			if (e.account){
				if (e.alive){
					if (!e.cpu){
						// only counts human players
						//console.info('Human player found at: '+ index);
						playerCount++;
						if (teams.indexOf(e.team) === -1){
							teams.push(e.team);
						}
					}
					if (e.cpu){
						//console.info('CPU player found at: '+ index);
						cpuCount++;
					}
				}
			}
		});
		// found 2 players on diplomacy panel
		$("#diplomacyPlayer" + i).removeClass('alive');
		console.info(playerCount, cpuCount, teams);
		if (g.teamMode){
			if (teams.length <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		}
		else {
			if (playerCount <= 1){
				// disables spectate button
				g.showSpectateButton = 0;
			}
		}
		// game over - insurance check to avoid multiples somehow happening
		if (!g.over){
			// it's not over... check with server
			console.info('ELIMINATED: ', playerCount, teams.length);
			if (i === my.player){
				gameDefeat();
			}
			else {
				// check if I won
				// cpus must be dead
				if (g.teamMode){
					if (teams.length <= 1){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				}
				else {
					if (playerCount <= 1 && !cpuCount){
						setTimeout(function(){
							gameVictory();
						}, 1000);
					}
				}
			}
		}
		// remove
		TweenMax.set('#diplomacyPlayer' + i, {
			autoAlpha: 0,
			onComplete: function(){
				$("#diplomacyPlayer" + i).css('display', 'none');
			}
		});
		TweenMax.set('#diplomacyPlayer' + i, 0, {
			startAt: { 
				transformPerspective: 400,
				transformOrigin: '50% 0',
				rotationX: 0
			},
			paddingTop: 0,
			paddingBottom: 0,
			height: 0,
			rotationX: -90
		});
		data.eliminateType !== 'byPlayer' && game.removePlayer(i);
	},
	removePlayer: function(p){
		game.tiles[p].account = '';
		game.tiles[p].nation = '';
		game.tiles[p].flag = '';
		for (var i=0, len=game.tiles.length; i<len; i++){
			if (game.tiles[i].player === p){
				game.tiles[i].account = '';
				game.tiles[i].defense = '';
				game.tiles[i].flag = '';
				game.tiles[i].nation = '';
				game.tiles[i].player = 0;
				game.tiles[i].units = 0;
				game.tiles[i].tile = i;
				game.updateTile(game.tiles[i]);
			}
		}
	},
	getGameState: function(){
		// this is now a reality check in case zmq messes up?
		// or check that players are still online?
		$.ajax({
			type: 'GET',
			url: app.url + "php/getGameState.php"
		}).done(function(data){
			// get tile data
			for (var i=0, len=data.tiles.length; i<len; i++){
				var d = data.tiles[i],
					updateTargetStatus = false;
				// check player value
				if (d.player !== game.tiles[i].player){
					// player value has changed
					if (!game.tiles[i].units){
						// set text visible if uninhabited
						// this confuses me still...
						TweenMax.set(DOM['unit' + i], {
							visibility: 'visible'
						});
					}
					// only update client data
					game.tiles[i].player = d.player;
					game.tiles[i].account = game.player[d.player].account;
					game.tiles[i].nation = game.player[d.player].nation;
					game.tiles[i].flag = game.player[d.player].flag;
					
					if (my.tgt === i){
						// current target was updated
						updateTargetStatus = true;
					}
					var newFlag = !game.player[d.player].flag ? 
						'blank.png' : game.player[d.player].flag;
					if (DOM['flag' + i] !== null){
						DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
					}
					TweenMax.set(DOM['land' + i], { 
						fill: g.color[game.player[d.player].playerColor],
						stroke: d.player ? g.color[game.player[d.player].playerColor] : '#aaa',
						strokeWidth: 1,
						onComplete: function(){
							if (d.player){
								TweenMax.set(this.target, {
									stroke: "hsl(+=0%, +=0%, -=30%)"
								});
							}
						}
					});
				}
				// check unit value
				if (d.units !== game.tiles[i].units){
					game.tiles[i].units = d.units;
					if (my.tgt === i){
						// defender won
						updateTargetStatus = true;
					}
					ui.setTileUnits(i);
				}
				
				updateTargetStatus && ui.showTarget(DOM['land' + i]); 
			}
		}).fail(function(data){
			console.info(data.responseText);
		});
	},
	updateDefense: function(data){
		var i = data.tile;
		game.tiles[i].defense = data.defense;
		animate.updateMapBars(i);
		if (my.tgt === i){
			ui.showTarget(DOM['land' + my.tgt]);
		}
	},
	updateTile: function(d){
		var i = d.tile * 1,
			p = d.player * 1,
			timestamp = d.timestamp * 10000;
		// this update happened on the server earlier than most recent update... ignore!
		if (timestamp < game.tiles[i].timestamp) {
			console.warn('did not update', i, timestamp, game.tiles[i].timestamp, timestamp < game.tiles[i].timestamp);
			return;
		}
		// only update client data
		console.info('updateTile: ', d);
		game.tiles[i].player = p;
		game.tiles[i].account = game.player[p].account;
		game.tiles[i].nation = game.player[p].nation;
		game.tiles[i].flag = game.player[p].flag;
		game.tiles[i].timestamp = timestamp;
		var newFlag = game.player[p].flag;
		// change flag
		if (DOM['flag' + i] !== null && newFlag){
			// check barb
			if (newFlag === 'blank.png' && d.units) {
				newFlag = 'Barbarian.jpg';
			}
			//console.info('newFlag', newFlag, d.units);
			DOM['flag' + i].href.baseVal = "images/flags/" + newFlag;
		}
		// land color
		TweenMax.set(DOM['land' + i], {
			fill: g.color[game.player[p].playerColor],
			stroke: p ? g.color[game.player[p].playerColor] : '#aaa',
			strokeWidth: 1,
			onComplete: function(){
				if (p){
					TweenMax.set(this.target, {
						stroke: "hsl(+=0%, +=0%, "+ (my.tgt === i ? "+=15%)" : "-=30%)")
					});
				}
			}
		});
		
		// check unit value
		if (d.units){
			if (d.units !== game.tiles[i].units){
				game.tiles[i].units = d.units;
				ui.setTileUnits(i);
			}
		}
		else {
			// dead/surrender
			game.tiles[i].units = 0;
			TweenMax.set(DOM['unit' + i], {
				visibility: 'hidden'
			});
		}
		
		my.tgt === i && ui.showTarget(DOM['land' + i]);
		ui.drawDiplomacyPanel();
		location.host === 'localhost' && localStorage.setItem('fwtiles', JSON.stringify(game.tiles));
	},
	isMineOrAdjacent: function(tile) {
		if (game.tiles[tile].player === my.player) return 1;
		if (!game.tiles[tile].units) return 0;
		var foo = 0;
		game.tiles[tile].adj.forEach(function(v) {
			if (game.tiles[v].player === my.player) {
				foo = 1;
			}
		});
		return foo;
	},
	setVisibilityAll: function() {
		game.tiles.forEach(function(o, i) {
			//tile.adj.forEach(function(v) {
				ui.setUnitVisibility(i);
			//});
		});
	},
	setSumValues: function(){
		var o = {
			food: 0,
			production: 0,
			culture: 0
		}
		for (var i=0; i<g.tileCount; i++){
			if (my.player === game.tiles[i].player){
				o.food += game.tiles[i].food;
				o.production += game.tiles[i].production;
				o.culture += game.tiles[i].culture;
			}
		}
		//DOM.sumFood.textContent = o.food;
		//DOM.sumProduction.textContent = o.production;
		//DOM.sumCulture.textContent = o.culture;
	},
	energyTimer: 0,
	startGameState: function(){
		// add function to get player data list?
		game.getGameState();
		game.energyTimer = setInterval(game.updateResources, g.speed * 1000);
		animate.energyBar();
	},
	triggerNextTurn: function(data){
		//console.info("TRIGGERING NEXT TURN!", data);
		clearInterval(game.energyTimer);
		game.energyTimer = setInterval(game.updateResources, g.speed * 1000);
		game.updateResources();
	},
	lowestPlayerIsMe: function() {
		var lowestId = my.player;
		game.player.forEach(function(v) {
			if (v.alive && v.player < lowestId) {
				lowestId = v.player;
			}
		});
		return lowestId === my.player;
	},
	playerActivatesCpuTurn: function(cpu) {
		var count = 0,
			alivePlayers = [];

		game.player.forEach(function(v, i) {
			//console.info('alivePlayers status: ', v.alive, v.cpu);
			if (v.alive && v.cpu === 0) {
				// add human players only
				//console.info('alivePlayers PUSH: ', i);
				alivePlayers.push(i);
				count++;
			}
		});
		var result = alivePlayers[cpu % count];
		/*console.info('alivePlayers: ', alivePlayers);
		console.info('cpu: ', cpu);
		console.info('count: ', count);*/
		// console.info('Player '+ result + ' taking turn for cpu ' + cpu);
		return result === my.player;
	},
	getResourceSums: function() {
		var o = {
			food: 0,
			production: 0,
			culture: 0
		};
		game.tiles.forEach(function(v) {
			if (v.player === my.player) {
				if (v.food) {
					o.food += v.food;
				}
				if (v.production) {
					o.production += v.production;
				}
				if (v.culture) {
					o.culture += v.culture;
				}
			}
		});
		return o;
	},
	updateResources: function(){
		if (!g.over){
			var firstPlayer = 0,
				pingCpu = 0;
			game.player.forEach(function(d){
				if (d.alive){
					if (d.cpu){
						// game.lowestPlayerIsMe() && ai.takeTurn(d);
						game.playerActivatesCpuTurn(d.player) && ai.takeTurn(d);
					}
					else if (d.cpu === 0){
						// 0 means player, null means barb
						if (!firstPlayer){
							firstPlayer = 1;
							if (d.account === my.account){
								// so only one players updates
								pingCpu = 1;
							}
						}
					}
				}
			});
			var res = game.getResourceSums();
			$.ajax({
				url: app.url + "php/updateResources.php",
				data: {
					pingCpu: pingCpu,
					resourceTick: g.resourceTick,
					food: res.food,
					production: res.production,
					culture: res.culture,
					revTile: game.getRevolutionTile()
				}
			}).done(game.updateResourcesDone)
			.fail(function(data){
				console.info(data.responseText);
				serverError(data);
			});
		}
	},
	getRevolutionTile: function() {
		var tile = -1,
			units = 0;
		game.tiles.forEach(function(v, i) {
			if (g.teamMode) {
				if (v.team !== my.team &&
					v.flag &&
					!v.capital) {
					if (v.units > units) {
						tile = i;
						units = v.units;
					}
				}
			}
			else {
				if (v.player !== my.player &&
					v.flag &&
					!v.capital) {
					if (v.units > units) {
						tile = i;
						units = v.units;
					}
				}
			}
		});
		return tile;
	},
	updateResourcesDone: function(data) {
		console.info('updateResources.php', data);
		g.resourceTick = data.resourceTick;
		setResources(data);
		game.reportMilestones(data);
		animate.energyBar(data.resourceTick);
	},
	reportMilestones: function(data){
		if (data.cultureMsg !== undefined){
			if (data.cultureMsg){
				var o = {
					message: data.cultureMsg
				};
				game.chat(o);
				audio.play('culture');
				audio.play('cheer3');
				// rush bonus changes
				initOffensiveTooltips();
			}
		}
	}
};
var timer = {
	hud: g.TDC()
};
// DOM caching
var DOM;
function initDom(){
	var d = document;
	DOM = {
		diplomacyBody: d.getElementById("diplomacy-body"),
		targetUiWrap: d.getElementById('target-ui-wrap'),
		endTurn: d.getElementById('endTurn'),
		energyIndicator: d.getElementById('energyIndicator'),
		currentYear: d.getElementById('currentYear'),
		currentYearWrap: d.getElementById('currentYearWrap'),
		//targetTargetWrap: d.getElementById('targetTargetWrap'),
		targetFlag: d.getElementById('targetFlag'),
		//targetCapStar: d.getElementById('targetCapStar'),
		targetResources: d.getElementById('targetResources'),
		targetNameWrap: d.getElementById('targetNameWrap'),
		targetBarsWrap: d.getElementById('targetBarsWrap'),
		targetNameAnchor: d.getElementById('targetNameAnchor'),
		//targetTargetFlag: d.getElementById('targetTargetFlag'),
		//targetTargetCapStar: d.getElementById('targetTargetCapStar'),
		//targetTargetNameWrap: d.getElementById('targetTargetNameWrap'),
		//targetTargetBarsWrap: d.getElementById('targetTargetBarsWrap'),
		landWrap: d.getElementById('landWrap'),
		gameWindows: d.getElementsByClassName('gameWindow'),
		sumMoves: d.getElementById('sumMoves'),
		moves: d.getElementById('moves'),
		gameWrap: d.getElementById('gameWrap'),
		gameTableBody: d.getElementById('gameTableBody'),
		food: d.getElementById('food'),
		production: d.getElementById('production'),
		culture: d.getElementById('culture'),
		Msg: d.getElementById('Msg'),
		hud: d.getElementById("hud"),
		sumFood: d.getElementById("sumFood"),
		foodMax: d.getElementById("foodMax"),
		cultureMax: d.getElementById("cultureMax"),
		manpower: d.getElementById("manpower"),
		sumProduction: d.getElementById("sumProduction"),
		sumCulture: d.getElementById("sumCulture"),
		chatContent: d.getElementById("chat-content"),
		chatInput: d.getElementById("chat-input"),
		lobbyChatInput: d.getElementById("lobby-chat-input"),
		titleChatInput: d.getElementById("title-chat-input"),
		worldWrap: d.getElementById('worldWrap'),
		motionPath: d.getElementById('motionPath'),
		troopIcon: d.getElementById('troop-icon'),
		targetLine: d.getElementById('targetLine'),
		targetLineBorder: d.getElementById('targetLineBorder'),
		arrowheadTip: d.getElementById('arrowhead-tip'),
		arrowhead: d.getElementById('arrowhead'),
		arrowheadBorder: d.getElementById('arrowhead-border'),
		targetLineShadow: d.getElementById('targetLineShadow'),
		targetCrosshair: d.getElementById('targetCrosshair'),
		target: d.getElementById('target'),
		//avatar: d.getElementById('avatar'),
		//ribbonWrap: d.getElementById('ribbonWrap'),
		targetName: d.getElementById('targetName'),
		oBonus: d.getElementById('oBonus'),
		dBonus: d.getElementById('dBonus'),
		productionBonus: d.getElementById('productionBonus'),
		foodBonus: d.getElementById('foodBonus'),
		cultureBonus: d.getElementById('cultureBonus'),
		foodBar: d.getElementById('foodBar'),
		cultureBar: d.getElementById('cultureBar'),
		world: d.getElementById('world'),
		bgmusic: d.getElementById('bgmusic'),
		tileName: d.getElementById('tileName'),
		buildWord: d.getElementById('buildWord'),
		buildCost: d.getElementById('buildCost'),
		cannonsCost: d.getElementById('cannonsCost'),
		missileCost: d.getElementById('missileCost'),
		nukeCost: d.getElementById('nukeCost'),
		masonryCost: d.getElementById('masonryCost'),
		constructionCost: d.getElementById('constructionCost'),
		gunpowderCost: d.getElementById('gunpowderCost'),
		engineeringCost: d.getElementById('engineeringCost'),
		rocketryCost: d.getElementById('rocketryCost'),
		atomicTheoryCost: d.getElementById('atomicTheoryCost'),
		futureTechCost: d.getElementById('futureTechCost'),
		upgradeTileDefense: d.getElementById('upgradeTileDefense'),
		screenFlash: d.getElementById('screenFlash'),
		fireCannons: d.getElementById('fireCannons'),
		launchMissile: d.getElementById('launchMissile'),
		launchNuke: d.getElementById('launchNuke'),
		researchMasonry: d.getElementById('researchMasonry'),
		researchConstruction: d.getElementById('researchConstruction'),
		researchEngineering: d.getElementById('researchEngineering'),
		researchGunpowder: d.getElementById('researchGunpowder'),
		researchRocketry: d.getElementById('researchRocketry'),
		researchAtomicTheory: d.getElementById('researchAtomicTheory'),
		researchFutureTech: d.getElementById('researchFutureTech'),
		lobbyChatLog: d.getElementById('lobbyChatLog'),
		titleChatLog: d.getElementById('titleChatLog'),
		mapAnimations: d.getElementById('mapAnimations'),
		mapBars: d.getElementById('mapBars'),
		titleChatBody: d.getElementById('titleChatBody')
	}
};
initDom();

var $DOM = {
	head: $("#head"),
	chatInputOpen: $("#chat-input-open"),
	chatInputWrap: $("#chat-input-wrap"),
	chatInput: $("#chat-input"),
	lobbyChatInput: $("#lobby-chat-input"),
	titleChatInput: $("#title-chat-input")
};
// team colors
var worldMap = [];


var video = {
	cache: {},
	load: {
		game: function(){
			var x = [
				'smoke.png'
			];
			for (var i=0, len=x.length; i<len; i++){
				var z = x[i];
				video.cache[z] = new Image();
				video.cache[z].src = "images/" + z;
			}
		}
	}
}

function playerLogout(){
	
    g.lock();
	socket.publish.title.remove(my.account);
    /*$.ajax({
		type: 'GET',
		url: app.url + 'php/deleteFromFwtitle.php'
	});*/
	
	try {
		FB.getLoginStatus(function(ret) {
			ret.authResponse && FB.logout(function(response) {});
		});
	} catch (err){
		console.info('Facebook error: ', err);
	}
	
	try {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function(){});
	} catch (err){
		console.info('Google error: ', err);
	}
	
	localStorage.removeItem('email');
	localStorage.removeItem('token');
	
	setTimeout(function(){
		$.ajax({
			type: 'GET',
			url: app.url + 'php/logout.php'
		}).done(function(data) {
			localStorage.removeItem('token');
			location.reload();
			g.msg(lang[my.lang].logoutSuccess);
		}).fail(function() {
			g.msg(lang[my.lang].logoutFailed);
		});
	}, 1000);
}

function exitGame(bypass){
	/*if (g.view === 'game'){
		var r = confirm("Are you sure you want to surrender?");
	}*/
	if (bypass || g.view !== 'game'){
		g.lock(1);
		$.ajax({
			url: app.url + 'php/exitGame.php',
			data: {
				view: g.view
			}
		}).always(location.reload);
	}
}
function surrenderMenu(){
	document.getElementById('surrenderScreen').style.display = 'block';
	audio.play('click');
}
function surrender(){
	document.getElementById('surrenderScreen').style.display = 'none';
	$.ajax({
		type: 'GET',
		url: app.url + 'php/surrender.php',
	});
	audio.play('click');
	
}

function serverError(data){
	// g.msg('The server reported an error.');
	console.error('The server reported an error.', data);
}