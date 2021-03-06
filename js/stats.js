// stats.js 
// scoreboard data values

(function(){
	// attempt auto login
	var isLoggedIn = $("#titleMenu").length;
	if (!isLoggedIn){
		var email = localStorage.getItem('email');
		var token = localStorage.getItem('token');
		if (email){
			// attempt persistent login
			if (token){
				$.ajax({
					type: 'POST',
					url: app.url + '/php/master1.php',
					data: {
						run: "authenticate",
						email: email,
						token: token
					}
				}).done(function(data){
					if (data === "Login successful!"){
						$.ajax({
							type: 'POST',
							url: app.url + '/php/master1.php',
							data: {
								run: "getToken",
								email: email
							}
						}).done(function(data){
							token = data;
							$.ajax({
								type: 'POST',
								url: app.url + '/php/master1.php',
								data: {
									run: "authenticate",
									email: email,
									token: token
								}
							}).done(function(data){
								console.info(data);
								localStorage.setItem('token', token);
								location.reload();
							}).fail(function(data){
								console.warn(data);
							});
						});
					} else {
						console.warn("Persistent login failed! ", data);
					}
				});
			} else {
				$.ajax({
					type: 'POST',
					url: app.url + '/php/master1.php',
					data: {
						run: "getToken",
						email: email
					}
				}).done(function(data){
					token = data;
				});
			}
		}
	}
})();

