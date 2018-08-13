// animate.js
var animate = {
	colors: [
		'#ffffff',
		'#fff',
		'#eeffee',
		'#ffffee',
		'#99ff99',
		'#eefff3',
		'#ddddff'
	],
	randomColor: function(){
		return animate.colors[~~(Math.random()*6)];
	},
	getXY: function(tile){
		var box = DOM['unit' + tile].getBBox(),
			o = {
				x: box.x,
				y: box.y
			}
		return o;
	},
	icon: {
		troops: {
			audio: '',
			image: 'troops.png',
			color: '#ff0'
		},
		energy: {
			audio: '',
			image: 'energy.png',
			color: '#ffa'
		},
		food: {
			audio: '',
			image: 'food.png',
			color: '#b5ff00'
		},
		production: {
			audio: '',
			image: 'production.png',
			color: '#7cf'
		},
		culture: {
			audio: '',
			image: 'culture.png',
			color: '#d2d'
		},
		shield: {
			audio: 'build',
			image: 'tile-defense.png',
			color: '#ff0'
		}
	},
	upgrade: function(tile, type, count){
		if (animate.icon[type].audio){
			audio.play(animate.icon[type].audio);
		}
		var box = DOM['unit' + tile].getBBox();
		var x = box.x + box.width/2 - 10;
		var y = box.y + box.height/2 + 10;
		// show icon
		var wrap = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
		text.setAttributeNS(null,"x",x - 10);
		text.setAttributeNS(null,"y",y + 10);
        text.style.fontFamily = 'FontAwesome';
        text.style.fontSize = '20px';
        text.style.fill = animate.icon[type].color;
		if (count){
			text.textContent = '+'+ count;
		} else {
			//text.textContent = animate.icon[type].text;
		}
		var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		image.setAttributeNS(null,"width",'3rem');
		image.setAttributeNS(null,"height",'3rem');
		image.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/icons/"+ animate.icon[type].image);
		image.setAttributeNS(null,"x",x + 10);
		image.setAttributeNS(null,"y",y - 20);
		wrap.appendChild(image);
		wrap.appendChild(text);
		DOM.mapAnimations.appendChild(wrap);
		TweenMax.to([text, image], .5, {
			startAt: {
				xPercent: -50,
				yPercent: -50,
				transformOrigin: '50% 50%',
				alpha: 1,
				scale: .1
			},
			scale: 1,
			ease: Back.easeOut.config(3)
		});
		TweenMax.to([text, image], 1.5, {
			y: '-=30'
		});
		TweenMax.to([text, image], .5, {
			delay: 1.5,
			alpha: 0,
			onComplete: function(){
				wrap.parentNode.removeChild(wrap);
			}
		});
		// update bars
		this.updateMapBars(tile);
	},
	paths: function() {
		/*TweenMax.to('.paths > path', 2, {
			startAt: {
				strokeDashoffset: 0
			},
			strokeDashoffset: -12,
			repeat: -1,
			ease: Linear.easeNone
		});*/
	},
	rifle: function() {
		TweenMax.to(DOM.troopIcon, .05, {
			startAt: {
				x: -1,
				y: -2
			},
			x: 1,
			y: 2,
			repeat:3,
			yoyo:true,
			ease: RoughEase.ease.config({
				template: Power0.easeNone,
				strength: 2,
				points: 5,
				taper: "none",
				randomize: true,
				clamp: false
			}),
			onComplete: function(){
				TweenMax.to(this.target, 1.5, {
					y:0,
					ease:Elastic.easeOut
				})
			}
		});
	},
	updateMapBars: function(tile){
		var box = DOM['unit' + tile].getBBox(),
			x = box.x + box.width/2 - 10,
			y = box.y + box.height/2 + 10;
		$(".mapBars" + tile).remove();
		this.initMapBars(tile, x, y);
	},
	target: function() {
		var o = {
			brightness: 200
		};
		TweenMax.to(o, .5, {
			brightness: 100,
			onUpdate: function() {
				animate.brightness(DOM.targetUiWrap, o.brightness);
			}
		})
	},
	initMapBars: function(i, x, y){
		var e = DOM['unit' + i],
			x = e.getAttribute('x') - 25,
			y = e.getAttribute('y') - 24,
			boxHeight = 0,
			barHeight = 5,
			barPad = 1,
			widthPerTick = 5,
			widthMax = 40;
		
		if (game.tiles[i].food){
			boxHeight += barHeight + barPad;
		}
		if (game.tiles[i].production){
			boxHeight += barHeight + barPad;
		}
		if (game.tiles[i].culture){
			boxHeight += barHeight + barPad; 
		}
		var totalDef = game.tiles[i].defense;
		if (totalDef){
			boxHeight += barHeight + barPad;
		}
		var foodWidth = game.tiles[i].food * widthPerTick;
		if (foodWidth > widthMax){
			foodWidth = widthMax;
		}
		// wrapper
		x += barHeight
		if (boxHeight){
			var svg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
			svg.setAttributeNS(null, 'width', widthMax);
			svg.setAttributeNS(null, 'height', boxHeight);
			svg.setAttributeNS(null,"x",x);
			svg.setAttributeNS(null,"y",y + 26);
			svg.setAttributeNS(null,"fill","#151515");
			svg.setAttributeNS(null,"stroke","#000000");
			svg.setAttributeNS(null,"stroke-width",1);
			svg.setAttributeNS(null,"opacity",1);
			svg.setAttributeNS(null,"class","mapBars" + i);
			DOM.mapBars.appendChild(svg);
			// food
			y += 23; // fixed value?
			//x += 1 // padding
			if (game.tiles[i].food){
				y += barHeight + barPad;
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + foodWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#b5ff00");
				svg.setAttributeNS(null,"stroke-width",widthPerTick);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
			// production
			if (game.tiles[i].production){
				y += barHeight + barPad;
				var productionWidth = game.tiles[i].production * (widthPerTick * 2);
				if (productionWidth > widthMax){
					productionWidth = widthMax;
				}
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + productionWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#7cf");
				svg.setAttributeNS(null,"stroke-width",widthPerTick);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars2x mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
			// culture
			if (game.tiles[i].culture){
				y += barHeight + barPad;
				var cultureWidth = game.tiles[i].culture * widthPerTick;
				if (cultureWidth > widthMax){
					cultureWidth = widthMax;
				}
				var svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + cultureWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#dd22dd");
				svg.setAttributeNS(null,"stroke-width",widthPerTick);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
			// defense
			if (totalDef){
				y += barHeight + barPad;
				var defWidth =
					totalDef * (widthMax/4),
					svg = document.createElementNS('http://www.w3.org/2000/svg', 'line');

				svg.setAttributeNS(null,"x1",x);
				svg.setAttributeNS(null,"y1",y);
				svg.setAttributeNS(null,"x2",x + defWidth);
				svg.setAttributeNS(null,"y2",y);
				svg.setAttributeNS(null,"stroke","#ffff00");
				svg.setAttributeNS(null,"stroke-width",barHeight);
				svg.setAttributeNS(null,"opacity",1);
				svg.setAttributeNS(null,"class","mapBars mapBars3x mapBars" + i);
				DOM.mapBars.appendChild(svg);
			}
		}
	},
	gunfire: function(atkTile, defTile, volume){
		var box1 = DOM['unit' + atkTile].getBBox(),
			box2 = DOM['unit' + defTile].getBBox();
		var sfx = ~~(Math.random()*9);
		var delay = [.6, .6, .43, .43, .43, .43, .9, .43, .76, .43];
		if (volume){
			audio.play('machine' + sfx, null, volume);
			game.tiles[atkTile].player === my.player && animate.rifle();
		}
		var shots = 30,
			w1 = 50,
			h1 = 50;
			//w2 = w1/2,
			//h2 = h1/2 - 10;
		for (var i=0; i<shots; i++){
			(function(){
				var path = document.createElementNS("http://www.w3.org/2000/svg","path"),
					x2 = box2.x + (Math.random() * w1),
					y2 = box2.y + (Math.random() * h1),
					x1 = box1.x + ~~(Math.random()*16)-8,
					y1 = box1.y + ~~(Math.random()*16)-8,
					drawPath = Math.random() > .5 ?
						"M "+ x1 +","+ y1 + ' '+ x2 +","+ y2 :
						"M "+ x2 +","+ y2 +' ' + x1 +","+ y1;

				path.setAttributeNS(null,"stroke",animate.randomColor());
				path.setAttributeNS(null,"stroke-width",1);
				DOM.world.appendChild(path);
				/*TweenLite.to(path, .1, {
					delay: (i / shots) * delay[sfx],
					startAt: {
						attr: {
							d: drawPath
						},
						drawSVG: '0%'
					},
					drawSVG: '0% 100%',
					ease: Power2.easeIn,
					onComplete: function(){
						TweenLite.to(path, .15, {
							drawSVG: '100% 100%',
							ease: Power2.easeOut,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							}
						});
					}
				});*/
				TweenLite.to(path, .08, {
					delay: (i / shots) * delay[sfx],
					startAt: {
						attr: {
							d: drawPath
						},
						drawSVG: '0% 25%'
					},
					drawSVG: '75% 100%',
					ease: Linear.easeIn,
					onComplete: function(){
						TweenLite.to(path, .033, {
							drawSVG: '100% 100%',
							ease: Linear.easeOut,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							}
						});
					}
				});

				if (i % 8 === 0) {
					animate.flash({
						d: .2,
						scale: 2,
						x: x2 - 100,
						y: y2 - 100,
					});
				}
				else if (i % 8 === 4) {
					animate.flash({
						d: .15,
						scale: 1.5,
						x: x1 - 100,
						y: y1 - 100,
					});
				}

			})();
		}
	},
	flash: function(o) {
		var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		image.setAttributeNS(null,"width",'200px');
		image.setAttributeNS(null,"height",'200px');
		image.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/flash.png");
		image.setAttributeNS(null, 'class', 'no-pointer');
		image.setAttributeNS(null,"x",o.x);
		image.setAttributeNS(null,"y",o.y);
		DOM.world.appendChild(image);
		TweenLite.to(image, o.d, {
			startAt: {
				transformOrigin: '50% 50%',
				scale: o.scale
			},
			scale: 0,
			onComplete: function() {
				this.target.parentNode.removeChild(this.target);
			}
		});
	},
	flashNuke: function(o) {
		var image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		image.setAttributeNS(null,"width",'200px');
		image.setAttributeNS(null,"height",'200px');
		image.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/flash.png");
		image.setAttributeNS(null, 'class', 'no-pointer');
		image.setAttributeNS(null,"x",o.x);
		image.setAttributeNS(null,"y",o.y);
		DOM.world.appendChild(image);
		TweenLite.to(image, o.d, {
			startAt: {
				transformOrigin: '50% 50%',
				scale: 0
			},
			scale: o.scale,
			onComplete: function() {
				this.target.parentNode.removeChild(this.target);
			}
		});
		TweenLite.to(image, o.d - 1.8, {
			delay: 1.8,
			opacity: 0,
		})
	},
	cannons: function(atkTile, defTile, playSound, delay, delay2){
		var box1 = DOM['unit' + atkTile].getBBox(),
			box2 = DOM['land' + defTile].getBBox(),
			box3 = DOM['unit' + defTile].getBBox()
			delay = delay === undefined ? .08 : delay;

		if (game.tiles[atkTile].player === my.player ||
			game.tiles[defTile].player === my.player){
			var a = [5, 6, 8];
			var sfx = ~~(Math.random() * 3);
			playSound && audio.play('grenade' + a[sfx]);
		}
		var x1 = box1.x + box1.width * .5,
			y1 = box1.y + box1.height * .5,
			w1 = box2.width * .5,
			w2 = w1/2,
			h1 = box2.height * .5,
			h2 = h1/2 - 10;

		for (var i=0; i<20; i++){
			(function(Math){
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle"),
					x2 = box3.x + (Math.random() * w1) - w2,
					y2 = box3.y + (Math.random() * h1) - h2;
				circ.setAttributeNS(null,"cx",x1);
				circ.setAttributeNS(null,"cy",y1);
				circ.setAttributeNS(null,"r",4);
				circ.setAttributeNS(null,"fill",g.color[game.player[game.tiles[atkTile].player].playerColor]);
				circ.setAttributeNS(null, 'class', 'no-pointer');
				circ.setAttributeNS(null,"stroke",animate.randomColor());
				circ.setAttributeNS(null,"strokeWidth",1);
				DOM.mapAnimations.appendChild(circ);
				
				TweenLite.to(circ, delay, {
					delay: i * .0125,
					startAt: {
						alpha: 1
					},
					attr: {
						cx: x2,
						cy: y2
					},
					ease: Linear.easeNone,
					onComplete: function(){
						// explode outward
						var d1 = Math.random()*.5 + .3,
							d2 = delay2 === undefined ? d1/2 : delay2,
							s1 = (d1 * 10) + 3;
						TweenLite.to(circ, d2, {
							startAt: {
								fill: 'none',
								strokeWidth: 0,
								attr: {
									r: 0
								}
							},
							strokeWidth: s1,
							attr: {
								r: s1/2
							},
							ease: Linear.easeNone,
							onComplete: function(){
							// explode fades from inner
								if (i % 2 === 0) {
									animate.flash({
										d: .25,
										scale: 1,
										x: x2 - 100,
										y: y2 - 100,
									});
								}
								TweenLite.to(circ, d2, {
									attr: {
										r: s1
									},
									strokeWidth: 0,
									ease: Sine.easeOut
								});
								TweenLite.to(circ, d2, {
									alpha: 0,
									onComplete: function(){
										this.target.parentNode.removeChild(this.target);
									},
									ease: Sine.easeOut
								});
							}
						});
					}
				});
				if (i === 0) {
					animate.flash({
						d: 1,
						scale: 2,
						x: x1 - 100,
						y: y1 - 100,
					});
				}
			})(Math);
		}
		animate.smoke(defTile, box3.x, box3.y, .8);
	},
	missile: function(attacker, defender, playSound){
		if (playSound){
			audio.play('missile7');
		}
		var e2 = DOM['unit' + attacker],
			boxA = e2.getBBox(),
			x1 = boxA.x + boxA.width/2,
			y1 = boxA.y + boxA.height/2,
			e3 = DOM['unit' + defender],
			boxB = e3.getBBox(),
			x2 = boxB.x + boxB.width/2,
			y2 = boxB.y + boxB.height/2;
			
		// get missile line coordinates
		my.motionPath[0] = e2.getAttribute('x')*1 - 10;
		my.motionPath[1] = e2.getAttribute('y')*1 - 10;
		my.motionPath[4] = e3.getAttribute('x')*1 - 10;
		my.motionPath[5] = e3.getAttribute('y')*1 - 10;
		my.motionPath[2] = (my.motionPath[0] + my.motionPath[4]) / 2;
		my.motionPath[3] = ((my.motionPath[1] + my.motionPath[5]) / 2) - (Math.abs(x1-x2)/3);
		TweenMax.set(DOM.motionPath, {
			attr: {
				d: "M " + my.motionPath[0] +","+ my.motionPath[1] + ' ' +
					+ my.motionPath[4] +" "+ my.motionPath[5]
			}
		});
		// missile flash
		var flash = document.createElementNS('http://www.w3.org/2000/svg', 'image');
		flash.setAttributeNS(null,"width",'200px');
		flash.setAttributeNS(null,"height",'200px');
		flash.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/flash-orange.png");
		flash.setAttributeNS(null, 'class', 'no-pointer');
		flash.setAttributeNS(null,"x",x1);
		flash.setAttributeNS(null,"y",y1);
		//console.info('1', x1, y1);
		//console.info('2', x2, y2);
		DOM.mapAnimations.appendChild(flash);
		TweenLite.to(flash, 1, {
			startAt: {
				xPercent: -50,
				yPercent: -50
			},
			x: x2 - x1 - 24,
			y: y2 - y1 - 24,
			ease: Power2.easeIn,
			onComplete: function() {
				this.target.parentNode.removeChild(this.target);
			}
		});

		var mis = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		mis.setAttributeNS(null, "cx", x1);
		mis.setAttributeNS(null, "cy", y1);
		mis.setAttributeNS(null, "r", 12);
		mis.setAttributeNS(null, "fill", g.color[game.player[game.tiles[attacker].player].playerColor]);
		mis.setAttributeNS(null,"stroke","#ffddaa");
		mis.setAttributeNS(null,"stroke-width",2);
		mis.setAttributeNS(null, 'class', 'no-pointer');
		DOM.mapAnimations.appendChild(mis);
		var count = 0;
		TweenMax.to(mis, .1, {
			attr: {
				r: 3
			},
			repeat: -1
		});
		TweenLite.to(mis, 1, {
			startAt: {
				alpha: 1,
				xPercent: -50,
				yPercent: -50
			},
			attr: {
				cx: x2,
				cy: y2
			},
			ease: Power2.easeIn,
			onUpdate: function(){
				count++;
				if (count % 2 === 0){
					// smoke trail
					var svg = document.createElementNS('http://www.w3.org/2000/svg', 'image');
					svg.setAttributeNS(null, 'height', 40);
					svg.setAttributeNS(null, 'width', 40);
					svg.setAttributeNS(null, 'opacity', 1);
					svg.setAttributeNS(null, "x", mis.getAttribute('cx')-10);
					svg.setAttributeNS(null, "y", mis.getAttribute('cy')-10);
					svg.setAttributeNS(null, 'class', 'no-pointer');
					svg.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/smoke.png');
					DOM.mapAnimations.appendChild(svg);
					TweenLite.to(svg, .3, {
						startAt: {
							xPercent: -50,
							yPercent: -50,
							transformOrigin: '50% 50%'
						},
						scale: 3,
						onComplete: function(){
							this.target.parentNode.removeChild(this.target);
						}
					});
					TweenLite.to(svg, .5, {
						alpha: 0
					});
				}
			},
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
				animate.missileExplosion(defender, g.color[game.player[game.tiles[attacker].player].playerColor]);
			}
		});
		animate.flash({
			d: 1,
			scale: 3,
			x: x1 - 100,
			y: y1 - 100,
		});
		animate.flash({
			d: 1,
			scale: 3,
			x: x1 - 100,
			y: y1 - 100,
		});
	},
	missileExplosion: function(tile, misColor){
		var box = DOM['unit' + tile].getBBox(),
			a = [5, 6, 8],
			sfx = ~~(Math.random() * 3);
		audio.play('grenade' + a[sfx]);
		// animate.screenShake(5, 3, .016);
		var x = 0,
			y = 0;
		for (var i=0; i<5; i++){
			(function(Math){
				animate.flash({
					d: .5,
					scale: 3,
					x: x - 100,
					y: y - 100,
				});
				animate.flash({
					d: .5,
					scale: 2,
					x: x - 100,
					y: y - 100,
				});
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				x = box.x + Math.random() * 60 - 30;
				y = box.y + Math.random() * 60 - 30;
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",0);
				circ.setAttributeNS(null, 'class', 'no-pointer');
				circ.setAttributeNS(null,"fill",misColor);
				circ.setAttributeNS(null,"stroke",'#ffffaa');
				DOM.mapAnimations.appendChild(circ);
				
				var delay = i * .05;
				TweenLite.to(circ, .75, {
					delay: delay,
					attr: {
						r: 32
					},
					onComplete: function(){
						TweenMax.to(circ, 1, {
							attr: {
								r: 1
							},
							ease: Power1.easeIn,
							onComplete: function(){
								this.target.parentNode.removeChild(this.target);
							},
						});
					},
					ease: Power4.easeOut
				});
				TweenMax.to(circ, .1, {
					fill: "hsl(+=0%, +=0%, +="+ ~~(Math.random()*100) +"%)",
					repeat: -1
				});
				TweenLite.to(circ, 1.75, {
					startAt:{
						alpha: 1
					},
					alpha: 0,
					ease: Power2.easeIn
				});
			})(Math);
		}
		animate.smoke(tile, x, y, 1);
	},
	nuke: function(tile, attacker){
		var box = DOM['unit' + tile].getBBox();
		var x = box.x;
		var y = box.y;
		// bomb shadow
		shadow = document.createElementNS("http://www.w3.org/2000/svg","ellipse");
		shadow.setAttributeNS(null,"cx",x);
		shadow.setAttributeNS(null,"cy",y);
		shadow.setAttributeNS(null,"rx",2);
		shadow.setAttributeNS(null,"ry",1);
		shadow.setAttributeNS(null,"fill",'#000000');
		shadow.setAttributeNS(null,"stroke",'none');
		DOM.mapAnimations.appendChild(shadow);
		TweenMax.to(shadow, 1, {
			startAt: {
				opacity: .5
			},
			attr: {
				rx: 10,
				ry: 5
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		// drop bomb svg
		var bomb = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		bomb.setAttributeNS(null, "cx", x);
		bomb.setAttributeNS(null, "cy", y - window.innerHeight);
		bomb.setAttributeNS(null, "r", 15);
		bomb.setAttributeNS(null,"fill",g.color[game.player[attacker].playerColor]);
		bomb.setAttributeNS(null,"stroke","#ffddaa");
		bomb.setAttributeNS(null, 'class', 'no-pointer');
		bomb.setAttributeNS(null,"stroke-width",2);
		DOM.mapAnimations.appendChild(bomb);
		TweenLite.to(bomb, .1, {
			attr: {
				r: 3
			},
			ease: Linear.easeIn,
			repeat: -1
		});
		TweenLite.to(bomb, 1, {
			startAt: {
				alpha: 1,
			},
			attr: {
				cy: y
			},
			ease: Power1.easeIn,
			onComplete: function(){
				this.target.parentNode.removeChild(bomb);
			}
		});
		// start bomb explosion sequence
		TweenLite.to(g, 1, {
			onComplete: function(){
				audio.play('bomb9');
				animate.screenShake(33, 7, .033, 1);
				//animate.sepia();
				animate.flashNuke({
					d: 2.5,
					scale: 5,
					opacity: 0,
					x: x - 100,
					y: y - 100,
				});
				animate.flashNuke({
					d: 2.5,
					scale: 4,
					x: x - 100,
					y: y - 100,
				});
				animate.flashNuke({
					d: 2.5,
					scale: 3,
					x: x - 100,
					y: y - 100,
				});
				animate.flashNuke({
					d: 2.5,
					scale: 2,
					x: x - 100,
					y: y - 100,
				});
				TweenMax.to(DOM.screenFlash, .05, {
					startAt: {
						opacity: .7,
						background: '#ffffff'
					},
					opacity: 0,
					background: '#ff8800',
					ease: Expo.easeOut
				});
				// shake
				var circ = document.createElementNS("http://www.w3.org/2000/svg","circle");
				circ.setAttributeNS(null,"cx",x);
				circ.setAttributeNS(null,"cy",y);
				circ.setAttributeNS(null,"r",1);
				circ.setAttributeNS(null,"fill",g.color[game.player[attacker].playerColor]);
				circ.setAttributeNS(null,"stroke",'#ffdd88');
				circ.setAttributeNS(null, 'class', 'no-pointer');
				DOM.mapAnimations.appendChild(circ);
				
				TweenLite.to(circ, 1.5, {
					startAt: {
						alpha: 1
					},
					attr: {
						r: 100
					},
					onComplete: function(){
						TweenMax.to(circ, 1, {
							attr: {
								r: 50
							},
							ease: Power1.easeIn
						});
					},
					ease: Power3.easeOut
				});
				TweenMax.to(circ, .05, {
					fill: "hsl(+=0%, +=0%, +=20%)",
					repeat: -1,
					yoyo: true,
					ease: SteppedEase.config(6)
				});
				TweenLite.to(circ, 2.5, {
					alpha: 0,
					ease: Power4.easeIn,
					onComplete: function(){
						this.target.parentNode.removeChild(this.target);
					}
				});
				
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
				animate.smoke(tile, x, y);
			}
		});
	},
	sepia: function() {
		var o = {
			sepia: 100,
			brightness: 200,
			blur: 3
		};

		TweenLite.to(o, 2.5, {
			sepia: 0,
			brightness: 100,
			blur: 0,
			ease: Power3.easeOut,
			onUpdate: function() {
				TweenMax.set(DOM.worldWrap, {
					filter: 'sepia(' + o.sepia +'%) brightness(' +
						o.brightness +'%) blur(' +
						o.blur +'px)'
				})
			}
		})
	},
	smoke: function(tile, x, y, scale){
		if (x === undefined){
			var o = animate.getXY(tile);
			x = o.x;
			y = o.y;
		}
		if (scale === undefined){
			scale = 1.25;
		}
		var smoke = document.createElementNS("http://www.w3.org/2000/svg","image");
		smoke.setAttributeNS(null,"width",256);
		smoke.setAttributeNS(null,"height",256);
		smoke.setAttributeNS(null,"x",x);
		smoke.setAttributeNS(null,"y",y);
		smoke.setAttributeNS(null,"opacity",0);
		smoke.setAttributeNS(null, 'class', 'no-pointer');
		smoke.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href","images/smoke.png");
		DOM.mapAnimations.appendChild(smoke);
		TweenLite.to(smoke, 3, {
			startAt: {
				alpha: 1,
				transformOrigin: '50% 50%',
				xPercent: -50,
				yPercent: -50,
				scale: 0
			},
			ease: Power4.easeOut,
			scale: scale
		});
		TweenLite.to(smoke, 3, {
			alpha: 0,
			onComplete: function(){
				this.target.parentNode.removeChild(this.target);
			}
		});
		
	},
	screenShake: function(count, d, interval, fade){
		// number of shakes, distance of shaking, interval of shakes
		var foo = 0;
		(function doit(count, d, interval, e, M){
			var d2 = d/2;
			if (fade){
				if (foo % 2 === 0){
					d--;
					if (d < 2){
						d = 2;
					}
				}
			}
			TweenLite.to(e, interval, {
				x: ~~(M.random()*(d)-d2),
				y: ~~(M.random()*(d)-d2),
				onComplete:function(){
					TweenMax.to(e, interval, {
						x: ~~(M.random()*(d)-d2),
						y: ~~(M.random()*(d)-d2),
						onComplete:function(){
							TweenMax.to(e, interval, {
								x: ~~(M.random()*(d)-d2),
								y: ~~(M.random()*(d)-d2),
								onComplete:function(){
									TweenMax.to(e, interval,{
										x: 0,
										y: 0,
										onComplete: function(){
											foo++;
											if(foo < count){ 
												doit(count, d, interval, e, M); 
											}
										}
									});
								}
							});
						}
					});
				}
			});
		})(count, d, interval, DOM.gameWrap, Math);
	},
	selectTile: function(oldTgt, newTgt){
		TweenLite.set(DOM['land' + oldTgt], {
			filter: 'none',
			fill: g.color[game.player[game.tiles[oldTgt].player].playerColor],
			stroke: game.tiles[oldTgt].player ? g.color[game.player[game.tiles[oldTgt].player].playerColor] : '#aaa',
			strokeDasharray: 'none',
			strokeDashoffset: 0,
			strokeWidth: 1,
			onComplete: function(){
				if (game.tiles[oldTgt].player){
					TweenMax.set(this.target, {
						strokeWidth: 1,
						stroke: "hsl(+=0%, +=0%, -=30%)"
					});
				}
			}
		});
		// move to top
		var x = DOM['land' + newTgt].cloneNode(true);
		DOM.landWrap.appendChild(x);
		DOM['land' + newTgt].parentNode.removeChild(DOM['land' + newTgt]);
		// cache
		DOM['land' + newTgt] = document.getElementById('land' + newTgt);
		
		var newStroke = g.color[game.player[!game.tiles[newTgt].player ? 
			my.player : game.tiles[newTgt].player].playerColor];
		var newFill = g.color[game.player[!game.tiles[newTgt].player ? 
			0 : game.tiles[newTgt].player].playerColor];
		TweenLite.set(DOM['land'+ newTgt], {
			fill: newFill,
			stroke: newStroke,
			onComplete: function(){
				TweenMax.set(this.target, {
					stroke: "hsl(+=0%, +=0%, +=15)"
				});
			}
		});
		TweenMax.to(DOM['land' + newTgt], .4, {
			startAt: {
				filter: 'url(#emboss)',
				strokeDasharray: '5,5',
				strokeWidth: 3,
				strokeDashoffset: 0
			},
			strokeDashoffset: 10,
			repeat: -1,
			ease: Linear.easeNone
		});
	},
	brightness: function(e, brightness) {
		TweenLite.set(e, {
			filter: 'brightness('+ brightness +'%)'
		});
	},
	muhBible: function() {
		var tl = new TimelineMax();
		var split = new SplitText(document.getElementById('muh-bible'), {
			type: "words,chars"
		});
		var chars = split.chars;
		tl.staggerFromTo(chars, .2, {
			immediateRender: true,
			alpha: 0
		}, {
			delay: .1,
			alpha: 1
		}, .033);
	},
	energyBar: function(tick){
		// 2.7 for 12? 2.9 for 15? this is really confusing
		TweenLite.to(DOM.energyIndicator, g.speed * 2.8, {
			startAt: {
				strokeDasharray: '0,100'
			},
			force3D: true,
			strokeDasharray: '100,100',
			ease: Linear.easeNone
		});
		TweenLite.to(DOM.currentYear, 3, {
			startAt: { color: '#ff0' },
			color: '#fff',
		});
		if (tick) {
			DOM.currentYear.textContent = ui.transformYear(tick);
			var o = {
				blur: 15
			};
			/*TweenLite.to(o, 1, {
				blur: 0,
				ease: Linear.easeIn,
				onUpdate: function() {
					animate.blur(DOM.currentYear, o.blur);
				}
			});*/
			/*TweenLite.to(DOM.currentYear, 2, {
				scrambleText:{
					text: ui.transformYear(year),
      				chars: "1234567890ABCD.",
					tweenLength: false,
					ease: Linear.easeIn
				}
			});*/
		}
	},
	blur: function(e, blur) {
		TweenLite.set(e, {
			filter: blur === 0 ? 'none' : 'blur('+ blur +'px)'
		})
	},
	research: function(o) { // element, duration, tech, method
		// create new DOM element
		var e = document.createElement('div'),
			e2 = document.createElement('div'),
			e3 = document.createElement('div'),
			e4 = document.createElement('div'),
			ref = document.getElementById(o.element);

		e.className = 'research-progress';

		e2.className = 'research-label';
		e2.innerHTML = o.tech;

		e3.className = 'research-bar';

		e4.className = 'research-bar-bg';

		ref.parentNode.insertBefore(e, ref.nextSibling);
		e.appendChild(e2);
		e.appendChild(e3);
		e3.appendChild(e4);

		TweenMax.to(e4, o.duration, {
			startAt: { width: 0 },
			width: '100%',
			ease: Linear.easeIn,
			onComplete: function() {
				e.parentNode.removeChild(e);
				research[o.method]();
				if (o.tech === 'Future Tech') {
					$("#researchFutureTech").css('display', 'flex');
				}
			}
		});
		// remove original element
		if (o.tech === 'Future Tech') {
			$("#researchFutureTech").css('display', 'none');
		}
		else {
			ref.parentNode.removeChild(ref);
		}
		// remove stale tooltip
		$(".tooltip.in").remove();
	}
}