var stats = {
	init: function(data){
		var flag = my.flag,
			str = '<img id="statWorld" src="images/FlatWorld90.jpg">',
			kjv = bible.getRandomQuoteAndVerse();

		str +=
		'<div id="statResult" class="no-select">\
			<img class="statResultFlag" src="images/flags/'+ flag +'">\
			<span id="statGameResult">'+ lang[my.lang].defeatIn + ui.transformYear(g.resourceTick) +'</span>\
			<img class="statResultFlag" src="images/flags/'+ flag +'">\
		</div>\
		<div id="statTabWrap" class="no-select shadow4">\
			<div id="statOverview" class="statTabs active">\
				'+ lang[my.lang].statOverview +'\
			</div><div id="statUnits" class="statTabs">\
				'+ lang[my.lang].statUnits +'\
			</div><div id="statStructures" class="statTabs">\
				'+ lang[my.lang].statStructures +'\
			</div><div id="statWeapons" class="statTabs">\
				'+ lang[my.lang].statWeapons +'\
			</div><div id="statResources" class="statTabs">\
				'+ lang[my.lang].statResources +'\
			</div>\
		</div>\
		<table id="gameStatsTable" class="table"></table>\
		<div id="statFooter" class="container-fluid">\
			<div class="row">\
				<div id="statQuote" class="col-xs-7 shadow4 stagBlue">\
					<div id="muh-bible">'+ kjv.quote +'</div>\
					<div id="statVerse" class="text-right">'+ kjv.verse +'</div>\
				</div>\
				<div id="statDuration" class="col-xs-4 stagBlue text-center">\
					<div id="gameDuration">'+ lang[my.lang].gameDuration + stats.gameDuration(g.gameDuration) +'</div>\
					<button id="statsEndGame" class="btn btn-md btn-block btn-responsive shadow4 lobbyButtons">'+ lang[my.lang].endGame +'</button>\
				</div>\
			</div>\
		</div>\
		<div id="ribbonBackdrop"></div>\
		<div id="ribbonReward" class="fw-primary title-modals">\
			<div class="header text-center">\
				<h2 class="header">Achievement Unlocked!</h2>\
			</div>\
			<hr class="fancyhr">\
			<div id="ribbonBody"></div>\
		</div>';
		document.getElementById('statWrap').innerHTML = str;
		stats.events();
		animate.muhBible();
		TweenMax.to("#statWorld", 300, {
			startAt: {
				xPercent: -50,
				yPercent: -50,
				rotation: -360
			},
			rotation: 0,
			repeat: -1,
			ease: Linear.easeNone
		});
		stats.setLeaderValues();
	},
	setBibleMode: function(state) {
		var e = document.createElement('style');
		e.id = 'bible-state';
		e.type = 'text/css';
		e.innerHTML = '#statQuote { visibility: visible!important }';

		if (!state) {
			e.innerHTML = '#statQuote { visibility: hidden }';
		}
		$("#bible-state").remove();
		document.head.appendChild(e);
		localStorage.setItem('bible', state ? 1 : 0);
	},
	show: function(){
		DOM.bgmusic.loop = true;
		stats.setView('statOverview');
		if (g.victory){
			audio.play('bell-8');
			audio.play('TheAssault', 1);
			document.getElementById('statGameResult').textContent =
				"Victory in "+ ui.transformYear(g.resourceTick);
		}
		else {
			audio.play('defeat');
			audio.play("JourneyOfForgottenSoldiers", 1);
		}
		document.getElementById('statWrap').style.visibility = 'visible';
		TweenMax.to('#gameWrap', .5, {
			startAt: {
				alpha: 0
			},
			alpha: 1
		});
		if (stats.achievements.length){
			audio.play('ding3');
			TweenMax.to('#ribbonBackdrop', .5, {
				startAt: {
					visibility: 'visible',
					alpha: 0
				},
				alpha: 1
			});
			TweenMax.to('#ribbonReward', 1, {
				startAt: {
					visibility: 'visible',
					alpha: 0,
					top: 0,
					y: 0
				},
				alpha: 1,
				y: 30
			});
		}
		$("#worldWrap, #targetWrap, #ui2, #resources-ui, #diplomacy-ui, #chat-ui, #chat-input-open, #chat-input-wrap, #surrenderScreen").remove();
	},
	events: function(){
		$("#statWrap").on(ui.click, '.statTabs', function(){
			$(".statTabs").removeClass('active');
			$(this).addClass('active');
			audio.play('switch13');
			// load data
			var id = $(this).attr('id');
			stats.setView(id);
		}).on(ui.click, '#statsEndGame', function(){
			location.reload();
		}).on(ui.click, '#ribbonBackdrop', function(){
			TweenMax.to('#ribbonBackdrop, #ribbonReward', .25, {
				alpha: 0,
				onComplete: function(){
					TweenMax.set('#ribbonBackdrop, #ribbonReward', {
						visibility: 'hidden'
					});
				}
			});
		});
		
	},
	maxValue: {
		unitsTotal: 0,
		structuresTotal: 0,
		weaponsTotal: 0,
		resourcesTotal: 0,
		overviewTotal: 0
	},
	setLeaderValues: function(){
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (typeof d !== 'undefined' && d.account){
				for (var key in d){
					if (i === 1){
						stats.maxValue[key] = d[key];
					} else {
						if (d[key] > stats.maxValue[key]){
							stats.maxValue[key] = d[key];
						}
					}
				}
				var units = stats.unitsTotal(i),
					structures = stats.structuresTotal(i),
					weapons = stats.weaponsTotal(i),
					resources = stats.resourcesTotal(i),
					overview = stats.overviewTotal(i);
				
				if (units > stats.maxValue.unitsTotal){
					stats.maxValue.unitsTotal = stats.unitsTotal(i);
				}
				if (structures > stats.maxValue.structuresTotal){
					stats.maxValue.structuresTotal = structures;
				}
				if (weapons > stats.maxValue.weaponsTotal){
					stats.maxValue.weaponsTotal = weapons;
				}
				if (resources > stats.maxValue.resourcesTotal){
					stats.maxValue.resourcesTotal = resources;
				}
				if (overview > stats.maxValue.overviewTotal){
					stats.maxValue.overviewTotal = overview;
				}
			}
		}
	},
	currentTabId: '',
	setView: function(id){
		if (id !== stats.currentTabId){
			stats.currentTabId = id;
			var str = stats[id]();
			document.getElementById('gameStatsTable').innerHTML = str;
		}
	},
	barAnimate: new TweenMax.delayedCall(0, ''),
	animate: function(a, delay){
		setTimeout(function(){
			var x = {
				max: 100,
				lastVal: 0
			};
			stats.barAnimate.kill();
			stats.barAnimate = TweenMax.to(x, delay, {
				startAt: {
					max: 0
				},
				max: 100,
				onUpdate: function(){
					if (~~x.lastVal !== ~~x.max){
						x.lastVal = x.max;
						audio.play('rollover5');
					}
				},
				onComplete: function(){
					audio.play('switch11');
				},
				ease: Sine.easeOut
			});
			for (var i=1, len=a.length; i<len; i++){
				var d = a[i];
				(function(d, e, bar, Sine){
					TweenMax.to(d, delay, {
						startAt: {
							max: 0
						},
						max: d.max,
						onUpdate: function(){
							e.textContent = ~~d.max;
						},
						ease: Sine.easeOut
					});
					TweenMax.to(bar, delay, {
						startAt: {
							width: 0
						},
						width : ((d.max / stats.maxValue[d.key]) * 100) + '%',
						ease: Sine.easeOut
					});
				})(d, document.getElementById(d.id), document.getElementById(d.id + '-bar'), Sine);
			}
		});
	},
	statOverview: function(){
		// head
		var str = stats.playerHead([
			lang[my.lang].tabUnits,
			lang[my.lang].tabStructures,
			lang[my.lang].tabWeapons,
			lang[my.lang].tabResources,
			lang[my.lang].tabTotalScore
		]);
		// player rows
		var animate = [];
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (typeof stats.data[i] !== 'undefined' && stats.data[i].account){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-units',
						max: stats.unitsTotal(i),
						key: 'unitsTotal'
					}, {
						id: 'p'+ i +'-structures',
						max: stats.structuresTotal(i),
						key: 'structuresTotal'
					}, {
						id: 'p'+ i +'-weapons',
						max: stats.weaponsTotal(i),
						key: 'weaponsTotal'
					}, {
						id: 'p'+ i +'-resources',
						max: stats.resourcesTotal(i),
						key: 'resourcesTotal'
					}, {
						id: 'p'+ i +'-total',
						max: stats.overviewTotal(i),
						key: 'overviewTotal'
					},
				]
				stats.animate(a, 1.5);
				str += '<tr class="statRow no-pointer">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['units', 'structures', 'weapons', 'resources', 'total'],
						len = a.length;
					for (var j=0; j<len; j++){
						var sumRow = (j+1 === len) ? ' statSum' : '';
						str += 
						'<td class="stagBlue statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal'+ sumRow +'">0</div>\
							</div>\
						</td>';
					}
				str += '</tr>';
			}
		}
		return str;
	},
	statUnits: function(){
		// head
		var str = stats.playerHead([
			lang[my.lang].tabEarned,
			lang[my.lang].tabDeployed,
			lang[my.lang].tabKilled,
			lang[my.lang].tabLost,
		]);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (typeof d !== 'undefined' && d.account){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-earned',
						max: d.earned,
						key: 'earned'
					}, {
						id: 'p'+ i +'-deployed',
						max: d.deployed,
						key: 'deployed'
					}, {
						id: 'p'+ i +'-killed',
						max: d.killed,
						key: 'killed'
					}, {
						id: 'p'+ i +'-lost',
						max: d.lost,
						key: 'lost'
					},
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow no-pointer">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['earned', 'deployed', 'killed', 'lost'],
						len = a.length;
					for (var j=0; j<len; j++){
						str += 
						'<td class="stagBlue statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal">0</div>\
							</div>\
						</td>';
					}
				str += '</tr>';
			}
		}
		return str;
	},
	statStructures: function(){
		// head
		var str = stats.playerHead([
			lang[my.lang].tabBunkers,
			lang[my.lang].tabWalls,
			lang[my.lang].tabFortresses
		]);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (typeof d !== 'undefined' && d.account){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-bunkers',
						max: d.bunkers,
						key: 'bunkers'
					}, {
						id: 'p'+ i +'-walls',
						max: d.walls,
						key: 'walls'
					}, {
						id: 'p'+ i +'-fortresses',
						max: d.fortresses,
						key: 'fortresses'
					}
				]
				stats.animate(a, 1);
				str += '<tr class="stagBlue statRow no-pointer">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['bunkers', 'walls', 'fortresses'],
						len = a.length;
					for (var j=0; j<len; j++){
						str += 
						'<td class="stagBlue statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal">0</div>\
							</div>\
						</td>';
					}
					str += '</tr>';
			}
		}
		return str;
	},
	statWeapons: function(){
		// head
		var str = stats.playerHead([
			lang[my.lang].tabCannons,
			lang[my.lang].tabMissiles,
			lang[my.lang].tabNukes
		]);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (typeof d !== 'undefined' && d.account){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-cannons',
						max: d.cannons,
						key: 'cannons'
					}, {
						id: 'p'+ i +'-missiles',
						max: d.missiles,
						key: 'missiles'
					}, {
						id: 'p'+ i +'-nukes',
						max: d.nukes,
						key: 'nukes'
					}
				]
				stats.animate(a, 1);
				str += '<tr class="stagBlue statRow no-pointer">'+
					stats.playerCell(d, i);
					var color = game.player[i].playerColor,
						a = ['cannons', 'missiles', 'nukes'],
						len = a.length;
					for (var j=0; j<len; j++){
						str += 
						'<td class="stagBlue statTD">\
							<div class="statBar pb'+ color +'">\
								<div id="p'+ i +'-'+ a[j] +'-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
								<div id="p'+ i +'-'+ a[j] +'" class="statVal">0</div>\
							</div>\
						</td>';
					}
					str += '</tr>';
			}
		}
		return str;
	},
	statResources: function(){
		// head
		var str = stats.playerHead([
			lang[my.lang].tabEnergy,
			lang[my.lang].tabScience,
			lang[my.lang].tabFood,
			lang[my.lang].tabCulture
		]);
		// player rows
		for (var i=1; i<=8; i++){
			var d = stats.data[i];
			if (typeof d !== 'undefined' && d.account){
				// player data exists
				var a = [{}, {
						id: 'p'+ i +'-moves',
						max: d.moves,
						key: 'moves'
					}, {
						id: 'p'+ i +'-production',
						max: d.production,
						key: 'production'
					}, {
						id: 'p'+ i +'-food',
						max: d.food,
						key: 'food'
					}, {
						id: 'p'+ i +'-culture',
						max: d.culture,
						key: 'culture'
					}
				]
				stats.animate(a, 1.5);
				str += '<tr class="stagBlue statRow no-pointer">' +
					stats.playerCell(d, i);
					var color = game.player[i].playerColor;
					str += '<td class="stagBlue statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-moves-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-moves" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="stagBlue statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-production-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-production" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="stagBlue statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-food-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-food" class="statVal">0</div>\
						</div>\
					</td>\
					<td class="stagBlue statTD">\
						<div class="statBar pb'+ color +'">\
							<div id="p'+ i +'-culture-bar" class="statBarBg pbar'+ color +'">&nbsp</div>\
							<div id="p'+ i +'-culture" class="statVal">0</div>\
						</div>\
					</td>\
				</tr>';
			}
		}
		return str;
	},
	playerHead: function(column){
		var str = '<tr><th style="width: 420px"></th>';
		for (var i=0, len=column.length; i<len; i++){
			if (i === 4){
				str += '<th class="text-center statHead chat-warning">'+ column[i] +'</th>';
			}
			else {
				str += '<th class="text-center statHead">'+ column[i] +'</th>';
			}
		}
		return str;
	},
	playerCell: function(p, i){
		var z = game.player[i],
			flag = p.flag.split('.')[0];

		flag = flag + ui.getFlagExt(flag);
		var str =
		'<td class="stat-detail-wrap">'+
			'<div class="statWrapper">'+
				'<img class="statFlagBG" src="images/flags/'+ flag +'">'+
			'</div>'+
			'<img class="statsFlags" src="images/flags/'+ flag +'">'+
			'<div class="statsPlayerWrap">'+
				'<div class="statsAccount chat-warning nowrap">' + lobby.governmentIcon(z);
					if (g.teamMode){
						str += '<span class="diploTeam">'+ z.team +'</span>';
					}
					// TODO: undefined error here on difficulty after CPU was eliminated and I surrendered
					var account = z.cpu === 1 ? z.difficulty : p.account;
					str += account +
				'</div>'+
				'<div class="statsNation nowrap">'+ p.nation +'</div>'+
			'</div>'+
		'</td>';
		return str;
	},
	initStats: function() {
		stats.data = [];
		for (var i=0; i<=8; i++) {
			stats.data[i] = {
				account: '',
				nation: '',
				flag: '',
				cpu: '',
				earned: 0,
				deployed: 0,
				killed: 0,
				lost: 0,
				bunkers: 0,
				walls: 0,
				fortresses: 0,
				cannons: 0,
				missiles: 0,
				nukes: 0,
				moves: 0,
				food: 0,
				culture: 0,
				production: 0,
			}
		}
		// add player data
		game.player.forEach(function(v, i) {
			if (v.account) {
				stats.data[i].account = v.account;
				stats.data[i].flag = v.flag;
				stats.data[i].government = v.government;
				stats.data[i].nation = v.nation;
			}
		});
	},
	delete: function() {
		sessionStorage.removeItem('fwstats');
	},
	update: function(data) {
		// console.info("stats.update", data);
		for (var player in data.contents) {
			var pObj = data.contents[player];
			for (var key in pObj) {
				stats.data[player][key] += pObj[key];
				// console.info('adding: player', player, key, pObj[key], stats.data[player][key]);
			}
		};
		sessionStorage.setItem('fwstats', JSON.stringify(stats.data));
	},
	data: [],
	gameDuration: function(data){
		return stats.hours(data) + stats.minutes(data) +':'+ stats.seconds(data)
	},
	hours: function(data){
		var hours = '';
		if (data >= 3600){
			hours = ~~(data / 3600) + ':';
		}
		return hours;
	},
	minutes: function(data){
		var min = '';
		if (data < 60){
			if (data >= 3600){
				min = '00:';
			}
		} else {
			min = ~~(data / 60 % 60);
			if (min < 10){
				min = '0' + min + '';
			}
		}
		return min;
	},
	seconds: function(data){
		var sec = ~~(data % 60);
		if (sec < 10){
			return '0' + sec + '';
		}
		return sec;
	},
	get: function(){
		$.ajax({
			url: app.url + 'php/stats.php',
			data: {
				killRatio: ~~action.getKillRatio()
			}
		}).done(function(data){
			stats.init(data);
			stats.notifyRibbons(data.ribbons);
			stats.notifySteam(data.ribbons);
		});
	},
	achievements: [],
	notifyRibbons: function(data){
		var str = '';
		data.forEach(function(e){
			str += 
			'<div class="ribbonName ranked">'+ lang[my.lang].ribbonTitle[e] +'</div>\
			<div class="ribbonDescription ranked">'+ lang[my.lang].ribbonDescription[e] +'</div>\
			<img class="giantRibbon block" src="images/ribbons/ribbon'+ e +'.jpg">';  
		});
		document.getElementById('ribbonBody').innerHTML = str;
		stats.achievements = data;
		if (stats.achievements.length){
			new Audio('sound/ding3.mp3');
			if (app.isApp) {
				// notify Steam
				var greenworks = require('./greenworks');
				if (greenworks.initAPI()) {
					greenworks.init();
					// send achievement data
				}
			}
		}
	},
	notifySteam: function(data) {
		if (app.isApp) {
			var greenworks = require('./greenworks');
			if (greenworks.initAPI()) {
				greenworks.init();
				data.forEach(function(i) {
					greenworks.activateAchievement('medal' + i, function(){});
				});
			}
		}
	},
	overviewTotal: function(i){
		return this.unitsTotal(i) + this.structuresTotal(i) + this.weaponsTotal(i) + this.resourcesTotal(i);
	},
	unitsTotal: function(i){
		var x = stats.data[i];
		return (x.deployed * 100) + (x.killed * 3);
	},
	structuresTotal: function(i){
		var x = stats.data[i];
		return (x.bunkers * 80) + (x.walls * 140) + (x.fortresses * 200);
	},
	weaponsTotal: function(i){
		var x = stats.data[i];
		return (x.cannons * 40) + (x.missiles * 60) + (x.nukes * 400);
	},
	resourcesTotal: function(i){
		var x = stats.data[i];
		return ~~( (x.food / 20) + (x.culture / 60) + (x.production / 20) );
	}
}