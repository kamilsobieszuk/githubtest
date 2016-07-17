BUBBLE = {};

BUBBLE.AboveUI = function(goalController,starController) {
	
	Phaser.Group.call(this,game);

  //this.comboText = new BUBBLE.UI_ComboText()


	this.goalController = goalController;
  this.starController = starController;

  if (BUBBLE.config.current == 'hd') {
  	this.particlesEmitter = game.add.emitter(0,0,40);
    this.particlesEmitter.makeParticles('ssheet','pot_light_particle');
  	this.particlesEmitter.setSize(0,0);
    this.particlesEmitter.setXSpeed(BUBBLE.l(-300), BUBBLE.l(300));
    this.particlesEmitter.setYSpeed(BUBBLE.l(-500), BUBBLE.l(300));
    this.particlesEmitter.gravity = BUBBLE.l(1000);
    this.particlesEmitter.setRotation(-30,30);
    this.particlesEmitter.setScale(3, 3, 3, 3,0);
    this.particlesEmitter.setAlpha(1,0,1500);
  }


  BUBBLE.events.onGoToAnimationReached.add(this.emitPartWorld,this);
  BUBBLE.events.fxBurstParticles.add(this.emitPart,this);


  BUBBLE.events.onAnimalFree.add(this.initGoToAnimation,this);
  BUBBLE.events.onGhostFree.add(this.initGoToGhostAnimation,this);

  BUBBLE.events.onGoalAchieved.add(function() {this.cellingStop = true},this);
  BUBBLE.events.onCellingFree.add(function(bubble) {
  	this.initGoToAnimation({x: bubble.x, y:bubble.y, key: 'bubblesheet', frameName: 'bubble_celling', velDown: BUBBLE.l(20)});
  },this);

  BUBBLE.events.reachedStar.add(this.initGoToStarAnimation,this);

  /*BUBBLE.events.onDoublePointsActivate.add(function() {

    var dbl = new BUBBLE.OneLineText(320,game.height*0.5,'font-outline','DOUBLE\n     POINTS!',70,550,0.5,0.5);
    dbl.tint = 0xff0000;
    dbl.pushAnimation();
    game.time.events.add(1500,function() {
      this.scaleOut();
    },dbl);
    this.add(dbl);

  },this);
  */
};

BUBBLE.AboveUI.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.AboveUI.prototype.emitPart = function(obj,number) {
  if (BUBBLE.config.current != 'hd') return;
  if (BUBBLE.config.current == 'sd' && number) {
    number = Math.floor(number*0.5);
  }

  this.particlesEmitter.emitX = obj.x;
  this.particlesEmitter.emitY = obj.y;
  this.particlesEmitter.explode(1500,number || (BUBBLE.config.current == 'hd' ? 10 : 3));
};

BUBBLE.AboveUI.prototype.emitPartWorld = function(obj,number) {
  if (BUBBLE.config.current != 'hd') return;
  if (BUBBLE.config.current == 'sd' && number) {
    number = Math.floor(number*0.5);
  }

	this.particlesEmitter.emitX = obj.world.x;
	this.particlesEmitter.emitY = obj.world.y;
	this.particlesEmitter.explode(1500,number || (BUBBLE.config.current == 'hd' ? 10 : 3));
};


BUBBLE.AboveUI.prototype.initGoToAnimation = function(object,target) {

	var freeObj = this.getFirstDead() || this.add(new BUBBLE.GoalGoToAnimation());
	freeObj.init(object,target || this.goalController.ico);

};

BUBBLE.AboveUI.prototype.initGoToGhostAnimation = function(object) {

  var newObject = {
    x: game.state.getCurrentState().grid.x+object.x,
    y: game.state.getCurrentState().grid.y+object.y,
    key: 'bubblesheet',
    frameName: 'ghost_01'
  } 

  this.initGoToAnimation(newObject,this.goalController.ico);
};

BUBBLE.AboveUI.prototype.initGoToStarAnimation = function(starNr) {

  

  var newObject = {
    x: BUBBLE.l(320),
    y: game.camera.y + (0.5*game.height),
    key: 'bubblesheet',
    frameName: 'star_01',
    animating: true
  } 

  this.emitPart(newObject);

  this.initGoToAnimation(newObject,this.starController.starMarkers[starNr-1]);

};
BUBBLE.Animations = {
	animations: {},

	addAnimation: function(name,f) {
		this.animations[name] = f;
	},

	playRandom: function(object) {
		var keys = Object.keys(animations);
		var randomIndex = Math.floor(Math.random()*keys.length)
		this.animations[keys[randomIndex]](object);
	},

	play: function(type,object) {
		if (type == 'random') {
			return this.playRandom(object)
		}
		this.animations[type](object);
	} 
};

BUBBLE.Animations.addAnimation('popOutAngle',function(object) {

	var multi = Math.random() > 0.5 ? -1 : 1;
	object.angle = -20*multi;
	object.scale.setTo(0);
	object.alpha = 1;

	game.add.tween(object.scale).to({x:1.5,y:1.5},800,Phaser.Easing.Quadratic.Out,true);
	game.add.tween(object).to({angle: 20*multi},800,Phaser.Easing.Quadratic.Out,true);
	game.add.tween(object).to({alpha: 0},300,Phaser.Easing.Sinusoidal.Out,true,500)
	.onComplete.add(function() {
		this.setText('');
		this.updateCache();
		this.kill();
	},object);

	return object;

});

BUBBLE.Animations.addAnimation('popOutHang',function(object) {

	object.scale.setTo(0);
	object.alpha = 1;

	var tScaleA = game.add.tween(object.scale)
		.to({x:1.5,y:1.5},500,Phaser.Easing.Quadratic.Out)
		.to({x:0,y:0},200,Phaser.Easing.Quadratic.In);

	tScaleA.onComplete.add(object.kill,object);																				
	tScaleA.start();

	return object;



});


BUBBLE.Background = function() {

	Phaser.BitmapData.call(this, game,'',game.width,game.height);
	

	this.bgImg = game.make.image(0,0,'main_menu_backgr');
	this.bgImg.anchor.setTo(0.5,0);

	this.opImg = game.make.image();

	this.text = new BUBBLE.OneLineText(0,0,'font-shadow','',30,220,0.5,0.5);

	this.drawMiddleImg = true;

	//this.endless = endless;

};

BUBBLE.Background.prototype = Object.create(Phaser.BitmapData.prototype);
BUBBLE.Background.constructor = BUBBLE.Background;


BUBBLE.Background.prototype.refreshBitmapData = function() {

	this.resize(game.width,game.height);

	this.bgImg.height = game.height;
	this.bgImg.scale.x = this.bgImg.scale.y;
	this.bgImg.width = this.bgImg.width < game.width ? game.width : this.bgImg.width;
	//this.bgImg.scale.x = this.bgImg.scale.y;
	this.draw(this.bgImg,this.width*0.5,0);

	if (this.drawMiddleImg) {
		this.drawRopes();
	}

	if (BUBBLE.horizontal) {
		this.drawUIBgs();

	}

}

BUBBLE.Background.prototype.drawRopes = function() {

	this.opImg.loadTexture('ssheet','rope');

	for (var yy = 0; yy < game.height; yy+=this.opImg.height) {
		this.opImg.anchor.setTo(1,0);
		this.draw(this.opImg, -game.world.bounds.x, yy);
		this.opImg.anchor.setTo(0,0);
		this.draw(this.opImg, -game.world.bounds.x+BUBBLE.l(640), yy);
	}

};

BUBBLE.Background.prototype.drawUIBgs = function() {

	this.drawPointsBg();
	this.drawMoneyUI();
	this.drawBoosterStripeBg();

};


BUBBLE.Background.prototype.drawMoneyUI = function() {

	var pos = BUBBLE.settings.ui.money.h;
	var xx = -game.world.bounds.x+BUBBLE.l(pos.x);
	var yy = BUBBLE.l(pos.y);

	this.opImg.loadTexture('ssheet','bg_points');
	this.opImg.anchor.setTo(1,0.5);
	this.draw(this.opImg,xx,yy);
 

};


BUBBLE.Background.prototype.drawPointsBg = function() {

	var pos = BUBBLE.settings.ui.points.h;
	var xx = -game.world.bounds.x+BUBBLE.l(pos.x);
	var yy = BUBBLE.l(pos.y);

	this.opImg.loadTexture('ssheet','bg_score_goals_h');
	this.opImg.anchor.setTo(0.5);
	this.draw(this.opImg,xx,yy);
	this.opImg.loadTexture('ssheet','bg_points');
	this.opImg.anchor.setTo(0.5);
	this.draw(this.opImg,xx,yy+BUBBLE.l(5));

	var scoreTxt = BUBBLE.txt('Score')+':';
	scoreTxt = scoreTxt[0].toUpperCase() + scoreTxt.slice(1);
	this.text.orgFontSize = BUBBLE.l(30);
	this.text.setText(scoreTxt);
	this.draw(this.text._cachedSprite,xx,yy-BUBBLE.l(85));

	/*
	this.text.orgFontSize = BUBBLE.l(20);
	this.text.setText(BUBBLE.txt("Best score")+': '+BUBBLE.saveState.data.highscores[0]);
	this.draw(this.text._cachedSprite,xx,yy+BUBBLE.l(55));
	*/
};

BUBBLE.Background.prototype.drawBoosterStripeBg = function() {

	var pos = BUBBLE.settings.ui.booster.h;
	var xx = -game.world.bounds.x+BUBBLE.l(pos.x);
	var yy = BUBBLE.l(pos.y);

	this.opImg.loadTexture('ssheet','bg_boosters_h');
	this.opImg.anchor.setTo(0.5,0);
	this.draw(this.opImg,xx,yy);

}

BUBBLE.Background.prototype.addImgToWorld = function(background,withoutMiddleImg) {

	if (background) this.bgImg.loadTexture(background);

	if (withoutMiddleImg) {
		this.drawMiddleImg = false;
	}else {
		this.drawMiddleImg = true;
	}

	this.refreshBitmapData();
	var img = this.addToWorld(0,0);
	img.fixedToCamera = true;
	
	BUBBLE.events.onScreenResize.add(this.refreshBitmapData,this);

	return img;

}
BUBBLE.BottomFxLayer = function() {
	Phaser.Group.call(this,game);

	BUBBLE.events.fxCircleParticle.add(this.initCircleParticle,this);
	BUBBLE.events.fxBlastCircleParticle.add(this.initBlastCircleParticle,this);
	BUBBLE.events.fxUnderMatch.add(this.initUnderMatch,this);
	BUBBLE.events.fxDummyBubble.add(this.initDummyBubble,this);

}

BUBBLE.BottomFxLayer.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.BottomFxLayer.constructor = BUBBLE.BottomFxLayer;

BUBBLE.BottomFxLayer.prototype.initCircleParticle = function(bubble) {
	this.getFreeBubble().initCircleParticle(bubble);
}

BUBBLE.BottomFxLayer.prototype.initBlastCircleParticle = function(bubble) {
	this.getFreeBubble().initBlastCircleParticle(bubble);
}

BUBBLE.BottomFxLayer.prototype.initDummyBubble = function(bubble) {
	this.getFreeBubble().initDummyBubble(bubble);
}

BUBBLE.BottomFxLayer.prototype.initUnderMatch = function(bubble) {
	this.getFreeBubble().initUnderMatchParticle(bubble);
}


BUBBLE.BottomFxLayer.prototype.childrenUpdate = function() {

	var i = this.children.length;

    while (i--)
    {
        this.children[i].update();
    }

};

BUBBLE.BottomFxLayer.prototype.getFreeBubble = function() {
	return this.getFirstDead() || this.add(new BUBBLE.BubbleFx());
};

BUBBLE.BottomFxLayer.prototype.init = function(grid,endless) {
	
	this.grid = grid;

	if (grid.ghostMode) {
		this.x = this.grid.x;
		this.y = this.grid.y;
		this.update = function() {
			this.rotation = this.grid.rotation;
			this.childrenUpdate();
		};
	}
	

	for (var i = 0 ; i < 5; i++) {
		if (endless) {
			this.add(new BUBBLE.BubbleFxEndless(grid));
		}else {
			this.add(new BUBBLE.BubbleFx());
		}
	}
}
BUBBLE.Flash = function() {
	
	Phaser.Image.call(this, game,0,0,'ssheet','fade');
	this.fixedToCamera = true;

	BUBBLE.events.onScreenResize.add(this.onScreenResize,this);

	this.onScreenResize();


	this.alpha = 0;

	BUBBLE.events.flash.add(this.flash,this);
	BUBBLE.events.onDoublePointsActivate.add(this.flash,this);

	this.game.add.existing(this);

	game.add.existing(this);
	this.alphaDelta = 0.05;

}

BUBBLE.Flash.prototype = Object.create(Phaser.Image.prototype);
BUBBLE.Flash.constructor = BUBBLE.FadeLayer;

BUBBLE.Flash.prototype.update = function() {

	this.alpha = Math.max(0,this.alpha-this.alphaDelta);
	if (this.alpha == 0) this.alphaDelta = 0.05;

};

BUBBLE.Flash.prototype.flash = function(alpha,delta) {
	
	this.alpha = alpha || 0.8;
	this.alphaDelta = delta || 0.05;
	
};

BUBBLE.Flash.prototype.onScreenResize = function() {
	this.width = game.width;
	this.height = game.height;
	if (this.cacheAsBitmap) {
		this.updateCache();
	}else {
		this.cacheAsBitmap = true;
	}
};

BUBBLE.BubbleFactory = function(grid) {

	this.grid = grid;
	this.gridArray = grid.gridArray;
	this.neighboursCoordinations = grid.neighboursCoordinations;

	this.colorGroups = ['0','1','2','3','4'];
	BUBBLE.utils.shuffle(this.colorGroups);

}

BUBBLE.BubbleFactory.prototype.makeBubble = function(cellX,cellY,type) {


	var createdBubble = 0;
	var pxPos = this.grid.cellToInsidePx(cellX,cellY);

	if (type.slice(0,6) == "SHIELD") {
		return this.makeShield(cellX,cellY,type);
	}else if (type.indexOf("explosive") != -1) {
		
		createdBubble = new BUBBLE.BubbleExplosive(cellX,cellY,pxPos[0],pxPos[1],type.slice(10));
	}else if (type == "infected") {
		createdBubble = new BUBBLE.BubbleInfected(cellX,cellY,pxPos[0],pxPos[1]);
	}else if (type == "chain") {
		createdBubble = new BUBBLE.BubbleChain(cellX,cellY,pxPos[0],pxPos[1]);
	}else if (type == "doom") {
		createdBubble = new BUBBLE.BubbleDoom(cellX,cellY,pxPos[0],pxPos[1]);
	}else if (type == "bomb") {
		createdBubble = new BUBBLE.BubbleBomb(cellX,cellY,pxPos[0],pxPos[1]);
	}else if (type == "multicolor") {
		createdBubble = new BUBBLE.BubbleRegular(cellX,cellY,pxPos[0],pxPos[1],'multicolor');
		createdBubble.loadTexture('bubblesheet','bubble_multicolor');
	}
	else if (type == "GHOST") {
		createdBubble = new BUBBLE.BubbleGhost(cellX,cellY,pxPos[0],pxPos[1]);
	}
	else if (type == "ANIMAL") {
		createdBubble = new BUBBLE.BubbleAnimal(cellX,cellY,pxPos[0],pxPos[1]);
	}
	else if (type == 'bk') {
		createdBubble = new BUBBLE.BubbleBlocker(cellX,cellY,pxPos[0],pxPos[1]);
	}
	else if (type == 'cham') {
		createdBubble = new BUBBLE.BubbleChameleon(cellX,cellY,pxPos[0],pxPos[1]);
	}
	else if (type == 'monster') {
		createdBubble = new BUBBLE.BubbleMonster(cellX,cellY,pxPos[0],pxPos[1],this.grid);
	}
	else if ((type.length == 2 || type.length == 3) && type[0] == 'C') {
		if (type[1] === 'g') {
			type = 'C'+this.colorGroups[parseInt(type[2])-1];
		}
		if (type[1] === 'r') {
			type = 'C'+this.colorGroups[BUBBLE.rndBetween(0,4,'BF Cr')];
		}
		createdBubble = new BUBBLE.BubbleCloud(cellX,cellY,pxPos[0],pxPos[1],type[1]);
	}else if (type == "blackhole") {
		createdBubble = new BUBBLE.BubbleBlackHole(cellX,cellY,pxPos[0],pxPos[1]);
	}else if (type == "r") {
		createdBubble = new BUBBLE.BubbleRegular(cellX,cellY,pxPos[0],pxPos[1],this.colorGroups[BUBBLE.rndBetween(0,4,'BF r')]);
	}else if (type == "r5") {
		createdBubble = new BUBBLE.BubbleRegular(cellX,cellY,pxPos[0],pxPos[1],BUBBLE.rndBetween(0,5,'BF r5').toString());
	}else if (type.indexOf('keyhole') != -1) {
		createdBubble = new BUBBLE.BubbleKeyhole(cellX,cellY,pxPos[0],pxPos[1],type[8]);
	}else {
		if (type[0] === 'g') {
			type = this.colorGroups[parseInt(type[1])-1];
		}
		createdBubble = new BUBBLE.BubbleRegular(cellX,cellY,pxPos[0],pxPos[1],type);
	}

	createdBubble.grid = this.grid;

	this.gridArray.set(cellX,cellY,createdBubble);
	
	if (createdBubble.animated) {
		this.grid.nonCacheGroup.add(createdBubble);
	}else {
		this.grid.add(createdBubble);
	}
	

	return createdBubble;

}


BUBBLE.BubbleFactory.prototype.makeRegularBubble = function(cellX,cellY,type) {

	var bubble 

}

BUBBLE.BubbleFactory.prototype.makeShield = function(cellX,cellY,type) {


	var pxPos = this.grid.cellToInsidePx(cellX,cellY);

	var centerOfShield = new BUBBLE.BubbleCenterOfShield(cellX,cellY,pxPos[0],pxPos[1],type,this.grid);
	var sides = [];
	
	this.grid.neighboursCoordinations[Math.abs(cellY%2)].forEach(function(coords) {
		
		pxPos = this.grid.cellToInsidePx(cellX+coords[0],cellY+coords[1]);
		sides.push(new BUBBLE.BubbleShield(cellX+coords[0],cellY+coords[1],pxPos[0],pxPos[1]));

	},this);

	sides.forEach(function(shield) {
		shield.grid = this.grid;
		this.gridArray.set(shield.cellX,shield.cellY,shield);
		this.grid.add(shield);
	},this);

	centerOfShield.setSides(sides);

	this.gridArray.set(cellX,cellY,centerOfShield);
	this.grid.add(centerOfShield);

	return centerOfShield;

};
BUBBLE.BubbleFlying = function(grid) {

	Phaser.Sprite.call(this,game,0,0,null);
	this.anchor.setTo(0.5);

	this.grid = grid;
	this.collCircle = new Phaser.Circle(0,0,BUBBLE.lnf(10));
	this.spd = BUBBLE.lnf(BUBBLE.settings.speedOfBubble);
	this.cellX = 0;
	this.cellY = 0;
	this.prevCellX = 0;
	this.prevCellY = 0;
	this.neighbours = [];
	this.ghostMode = grid.lvl.mode == "Ghost";
	this.bossMode = grid.lvl.mode == "Boss";
	
	this.kill();

}

BUBBLE.BubbleFlying.prototype = Object.create(Phaser.Sprite.prototype);
BUBBLE.BubbleFlying.constructor = BUBBLE.BubbleFlying;


BUBBLE.BubbleFlying.prototype.update = function() {
	if (!this.alive) return;

	this.updatePosition();
	this.updateColl();

	if (!this.alive) {
		BUBBLE.events.onMoveDone.dispatch(this.grid.getAllColorsOnBoard());
	}
}

BUBBLE.BubbleFlying.prototype.init = function(x,y,angle,type,walkthroughEndPoint) {

	if (walkthroughEndPoint) {
		
		
	}
	

	this.revive();
	this.x = x;
	this.y = y;
	this.collCircle.diameter = BUBBLE.lnf(10);
	this.cellX = -99999;
	this.cellY = -99999;
	this.alpha = 1;
	this.type = type.toString();
	this.velX = BUBBLE.utils.lengthdir_x(angle,this.spd,true);
	this.velY = BUBBLE.utils.lengthdir_y(angle,this.spd,true);

	this.walkthroughEndPoint = walkthroughEndPoint;

	if (walkthroughEndPoint) {
		this.loadTexture('bubblesheet','bubble_'+walkthroughEndPoint.type)
		this.type = walkthroughEndPoint.type.toString();
	}else {
		this.loadTexture('bubblesheet','bubble_'+type)
	}

	this.minX = BUBBLE.l(40);
	this.maxX = BUBBLE.l(600);
	this.minY = BUBBLE.l(30);
	this.maxY = y;
};

BUBBLE.BubbleFlying.prototype.updateColl = function() {

 	if (!this.alive) return;


	var coll = this.grid.checkCollisionAgainst(this,this.neighbours);

	if (coll.length > 0) {

		if (this.grid.getBubble(this.cellX,this.cellY)) {
			//this.grid.bounceBubbles(this.cellX,this.cellY,this.velX,this.velY);
			this.cellX = this.prevCellX;
			this.cellY = this.prevCellY;
		}

		if (this.walkthroughEndPoint) {
			this.cellX = this.walkthroughEndPoint.c[0];
			this.cellY = this.walkthroughEndPoint.c[1];
			this.x = BUBBLE.lnf(this.walkthroughEndPoint.p[0]);
			this.y = BUBBLE.lnf(this.walkthroughEndPoint.p[1]);
		}

		//so move recorder can catch and make walkthroughEndPoint
		BUBBLE.events.flyingBubbleToBePut.dispatch(this);
		this.grid.putBubble(this);

		this.kill();

	}
};


BUBBLE.BubbleFlying.prototype.updatePosition = function() {

	if (!this.alive) return;

	this.x += this.velX;
	this.y += this.velY;

	if (this.x < this.minX || this.x > this.maxX) {
		var offset = this.x < this.minX ? this.minX-this.x : this.maxX-this.x;
		this.x = game.math.clamp(this.x,this.minX,this.maxX)+offset;
		this.velX *= -1;
		game.sfx['hit_'+game.rnd.between(1,3)].play();
	}

	if (this.ghostMode && this.y < this.minY) {
		this.y = this.minY-(this.y-this.minY);
		this.velY *= -1;
		game.sfx['hit_'+game.rnd.between(1,3)].play();
	}

	if (this.bossMode && this.y < this.grid.y+this.minY) {
		this.y = this.grid.y+this.minY;
		this.velY *= -1;
		game.sfx['hit_'+game.rnd.between(1,3)].play();
	}

	if (this.y > this.maxY) {
		this.alpha -= 0.07;
		if (this.alpha < 0) {
			this.kill();
		}
	}

	var cellPos = this.grid.outsidePxToCell(this.x,this.y);

	if (this.cellX != cellPos[0] || this.cellY != cellPos[1]) {
		this.prevCellX = this.cellX;
		this.prevCellY = this.cellY;
		this.cellX = cellPos[0];
		this.cellY = cellPos[1];
		this.neighbours = this.grid.getNeighbours(cellPos[0],cellPos[1]);

	}

};


BUBBLE.BubbleFlying.prototype.getInsideGridPx = function() {
	return this.grid.cellToInsidePx(this.cellX,this.cellY);
};
BUBBLE.BubbleFx = function() {

	Phaser.Image.call(this,game,0,0, null);
	this.anchor.setTo(0.5);

	this.kill();

	this.updateFunction = function() {};
}

BUBBLE.BubbleFx.prototype = Object.create(Phaser.Image.prototype);
BUBBLE.BubbleFx.constructor = BUBBLE.BubbleFx;


BUBBLE.BubbleFx.prototype.update = function() {

	if (!this.alive) return;

	this.updateFunction(); 

}

BUBBLE.BubbleFx.prototype.updateEmpty = function() {};


BUBBLE.BubbleFx.prototype.init = function(bubble) {

	this.x = bubble.x;
	this.y = bubble.y;
	this.alpha = 1;
	this.angle = 0;
	this.scale.setTo(1);
	this.bubble = bubble;
	this.updateFunction = this.updateEmpty;
	this.revive();

}

BUBBLE.BubbleFx.prototype.initCircleParticle = function(bubble) {

	this.init(bubble);
	
	this.scale.setTo(0);
	this.loadTexture('bubblesheet','bubble_hit_particle');
	this.updateFunction = this.updateCircleParticle;

}



BUBBLE.BubbleFx.prototype.updateCircleParticle = function() {

	this.scale.setTo(this.scale.x+0.06);
	if (this.scale.x > 0.75) {
		this.alpha = 1 - ((this.scale.x-0.75)*2);
		if (this.alpha <= 0) this.kill();
	}

}

BUBBLE.BubbleFx.prototype.initBlastCircleParticle = function(bubble) {

	this.init(bubble);
	
	this.scale.setTo(0);
	this.loadTexture('bubblesheet','bubble_hit_particle');
	this.updateFunction = this.updateBlastCircleParticle;

}



BUBBLE.BubbleFx.prototype.updateBlastCircleParticle = function() {

	this.scale.setTo(this.scale.x+0.15);
	if (this.scale.x > 2) {
		this.alpha = 1 - ((this.scale.x-2)*2);
		if (this.alpha <= 0) this.kill();
	}

}


BUBBLE.BubbleFx.prototype.initMatchParticle = function(bubble) {

	this.init(bubble);

	this.matchIndex = 1;
	this.matchTimer = 0;
	this.loadTexture(null);
	this.updateFunction = this.updateMatchParticle;

}

BUBBLE.BubbleFx.prototype.updateMatchParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y;
	this.scale.setTo(this.bubble.scale.x);

	if (this.matchTimer == 0) {
		this.loadTexture('bubblesheet','bubble_match_'+this.matchIndex);
		this.matchTimer = 2;
		this.matchIndex++;
		if (this.matchIndex == 12) {
			this.kill();
		}
	}

	this.matchTimer--;
}

BUBBLE.BubbleFx.prototype.initUnderMatchParticle = function(bubble) {

	this.init(bubble);

	//this.angle = Math.random()*360;
	this.animIndex = 0;
	this.delay = 15+Math.floor(Math.random()*25); 
	this.loadTexture(null);
	this.updateFunction = this.updateUnderMatchParticle;
	if (Math.random() > 0.5) {
		this.scale.x = -1;
	}
	if (Math.random() > 0.5) {
		this.scale.y = -1;
	}

}

BUBBLE.BubbleFx.prototype.updateUnderMatchParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y;
	this.scale.setTo(this.bubble.scale.x);

	if (this.delay-- > 0) return;

	this.animIndex++;

	if (this.animIndex == 20) {
		this.kill();
	}else {
		this.loadTexture('burstsheet','underburst'+this.animIndex);
	}

};

BUBBLE.BubbleFx.prototype.initMatchParticleNew = function(bubble) {

	this.init(bubble);

	this.matchIndex = 1;
	this.matchTimer = 0;
	this.loadTexture('burstsheet',bubble.typeName+'_blur');
	this.updateFunction = this.updateMatchParticleNew;

	this.alphaD = 0.1;
	this.alpha = 0.001;

}

BUBBLE.BubbleFx.prototype.updateMatchParticleNew = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y;

	this.alpha += this.alphaD;

	if (this.alpha > 1) {
		this.alpha = 1;
		this.alphaD *= -1;
	}

	if (this.alpha < 0) {
		this.kill();
	}

}

BUBBLE.BubbleFx.prototype.initCloudParticle = function(bubble) {

	this.init(bubble);

	this.rotation = this.bubble.rotation;
	this.animIndex = 0;
	this.animTimer = 0;
	this.loadTexture('bubblesheet','cloud_0');
	this.updateFunction = this.updateCloudParticle;

}

BUBBLE.BubbleFx.prototype.updateCloudParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y;
	this.rotation = this.bubble.rotation;

	if (this.animTimer == 0) {
		this.loadTexture('bubblesheet','cloud_'+this.animIndex);
		this.animTimer = 3;
		this.animIndex++;
		if (this.animIndex == 5) {
			this.kill();
		}
	}

	this.animTimer--;
	
}


BUBBLE.BubbleFx.prototype.initChameleonColorChange = function(bubble) {

	this.init(bubble);

	this.rotation = this.bubble.rotation;
	this.animIndex = 0;
	this.animTimer = 0;
	this.loadTexture('bubblesheet',bubble.frameName);
	this.updateFunction = this.updateChameleonColorChange;

}

BUBBLE.BubbleFx.prototype.updateChameleonColorChange = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y;
	this.rotation = this.bubble.rotation;
	this.alpha -= 0.03;
	if (this.alpha < 0) this.kill();

};


BUBBLE.BubbleFx.prototype.initDummyBubble = function(bubble) {

	this.init(bubble);
	this.loadTexture('bubblesheet',bubble.frameName);

	this.dummyTimer = 30;
	this.updateFunction = this.updateDummyBubble;
};

BUBBLE.BubbleFx.prototype.updateDummyBubble = function() {
	this.dummyTimer--;
	if (this.dummyTimer == 0) {
		this.alpha = 0;
		this.kill();
	};
};

BUBBLE.BubbleFx.prototype.initExplosionMain = function(bubble) {

	this.init(bubble)

	game.sfx.explosion_2.play();
	
	this.animIndex = 0;
	this.animTimer = 1;
	this.animTimerInterval = this.animTimer;
	this.loadTexture('explosionsheet','explosion_0');
	this.updateFunction = this.updateExplosion;
	BUBBLE.events.shakeCamera.dispatch();
	BUBBLE.events.flash.dispatch();

};

BUBBLE.BubbleFx.prototype.updateExplosion = function() {

	if (this.animTimer-- == 0) {
		this.animTimer = this.animTimerInterval;

		this.animIndex++;

		if (this.animIndex == 15) {
			this.kill();
		}else {
			this.loadTexture('explosionsheet','explosion_'+this.animIndex);
		}
	}

};

BUBBLE.BubbleFx.prototype.initExplosionPart = function(bubble,sprite,angle,spd) {

	this.init(bubble);

	this.timer = Math.floor(Math.random()*10);
	
	this.velX = BUBBLE.utils.lengthdir_x(angle,BUBBLE.lnf(spd),false);
	this.velY = BUBBLE.utils.lengthdir_y(angle,BUBBLE.lnf(spd),false);
	this.loadTexture('explosionsheet',sprite);
	this.angle = angle+180;

	this.updateFunction = this.updateExplosionPartUpdate;


};

BUBBLE.BubbleFx.prototype.updateExplosionPartUpdate = function() {

	if (this.timer-- < 0) {
		this.alpha -= 0.05;
		if (this.alpha < 0) {
			this.kill();
		}
	}

	this.velX *= 0.96;
	this.velY *= 0.96;

	this.x += this.velX;
	this.y += this.velY;

};
BUBBLE.BubbleFxEndless = function(grid) {

	Phaser.Image.call(this,game,0,0, null);
	this.anchor.setTo(0.5);

	this.grid = grid;

	this.kill();

	this.updateFunction = function() {};
}

BUBBLE.BubbleFxEndless.prototype = Object.create(Phaser.Image.prototype);
BUBBLE.BubbleFxEndless.constructor = BUBBLE.BubbleFxEndless;


BUBBLE.BubbleFxEndless.prototype.update = function() {

	if (!this.alive) return;

	this.updateFunction(); 

}

BUBBLE.BubbleFxEndless.prototype.updateEmpty = function() {};


BUBBLE.BubbleFxEndless.prototype.init = function(bubble) {

	this.x = bubble.x;
	this.y = bubble.y;
	this.alpha = 1;
	this.angle = 0;
	this.scale.setTo(1);
	this.bubble = bubble;
	this.updateFunction = this.updateEmpty;
	this.revive();

}

BUBBLE.BubbleFxEndless.prototype.initCircleParticle = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;
	
	this.scale.setTo(0);
	this.loadTexture('bubblesheet','bubble_hit_particle');
	this.updateFunction = this.updateCircleParticle;

}



BUBBLE.BubbleFxEndless.prototype.updateCircleParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;

	this.scale.setTo(this.scale.x+0.06);
	if (this.scale.x > 0.75) {
		this.alpha = 1 - ((this.scale.x-0.75)*2);
		if (this.alpha <= 0) this.kill();
	}

}

BUBBLE.BubbleFxEndless.prototype.initBlastCircleParticle = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;
	
	this.scale.setTo(0);
	this.loadTexture('bubblesheet','bubble_hit_particle');
	this.updateFunction = this.updateBlastCircleParticle;

}



BUBBLE.BubbleFxEndless.prototype.updateBlastCircleParticle = function() {

	this.scale.setTo(this.scale.x+0.15);
	if (this.scale.x > 2) {
		this.alpha = 1 - ((this.scale.x-2)*2);
		if (this.alpha <= 0) this.kill();
	}

}


BUBBLE.BubbleFxEndless.prototype.initMatchParticle = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;

	this.matchIndex = 1;
	this.matchTimer = 0;
	this.loadTexture(null);
	this.updateFunction = this.updateMatchParticle;

}

BUBBLE.BubbleFxEndless.prototype.updateMatchParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;
	this.scale.setTo(this.bubble.scale.x);

	if (this.matchTimer == 0) {
		this.loadTexture('bubblesheet','bubble_match_'+this.matchIndex);
		this.matchTimer = 2;
		this.matchIndex++;
		if (this.matchIndex == 12) {
			this.kill();
		}
	}

	this.matchTimer--;

}

BUBBLE.BubbleFxEndless.prototype.initUnderMatchParticle = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;
	//this.angle = Math.random()*360;
	this.animIndex = 0;
	this.delay = 15+Math.floor(Math.random()*25); 
	this.loadTexture(null);
	this.updateFunction = this.updateUnderMatchParticle;
	if (Math.random() > 0.5) {
		this.scale.x = -1;
	}
	if (Math.random() > 0.5) {
		this.scale.y = -1;
	}

}

BUBBLE.BubbleFxEndless.prototype.updateUnderMatchParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;
	this.scale.setTo(this.bubble.scale.x);

	if (this.delay-- > 0) return;

	this.animIndex++;

	if (this.animIndex == 20) {
		this.kill();
	}else {
		this.loadTexture('burstsheet','underburst'+this.animIndex);
	}

};

BUBBLE.BubbleFxEndless.prototype.initMatchParticleNew = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;

	this.matchIndex = 1;
	this.matchTimer = 0;
	this.loadTexture('burstsheet',bubble.typeName+'_blur');
	this.updateFunction = this.updateMatchParticleNew;

	this.alphaD = 0.1;
	this.alpha = 0.001;

}

BUBBLE.BubbleFxEndless.prototype.updateMatchParticleNew = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;

	this.alpha += this.alphaD;

	if (this.alpha > 1) {
		this.alpha = 1;
		this.alphaD *= -1;
	}

	if (this.alpha < 0) {
		this.kill();
	}

}

BUBBLE.BubbleFxEndless.prototype.initCloudParticle = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;

	this.rotation = this.bubble.rotation;
	this.animIndex = 0;
	this.animTimer = 0;
	this.loadTexture('bubblesheet','cloud_0');
	this.updateFunction = this.updateCloudParticle;

}

BUBBLE.BubbleFxEndless.prototype.updateCloudParticle = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;
	this.rotation = this.bubble.rotation;

	if (this.animTimer == 0) {
		this.loadTexture('bubblesheet','cloud_'+this.animIndex);
		this.animTimer = 3;
		this.animIndex++;
		if (this.animIndex == 5) {
			this.kill();
		}
	}

	this.animTimer--;
	
}


BUBBLE.BubbleFxEndless.prototype.initChameleonColorChange = function(bubble) {

	this.init(bubble);

	this.y += this.grid.y;
	this.rotation = this.bubble.rotation;
	this.animIndex = 0;
	this.animTimer = 0;
	this.loadTexture('bubblesheet',bubble.frameName);
	this.updateFunction = this.updateChameleonColorChange;

}

BUBBLE.BubbleFxEndless.prototype.updateChameleonColorChange = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;
	this.rotation = this.bubble.rotation;
	this.alpha -= 0.03;
	if (this.alpha < 0) this.kill();

};


BUBBLE.BubbleFxEndless.prototype.initDummyBubble = function(bubble) {

	this.init(bubble);
	this.loadTexture('bubblesheet',bubble.frameName);

	this.y += this.grid.y;

	this.dummyTimer = 30;
	this.updateFunction = this.updateDummyBubble;
};

BUBBLE.BubbleFxEndless.prototype.updateDummyBubble = function() {

	this.x = this.bubble.x;
	this.y = this.bubble.y+this.grid.y;

	this.dummyTimer--;
	if (this.dummyTimer == 0) {
		this.alpha = 0;
		this.kill();
	};
};


BUBBLE.BubbleFxEndless.prototype.initExplosionMain = function(bubble) {

	this.init(bubble)

	this.animIndex = 0;
	this.animTimer = 1;
	this.animTimerInterval = this.animTimer;
	this.loadTexture('explosionsheet','explosion_0');
	this.updateFunction = this.updateExplosion;
	BUBBLE.events.shakeCamera.dispatch();
	BUBBLE.events.flash.dispatch();

};

BUBBLE.BubbleFxEndless.prototype.updateExplosion = function() {

	if (this.animTimer-- == 0) {
		this.animTimer = this.animTimerInterval;

		this.animIndex++;

		if (this.animIndex == 15) {
			this.kill();
		}else {
			this.loadTexture('explosionsheet','explosion_'+this.animIndex);
		}
	}

};

BUBBLE.BubbleFxEndless.prototype.initExplosionPart = function(bubble,sprite,angle,spd) {

	this.init(bubble);

	this.timer = Math.floor(Math.random()*10);
	
	this.velX = BUBBLE.utils.lengthdir_x(angle,BUBBLE.lnf(spd),false);
	this.velY = BUBBLE.utils.lengthdir_y(angle,BUBBLE.lnf(spd),false);
	this.loadTexture('explosionsheet',sprite);
	this.angle = angle+180;

	this.updateFunction = this.updateExplosionPartUpdate;


};

BUBBLE.BubbleFxEndless.prototype.updateExplosionPartUpdate = function() {

	if (this.timer-- < 0) {
		this.alpha -= 0.05;
		if (this.alpha < 0) {
			this.kill();
		}
	}

	this.velX *= 0.96;
	this.velY *= 0.96;

	this.x += this.velX;
	this.y += this.velY;

};
BurstAnimation = function() {

	Phaser.Group.call(this,game);


	this.color = 'yellow';

	this.burst = BUBBLE.makeImageL(200,200,'burst_0',0.5,this);
	this.burstTimer = 20;
	this.burstFrameIndex = 0;


	this.bubble = BUBBLE.makeImageL(200,200,this.color+'_1',0.5,this);
	this.bubble.scale.setTo(0.94);
	this.bubbleTimer = 20;
	this.bubbleFrameIndex = 1;

	/*
	this.bubblebrigth = BUBBLE.makeImageL(200,200,'blue_bright',0.5,this);
	this.bubblebrigth.width = 58;
	this.bubblebrigth.height = 58;
	this.bubblebrigth.alpha = 0;
	this.bubblebrigth.alphaD = 0.1;
	*/

	
	this.startAnimations = false;

	this.animTimer = 0;


}

BurstAnimation.prototype = Object.create(Phaser.Group.prototype);


BurstAnimation.prototype.updateAnim = function() {
	
	this.burstFrameIndex++;
	if (this.burstFrameIndex < 9) {	
		this.burst.loadTexture('ballburst','burst_'+this.burstFrameIndex);
	}else {
		this.burst.visible = false;
	}	

	this.bubbleFrameIndex++;
	if (this.bubbleFrameIndex < 8) {	
		this.bubble.loadTexture('ballburst',this.color+'_'+this.bubbleFrameIndex);
	}else {
		this.bubble.visible = false;
	}	

};



BurstAnimation.prototype.updateAnim2 = function() {
	
	this.bubblebrigth.alpha += this.bubblebrigth.alphaD;
	this.bubblebrigth.alpha = game.math.clamp(this.bubblebrigth.alpha,0,1);

	if (this.bubblebrigth.alpha >= 1) {
		this.bubblebrigth.alphaD *= -1;
		this.startAnimations = true;
	}
	
	if (this.startAnimations) {
		if (this.animTimer-- == 0) {
			this.animTimer = 2;

			this.burstFrameIndex++;
			if (this.burstFrameIndex < 9) {	
				this.burst.loadTexture('ballburst','burst_'+this.burstFrameIndex);
			}else {
				this.burst.visible = false;
			}	

			this.bubbleFrameIndex++;
			if (this.bubbleFrameIndex < 8) {	
				this.bubble.loadTexture('ballburst','blue_'+this.bubbleFrameIndex);
			}else {
				this.bubble.visible = false;
			}	
		}
	}


};
BUBBLE.Button = function(x,y,sprite,callback,context) {

	Phaser.Button.call(this, game,BUBBLE.l(x),BUBBLE.l(y),null,this.click,this);
	
	this.state = game.state.getCurrentState();

	this.loadTexture('ssheet',sprite);
	this.anchor.setTo(0.5);

	this.sfx = game.sfx.pop;

	this.active = true;

	this.onClick = new Phaser.Signal();
	if (callback) {
		this.onClick.add(callback,context || this);
	}

	this.terms = [];


}

BUBBLE.Button.prototype = Object.create(Phaser.Button.prototype);
BUBBLE.Button.constructor = BUBBLE.Button;

BUBBLE.Button.prototype.click = function() {
	if (!this.active) return;

	for (var i = 0; i < this.terms.length; i++) {
		if (!this.terms[i][0].call(this.terms[i][1])) {
			return;
		}
	}

	this.active = false;
	this.onClick.dispatch();

	this.sfx.play();

	game.add.tween(this.scale).to({x: 1.2, y: 1.2},200,Phaser.Easing.Quadratic.Out,true).onComplete.add(function() {

		

		game.add.tween(this.scale).to({x: 1, y: 1},200,Phaser.Easing.Quadratic.Out,true).onComplete.add(function() {
			this.active = true;
		},this)
	},this)


}

BUBBLE.Button.prototype.addTerm = function(callback,context) {
	this.terms.push([callback,context]);
}

BUBBLE.Button.prototype.addImageLabel = function(image) {
	this.label = game.make.image(0,0,'ssheet',image);
	this.label.anchor.setTo(0.5);
	this.addChild(this.label);
};

BUBBLE.Button.prototype.addTextLabel = function(font,text,size) {
	var multi = 1/BUBBLE.config.multiplier;

	

	this.label = new BUBBLE.OneLineText(0,0,font,text,size || Math.floor(this.height*multi*0.7),this.width*multi*0.9,0.5,0.5);
	this.addChild(this.label);
};

BUBBLE.Button.prototype.addTextLabelMultiline = function(font,text) {
	var multi = BUBBLE.config.multiplier/1;

	this.label = new BUBBLE.MultiLineText(0,0,font,text,Math.floor(this.height*multi*0.5),this.width*multi*0.8,this.height*multi*0.7,'center',0.5,0.5);
	this.addChild(this.label); 
};
BUBBLE.CameraController = function() {

	Phaser.Image.call(this,game);

	this.followShooter = false;
	this.followObj = false;
	this.shooter;


	this.onFlyOverFinished = new Phaser.Signal();

	this.followObject = {
		y: game.height*0.5,
		update: function() {this.y += 5}
	};

	game.add.existing(this);

};

BUBBLE.CameraController.prototype = Object.create(Phaser.Image.prototype); 

BUBBLE.CameraController.prototype.follow = function(obj) {
	
	if (BUBBLE.horizontal) {
		game.camera.y = obj.y-game.height;
	}else {
		game.camera.y = obj.y+BUBBLE.bottomStripeHeight-game.height;
	}

};

BUBBLE.CameraController.prototype.startFlyOver = function() {

	this.flyOverProgress = 0;
	this.followObject.y = game.world.bounds.y + BUBBLE.l(960);
	this.followObj = true;
	this.followShooter = false;
}



BUBBLE.CameraController.prototype.update = function() {
	if (!this.shooter) return;

	if (this.followShooter) {
		this.follow(this.shooter);
	}else if (this.followObj) {
		this.follow(this.followObject);
		this.followObject.update();
		if (this.followObject.y > this.shooter.y) {
			this.onFlyOverFinished.dispatch();
			this.followShooter = true;
			this.followObj = false;
		}
	}else {
		game.camera.y = game.world.bounds.y;
	}
	
};
BUBBLE.CameraShaker = function() {
	Phaser.Image.call(this,game);

	this.shakeTime = 0;

	BUBBLE.events.shakeCamera.add(function(time) {
		this.shakeTime = time || 40;
	},this);

	game.add.existing(this);

};

BUBBLE.CameraShaker.prototype = Object.create(Phaser.Image.prototype);

BUBBLE.CameraShaker.prototype.update = function() {

	if (this.shakeTime > 0) {
		this.shakeTime--;
		game.camera.x += Math.random()*this.shakeTime-(this.shakeTime*0.5); 
		game.camera.y += Math.random()*this.shakeTime-(this.shakeTime*0.5);
	}
};
BUBBLE.DoublePointsRopes = function() {
	Phaser.Group.call(this,game);

	this.fixedToCamera = true;

	this.alpha = 0;
	this.frameIndex = 0;
	this.frameAmount = 5;
	this.animTimer = 2;
	this.animTimerAmount = this.animTimer;

	this.ropeLeft = BUBBLE.makeImageL(0,0,'el1',[0.5,0],this);
	this.ropeRight = BUBBLE.makeImageL(640,0,'el1',[0.5,0],this);

	this.onResize();

	BUBBLE.events.onDoublePointsActivate.add(this.activate,this);
	BUBBLE.events.onDoublePointsActivate.add(function() {
		BUBBLE.events.useOfbomb.dispatch(true);
	});

	BUBBLE.events.onMissShoot.add(this.deactivate,this);
	BUBBLE.events.onScreenResize.add(this.onResize,this);

	BUBBLE.events.onMoveDone.add(function() {
		if (this.alpha == 1) {
			this.deactivate();
		}
	},this);
};


BUBBLE.DoublePointsRopes.prototype = Object.create(Phaser.Group.prototype);


BUBBLE.DoublePointsRopes.prototype.activate = function() {

	if (this.tAlpha) this.tAlpha.stop();

	this.alpha = 1;

};

BUBBLE.DoublePointsRopes.prototype.deactivate = function() {

	if (this.alpha != 1) return;

	this.tAlpha = game.add.tween(this).to({alpha:0},800,Phaser.Easing.Sinusoidal.Out,true);

};

BUBBLE.DoublePointsRopes.prototype.update = function() {
	if (this.alpha  > 0 && this.animTimer-- == 0) {
		
		this.animTimer = this.animTimerAmount;
		this.frameIndex = (this.frameIndex+1) % this.frameAmount;
		this.ropeLeft.loadTexture('ssheet','el'+this.frameIndex);
		this.ropeRight.loadTexture('ssheet','el'+this.frameIndex);
	}
};

BUBBLE.DoublePointsRopes.prototype.onResize = function() {

	this.cameraOffset.x = -game.world.bounds.x;

};
BUBBLE.EndlessAlarmGlow = function() {

	Phaser.Image.call(this,game,0,960,'ssheet','alarm_glow');
	this.anchor.setTo(0,1);

	this.lowestCell = 2;
	this.sinAddingTarget = 0;
	this.sinAdding = 0;
	this.alphaMultiplier = 0;
	this.alphaMultiplierTarget = 0;
	this.sin = 0;

	this.alpha = 0;

	this.endGame = false;


};

BUBBLE.EndlessAlarmGlow.prototype = Object.create(Phaser.Image.prototype);

BUBBLE.EndlessAlarmGlow.prototype.update = function() {

	if(this.endGame) {
		this.alpha = Math.max(0,this.alpha-0.01);
		return;
	}

		this.sinAdding = BUBBLE.utils.lerp(this.sinAdding,this.sinAddingTarget,0.1);
		this.alphaMultiplier = BUBBLE.utils.lerp(this.alphaMultiplier,this.alphaMultiplierTarget,0.1);

		this.sin += this.sinAdding*0.15;
		this.alpha = (Math.sin(this.sin)+1)/2 * (this.alphaMultiplier*0.9);

};

BUBBLE.EndlessAlarmGlow.prototype.moveDone = function() {
	this.lowestCell = this.grid.getLowestBubble();
		if (this.lowestCell > 10) this.endGame = true;

		this.alarmLevel = this.lowestCell > 5 ? Math.min(1,(this.lowestCell-5)/5) : 0;
		
		this.alphaMultiplierTarget = this.alarmLevel;
		this.sinAddingTarget = this.alarmLevel;

};



BUBBLE.EndlessController = function(grid) {

	this.refillData = game.cache.getJSON('refillData');

	this.grid = grid;

	this.movesToRefill = 5;
	this.refillNr = 0;

	this.lookUp = BUBBLE.utils.shuffle(['0','1','2','3','4']);
	this.easyIndex = 0;

	BUBBLE.events.onMoveDone.add(this.moveDone, this);

};

BUBBLE.EndlessController.prototype.moveDone = function(possibleColors) {
		
		if (this.grid.getLowestBubble() > 10) return;
		if (possibleColors.length <= 1 || (this.grid.length+this.grid.nonCacheGroup.length) < 8 || this.movesToRefill-- == 0) {
			this.movesToRefill = 5;
			this.refill(this.refillNr++);
		}

};

BUBBLE.EndlessController.prototype.refill = function(nr) {

	if (++this.easyIndex % 4 == 0) {
		var nr = 0;
	}

	var data = this.getRefillData(nr);

	

	var result = [
	[],
	[]
	]

	for (var i = 0; i < 11; i++) {
		result[0].push(this.getRandomElementFromData(data));
		if (i < 10) {
			result[1].push(this.getRandomElementFromData(data));
		}
	}

	for (var e = 0; e < data.empty; e++) {
		var rndIndex = Math.floor(Math.random()*21);
		var row = Math.floor(rndIndex/11);
		var collumn = rndIndex%11;
		result[row][collumn] = false;
	}

	BUBBLE.utils.shuffle(result[0]);
	BUBBLE.utils.shuffle(result[1]);

	this.grid.endlessAddRows(result);

	BUBBLE.events.onLevelUp.dispatch();
	BUBBLE.events.flash.dispatch(1);

};

BUBBLE.EndlessController.prototype.getRefillData = function(nr) {

	var index = 0;

	this.refillData.forEach(function(data,i) {
		if (data[0] <= nr) {
			index = i;
		}
	});

	var data = JSON.parse(JSON.stringify(this.refillData[index][1]));

	data.pattern = this.preparePattern(data.pattern);

	return data;

};

BUBBLE.EndlessController.prototype.preparePattern = function(pattern) {

	
	var explo = ['explosive_normal','explosive_horizontal'];
	pattern.forEach(function(el,index) {
		if (el[0] == 'g') {

			el[0] = this.lookUp[index%this.lookUp.length];

		}
		if (el[0] == 'explosive') {

			el[0] = explo[Math.floor(Math.random()*explo.length)];

		}
	},this);

	return pattern;

};

BUBBLE.EndlessController.prototype.getRandomElementFromData = function(data) {

	if (data.pattern.length == '0') return 'r';

	var pattern = data.pattern;
	var index = Math.floor(Math.random()*pattern.length);


	if (data.pattern[index][2] && Math.random()<data.pattern[index][2]) {
		index = (index+1) % pattern.length;
	}

	var element = pattern[index][0];
	if (--pattern[index][1] == 0 && pattern.length>1) {
		pattern.splice(index,1);
	}

	return element;

};
/*
BUBBLE.EndlessController.prototype.refillData = [
	[0,{empty: 7, pattern: [['g',10],['g',10],['explosive',1,0.5]] }],
	[5,{empty: 7, pattern: [['g',10],['g',10],['g',10],['explosive',1,0.5]] }],
	[10,{empty: 6, pattern: [['g',10],['g',10],['g',10],['g',10],['explosive',1,0.5]] }],
	[15,{empty: 8, pattern: [['r',20],['explosive',1,0.5]] }],

	[20,{empty: 7, pattern: [['r',15],['Cr',10],['explosive',1,0.5]] }],
	[25,{empty: 5, pattern: [['r',15],['Cr',5],['explosive',1,0.5]] }],

	[30,{empty: 5, pattern: [['r',15],['Cr',5],['bk',2]] }],

	[35,{empty: 5, pattern: [['r',15],['Cr',5],['bk',5]] }],

	[40,{empty: 5, pattern: [['r',13],['Cr',5],['bk',5],['cham',2]] }],

	[45,{empty: 5, pattern: [['r',13],['Cr',3],['bk',3],['cham',2],['blackhole',1]] }],

	[50,{empty: 5, pattern: [['r',13],['Cr',3],['bk',3],['cham',2],['blackhole',1],['monster',1]] }],

	[55,{empty: 5, pattern: [['r',13],['Cr',3],['bk',3],['cham',2],['monster',1],['blackhole',1],['infected',1]] }]

]*/
BUBBLE.Explosion = function(x,y,autostart,destroyAfter) {
	Phaser.Sprite.call(this,game,x,y,'explosionsheet','explosion_0');

	this.anchor.setTo(0.5);
	//this.scale.setTo(1);

	this.active = false;
	this.animIndex = 0;
	this.animTimer = 1;
	this.animTimerInterval = this.animTimer;

	if (autostart) {
		this.explode();
	}else {
		this.alpha = 0;
	}

	this.destroyAfter = destroyAfter;

	game.add.existing(this);

	

	e = this;

};

BUBBLE.Explosion.prototype = Object.create(Phaser.Sprite.prototype);


BUBBLE.Explosion.prototype.explode = function() {

	this.alpha = 1;
	this.angle = Math.random()*360;
	game.sfx.explosion_2.play();
	this.active = true;
	BUBBLE.events.shakeCamera.dispatch(40);

};

BUBBLE.Explosion.prototype.update = function() {

	if (!this.active) return;

	if (this.animTimer-- == 0) {
		this.animTimer = this.animTimerInterval;

		this.animIndex++;

		if (this.animIndex == 15) {
			if (this.destroyAfter) {
				this.destroy();
				return;
			}
			return
		}else {
			this.loadTexture('explosionsheet','explosion_'+this.animIndex);
		}


	}

};


BUBBLE.FadeLayer = function() {
	
	Phaser.Image.call(this, game,0,0,'ssheet','fade');
	this.fixedToCamera = true;

	BUBBLE.events.onScreenResize.add(this.onScreenResize,this);
	BUBBLE.events.onChangeLevel.add(this.setupChange,this);

	this.changeLevel = null;
	this.arg1 = null;
	this.arg2 = null;
	this.arg3 = null;

	this.onScreenResize();

	this.game.add.existing(this);

}

BUBBLE.FadeLayer.prototype = Object.create(Phaser.Image.prototype);
BUBBLE.FadeLayer.constructor = BUBBLE.FadeLayer;

BUBBLE.FadeLayer.prototype.update = function() {

	if (this.changeLevel === null) {
		this.alpha = Math.max(0,this.alpha-0.05);
	}else {
		this.alpha = Math.min(1,this.alpha+0.05);
		if (this.alpha == 1) {
			game.state.start(this.changeLevel,true,false,this.arg1,this.arg2,this.arg3);
		}
	}

};

BUBBLE.FadeLayer.prototype.onScreenResize = function() {
	//this.cacheAsBitmap = false;
	this.width = game.width;
	this.height = game.height;

	//this.cacheAsBitmap = true;	
};

BUBBLE.FadeLayer.prototype.setupChange = function(changeLevel, arg1, arg2, arg3) {

	if (this.changeLevel !== null) return;
	this.changeLevel = changeLevel;
	this.arg1 = arg1;
	this.arg2 = arg2;
	this.arg3 = arg3;
	game.sfx.transition.play();

};
BUBBLE.FadeLayerCross = function() {
	
	Phaser.Group.call(this,game);

	
	if (!BUBBLE.transitionBitmap) {
		BUBBLE.transitionBitmap =  this.bitmapData = game.add.bitmapData(game.width, game.height);
	}else {

		this.bitmapData = BUBBLE.transitionBitmap;
		this.transitionImg = this.bitmapData.addToWorld();
		this.transitionImg.fixedToCamera = true;
		this.transitionImg.anchor.setTo(0.5);
		this.transitionImg.cameraOffset.x = game.width*0.5;
		this.transitionImg.cameraOffset.y = game.height*0.5;
		this.transitionImg.width = game.width;
		this.transitionImg.height = game.height;

		game.sfx.transition.play();

		game.add.tween(this.transitionImg).to({alpha: 0},800,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.transitionImg.scale).to({x:2,y:2},800,Phaser.Easing.Sinusoidal.Out,true);

	}

	

	BUBBLE.events.onChangeLevel.add(this.setupChange,this);

	BUBBLE.events.onScreenResize.add(this.onScreenResize,this);

}


BUBBLE.FadeLayerCross.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.FadeLayerCross.constructor = BUBBLE.FadeLayer;

BUBBLE.FadeLayerCross.prototype.onScreenResize = function() {

	if (this.bitmapData.width != game.width || this.bitmapData.height != game.height) {
		this.bitmapData.resize(game.width,game.height);
		if (this.transitionImg && this.transitionImg.alpha !== 0) {
			this.transitionImg.alpha = 0;
		} 
	}
};

BUBBLE.FadeLayerCross.prototype.update = function() {
	return;

	if (this.transitionImg) {
		this.transitionImg.width = game.width;
		this.transitionImg.height = game.height;
	}
};

BUBBLE.FadeLayerCross.prototype.setupChange = function(changeLevel, arg1, arg2, arg3) {

	this.bitmapData.copyRect(game.canvas,new Phaser.Rectangle(0,0,game.width,game.height),0,0);
	game.state.start(changeLevel,true,false,arg1,arg2,arg3);
};


/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if(typeof navigator!=="undefined"&&/MSIE [1-9]\./.test(navigator.userAgent)){return}var t=e.document,n=function(){return e.URL||e.webkitURL||e},r=t.createElementNS("http://www.w3.org/1999/xhtml","a"),i="download"in r,o=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},a=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),f=e.webkitRequestFileSystem,u=e.requestFileSystem||f||e.mozRequestFileSystem,s=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},c="application/octet-stream",d=0,l=500,w=function(t){var r=function(){if(typeof t==="string"){n().revokeObjectURL(t)}else{t.remove()}};if(e.chrome){r()}else{setTimeout(r,l)}},p=function(e,t,n){t=[].concat(t);var r=t.length;while(r--){var i=e["on"+t[r]];if(typeof i==="function"){try{i.call(e,n||e)}catch(o){s(o)}}}},v=function(e){if(/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)){return new Blob(["\ufeff",e],{type:e.type})}return e},y=function(t,s,l){if(!l){t=v(t)}var y=this,m=t.type,S=false,h,R,O=function(){p(y,"writestart progress write writeend".split(" "))},g=function(){if(R&&a&&typeof FileReader!=="undefined"){var r=new FileReader;r.onloadend=function(){var e=r.result;R.location.href="data:attachment/file"+e.slice(e.search(/[,;]/));y.readyState=y.DONE;O()};r.readAsDataURL(t);y.readyState=y.INIT;return}if(S||!h){h=n().createObjectURL(t)}if(R){R.location.href=h}else{var i=e.open(h,"_blank");if(i==undefined&&a){e.location.href=h}}y.readyState=y.DONE;O();w(h)},b=function(e){return function(){if(y.readyState!==y.DONE){return e.apply(this,arguments)}}},E={create:true,exclusive:false},N;y.readyState=y.INIT;if(!s){s="download"}if(i){h=n().createObjectURL(t);r.href=h;r.download=s;setTimeout(function(){o(r);O();w(h);y.readyState=y.DONE});return}if(e.chrome&&m&&m!==c){N=t.slice||t.webkitSlice;t=N.call(t,0,t.size,c);S=true}if(f&&s!=="download"){s+=".download"}if(m===c||f){R=e}if(!u){g();return}d+=t.size;u(e.TEMPORARY,d,b(function(e){e.root.getDirectory("saved",E,b(function(e){var n=function(){e.getFile(s,E,b(function(e){e.createWriter(b(function(n){n.onwriteend=function(t){R.location.href=e.toURL();y.readyState=y.DONE;p(y,"writeend",t);w(e)};n.onerror=function(){var e=n.error;if(e.code!==e.ABORT_ERR){g()}};"writestart progress write abort".split(" ").forEach(function(e){n["on"+e]=y["on"+e]});n.write(t);y.abort=function(){n.abort();y.readyState=y.DONE};y.readyState=y.WRITING}),g)}),g)};e.getFile(s,{create:false},b(function(e){e.remove();n()}),b(function(e){if(e.code===e.NOT_FOUND_ERR){n()}else{g()}}))}),g)}),g)},m=y.prototype,S=function(e,t,n){return new y(e,t,n)};if(typeof navigator!=="undefined"&&navigator.msSaveOrOpenBlob){return function(e,t,n){if(!n){e=v(e)}return navigator.msSaveOrOpenBlob(e,t||"download")}}m.abort=function(){var e=this;e.readyState=e.DONE;p(e,"abort")};m.readyState=m.INIT=0;m.WRITING=1;m.DONE=2;m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null;return S}(typeof self!=="undefined"&&self||typeof window!=="undefined"&&window||this.content);if(typeof module!=="undefined"&&module.exports){module.exports.saveAs=saveAs}else if(typeof define!=="undefined"&&define!==null&&define.amd!=null){define([],function(){return saveAs})}
BUBBLE.GameGrid = function(lvl) {

	Phaser.Group.call(this, game);

	this.topGrid = game.add.imageL(0,3,'grid_top');
	this.topGrid.anchor.setTo(0,1);

	this.offsetX = 0;
	this.offsetY = 0;
	this.gridArray = new BUBBLE.GridArray();
	this.nonCacheGroup = game.add.group();
	this.nonCacheGroup.grid = this;
	this.matchGroup = game.add.group(); 
	this.popOutGroup = null;

	this.locksGroup = new BUBBLE.LocksGroup(this);

	this.bubbleFactory = new BUBBLE.BubbleFactory(this);
	
	this.cellW = BUBBLE.l(58);
	this.cellH = BUBBLE.l(51);
	this.holds = [];
	this.cachingCelling = true;
	this.lvl = lvl;

	this.parseLevel(lvl);

	this.maxY = BUBBLE.l(400);
	this.targetY = this.getTargetY();

	this.moveDelay = 0;
	this.oldHeight = this.height;

	this.caching = true;
	this.orderCacheAfterUpdate = false;
	this.recacheBitmap();

	//this.forEach(function(child) {if (child.cellY < 45) child.visible = false});

	BUBBLE.events.onBubblePutToGrid.add(function() {
		if (this.height == this.oldHeight) return;
		this.targetY = this.getTargetY();
		this.oldHeight = this.height;
	},this);

	BUBBLE.events.onBubbleDestroyed.add(function() {
		if (this.height == this.oldHeight) return;
		this.targetY = this.getTargetY();
		this.oldHeight = this.height;
		this.moveDelay = 30;
	},this);

	BUBBLE.events.onShieldDefeated.add(function(shield) {

            var bubbleArray = shield.sides;
            this.destroyBubbles(bubbleArray);
            this.checkAndProcessHold();
            this.activeTheLowestShield();

            this.recacheBitmap();

    },this);



    BUBBLE.events.onBubbleStartBounce.add(function(bubble) {
    	if (!bubble.animated) {
    		this.nonCacheGroup.add(bubble);
    	}
    },this);

    BUBBLE.events.onBubbleFinishBounce.add(function(bubble) {
    	if (!bubble.animated) {
    		this.add(bubble);
    	}
    	this.orderCacheAfterUpdate = true;
    },this);

    BUBBLE.events.requestDestroy.add(function(bubble) {
    	this.destroyBubbles([bubble]);
    	this.checkAndProcessHold();
    },this);

}

BUBBLE.GameGrid.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.GameGrid.constructor = BUBBLE.GameGrid;









BUBBLE.GameGrid.prototype.getTargetY = function() {
	return Math.min(0,this.maxY - this.height);
}

BUBBLE.GameGrid.prototype.update = function() {

	this.nonCacheGroup.y = this.y;
	this.matchGroup.y = this.y;
	this.locksGroup.y = this.y;

}

BUBBLE.GameGrid.prototype.postUpdate = function() {

	if (this.fixedToCamera)
  {
      this.x = this.game.camera.view.x + this.cameraOffset.x;
      this.y = this.game.camera.view.y + this.cameraOffset.y;
  }

  var i = this.children.length;

  while (i--)
  {
      this.children[i].postUpdate();
  }

  if (this.orderCacheAfterUpdate) {
		this.recacheBitmap();
	}

};

BUBBLE.GameGrid.prototype.updateChildren = function() {
	var len = this.length;
	for (var i = 0; i < len; i++) {
		this.children[i].update();
	}
}

BUBBLE.GameGrid.prototype.makeBubble = function(x,y,type) {
	this.orderCacheAfterUpdate = true;
	return this.bubbleFactory.makeBubble(x,y,type);
}

BUBBLE.GameGrid.prototype.makeBubbleFromFlyingBubble = function(flyingBubble) {

	if (this.getBubble(flyingBubble.cellX,flyingBubble.cellY)) {
		
	}


	this.prepareBubbleToBePut(flyingBubble);

	var newBubble = this.makeBubble(flyingBubble.cellX,flyingBubble.cellY,flyingBubble.type);
	newBubble.x = flyingBubble.x;
	newBubble.y = flyingBubble.y;
	newBubble.velX = flyingBubble.velX;
	newBubble.velY = flyingBubble.velY;

	return newBubble;

};

BUBBLE.GameGrid.prototype.isSpaceFreePx = function(px,py) {
	var cell = this.outsidePxToCell(px,py);
	return this.isSpaceFree(cell[0],cell[1]);
}

BUBBLE.GameGrid.prototype.isSpaceFree = function(cx,cy) {
	return this.getBubble(cx,cy) ? false : true;
}

BUBBLE.GameGrid.prototype.outsidePxToCell = function(x,y) {
	return this.insidePxToCell(x-this.x,y-this.y);
}

BUBBLE.GameGrid.prototype.insidePxToCell = function(x,y) {

		var clean;

		y += BUBBLE.l(6);

		if (y < 0) {
			clean = y % this.cellH > BUBBLE.l(-34);
		}else {
			clean = y % this.cellH > BUBBLE.l(17);
		}

		var xx,yy,modX,modY;

		yy = Math.floor(y/this.cellH);

		if (!clean) {
			
			modX = yy % 2 == 0 ? x % this.cellW : (x-(this.cellW*0.5)) % this.cellW;
			modX = modX < 0 ? this.cellW+modX : modX;
			modY = y > 0 ? y % this.cellH : this.cellH-Math.abs(y % this.cellH);

			if (modX+modY < BUBBLE.l(23) || modX+modY > BUBBLE.l(52)) {
				yy--;
			}

			if (yy % 2 == 0) {
				xx = Math.floor(x/this.cellW);
			}else {
				xx = Math.floor((x-(this.cellW*0.5))/this.cellW)
			}
				
		}else {
			if (yy % 2 == 0) {
				xx = Math.floor(x/this.cellW);
			}else {
				xx = Math.floor((x-(this.cellW*0.5))/this.cellW)
			}
		}

		return [xx,yy];

		
}


BUBBLE.GameGrid.prototype.cellToInsidePx = function(x,y) {

	if (y % 2 == 0) {
		return [Math.floor(x*this.cellW+(this.cellW*0.5)-this.offsetX), Math.floor(y*this.cellH+(this.cellW*0.5)-this.offsetY)];
	}else {
		return [Math.floor(x*this.cellW+this.cellW-this.offsetX), Math.floor(y*this.cellH+(this.cellW*0.5)-this.offsetY)];
	}

}

BUBBLE.GameGrid.prototype.cellToOutsidePx = function(x,y) {


	var pos = this.cellToInsidePx(x,y);
	pos[1] += this.y;

	return pos;

}



BUBBLE.GameGrid.prototype.putBubble = function(flyingBubble) {
	
	var newBubble = this.makeBubbleFromFlyingBubble(flyingBubble);
	var xx = newBubble.cellX;
	var yy = newBubble.cellY;

	newBubble.onPut();
	BUBBLE.events.onBubblePutToGrid.dispatch(newBubble);
	
	//-----------PRECISE HITS
	if (this.getBubble(xx,yy)) {
		this.getPreciseHits(newBubble).forEach(function(bubble) {
			bubble.onPreciseHit(newBubble);
		});
	}

	//-----------NORMAL HITS
	if (this.getBubble(xx,yy)) {
		this.hitNeighboursOf(newBubble);
	};

	//MATHCHING
	if (this.getBubble(xx,yy)) {
		var matching = this.getMatching(xx,yy,newBubble.type);

		if (matching.length > 2 || newBubble.type == 'multicolor') {
			game.sfx.l_pop.play();
			this.processMatching(matching);
		}
		else {
			game.sfx['hit_'+game.rnd.between(1,3)].play();
			this.bounceBubbles(newBubble);
		}
	}

	
	this.checkAndProcessHold();

	this.orderCacheAfterUpdate = true;

}


BUBBLE.GameGrid.prototype.prepareBubbleToBePut = function(bubble) {
	bubble.y -= this.y;	
}


BUBBLE.GameGrid.prototype.outsidePxToInsidePx = function(x,y) {
	return [x,y-this.y];
} 


BUBBLE.GameGrid.prototype.checkCollisionAgainst = function(bubble,against) {

	var circle = this.prepareBubbleCollCircleToCollCheck(bubble);

	against.push(this.getBubble(bubble.cellX,bubble.cellY));

	var coll = [];

	if (this.cachingCelling && bubble.cellY == 0) return [bubble.cellX,bubble.cellY];

	for (var i = 0; i < against.length; i++) {
		if (against[i] && Phaser.Circle.intersects(circle,against[i].collCircle)) {
			return [against[i].cellX,against[i].cellY];
		}
	}

	return coll;
};

BUBBLE.GameGrid.prototype.prepareBubbleCollCircleToCollCheck = function(bubble) {
 	var circle = bubble.collCircle
	circle.x = bubble.x;
	circle.y = bubble.y - this.y;
    return circle;
};

BUBBLE.GameGrid.prototype.getPreciseHits = function(bubble) {
	

	var oldDiameter = bubble.collCircle.diameter;
	var oldX = bubble.collCircle.x;
	var oldY = bubble.collCircle.y;

	var neighbours = this.getNeighbours(bubble.cellX,bubble.cellY);
	neighbours.push(this.getBubble(bubble.cellX,bubble.cellY));
	var circle = this.prepareBubbleCollCircleToCollCheck(bubble);
	bubble.collCircle.x = bubble.x;
	bubble.collCircle.y = bubble.y;
	bubble.collCircle.diameter = BUBBLE.l(50);

	var result = [];

	for (var i = 0; i < neighbours.length; i++) {
		if (neighbours[i] && Phaser.Circle.intersects(circle,neighbours[i].collCircle)) {
			result.push(neighbours[i]);
		}
	}

	bubble.collCircle.x = oldX;
	bubble.collCircle.y = oldY;
	bubble.collCircle.diameter = oldDiameter;

	return result;
};

BUBBLE.GameGrid.prototype.isBelowLock = function(bubble) {
	return this.locksGroup.isBelowLock(bubble);
};

BUBBLE.GameGrid.prototype.isInChain = function(bubble) {
	return this.locksGroup.isInChain(bubble)
};

BUBBLE.GameGrid.prototype.isInChainOrKeyhole = function(bubble) {
	return this.locksGroup.isInChainOrKeyhole(bubble)
};


BUBBLE.GameGrid.prototype.hitNeighboursOf = function(bubble) {

	this.getNeighbours(bubble.cellX,bubble.cellY).forEach(function(child) {
		child.onHit(bubble);
	});

}


BUBBLE.GameGrid.prototype.getBubble = function(cellX,cellY) {
	return this.gridArray.get(cellX,cellY); 
}

BUBBLE.GameGrid.prototype.neighboursCoordinations = [
	[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,0]],
	[[0,-1],[-1,0],[0,1],[1,-1],[1,1],[1,0]]
]

BUBBLE.GameGrid.prototype.outerRingCoordinations = [
	//[[0,-2],[1,-2],[1,-1],[2,0],[1,1],[1,2],[0,2],[-1,2],[-2,1],[-2,0],[-2,-1],[-1,-2]],
	[[0,-2],[-1,-2],[1,-1],[2,0],[1,1],[1,-2],[1,2],[0,2],[-1,2],[-2,1],[-2,0],[-2,-1]],

	//[[0,-2],[1,-2],[2,-1],[2,0],[2,1],[1,2],[0,2],[-1,2],[-1,1],[-2,0],[-1,1],[-1,-2]]
	[[-1,-2],[0,-2],[1,-2],[2,-1],[2,0],[2,1],[1,2],[0,2],[-1,2],[-1,1],[-2,0],[-1,-1]]
]

BUBBLE.GameGrid.prototype.getNeighbours = function(cellX,cellY) {

	var result = [];

	this.neighboursCoordinations[Math.abs(cellY%2)].forEach(function(coords) {

		var bubble = this.getBubble(cellX+coords[0],cellY+coords[1]);
		if (bubble) {
			result.push(bubble);
		}
	},this);

	return result;

}

BUBBLE.GameGrid.prototype.getOuterRing = function(cellX,cellY) {

	var result = [];

	this.outerRingCoordinations[Math.abs(cellY%2)].forEach(function(coords) {
		var bubble = this.getBubble(cellX+coords[0],cellY+coords[1]);
		if (bubble) {
			result.push(bubble);
		}
	},this);
	return result;

}


BUBBLE.GameGrid.prototype.getFreeSpacesAround = function(cellX,cellY) {

	var result = [];

	this.neighboursCoordinations[Math.abs(cellY%2)].forEach(function(coords) {

		if (!this.getBubble(cellX+coords[0],cellY+coords[1])) {

			var xx = cellX+coords[0];
			var yy = cellY+coords[1];

			if (!this.ghostMode && yy < 0) {
				return;
			}

			if (yy % 2 == 0) {
				if (xx >= 0 && xx < 11) {
					result.push([xx,yy]);
				}
			}else {
				if (xx >= 0 && xx < 10) {
					result.push([xx,yy]);
				}
			}

		}

	},this);

	return result;

}



BUBBLE.GameGrid.prototype.getMatching = function(cellX,cellY,type) {

	if (type == "multicolor") {return this.getMatchingMulticolor(cellX,cellY)};


	this.clearCheck();

	var toCheck = [[cellX,cellY]];
	var toCheckIndex = 0;

	if (!this.getBubble(cellX,cellY)) return false;

	var found = [this.getBubble(cellX,cellY)]; 
	this.getBubble(cellX,cellY).checked = true;

	while (toCheckIndex < toCheck.length) {

		var bubble = this.getBubble(toCheck[toCheckIndex][0],toCheck[toCheckIndex][1]);
		toCheckIndex++;
		var neighbours = this.getNeighbours(bubble.cellX,bubble.cellY);
		for (var i = 0; i < neighbours.length; i++) {
			if (neighbours[i] && neighbours[i].checkType(type) && !this.isInChain(neighbours[i])) {
				found.push(neighbours[i]);
				toCheck.push([neighbours[i].cellX,neighbours[i].cellY]);
			}
		}

	}

	return found;
}

BUBBLE.GameGrid.prototype.getMatchingMulticolor = function(cellX,cellY) {

	var result = [];
	var neighbours = this.getNeighbours(cellX,cellY);
	var colorsOfNeighbours = [];

	neighbours.forEach(function(bubble) {
		if (bubble.type.length == 1 && colorsOfNeighbours.indexOf(bubble.type) == -1) {
			colorsOfNeighbours.push(bubble.type);
		}
	});

	colorsOfNeighbours.forEach(function(color,index) {
		var match = this.getMatching(cellX,cellY,color);
		
		match.splice(0,1);
		result = Array.prototype.concat(result,match);
	},this);

	result.push(this.getBubble(cellX,cellY));

	return result;

}


BUBBLE.GameGrid.prototype.clearCheck = function() {

	this.forEach(function(child) {
		child.clearCheck();
	});
	this.nonCacheGroup.forEach(function(child) {
		child.clearCheck();
	});

}

BUBBLE.GameGrid.prototype.processMatching = function(match) {

	BUBBLE.events.onBubblesMatch.dispatch(match);
	match.forEach(function(bubble) {
		bubble.onMatch();
	})

	this.hitMatchNeighbours(match);

}


BUBBLE.GameGrid.prototype.hitMatchNeighbours = function(match) {

	var matchNeighbours = []


	match.forEach(function(bubble) {

		var matchNeighboursArray = matchNeighbours;
		var matchArray = match;

		this.getNeighbours(bubble.cellX,bubble.cellY).forEach(function(neighbour) {

			if (matchArray.indexOf(neighbour) == -1 && matchNeighboursArray.indexOf(neighbour) == -1) {
				matchNeighboursArray.push(neighbour);
			}

		});

	},this);

	matchNeighbours.forEach(function(bubble) {
		bubble.onMatchHit();
	})

}


BUBBLE.GameGrid.prototype.destroyBubbles = function(array) {

	array.forEach(function(child) {
		this.gridArray.set(child.cellX,child.cellY,null);
		child.destroy();
		BUBBLE.events.onBubbleDestroyed.dispatch(child);
	},this);

	this.orderCacheAfterUpdate = true;

}

BUBBLE.GameGrid.prototype.outOfGrid = function(arg) {

	array.forEach(function(child) {
		this.gridArray.set(child.cellX,child.cellY,null);
		BUBBLE.events.onBubbleDestroyed.dispatch(child);
	},this);

	this.orderCacheAfterUpdate = true;

}

BUBBLE.GameGrid.prototype.popOutBubbles = function(list) {
	if (list.length == 0) return;

	game.sfx.pop.play();
	BUBBLE.events.onBubblesPopOut.dispatch(list);
	list.forEach(function(bubble) {
		bubble.onPopOut();
	});
};

BUBBLE.GameGrid.prototype.checkAndProcessHold = function() {

	this.checkHold();
	var notChecked = this.getAllNotChecked();
	this.popOutBubbles(notChecked)
	
};


BUBBLE.GameGrid.prototype.checkHold = function() {

	this.clearCheck();

	this.holds.forEach(function(child) {
		this.holdCheckFrom(child[0],child[1]);
	},this);

}

BUBBLE.GameGrid.prototype.holdCheckFrom = function(cellX,cellY) {

	if (!this.getBubble(cellX,cellY)) return;
	if (this.getBubble(cellX,cellY).checked) return;

	var toCheck = [[cellX,cellY]];
	var toCheckIndex = 0;
	this.getBubble(cellX,cellY).checked = true;
	
	while (toCheckIndex < toCheck.length) {

		var bubble = this.getBubble(toCheck[toCheckIndex][0],toCheck[toCheckIndex][1]);
		toCheckIndex++;

		var neighbours = this.getNeighbours(bubble.cellX,bubble.cellY);

		for (var i = 0; i < 6; i++) {
			if (neighbours[i] && !neighbours[i].checked) {
				neighbours[i].checked = true;
				toCheck.push([neighbours[i].cellX,neighbours[i].cellY]);
			}
		}

	}

}

BUBBLE.GameGrid.prototype.getAllNotChecked = function() {
	var notChecked = [];
	this.forEach(function(child) {
		if (!child.checked) notChecked.push(child);
	});
	this.nonCacheGroup.forEach(function(child) {
		if (!child.checked) notChecked.push(child);
	});
	return notChecked;
}



BUBBLE.GameGrid.prototype.bounceBubbles = function(bubble) {

	var neighbours = this.getNeighbours(bubble.cellX,bubble.cellY);
	
	var distance = game.math.distance(0,0,bubble.velX,bubble.velY)*0.25;

	bubble.startBounce(bubble.velX*0.5,bubble.velY*0.5);

	neighbours.forEach(function(child) {
		
		var angle = game.math.angleBetween(bubble.x,bubble.y,child.x,child.y);
		var distanceOffset = child.collCircle.diameter-game.math.distance(bubble.x,bubble.y,child.x,child.y);
		var distanceMultiplier = distanceOffset < 0 ? 0.5 : 1;
		var velX = BUBBLE.utils.lengthdir_x(angle,distance*distanceMultiplier,true); 
		var velY = BUBBLE.utils.lengthdir_y(angle,distance*distanceMultiplier,true); 
		child.startBounce(velX,velY);

	});

}


BUBBLE.GameGrid.prototype.parseLevel = function(lvl) {

	var elements = lvl.level;
	var offsetX = 0;
	var offsetY = 0;

	if (lvl.mode == "Ghost") {

		elements.forEach(function(element) {	
			if (element[2] === 'GHOST') {
				offsetX = element[0]*-1;
				offsetY = element[1]*-1;
			}
		});

		this.cachingCelling = false;
		this.x = (offsetX * this.cellW*-1)+this.offsetX;
		this.y = (offsetY * this.cellH*-1)+this.offsetY;
		this.holds.push([0,0]);
	}

	if (lvl.mode === 'ENDLESS') {
		this.topGrid.destroy();
	}

	elements.forEach(function(element) {

		if (element[2].slice(0,6) == "SHIELD") {
			this.holds.push([element[0],element[1]]);
			this.cachingCelling = false;
		}
			
		this.makeBubble(element[0]+offsetX,element[1]+offsetY,element[2]);			


	},this);

	if (lvl.mode == "Classic" || lvl.mode == 'Animals') {

		this.holds = [[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0]];

	}else if (lvl.mode == 'Boss') {

		this.activeTheLowestShield();

	}

	this.locksGroup.locks.forEach(function(cellY) {
		var len = cellY % 2 == 0 ? 11 : 10;
		for (var i = 0; i < len; i++) {
			if (this.getBubble(i,cellY)) continue;
			this.makeBubble(i,cellY,'chain');
		}
	},this);

}

BUBBLE.GameGrid.prototype.getAllColorsOnBoard = function() {
	var result = [];

	this.forEach(function(child) {
	
		if (child.type == 0 || child.type == 1 || child.type == 2 || child.type == 3 || child.type == 4 || child.type == 5) {
			if (child.special == 'cham') return;
			if (result.indexOf(child.type) == -1) {
				result.push(child.type);
			}
		} else if (child.type.slice(0,7) == "SHIELD_") {
			if (result.indexOf(child.color) == -1) {
				result.push(child.color);
			}
		}
	});

	this.nonCacheGroup.forEach(function(child) {

		if (child.type == 0 || child.type == 1 || child.type == 2 || child.type == 3 || child.type == 4 || child.type == 5) {
			if (child.special == 'cham') return;
			if (result.indexOf(child.type) == -1) {
				result.push(child.type);
			}
		} else if (child.type.slice(0,7) == "SHIELD_") {
			if (result.indexOf(child.color) == -1) {
				result.push(child.color);
			}
		}
	});
	
	return result;
};

BUBBLE.GameGrid.prototype.activeTheLowestShield = function() {

	var lowestShield = null;

	this.nonCacheGroup.forEach(function(bubble) {

		if (bubble.type.slice(0,7) == "SHIELD_") {

			if (lowestShield === null) {
				lowestShield = bubble;
			}else {
				lowestShield = bubble.cellY > lowestShield.cellY ? bubble : lowestShield;
			}

		}

	});

	this.forEach(function(bubble) {

		if (bubble.type.slice(0,7) == "SHIELD_") {

			if (lowestShield === null) {
				lowestShield = bubble;
			}else {
				lowestShield = bubble.cellY > lowestShield.cellY ? bubble : lowestShield;
			}

		}

	});

	

	if (lowestShield) {
		lowestShield.activateShield();
	}

};

BUBBLE.GameGrid.prototype.recacheBitmap = function() {
	if (!this.caching) return;
	this.orderCacheAfterUpdate = false;
	this.updateCache();
}

BUBBLE.GameGrid.prototype.vanishBubble = function(bubble) {
	this.gridArray.set(bubble.cellX,bubble.cellY,null);
	bubble.kill();
	bubble.destroy();
};

BUBBLE.GameGrid.prototype.moveToPopOutGroup = function(bubble) {
	this.gridArray.set(bubble.cellX,bubble.cellY,null);
	bubble.rotation = this.rotation;
	this.popOutGroup.add(bubble);
	BUBBLE.events.onBubbleOutOfGrid.dispatch(bubble);
}

BUBBLE.GameGrid.prototype.moveToMatchGroup = function(bubble) {
	this.gridArray.set(bubble.cellX,bubble.cellY,null);
	bubble.rotation = this.rotation;
	this.matchGroup.add(bubble);
	BUBBLE.events.onBubbleOutOfGrid.dispatch(bubble);

}

BUBBLE.GameGrid.prototype.moveToNonCacheGroup = function(bubble) {
	this.nonCacheGroup.add(bubble);
	this.orderCacheAfterUpdate = true;
}

BUBBLE.GameGrid.prototype.moveToCacheGroup = function(bubble) {
	this.add(bubble);
	this.orderCacheAfterUpdate = true;
}

BUBBLE.GameGrid.prototype.getLowestBubble = function() {
	var lowest = 0;
	this.forEach(function(bubble) {
		if (bubble.cellY > lowest) {
			lowest = bubble.cellY;
		}
	});
	this.nonCacheGroup.forEach(function(bubble) {
		if (bubble.cellY > lowest) {
			lowest = bubble.cellY;
		}
	});

	return lowest;
}

BUBBLE.GameGrid.prototype.getBubblesInRange = function(min,max) {
	var result = [];

	this.forEach(function(bubble) {
		if (bubble.cellY >= min && bubble.cellY <= max) {
			result.push(bubble);
		}
	});

	this.nonCacheGroup.forEach(function(bubble) {
		if (bubble.cellY >= min && bubble.cellY <= max) {
			result.push(bubble);
		}
	});

	return result;
};


//ENDLESS

BUBBLE.GameGrid.prototype.endlessAddRows = function(data) {

	var amount = data.length;

	this.moveAllBubblesDown(amount);
	this.fillTopRows(data);
	this.checkAndProcessHold();
	this.orderCacheAfterUpdate = true;
	this.y = this.cellH*-amount;
	game.add.tween(this).to({y: 0},1000,Phaser.Easing.Sinusoidal.InOut,true)
	BUBBLE.events.onEndlessAddRows.dispatch(this.getAllColorsOnBoard());
};

BUBBLE.GameGrid.prototype.moveAllBubblesDown = function(amount) {

	this.gridArray.clear();

	this.children.concat(this.nonCacheGroup.children).forEach(function(bubble) {
		bubble.cellY += amount;
		bubble.y += this.cellH*amount;
		bubble.orgY = this.cellToInsidePx(bubble.cellX,bubble.cellY)[1];
		bubble.collCircle.y += this.cellH*amount;
		this.gridArray.set(bubble.cellX,bubble.cellY,bubble);
	},this);

	this.matchGroup.forEach(function(bubble) {
		bubble.cellY += amount;
		bubble.y += this.cellH*amount;
		bubble.orgY = this.cellToInsidePx(bubble.cellX,bubble.cellY)[1];
		bubble.collCircle.y += this.cellH*amount;
	},this);

};

BUBBLE.GameGrid.prototype.fillTopRows = function(data) {
		
	for (var x = 0; x < 11; x++) {
		if (data[0][x]) {
			this.makeBubble(x,0,data[0][x]);
		}
	}
	for (x = 0; x < 10; x++) {
		if (data[1][x]) {
			this.makeBubble(x,1,data[1][x]);
		}
	}

};

BUBBLE.GameGridGhost = function(lvl) {
	
	this.topGrid = game.add.imageL(0,3,'grid_top');
	this.topGrid.anchor.setTo(0,1);
	
	Phaser.Group.call(this, game);

	//this.angle = 180;
	this.offsetX = BUBBLE.l(29);
	this.offsetY = BUBBLE.l(26);
	this.gridArray = new BUBBLE.GridArray();
	this.nonCacheGroup = game.add.group();
	this.nonCacheGroup.grid = this;
	this.matchGroup = game.add.group();
	this.popOutGroup = null; 

	this.locksGroup = new BUBBLE.LocksGroup(this);

	this.bubbleFactory = new BUBBLE.BubbleFactory(this);
	
	this.cellW = BUBBLE.l(58);
	this.cellH = BUBBLE.l(51);
	this.holds = [];
	this.cachingCelling = false;
	this.lvl = lvl;


	this.angleSpd = 0;
	this.maxY = BUBBLE.l(650);
	this.ghostMode = true;
	
	this.bubblesCloseToEdge = [];
	this.closeToEdgeBorder = BUBBLE.l(50);

	this.parseLevel(lvl);


	this.caching = true;
	this.orderCacheAfterUpdate = false;
	this.recacheBitmap();
	
	/*
	BUBBLE.events.onBubbleDestroyed.add(function(bubble) {
		if (this.length == 1 && this.nonCacheGroup.length == 0) {
			
			BUBBLE.events.onGhostFree.dispatch(this.getBubble(0,0));
			this.destroyBubbles([this.getBubble(0,0)]);
		}
		var indexOf = this.bubblesCloseToEdge.indexOf(bubble);
		if (indexOf !== -1) {
			this.bubblesCloseToEdge.splice(indexOf,1);
		}
	},this);
	*/

	BUBBLE.events.onMoveDone.add(function(bubble) {
		if (this.length == 0 && this.nonCacheGroup.length == 1) {
			
			BUBBLE.events.onGhostFree.dispatch(this.getBubble(0,0));
			this.getBubble(0,0).popOutForSure = true;
			this.popOutBubbles([this.getBubble(0,0)]);
		}
	},this);


	BUBBLE.events.onBubbleStartBounce.add(function(bubble) {
    	if (!bubble.animated) {
    		this.nonCacheGroup.add(bubble);
    	}
    },this);



    BUBBLE.events.onBubbleFinishBounce.add(function(bubble) {
    	if (!bubble.animated) {
    		this.add(bubble);
    	}
    	this.orderCacheAfterUpdate = true;
    },this);


}

BUBBLE.GameGridGhost.prototype = Object.create(BUBBLE.GameGrid.prototype);
BUBBLE.GameGridGhost.constructor = BUBBLE.GameGridGhost;


BUBBLE.GameGridGhost.prototype.makeBubble = ( function() {
	var orgF = BUBBLE.GameGrid.prototype.makeBubble;

	return function(x,y,type) {
		var bubble = orgF.call(this,x,y,type);

		bubble.collCircle.x += this.x;
		bubble.collCircle.y += this.y;
		

		if (game.math.distance(0,0,bubble.x,bubble.y) > Math.min(this.x,BUBBLE.l(960)-this.x,this.y,this.maxY-this.y)-this.closeToEdgeBorder) {
			this.bubblesCloseToEdge.push(bubble);
		}

		return bubble;
	}

})();



BUBBLE.GameGridGhost.prototype.update = function() {
	this.angle += this.angleSpd;

	if (Math.abs(this.angleSpd) > 0.005) {
		this.angleSpd *= 0.99;
		this.checkBubblesCloseToEdge();
	}else {
		this.angleSpd = 0;
	}

	this.matchGroup.x = this.x;
	this.matchGroup.y = this.y;
	this.matchGroup.rotation = this.rotation;
	this.nonCacheGroup.x = this.x;
	this.nonCacheGroup.y = this.y;
	this.nonCacheGroup.rotation = this.rotation;
	
}

BUBBLE.GameGridGhost.prototype.checkBubblesCloseToEdge = function() {
	var outsidePos;

	for (var i = 0; i < this.bubblesCloseToEdge.length; i++) {
		outsidePos = this.insidePxToOutsidePx(this.bubblesCloseToEdge[i].x,this.bubblesCloseToEdge[i].y);
		if (outsidePos[0] < this.closeToEdgeBorder || outsidePos[0] > this.maxY-this.closeToEdgeBorder || outsidePos[1] < this.closeToEdgeBorder || outsidePos[1] > this.maxY-this.closeToEdgeBorder) {
			
			this.bubblesCloseToEdge[i].onPopOut();
			this.bubblesCloseToEdge.splice(i,1);
			this.checkAndProcessHold();
			this.orderCacheAfterUpdate = true;
			return;
		}
	}

}
/*
BUBBLE.GameGridGhost.prototype.checkCollisionAgainst = function(bubble,against) {

	var circle = this.prepareBubbleCollCircleToCollCheck(bubble);

	against.push(this.getBubble(bubble.cellX,bubble.cellY));

	var coll = [];

	for (var i = 0; i < against.length; i++) {
		if (against[i] && Phaser.Circle.intersects(circle,against[i].collCircle)) {
			return [against[i].cellX,against[i].cellY];
		}
	}

	return coll;
}
*/


BUBBLE.GameGridGhost.prototype.outsidePxToCell = function(x,y) {

    var pos = this.outsidePxToInsidePx(x,y);
	return this.insidePxToCell(pos[0],pos[1]);
}


BUBBLE.GameGridGhost.prototype.cellToOutsidePx = function(x,y) {
	var pos = this.cellToInsidePx(x,y);
	return this.insidePxToOutsidePx(pos[0],pos[1]);
}

BUBBLE.GameGridGhost.prototype.prepareBubbleToBePut = function(bubble) {
	bubble.x -=  this.x;
	bubble.y -= this.y;
	var s = Math.sin(-this.rotation);
	var c = Math.cos(-this.rotation);
	var tx = c * bubble.x - s * bubble.y;
	var ty = s * bubble.x + c * bubble.y;
	bubble.x = tx;
	bubble.y = ty;

	var velAngle = game.math.angleBetween(0,0,bubble.velX,bubble.velY);
	var velSpd = game.math.distance(0,0,bubble.velX,bubble.velY);
	bubble.velX = BUBBLE.utils.lengthdir_x(velAngle-this.rotation,velSpd,true);
	bubble.velY = BUBBLE.utils.lengthdir_y(velAngle-this.rotation,velSpd,true);


}


BUBBLE.GameGridGhost.prototype.prepareBubbleCollCircleToCollCheck = function(bubble) {



 	var circle = bubble.collCircle
	circle.x = bubble.x;
	circle.y = bubble.y;

	circle.x -=  this.x;
    circle.y -= this.y;

    
    var s = Math.sin(-this.rotation);
    var c = Math.cos(-this.rotation);
    var tx = c * circle.x - s * circle.y;
    var ty = s * circle.x + c * circle.y;
    circle.x = tx + this.x;
    circle.y = ty + this.y;
    
    return circle;
};


BUBBLE.GameGridGhost.prototype.getPreciseHits = function(bubble) {


	var oldDiameter = bubble.collCircle.diameter;
	var oldX = bubble.collCircle.x;
	var oldY = bubble.collCircle.y;

	var neighbours = this.getNeighbours(bubble.cellX,bubble.cellY);
	neighbours.push(this.getBubble(bubble.cellX,bubble.cellY));


	var circle = bubble.collCircle;
	bubble.collCircle.x += bubble.x-bubble.orgX;
	bubble.collCircle.y += bubble.y-bubble.orgY;
	bubble.collCircle.diameter = BUBBLE.l(50);

	var result = [];

	for (var i = 0; i < neighbours.length; i++) {
		if (neighbours[i] && Phaser.Circle.intersects(circle,neighbours[i].collCircle)) {
			result.push(neighbours[i]);
		}
	}

	bubble.collCircle.x = oldX;
	bubble.collCircle.y = oldY;
	bubble.collCircle.diameter = oldDiameter;

	return result;
};



BUBBLE.GameGrid.prototype.outsidePxToInsidePx = function(x,y) {
	x -=  this.x;
    y -= this.y;
    var s = Math.sin(-this.rotation);
    var c = Math.cos(-this.rotation);
    var tx = c * x - s * y;
    var ty = s * x + c * y;
    x = tx + this.x;
    y = ty + this.y;
    return [x-this.x+this.offsetX, y-this.y+this.offsetY]
} 


BUBBLE.GameGrid.prototype.popOutAll = function() {

	
	this.children.slice().forEach(function(child) {
		child.onPopOut();
	});
	this.nonCacheGroup.children.slice().forEach(function(child) {
		child.onPopOut();
	});
	this.orderCacheAfterUpdate = true;
	
}

BUBBLE.GameGridGhost.prototype.insidePxToOutsidePx = function(x,y) {

	var s = Math.sin(this.rotation);
    var c = Math.cos(this.rotation);
    var tx = c * x - s * y;
    var ty = s * x + c * y;
    x = tx;
    y = ty;

    x += this.x;
    y += this.y;

    return [x,y];
}

BUBBLE.GameGridGhost.prototype.bounceBubbles = (function () {

	var orgF = BUBBLE.GameGrid.prototype.bounceBubbles;

	return function(bubble) {

		var worldPos = bubble.getWorldPosition();
		var distance = game.math.distance(0,0,bubble.x,bubble.y);
		var angleCenterBubble = game.math.angleBetween(this.x,this.y,worldPos[0],worldPos[1]);
		var velV = Phaser.Point.rotate(new Phaser.Point(bubble.velX,bubble.velY),0,0,this.rotation);
		velV.rotate(0,0,-angleCenterBubble);

		var finalAngle = game.math.radToDeg(game.math.angleBetween(0,0,velV.x,velV.y));
		var rotComponent;
		if (finalAngle > 0) {
			rotComponent = (90-Math.abs(90-finalAngle))/90
		}else {
			rotComponent = (90-Math.abs(90-Math.abs(finalAngle)))/90*-1;
		}
		var distanceComponent = distance/BUBBLE.l(200);
		
		var powerOfSpin = (rotComponent*3)*distanceComponent;
		this.angleSpd = game.math.clamp(this.angleSpd+powerOfSpin, -3, 3);


		orgF.call(this,bubble);

	}

})();


BUBBLE.GameGridGhost.prototype.moveToPopOutGroup = function(bubble) {

	this.gridArray.set(bubble.cellX,bubble.cellY,null);
	bubble.rotation = this.rotation;
	var newPos = bubble.getWorldPosition();
	bubble.x = newPos[0];
	bubble.y = newPos[1];
	this.popOutGroup.add(bubble);
	BUBBLE.events.onBubbleOutOfGrid.dispatch(bubble);
}

BUBBLE.GameGridGhost.prototype.moveToMatchGroup = function(bubble) {
	this.gridArray.set(bubble.cellX,bubble.cellY,null);
	this.matchGroup.add(bubble);
	BUBBLE.events.onBubbleOutOfGrid.dispatch(bubble);

}
BUBBLE.GoalText = function(lvl) {
	Phaser.Group.call(this,game);

	var endless = game.state.getCurrentState().lvlNr == 'ENDLESS';

	this.state = game.state.getCurrentState();

	this.fixedToCamera = true;
	this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(320);
	this.cameraOffset.y = -500;
	BUBBLE.events.onScreenResize.add(function() {
		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(320);
	},this);

	this.progress = -0.25;


	this.bg = BUBBLE.makeImageL(0,0,'inropepopupsmall',0.5,this);

	this.goalTxt = new BUBBLE.OneLineText(0,-50,'font-outline',BUBBLE.txt('Beat the highscore!'),50,640,0.5,0.5);
	this.add(this.goalTxt);

	this.highscoreTxt = new BUBBLE.OneLineText(0,30,'font-outline',BUBBLE.txt('Highscore')+': '+BUBBLE.saveState.data.highscores[0],40,640,0.5,0.5);
	this.add(this.highscoreTxt);




	this.update = function() {
		if (this.requestStart && this.state.windowLayer.children == 0) {
			this._start();
			this.requestStart = false;
		}

		this.cameraOffset.y = game.height*this.progress;
	};


	this.start = function() {
		this.requestStart = true;
	};

	this._start = function() {

		game.add.tween(this).to({progress: 0.5},375,Phaser.Easing.Sinusoidal.InOut,true);

		game.time.events.add(1500,function() {

			game.add.tween(this).to({progress: 1.25},375,Phaser.Easing.Sinusoidal.InOut,true);
			if (this.state.handTut) {
				this.state.handTut.startPointsMoney(false);
			}			
		},this);

	};


};

BUBBLE.GoalText.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.GridArray = function(minX,maxX,minY,maxY) {

	this.minX = minX || false;
	this.maxX = maxX || false;
	this.minY = minY || false;
	this.maxY = maxY || false;
	this.limited = this.minX || this.maxX || this.minY || this.maxY; 
	
	this.mainArray = [];

	this.maxIndexX = false;
	this.minIndexX = false;
	this.maxIndexY = false;
	this.minIndexY = false;

}

BUBBLE.GridArray.prototype.clear = function() {
	this.mainArray = [];
};


BUBBLE.GridArray.prototype.set = function(x,y,value) {

	if (x.constructor === Array) {
		value = y;
		y = x[1];
		x = x[0];
	}

	if (this.limited && !this.inLinit(x,y)) {
		throw 'Out of limit!';
	}

	if (!this.mainArray[x]) {
		this.mainArray[x] = [];
	}
	
	this.mainArray[x][y] = value;

	this.setHelperValues(x,y);

	return value;

}

BUBBLE.GridArray.prototype.get = function(x,y) {

	if (x.constructor === Array) {
		y = x[1];
		x = x[0];
	}


	if (this.limited && !this.inLimit(x,y)) {
		throw 'Out of limit!';
	}

	if (this.mainArray[x]) {
		if (this.mainArray[x][y]) {
			return this.mainArray[x][y];
		}else {
			return null;
		}
	}else {
		return null;
	}

}


BUBBLE.GridArray.prototype.inLimit = function(x,y) {
	if (this.minX !== false && x < this.minX) return false;
	if (this.maxX !== false && x > this.maxX) return false;
	if (this.minY !== false && y < this.minY) return false;
	if (this.maxY !== false && y > this.maxY) return false;
	return true;
}

BUBBLE.GridArray.prototype.setHelperValues = function(x,y) {
	if (this.maxIndexX === false) {
		this.maxIndexX = x;
		this.minIndexX = x;
		this.lengthX = 1;
		this.maxIndexY = y;
		this.minIndexY = y;
		this.lengthY = 1;
	}else {

		this.minIndexX = x < this.minIndexX ? x : this.minIndexX;
		this.maxIndexX = x > this.maxIndexX ? x : this.maxIndexX;
		this.minIndexY = y < this.minIndexY ? y : this.minIndexY;
		this.maxIndexY = y > this.maxIndexY ? y : this.maxIndexY;

	}
		
};

GroupSpriteCacher = function(group,framesToCatch) {

	Phaser.Group.call(this,game);

	this.bitmapData = game.add.bitmapData(200,200);

	this.group = group;
	this.framesToCatch = framesToCatch;
	this.currentFrame = 0;

	if (this.group.start) this.group.start();
	this.catchFrame();

};

GroupSpriteCacher.prototype = Object.create(Phaser.Group.prototype);

GroupSpriteCacher.prototype.catchFrame = function() {

	if (this.currentFrame < this.framesToCatch) {

		

		this.bitmapData.clear();
		this.bitmapData.drawGroup(this.group);
		saveCanvas(this.bitmapData.canvas,this.currentFrame);
		this.currentFrame++;
		this.group.updateAnim();

		game.time.events.add(400,this.catchFrame,this);
	}

};


(function(a){"use strict";var b=a.HTMLCanvasElement&&a.HTMLCanvasElement.prototype,c=a.Blob&&function(){try{return Boolean(new Blob)}catch(a){return!1}}(),d=c&&a.Uint8Array&&function(){try{return(new Blob([new Uint8Array(100)])).size===100}catch(a){return!1}}(),e=a.BlobBuilder||a.WebKitBlobBuilder||a.MozBlobBuilder||a.MSBlobBuilder,f=(c||e)&&a.atob&&a.ArrayBuffer&&a.Uint8Array&&function(a){var b,f,g,h,i,j;a.split(",")[0].indexOf("base64")>=0?b=atob(a.split(",")[1]):b=decodeURIComponent(a.split(",")[1]),f=new ArrayBuffer(b.length),g=new Uint8Array(f);for(h=0;h<b.length;h+=1)g[h]=b.charCodeAt(h);return i=a.split(",")[0].split(":")[1].split(";")[0],c?new Blob([d?g:f],{type:i}):(j=new e,j.append(f),j.getBlob(i))};a.HTMLCanvasElement&&!b.toBlob&&(b.mozGetAsFile?b.toBlob=function(a,c,d){d&&b.toDataURL&&f?a(f(this.toDataURL(c,d))):a(this.mozGetAsFile("blob",c))}:b.toDataURL&&f&&(b.toBlob=function(a,b,c){a(f(this.toDataURL(b,c)))})),typeof define=="function"&&define.amd?define(function(){return f}):a.dataURLtoBlob=f})(this);

function saveCanvas(x_canvas,framenumber){


	

    x_canvas.toBlob(function(blob) {
        saveAs(
            blob
            , "underburst"+framenumber+".png"
        );
    }, "image/png");
}

BUBBLE.LevelButton = function(worldPosition,nr,editorMode) {
	
	BUBBLE.Button.call(this,worldPosition[0],worldPosition[1],'lvl_point');

	this.over = false;

	this.lvl = BUBBLE.levels[nr];
	
	this.onInputOver.add(function() {
		this.over = true;
	},this);
	
	this.onInputOut.add(function() {
		this.over = false;
	},this);
	
	this.addTerm(function() {return this.over},this);
	
	this.onClick.add(function() {
		//new BUBBLE.Window('level',nr);
		//this.windowLayer.pushWindow(['level',nr]);
		BUBBLE.events.pushWindow.dispatch(['level',nr]);
		//BUBBLE.events.onChangeLevel.dispatch("Game",this.nr);
	},this);

	this.nr = nr;
	this.stars = BUBBLE.saveState.getStars(this.nr);
	this.unlocked = BUBBLE.saveState.isUnlocked(this.nr);


	if (this.unlocked) {

		
		this.nrTxt = game.make.bitmapTextL(0,-20,'font-outline',(nr+1).toString(),30);
		this.nrTxt.anchor.setTo(0.5);
		this.addChild(this.nrTxt);

		if (this.stars == 0) {
			this.loadTexture('ssheet','lvl_point_current');
		}else {
			this.loadTexture('ssheet',this.stars == 3 ? 'lvl_point_green' : 'lvl_point');
			this.starImg = game.add.imageL(-2,5,'lvl_star_'+this.stars);
			this.starImg.anchor.setTo(0.5,0);
			this.addChild(this.starImg);
		}



	}else {

		this.inputEnabled = false;
		this.active = false;

	}

}

BUBBLE.LevelButton.prototype = Object.create(BUBBLE.Button.prototype);
BUBBLE.LevelButton.constructor = BUBBLE.LevelButton;

BUBBLE.LocksGroup = function(grid) {
	Phaser.Group.call(this, game);

	this.locks = [];
	this.chains = [];
	this.grid = grid;

	BUBBLE.events.newLock.add(this.addNewLock,this);
	BUBBLE.events.unlockLock.add(this.unlockLock,this);

};

BUBBLE.LocksGroup.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.LocksGroup.prototype.addNewLock = function(bubble) {

	

	this.locks.push(bubble.cellY);

	var chain = {
		cellY: bubble.cellY,
		chain: game.make.image(0,bubble.y,'bubblesheet','chain'),
		keyhole: game.make.image(bubble.x,bubble.y,'bubblesheet',bubble.frameName)
	}

	var hole = BUBBLE.makeImageL(0,0,'ball_lock',0.5);
	chain.keyhole.addChild(hole);

	chain.chain.anchor.setTo(0,0.5);
	chain.keyhole.anchor.setTo(0.5);
	this.add(chain.chain);
	this.add(chain.keyhole);

	this.chains.push(chain);

};

BUBBLE.LocksGroup.prototype.unlockLock = function(unlockY) {

	this.locks.splice(this.locks.indexOf(unlockY),1);

	this.chains.forEach(function(chain,index) {

		if (chain.cellY == unlockY) {
			game.add.tween(chain.chain).to({alpha: 0},800,Phaser.Easing.Sinusoidal.InOut,true);
			game.add.tween(chain.chain.scale).to({y: 1.5},800,Phaser.Easing.Sinusoidal.InOut,true);
			game.add.tween(chain.keyhole).to({alpha: 0},800,Phaser.Easing.Sinusoidal.InOut,true);
			game.add.tween(chain.keyhole.scale).to({x: 1.5,y:1.5},800,Phaser.Easing.Sinusoidal.InOut,true).onComplete.add(function() {
				chain.chain.destroy();
				chain.keyhole.destroy();
			});
			this.chains.splice(index,1);
		}

	},this);

};

BUBBLE.LocksGroup.prototype.isBelowLock = function(child) {
	if (this.locks.length == 0) {
		return true
	}else {
		return child.cellY > BUBBLE.utils.getMaxOfArray(this.locks);
	}
};

BUBBLE.LocksGroup.prototype.isInChain = function(bubble) {
	return this.locks.indexOf(bubble.cellY) != -1 && !bubble.keyhole;
};

BUBBLE.LocksGroup.prototype.isInChainOrKeyhole = function(bubble) {
	return this.locks.indexOf(bubble.cellY) != -1;
}
BUBBLE.MultiLineText = function(x,y,font,text,size,max_width,max_height,align,hAnchor,vAnchor) {  
  
  x = BUBBLE.l(x);
  y = BUBBLE.l(y);
  size = BUBBLE.l(size);
  max_width = BUBBLE.l(max_width);
  max_height = BUBBLE.l(max_height);

  Phaser.BitmapText.call(this, game, x, y, font,'',size);
  
  this.splitText(text,max_width);

  this.align = align || 'center';
  
  if (max_height) {
      while (this.height > max_height) {
        this.fontSize -= 2;
        this.splitText(text,max_width);
        this.updateText();
      }
  }

  this.hAnchor = typeof hAnchor == 'number' ? hAnchor : 0.5;
  this.vAnchor = typeof vAnchor == 'number' ? vAnchor : 0;

  this.cacheAsBitmap = true; 
  this._cachedSprite.anchor.setTo(this.hAnchor,this.vAnchor);

};

BUBBLE.MultiLineText.prototype = Object.create(Phaser.BitmapText.prototype);

BUBBLE.MultiLineText.prototype.splitText = function(text,max_width) {

  var txt = text;
  var txtArray = [];
  var prevIndexOfSpace = 0;
  var indexOfSpace = 0;
  var widthOverMax = false;

  while (txt.length > 0) {

    prevIndexOfSpace = indexOfSpace;
    indexOfSpace = txt.indexOf(' ',indexOfSpace+1);

    
    if (indexOfSpace == -1) this.setText(txt);
    else this.setText(txt.substring(0,indexOfSpace));
    this.updateText();

    if (this.width > max_width) {

      if (prevIndexOfSpace == 0 && indexOfSpace == -1) {
        txtArray.push(txt);
        txt = '';
        indexOfSpace = 0;
        continue;
      }

      if (prevIndexOfSpace == 0) {
        txtArray.push(txt.substring(0,indexOfSpace));
        txt = txt.substring(indexOfSpace+1);
        indexOfSpace = 0;
        continue;
      }

      txtArray.push(txt.substring(0,prevIndexOfSpace));
      txt = txt.substring(prevIndexOfSpace+1);
      indexOfSpace = 0;


    }else {
      //ostatnia linijka nie za dluga
      if (indexOfSpace == -1) {
        txtArray.push(txt);
        txt = '';
      } 

    }
  
  }


  this.setText(txtArray.join('\n'));


};
BUBBLE.NoMoreAds = function() {
	
	Phaser.Group.call(this,game);

	this.bg = BUBBLE.makeImageL(0,0,'bg_shop',0.5,this);

	this.noMoreTxt = new BUBBLE.MultiLineText(0,0,'font-outline',BUBBLE.txt("Thanks, no more videos for today. Please come back tomorrow"),50,500,400,'center',0.5,0.5);
	this.add(this.noMoreTxt);


	this.bg.width = this.noMoreTxt.width+BUBBLE.l(100);
	this.bg.height = this.noMoreTxt.height+BUBBLE.l(100);

	game.add.tween(this).from({alpha:0},300,Phaser.Easing.Sinusoidal.InOut,true).onComplete.add(function() {

		game.add.tween(this).to({alpha:0},300,Phaser.Easing.Sinusoidal.InOut,true,2000).onComplete.add(this.destroy,this);

	},this);

};

BUBBLE.NoMoreAds.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.NoMoreAds.prototype.update = function() {

	this.x = game.world.bounds.x+Math.floor(game.width*0.5);
	this.y = Math.floor(game.height*0.5);

};

BUBBLE.OneLineText = function(x,y,font,text,size,width,hAnchor,vAnchor) {  

  var x = BUBBLE.l(x);
  var y = BUBBLE.l(y);

   var size = BUBBLE.l(size);
   var width = BUBBLE.l(width);

  Phaser.BitmapText.call(this, game, x, y, font, text, size, width);

  if (width) {
      while (this.width > width) {
        this.fontSize -= 2;
        this.updateText();
      }
  }

  this.orgFontSize = size;

  this.maxUserWidth = width;

  

  this.hAnchor = hAnchor;
  this.vAnchor = vAnchor;

  this.anchor.setTo(this.hAnchor,this.vAnchor);
  this.updateText();

  this.insertCoin(this.fontSize);

  this.cacheAsBitmap = true;

  this.updateCache();
  //this._cachedSprite.anchor.setTo(typeof this.hAnchor == 'undefined' ? 0.5 : this.hAnchor,this.vAnchor || 0);

  //this.x -= Math.floor(this.width*0.5);


};

BUBBLE.OneLineText.prototype = Object.create(Phaser.BitmapText.prototype);

BUBBLE.OneLineText.prototype.insertCoin = function(size) {


  if (this.text.indexOf('$$') == -1) return;


  this.children.forEach(function(element,index,array) {

    if (!element.name) return;

    if (element.name == "$" && element.visible) {
      if (index+1 <= array.length-1 && array[index].name == '$') {

        var el = element;
        var el2 = array[index+1];

        el.visible = false;
        el2.visible = false;
        coin = game.add.image(el.x+(size*0.05),el.y-(size*0.05),'ssheet','coin');
        coin.width = size;
        coin.height = size;
        el.parent.addChild(coin);


      }
    }


  });

} 


BUBBLE.OneLineText.prototype.setText = function(text) {

  Phaser.BitmapText.prototype.setText.call(this,text.toString());

  if (this.maxUserWidth) {
    this.fontSize = this.orgFontSize;
    this.updateText();
    while (this.width > this.maxUserWidth) {
      this.fontSize -= 1;
      this.updateText();
    }
  }

  this.updateCache();
  //this._cachedSprite.anchor.setTo(this.hAnchor || 0.5,1);

};


BUBBLE.OneLineText.prototype.popUpAnimation = function() {
  
  this.cacheAsBitmap = false;

  var char_numb = this.children.length;
 
  //
  var delay_array = [];
  for (var i = 0; i < char_numb; i++) {
    delay_array[i] = i;
  }
 
  delay_array = Phaser.ArrayUtils.shuffle(delay_array);
  
  delay_index = 0;
  this.activeTweens = 0;

  this.children.forEach(function(letter) {
 
      if (letter.anchor.x == 0) {
        letter.x = letter.x + (letter.width*0.5);
        letter.y = letter.y + letter.height;
        letter.anchor.setTo(0.5,1);
      }
      var target_scale = letter.scale.x;
      letter.scale.setTo(0,0);
      this.activeTweens++;
      var tween = game.add.tween(letter.scale)
        .to({x:target_scale*1.5,y:target_scale*1.5},200,Phaser.Easing.Quadratic.In,false,delay_array[delay_index]*25)
        .to({x:target_scale,y:target_scale},200,Phaser.Easing.Sinusoidal.In);
      tween.onComplete.add(function() {this.activeTweens--; if (this.activeTweens == 0) {if (this.alive) this.cacheAsBitmap = true;}},this);
      tween.start();
      delay_index++; 
    },this)
};



BUBBLE.OneLineText.prototype.pushAnimation = function(onComplete,context) {
  this.cacheAsBitmap = false;

  var char_numb = this.children.length;
 
  var delay_array = [];
  for (var i = 0; i < char_numb; i++) {
    delay_array[i] = i;
  }
 
  delay_index = 0;
  this.activeTweens = 0;

  this.children.forEach(function(letter) {
 
      if (letter.anchor.x == 0) {
        letter.x = letter.x + letter.width*0.5;
        letter.y = letter.y + letter.height*0.5;
        letter.anchor.setTo(0.5,0.5);
      }
      var target_scale = letter.scale.x;
      letter.scale.setTo(0,0);
      this.activeTweens++;

      var tween = game.add.tween(letter.scale)
        .to({x:target_scale*2,y:target_scale*2},400,Phaser.Easing.Quadratic.Out,false,delay_array[delay_index]*20)
        .to({x:target_scale,y:target_scale},200,Phaser.Easing.Sinusoidal.In);
          tween.onComplete.add(function() {
          this.activeTweens--;
          if (this.activeTweens == 0) {this.cacheAsBitmap = true;}
         },this);

      tween.start();
      delay_index++; 
    },this)

}

BUBBLE.OneLineText.prototype.scaleOut = function(onComplete,context) {
  this.cacheAsBitmap = false;

  this.activeTweens = 0;


  this.children.forEach(function(letter,index) {

      if (letter.anchor.x == 0) {
        letter.x = letter.x + letter.width*0.5;
        letter.y = letter.y + letter.height*0.5;
        letter.anchor.setTo(0.5,0.5);
      }
      this.activeTweens++;
      letter.scale.setTo(letter.scale.x,letter.scale.y);

      var tween = game.add.tween(letter.scale)
        .to({x:0,y:0},400,Phaser.Easing.Cubic.In,false,index*20);
      tween.onComplete.add(function() {
        this.activeTweens--;
        if (this.activeTweens == 0) {this.destroy()}
       },this);
      tween.start();
    },this)

}
PotBubblesAnim = function() {

	Phaser.Group.call(this,game);


	this.makeParticle(-60,10,0.2,5,7);
	this.makeParticle(45,4,0.2,2,10);
	this.makeParticle(0,0,0.2,1,3);
	this.makeParticle(35,-5,0.2,0,4); 
	this.makeParticle(70,8,0.2,4,8);

};

PotBubblesAnim.prototype = Object.create(Phaser.Group.prototype);

PotBubblesAnim.prototype.updateAnim = PotBubblesAnim.prototype.update;

PotBubblesAnim.prototype.update = function() {};

PotBubblesAnim.prototype.makeParticle = function(x,y,scale,delay,timer) {

	var x = x+100;
	var y = y+100;

	var part = BUBBLE.makeImageL(x,y,'bubble3',0.5,this);
	var part2 = BUBBLE.makeImageL(x,y,'bubble',0.5,this);
	part.outer = part2;
	part.timer = timer;
	part.scale.setTo(scale);
	part2.scale.setTo(scale);
	part.delay = delay;
	part.spd = 4;

	part.stage2 = false;

	part.update = function() {
		if (this.delay-- > 0) return;

		if (part.stage2) {
			this.alpha -= 0.25;
			this.outer.alpha = this.alpha;
			this.scale.setTo(this.scale.x-0.25);
			this.outer.scale.setTo(this.outer.scale.x+0.15);
			if (this.alpha < 0) {
				this.outer.destroy();
				this.destroy();
			}
		}else {
			if (this.timer-- > 0) {

				this.y -= this.spd;
				this.outer.y = this.y;
				
				if (this.timer == 1) {
				this.stage2 = true;
				this.outer.loadTexture('ssheet','bubble2');
				}
			}

		};

	};
};


BUBBLE.PotsGroup = function(grid,scoreCoinsGroup) {

	Phaser.Group.call(this,game);

	this.x = BUBBLE.l(320);

	this.offsetY = BUBBLE.l(960);

	this.pots = BUBBLE.makeImageL(0,10,'pots',[0.5,1],this);



	this.scoreCoinsGroup = scoreCoinsGroup;



	this.potsFilling = BUBBLE.makeImageL(0,18,'pots_0',[0.5,1],this);
	this.potsFilling.animIndex = 0;
	this.potsFilling.animTimer = 2;
	this.potsFilling.refreshLevelTarget = function(combo) {
		this.targetY = BUBBLE.l(18)-Math.floor((22*(combo/6)));
		this.targetY = game.math.clamp(this.targetY,BUBBLE.l(-4),BUBBLE.l(18));
	};
	this.potsFilling.targetY = BUBBLE.l(18);
	this.potsFilling.update = function() {

		if (this.y > this.targetY) {
			this.y--;
		}
		if (this.y < this.targetY) {
			this.y++;
		}

		if (this.animTimer-- == 0) {
			this.animTimer = 4;
			this.animIndex++;
			if (this.animIndex == 6) this.animIndex = 0;
			this.loadTexture('ssheet','pots_'+this.animIndex);
		}
	};


	this.bubbles = game.add.group();


	this.initSmokeGroup();
	this.initLightsGroup();

	this.initColliders();


	this.potsFront = BUBBLE.makeImageL(320,10,'pots_fronts',[0.5,1]);


	this.combo = 0;


	BUBBLE.events.onGoodShoot.add(function() {
		this.combo++;
		this.potsFilling.refreshLevelTarget(this.combo);
	},this);
	BUBBLE.events.onMissShoot.add(function() {
		this.combo = 0;
		this.potsFilling.refreshLevelTarget(this.combo);
	},this);
	
	BUBBLE.events.onDoublePointsActivate.add(function() {
		var i = this.lightsGroup.children.length;
		while (i--) {
			this.lightPot(i);
		}
	},this);

	//BUBBLE.events.onScreenResize.add(this.resize,this);
	BUBBLE.events.onPopOutDestroyed.add(this.processPopOutDestroyed,this);

	//BUBBLE.events.onPotBottomYChange.add(this.updatePositions,this);

}

BUBBLE.PotsGroup.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.PotsGroup.constructor = BUBBLE.PotsGroup;

BUBBLE.PotsGroup.prototype.update = function() {

	this.potsFilling.update();

	this.colliders.forEach(this.updateCollider,this);
	this.checkCollisions();
	this.lightsGroup.forEach(this.updateLights);


	//this.pots.y = game.camera.y+game.world.bounds.y+this.offsetY+this.pots.additionalOffsetY;
	//this.potsFront.y = this.pots.y;

	//this.pots.y = this.potsFront.y = BUBBLE.potBottomY + this.pots.additionalOffsetY;

	/*


	
	this.potsFilling.level = this.potsFilling.level < this.combo ? Math.min(this.potsFilling.level+0.05,this.combo) : Math.max(this.potsFilling.level-0.2,this.combo);
	this.potsFilling.fillingOffset = game.math.clamp(BUBBLE.l(10) - (BUBBLE.lnf(4)*this.potsFilling.level),BUBBLE.l(-15),BUBBLE.l(10));
	this.potsFilling.y = BUBBLE.potBottomY+this.potsFilling.fillingOffset+this.pots.additionalOffsetY;
	this.potsFilling.update();
	*/
};


BUBBLE.PotsGroup.prototype.updatePositions = function(bottomY) {
	this.y = bottomY;
	this.potsFront.y = this.y+BUBBLE.l(10);
	this.lightsGroup.y = bottomY;
	this.smokeGroup.y = bottomY;

};


BUBBLE.PotsGroup.prototype.updateCollider = function(collider) {
	collider.y = this.y - collider.height;
}

BUBBLE.PotsGroup.prototype.updateLights = function(light) {
	light.alpha = Math.max(0,light.alpha-0.05);
}

BUBBLE.PotsGroup.prototype.checkCollisions = function() {

	var i = this.bubbles.length;
	var bubble;

	while(i--) {

		bubble = this.bubbles.children[i];

		this.colliders.forEach(function(collider) {
		if (Phaser.Circle.intersectsRectangle(bubble.collCircle, collider)) {
			this.potBubbleCollision(collider,bubble);
		}
		},this);

		this.scoreCoinsGroup.forEach(function(coin) {
			if (!coin.active) return;
			if (Phaser.Circle.intersects(coin.collCircle,bubble.collCircle)) {
				this.coinBubbleCollision(coin,bubble);
			}
		},this);

	}

};

BUBBLE.PotsGroup.prototype.coinBubbleCollision = function(scoreCoin,bubble) {
	game.sfx['hit_'+game.rnd.between(1,3)].play();

	bubble.x += -bubble.velX;
	bubble.y += -bubble.velY;

	var direction = game.math.radToDeg(game.math.angleBetween(scoreCoin.x,scoreCoin.y,bubble.x,bubble.y));
	bubble.x = scoreCoin.x + BUBBLE.utils.lengthdir_x(direction,scoreCoin.collCircle.radius+bubble.collCircle.radius+1);
	bubble.y = scoreCoin.y + BUBBLE.utils.lengthdir_y(direction,scoreCoin.collCircle.radius+bubble.collCircle.radius+1);

	bubble.collCircle.x = bubble.x;
	bubble.collCircle.y = bubble.y;
	scoreCoin.onHit(bubble);
	var spd = Math.max(BUBBLE.lnf(2.5),game.math.distance(0,0,bubble.velX,bubble.velY) * 0.75);
	var newAngle = game.math.angleBetween(scoreCoin.x,scoreCoin.y,bubble.x,bubble.y);
	bubble.velX = BUBBLE.utils.lengthdir_x(newAngle,spd,true);
	bubble.velY = BUBBLE.utils.lengthdir_y(newAngle,spd,true);

};

BUBBLE.PotsGroup.prototype.potBubbleCollision = function(collCollider,bubble) {

	game.sfx['hit_'+game.rnd.between(1,3)].play();

	bubble.x += -bubble.velX;
	bubble.y += -bubble.velY;
	bubble.collCircle.x = bubble.x;
	bubble.collCircle.y = bubble.y;

	if (Phaser.Circle.intersectsRectangle(bubble.collCircle, collCollider)) {
		if (bubble.x < collCollider.centerX) {
		bubble.x = Math.min(bubble.x,collCollider.left-bubble.collCircle.radius);
		}else {
			bubble.x = Math.max(bubble.x,collCollider.right+bubble.collCircle.radius);
		}
	}
		
	var spd = Math.max(BUBBLE.lnf(2.5),game.math.distance(0,0,bubble.velX,bubble.velY) * 0.75);
	var newAngle = game.math.angleBetween(collCollider.centerX,collCollider.centerY,bubble.x,bubble.y);

	bubble.velX = BUBBLE.utils.lengthdir_x(newAngle,spd,true);
	bubble.velY = BUBBLE.utils.lengthdir_y(newAngle,spd,true);

};

BUBBLE.PotsGroup.prototype.processPopOutDestroyed = function(bubble) {

	var lightNr = this.whichPot(bubble);

	this.lightPot(lightNr);

	var smokeAnim = this.smokeGroup.getFirstDead();
	if (smokeAnim != null) {
		smokeAnim.start(lightNr);
	}

};

BUBBLE.PotsGroup.prototype.lightPot = function(lightNr) {
	this.lightsGroup.children[lightNr].alpha = 1;
};


BUBBLE.PotsGroup.prototype.whichPot = function(bubble) {

	var lightNr = null;
	this.potsRanges.forEach(function(range,index) {
		if (bubble.x >= range[0] && bubble.x <= range[1]) {
			lightNr = index;
		}
	});
	return lightNr;
};

BUBBLE.PotsGroup.prototype.initLightsGroup = function() {

	this.lightsGroup = game.add.group();
	this.lightsGroup.x = BUBBLE.l(320);
	this.lightsGroup.add(game.make.imageL(-242,90,'pot_light'));
	this.lightsGroup.add(game.make.imageL(-115,50,'pot_light'));
	this.lightsGroup.add(game.make.imageL(1,-10,'pot_light'));
	this.lightsGroup.add(game.make.imageL(115,50,'pot_light'));
	this.lightsGroup.add(game.make.imageL(241,90,'pot_light'));
	this.lightsGroup.forEach(function(child) {
		child.anchor.setTo(0.5,1);
		child.alpha = 0;
	});

};

BUBBLE.PotsGroup.prototype.initColliders = function() {
	this.colliders = [];
	this.colliders.push(Phaser.RectangleL(0,0,18,56));
	this.colliders.push(Phaser.RectangleL(148,0,6,56));
	this.colliders.push(Phaser.RectangleL(264,0,9,43));
	this.colliders.push(Phaser.RectangleL(375,0,9,43));
	this.colliders.push(Phaser.RectangleL(494,0,6,56));
	this.colliders.push(Phaser.RectangleL(627,0,18,56));

	this.potsRanges = [];
	this.colliders.forEach(function(collider,index,array) {
		var a, b = collider.centerX;
		if (index == 0) {
			return;
		}else {
			a = array[index-1].centerX;
		}
		this.potsRanges.push([a,b]);
	},this);
};

BUBBLE.PotsGroup.prototype.initSmokeGroup = function() {


	this.smokeGroup = game.add.group();

	for (var i = 0; i < 3; i++) {

		this.smokeAnim = BUBBLE.makeImageL(0,0,'smoke_01',[0.5,1]);
		
		this.smokeAnim.animTimer = 2;
		this.smokeAnim.frameIndex = 0;
		this.smokeAnim.potsPositions = [-242,-115,1,115,241].map(function(o) {return BUBBLE.l(o)});

		this.smokeAnim.start = function(potNr) {
			if (this.alive) return;

			this.x = BUBBLE.l(320)+this.potsPositions[potNr];
			this.frameIndex = 0;
			this.animTimer = 1;
			this.revive();

		};

		this.smokeAnim.update = function() {
			if (!this.alive) return;
			if (this.animTimer-- == 0) {
				this.animTimer = 2;
				this.frameIndex++;
				if (this.frameIndex == 9) {
					return this.kill();
				}
				this.loadTexture('ssheet','smoke_0'+this.frameIndex);
			}
		}; 

		this.smokeAnim.kill();
		this.smokeGroup.add(this.smokeAnim);

	}

};
BUBBLE = BUBBLE || {};

BUBBLE.saveState = {

    makeNewDataObject: function() {
        return {
            coins: BUBBLE.settings.coinsOnStart,
            bomb: BUBBLE.settings.boostersOnStart,
            multicolor: BUBBLE.settings.boostersOnStart,
            aim: BUBBLE.settings.boostersOnStart,
            extraMoves: BUBBLE.settings.boostersOnStart,
            highscores: [0,0,0],
            sawTutorial: false,
            sawBomb: false,
            sawMulticolor: false,
            sawAim: false
        }

    },

    startLevel: function() {

        this.data.coins = BUBBLE.settings.coinsOnStart;
        this.data.bomb = BUBBLE.settings.boostersOnStart;
        this.data.multicolor = BUBBLE.settings.boostersOnStart;
        this.data.aim = BUBBLE.settings.boostersOnStart;
        this.data.extraMoves = BUBBLE.settings.boostersOnStart;

    },

    pushGift: function(type) {
        this.data.gifts.push(type);
        this.save();
        BUBBLE.events.refreshGiftCounter.dispatch(this.data.gifts.length);
    },

    getGift: function() {
        var gift = this.data.gifts.shift();
        this.save();
        BUBBLE.events.refreshGiftCounter.dispatch(this.data.gifts.length);
        return gift;
    },

    getStars: function(lvl_nr) {
        lvl_nr;
        return this.data.levels[lvl_nr] ? this.data.levels[lvl_nr] : 0;
    },

    levelEnd: function(points) {


        if (points != 0 && this.data.highscores[this.data.highscores.length-1] < points) {
            var bestPos;

            for (var i = bestPos = this.data.highscores.length-1; i >= 0; i--) {
                if (this.data.highscores[i] < points) {
                    bestPos = i;
                }
            }

            this.data.highscores[bestPos] = points;
            this.save();

            return bestPos;
        }
        return null;
    },

    isBooosterUnlocked: function(lvlNr,type) {
        if (lvlNr == 'ENDLESS') return false;
        if (game.state.getCurrentState().walkthrough) return false;
        return this.getLastLevel() >= BUBBLE.settings.boosterUnlockLvl[type];
    },

    passPoints: function(lvl_nr,points) {
        var current = this.data.scores[lvl_nr] || 0;
        if (points > current) {
            this.data.scores[lvl_nr] = points;
            return true;
        }else {
            return false;
        }
    },

    getScore: function(lvl_nr) {
        if (!this.data.scores) this.data.scores = [];
        return this.data.scores[lvl_nr] || 0;
    },

    getEndlessScore: function() {
        return this.data.endlessHighscore || 0;
    },

    getCoins: function() {
        return this.data.coins;
    },

    getBooster: function(type) {
        return this.data[type];
    },

    getLives: function() {
        return this.data.lives;
    },

    isUnlocked: function(lvl_nr) {
        lvl_nr;
        return lvl_nr <= this.data.levels.length;
    },

    isEnoughToBuy: function(price) {
        return price <= this.data.coins;
    },

    isEnoughToBuyBooster: function(booster) {
        return BUBBLE.settings['costOf'+booster] <= this.data.coins;
    },


    buyBooster: function(booster) {
        this.changeCoins(-BUBBLE.settings['costOf'+booster]);
        this.data[booster]++;
        this.save();
        BUBBLE.events.onBoosterBought.dispatch(booster);
    },

    buyAndUseBooster: function(booster) {
        this.changeCoins(-BUBBLE.settings['costOf'+booster]);
        BUBBLE.events['useOf'+booster].dispatch(true);
        this.save();

    },

    getLastLevel: function() {
        return Math.min(this.data.levels.length,BUBBLE.levels.length-1);
    },

    changeCoins: function(amount) {

        this.data.coins += amount;
        this.data.coins = Math.max(0,this.data.coins);
        BUBBLE.events.onCoinsChange.dispatch(this.data.coins);
        this.save();

    },

    changeBooster: function(booster,amount) {
        if (this.data[booster] == 99) return;

        this.data[booster] = Math.min(99,this.data[booster]+amount);
        this.save();

        BUBBLE.events.onBoosterChange.dispatch(booster);
    },

    decreaseBooster: function(type) {
        this.data[type]--;
        this.save();
    },

    save: function() {

        this.data.mute = game.sound.mute;
        SG_Hooks.setStorageItem('gmdatastring',JSON.stringify(this.data));

    },

    load: function() {

        var item = SG_Hooks.getStorageItem('gmdatastring');
        if (item) {
            this.data = JSON.parse(item);
            game.sound.mute = this.data.mute;

        }else {
            this.data = this.makeNewDataObject();
        }

    }

}



BUBBLE.ScoreCoin = function(x,offsetY) {

	Phaser.Image.call(this, game,BUBBLE.l(x),0,'ssheet','score_coin_100');

	this.distanceFromBottom = BUBBLE.l(offsetY);
	this.y = Math.floor(game.camera.y+game.camera.height)-this.distanceFromBottom;

	this.targetX = this.x;
	this.targetDistanceFromBottom = this.distanceFromBottom;

	this.anchor.setTo(0.5);
	this.collCircle = new Phaser.Circle(this.x,this.y,0);

	this.active = false;
	this.kill();

	BUBBLE.events.onPotBottomYChange.add(function(bottomY) {
		this.y = bottomY-this.distanceFromBottom;
	});


}

BUBBLE.ScoreCoin.prototype = Object.create(Phaser.Image.prototype);
BUBBLE.ScoreCoin.constructor = BUBBLE.ScoreCoin;

BUBBLE.ScoreCoin.prototype.update = function() { 

	this.y = BUBBLE.potBottomY-this.distanceFromBottom;

	if (this.active) {
		this.collCircle.y = this.y;
		this.scale.x = this.scale.y = Math.max(1,this.scale.x - 0.02)
	}

};

BUBBLE.ScoreCoin.prototype.onHit = function(bubble) {

	game.sfx.scorecoin.play();

	this.scale.x = this.scale.y = 1.5;
	BUBBLE.events.fxBurstParticles.dispatch(this,3);
	BUBBLE.events.onScoreCoinHit.dispatch(this);

	if (!bubble.hitId) {
		bubble.hitId = Math.floor(Math.random()*2500);
	}

	if (!this.hitHistory[bubble.hitId]) {
		this.hitHistory[bubble.hitId] = 1;
	}else {
		if (++this.hitHistory[bubble.hitId] == 4) {
			this.deactivate();
		}
	}

};


BUBBLE.ScoreCoin.prototype.activate = function(obj,type) {

	BUBBLE.stopTweens(this);

	
	this.scale.setTo(1);

	var spriteType;

	if (type == BUBBLE.settings.scoreCoinsPoints[0]) {
		spriteType = 100;
	}else if (type == BUBBLE.settings.scoreCoinsPoints[1]) {
		spriteType = 250;
	}else {
		spriteType = 500;
	}

	this.loadTexture('ssheet','score_coin_'+spriteType);
	this.points = type;
	this.hitHistory = {};

	this.x = obj.x;
	this.distanceFromBottom = BUBBLE.potBottomY-obj.y;
	this.y = Math.floor(BUBBLE.potBottomY)-this.distanceFromBottom;

	

	game.add.tween(this.scale).to({x:2,y:2},400,Phaser.Easing.Cubic.Out,true,0,0,true);


	game.add.tween(this).to({x: this.targetX, distanceFromBottom: this.targetDistanceFromBottom},800,Phaser.Easing.Sinusoidal.InOut,true).onComplete.add(function() {
		this.collCircle.diameter = BUBBLE.l(25);
		this.active = true;
	},this);



	BUBBLE.events.fxBurstParticles.dispatch(this,3);

	this.revive();
};

BUBBLE.ScoreCoin.prototype.deactivate = function() { 
	
	BUBBLE.stopTweens(this);
	
	this.active = false;
	this.collCircle.diameter = 0;
	game.add.tween(this.scale).to({x:0,y:0},800,Phaser.Easing.Cubic.Out,true).onComplete.add(function() {
		this.kill();
	},this);

};
BUBBLE.ScoreCoinsGroup = function() {
	
	Phaser.Group.call(this,game);

	this.add(new BUBBLE.ScoreCoin(30,160));
	this.add(new BUBBLE.ScoreCoin(140,140));
	this.add(new BUBBLE.ScoreCoin(30,270));
	this.add(new BUBBLE.ScoreCoin(160,240));

	this.add(new BUBBLE.ScoreCoin(610,160));
	this.add(new BUBBLE.ScoreCoin(500,140));
	this.add(new BUBBLE.ScoreCoin(610,270));
	this.add(new BUBBLE.ScoreCoin(480,240));

	this.scoreCoinsPoints = BUBBLE.settings.scoreCoinsPoints;


};


BUBBLE.ScoreCoinsGroup.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.ScoreCoinsGroup.prototype.getTypeOfCoin = function(combo) {
	if (combo >= 5) {
		return this.scoreCoinsPoints[2];
	}else if (combo >= 3) {
		return Math.random()<0.7?this.scoreCoinsPoints[1]:this.scoreCoinsPoints[2];
		//return BUBBLE.rnd('SCG - getTypeOfCoin')<0.7 ? 250 : 500;
	}else {
		return Math.random()<0.7?this.scoreCoinsPoints[0]:this.scoreCoinsPoints[1];
		//return BUBBLE.rnd('SCG - getTypeOfCoin')<0.9 ? 100 : 250;
	}
};

BUBBLE.ScoreCoinsGroup.prototype.activateCoin = function(obj,combo) {
	
	//var start =  Math.floor(BUBBLE.rnd('SCG - activateCoin')*8); 
	var start = Math.floor(Math.random()*8);
	var child;

	for (var i = 0; i < 8; i++) {
		child = this.children[(start+i)%this.children.length];
		if (!child.active) {
			child.activate(obj,this.getTypeOfCoin(combo));
			return;
		}
	};

};

BUBBLE.ScoreCoinsGroup.prototype.deactivateCoin = function() {

	var start = Math.floor(BUBBLE.rnd('SCG - deactivateCoin')*8); 
	var child;

	for (var i = 0; i < 8; i++) {
		child = this.children[(start+i)%this.children.length];
		if (child.active) {
			child.deactivate();
			return;
		}
	};

};

BUBBLE.ShineLights = function(x,y) {
	
	Phaser.Group.call(this, game);

	this.x = BUBBLE.l(x || 0);
	this.y = BUBBLE.l(y || 0);

	for (var i = 0; i < 3; i++) {
		this.add(game.make.imageL(0,0,'prize_light'));
		this.children[i].angle = Math.random()*360;
		this.children[i].anchor.setTo(0.5);
	}

	this.update = function() {
		this.children[0].angle += 0.5;
		this.children[1].angle -= 0.7;
		this.children[2].angle += 1.2;
	};

}

BUBBLE.ShineLights.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.Shooter = function(grid) {

	Phaser.Group.call(this, game);

	this.grid = grid;
	this.lvl = grid.lvl;
	this.random = this.lvl.shooter.mode == 'random';
	this.pattern = this.lvl.shooter.pattern;
	this.patternIndex = 0;
	this.possibleColors = this.grid.getAllColorsOnBoard();
	this.moves = this.lvl.shooter.bubblesNumber;
	this.active = true;
	this.lockInput = false;

	this.aimsBooster = 0;
	if (game.state.getCurrentState().editorMode) this.aimsBooster = 9999;

	this.chargeUpPlayed = false;
	
	this.gridOffset = BUBBLE.l(420);
	this.cameraOffset = BUBBLE.l(960)-BUBBLE.topStripeHeight;
	this.pots = {};
	
	this.x = BUBBLE.l(320);
	
	this.ghostMode = this.lvl.mode == 'Ghost';
	if (this.ghostMode) {
		this.targetY = Math.max(this.cameraOffset,this.gridOffset);
		}else {
		this.targetY = Math.max(this.cameraOffset,(this.grid.getLowestBubble()*BUBBLE.l(51))+this.gridOffset);
	}
	this.cameraY = this.targetY-this.cameraOffset;
	this.y = this.targetY;

	this.minX = BUBBLE.l(40);
	this.maxX = BUBBLE.l(600);
	this.minY = BUBBLE.l(30);
	

	this.flyingBubbleRadius = BUBBLE.l(6);

	this.showPointer = false;
	this.aimAngle = 0;


	this.pointerGroup = game.add.group();
	for (var i = 0; i < 30; i++) {
		var pointer = game.add.image(320,i*50,'ssheet','aim_dot');
		pointer.anchor.setTo(0.5,0.5);
		this.pointerGroup.add(pointer)
	}
	this.pointerGroup.alpha = 0;

	this.initSprites();



	this.lastColor;

	

	this.duringAnimation = false;
	
	this.chargeUpSfx = {sfx: [game.sfx.charge_up,game.sfx.charge_up2,game.sfx.charge_up3,game.sfx.charge_up4],
		isPlaying: false,
		play: function() {
			var sfx = this.sfx[game.rnd.between(0,3)];
			sfx.play();
			this.isPlaying = sfx;
		},
		stop: function() {
			if (this.isPlaying) {
				this.isPlaying.stop();
				this.isPlaying = false;
			}
	}}

	


	this.touchYDeadZone = BUBBLE.l(140);
	this.inputRect = {left: BUBBLE.l(-15), right: BUBBLE.l(655), topMargin: -game.world.bounds.y, bottom: this.y-this.touchYDeadZone}

	game.input.onUp.add(function(pointer) {
		if (!this.lockInput && this.checkIfInInputRect(pointer)) {
			var angle = game.math.angleBetween(this.x,this.y-BUBBLE.l(60),pointer.worldX,pointer.worldY);
			this.shoot(angle);
		}
	},this);
	

	BUBBLE.events.onOpenBoosterStrip.add(function() {
		if (!BUBBLE.horizontal) this.inputRect.right = BUBBLE.l(460);
	},this)

	BUBBLE.events.onCloseBoosterStrip.add(function() {
		this.inputRect.right = BUBBLE.l(640);
	},this);

	BUBBLE.events.onScreenResize.add(function() {
		this.inputRect.topMargin = Math.min(BUBBLE.l(100),-game.world.bounds.y);
	},this)

	BUBBLE.events.onMoveDone.add(function(possibleColors) {
		this.possibleColors = possibleColors;
		this.checkCurrentColors();
	},this);

	BUBBLE.events.onGoalAchieved.add(function() {
		this.active = false;
	},this);

	BUBBLE.events.onWindowOpened.add(function() {
		this.lockInput = true;
		this.swapButton.input.enabled = false;
	},this);

	BUBBLE.events.onWindowClosed.add(function() {
		this.lockInput = false;
		this.swapButton.input.enabled = true;
	},this);


	this.movingPhase = 1;
	this.aims = 0;
	this.bomb = false;
	this.multicolor = false;

	BUBBLE.events.useOfbomb.add(function(skipDecreasing) {
		if (!this.active) return;
		if (this.bubble0.color != 'bomb') {
			game.sfx.booster.play();
			if (!skipDecreasing) BUBBLE.saveState.decreaseBooster('bomb');
			this.bubble0.color = 'bomb';
			this.bubble0fade.alpha = 1;
			this.bubble0.loadTexture('bubblesheet','bubble_'+this.bubble0.color);
		}
		
	},this);

    BUBBLE.events.useOfmulticolor.add(function(skipDecreasing) {
    	if (!this.active) return;
    	if (this.bubble0.color != 'multicolor') {
    		game.sfx.booster.play();
    		BUBBLE.saveState.data.sawMulticolor = true;
    		if (!skipDecreasing) BUBBLE.saveState.decreaseBooster('multicolor');
    		this.bubble0.color = 'multicolor';
    		this.bubble0fade.alpha = 1;
			this.bubble0.loadTexture('bubblesheet','bubble_'+this.bubble0.color);
    	}
    },this);

    BUBBLE.events.useOfaim.add(function(skipDecreasing) {
    	if (!this.active) return;
    	game.sfx.booster.play();
    	BUBBLE.saveState.data.sawAim = true;
    	if (!skipDecreasing) BUBBLE.saveState.decreaseBooster('aim');
    	this.aimsBooster+=BUBBLE.settings.numberOfAims;
    },this);

    BUBBLE.events.useOfextraMoves.add(function(dontDecrease) {
    	if (!this.active) return;
    	if (!dontDecrease) {
    		BUBBLE.saveState.decreaseBooster('extraMoves');
    	}
    	game.sfx.booster.play();
    	this.addMoves(5);
    	
    },this);

}

BUBBLE.Shooter.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.Shooter.constructor = BUBBLE.Shooter;


BUBBLE.Shooter.prototype.animationUpdate = function() {

	this.boosterHighlight.update();
	
	this.shootAnimation.update();

	if (this.cannon.animating) {
		this.cannon.animTimer--;
		if (this.cannon.animTimer==0) {
			if (this.cannon.animIndex == 7) {
				this.cannon.loadTexture('ssheet','cannon_00');
				this.cannon.animTimer = 1;
				this.cannon.animIndex = 0;
				this.cannon.animating = false;
			}else {
				this.cannon.loadTexture('ssheet',this.cannon.animArray[this.cannon.animIndex]);
				this.cannon.animIndex++;
				this.cannon.animTimer = 2;
			}
		}
	}
};

BUBBLE.Shooter.prototype.positionUpdate = function() {

	this.updateTargetY();
	this.yy = BUBBLE.utils.lerp(this.y,this.targetY,0.02);
	this.y = Math.floor(this.yy); 
	this.pots.updatePositions(this.y);

	//game.camera.y = this.y - this.cameraOffset + game.world.bounds.y;
	BUBBLE.potBottomY = BUBBLE.horizontal ? game.camera.y + game.height : game.camera.y + game.height-BUBBLE.bottomStripeHeight;
	BUBBLE.events.onPotBottomYChange.dispatch(BUBBLE.potBottomY);
	this.inputRect.bottom = this.y - this.touchYDeadZone;


};

BUBBLE.Shooter.prototype.winUpdate = function() {

	if (BUBBLE.pause) return;


	this.positionUpdate();

	
	this.bubble0fade.alpha = Math.max(0,this.bubble0fade.alpha-0.05);
	this.bubble1fade.alpha = Math.max(0,this.bubble1fade.alpha-0.05);
	
	if (this.moves > 0) {
		this.cannon.angle += this.movingPhase;
		if (this.movingPhase == -1 && this.cannon.angle < -30) {
			this.movingPhase = 1;
		}else if (this.movingPhase == 1 && this.cannon.angle > 30) {
			this.movingPhase = -1;
		}
	}
	
	this.animationUpdate();
	
	if (!this.cannon.animating && this.moves > 0) {
		this.shoot(10,true);
	}


}

BUBBLE.Shooter.prototype.update = function() {


	this.animationUpdate();

	if (BUBBLE.pause) return;

	

	this.positionUpdate();


	this.bubble0fade.alpha = Math.max(0,this.bubble0fade.alpha-0.05);
	this.bubble1fade.alpha = Math.max(0,this.bubble1fade.alpha-0.05);

	if (!this.lockInput && this.active && !this.duringAnimation && this.moves > 0 
		&& this.checkIfInInputRect(game.input.activePointer)) {

		
		
		var angle = game.math.angleBetween(this.x,this.y-BUBBLE.l(60),game.input.activePointer.worldX,game.input.activePointer.worldY);
		
		this.cannon.rotationTarget = angle+1.5708;
		this.cannon.rotation = BUBBLE.utils.lerp(this.cannon.rotation,this.cannon.rotationTarget,0.2);
		
		if (game.input.activePointer.isDown) {
				this.showPointer = true;
			if (!this.chargeUpPlayed) {
				this.chargeUpPlayed = true;
				this.chargeUpSfx.play();
			}
		}else {
			this.chargeUpPlayed = false;
		}

		

	}else {

		if (this.chargeUpSfx.isPlaying) {
			this.chargeUpSfx.stop();
		}
		this.chargeUpPlayed = false;


		this.showPointer = false;
		this.cannon.rotation = BUBBLE.utils.lerp(this.cannon.rotation,this.cannon.rotationTarget,0.1);
		//this.lightsGroup.turnOff();
	}

	this.pointerGroup.alpha = game.math.clamp(this.showPointer ? this.pointerGroup.alpha+0.08 : this.pointerGroup.alpha-0.03,0,1);
	if (this.pointerGroup.alpha > 0) {
		this.aimPointers(this.cannon.rotation-1.5708);
	}
}


BUBBLE.Shooter.prototype.updateTargetY = (function() {

	var timer = 1;

	return function() {

		timer--;

		if (timer == 0) {

			if (this.ghostMode) {
			this.targetY = Math.max(this.cameraOffset,this.gridOffset);
			}else {
			this.targetY = Math.max(this.cameraOffset,(this.grid.getLowestBubble()*BUBBLE.l(51))+this.gridOffset);
			}
			timer = 30;
		}
		
	}
	

})();

BUBBLE.Shooter.prototype.swapBubbles = function() {


	if (!this.active || this.bubble0.color === null || this.bubble1.color === null || this.duringAnimation) return;

	BUBBLE.events.onBubbleSwap.dispatch();

	this.duringAnimation = true;

	game.sfx.whoosh.play();

	game.add.tween(this.bubble0).to({x: this.bubble1.x, y: this.bubble1.y},500,Phaser.Easing.Sinusoidal.InOut,true);
	game.add.tween(this.bubble1).to({x: this.bubble0.x, y: this.bubble0.y},500,Phaser.Easing.Sinusoidal.InOut,true)
	.onComplete.add(function() {

		var tmp;
		tmp = this.bubble0;
		this.bubble0 = this.bubble1;
		this.bubble1 = tmp;

		this.duringAnimation = false;

	},this);

	if (this.bubble0.z < this.bubble1.z) {
		this.swap(this.bubble0,this.bubble1);
	}
	
	//game.add.tween(this.bubble0.scale).to({x:1.75,y:1.75},250,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);
	//game.add.tween(this.bubble1.scale).to({x:0.25,y:0.25},250,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);
	


};


BUBBLE.Shooter.prototype.shoot = function(angle,popout,walkthroughData) {
	
	if (!popout) {
		if (!this.active || this.bubble0.color == null || this.duringAnimation) return;
	} 

	this.pointerGroup.alpha = 0;

	
	this.shootAnimation.shoot(this.bubble0.color);


	game.sfx.launch_ball.play();
	this.chargeUpSfx.stop();

	this.aimsBooster = Math.max(0,this.aimsBooster-1);

	BUBBLE.events.onBubbleShoot.dispatch(this.x,this.y-BUBBLE.l(60),angle,this.bubble0.color,popout,walkthroughData);

	this.cannon.animating = true;

	if (this.bubble0.color != 'bomb' && this.bubble0.color != 'multicolor') {
		this.moves--;
		this.movesTxt.setText(this.moves.toString());
		this.movesTxt.updateCache();
	}

	this.bomb = false;
	this.multicolor = false;

	this.changeColorOfBubble(this.bubble0,this.bubble1.color);
	this.changeColorOfBubble(this.bubble1,this.getNextColor());

	if (this.bubble0.color === null) return;

	this.duringAnimation = true;

	this.bubble0.x = BUBBLE.l(-60);
	this.bubble0.y = BUBBLE.l(-55);
	this.bubble1.x = BUBBLE.l(-60);
	this.bubble1.y = BUBBLE.l(22);

	game.add.tween(this.bubble0).to({x:0,y:BUBBLE.l(-95)},500,Phaser.Easing.Sinusoidal.InOut,true)
	.onComplete.add(function() {
		this.duringAnimation = false;
	},this);

	game.add.tween(this.bubble1).to({x:BUBBLE.l(-60),y:BUBBLE.l(-55)},500,Phaser.Easing.Sinusoidal.InOut,true)
	.onComplete.add(function() {
		this.duringAnimation = false;
	},this)


};


BUBBLE.Shooter.prototype.getNextColor = function() {

	var color;
	
	if (this.update == this.winUpdate) {
		return BUBBLE.rndBetween(0,4,'S - getNextColor winUpdate');
	};


	if (!this.active) {
		return BUBBLE.rndBetween(0,4,'S - getNextColor !active');
	}
	
	if (this.moves <= 1) {
		return null;
	}

	if (!this.random && typeof this.pattern[this.patternIndex] !== 'undefined') {
		return this.changeIfNotAvailable(this.pattern[this.patternIndex++]);

	}else {
		color = BUBBLE.rndBetween(0,4,'S - getNextColor else');
		if (this.lastColor == color) {
			color += BUBBLE.rndBetween(1,3,'S - getNextColor last==color');
		}
		return this.changeIfNotAvailable(color.toString());

	}
	
};

BUBBLE.Shooter.prototype.changeIfNotAvailable = function(color) {

	var color = color.toString();

	if (this.possibleColors.indexOf(color) == -1) {

		if (this.possibleColors.length == 0) {
			this.lastColor = '0';
			return '0';
		}



		var randomIndex = Math.floor(BUBBLE.rnd('S changeIfNotAvailable')*this.possibleColors.length);
		if (randomIndex == this.lastColor && this.possibleColors.length > 1) {
			randomIndex = (randomIndex+1)%this.possibleColors.length;
		}
		this.lastColor = this.possibleColors[randomIndex];
		return this.possibleColors[randomIndex];
	}else {
		this.lastColor = color;
		return color;
	}

};


BUBBLE.Shooter.prototype.changeColorOfBubble = function(bubble,color) {


if (!this.active) {
	//color = '0';
}
	bubble.color = color;
	if (color !== null) {
		bubble.loadTexture('bubblesheet','bubble_'+color);
	}else {
		bubble.loadTexture(null);
	}
}


BUBBLE.Shooter.prototype.checkCurrentColors = function() {

	var randomIndex;
	if (this.possibleColors.length == 0) return;

	if (this.bubble0.color != 'bomb' && this.bubble0.color != 'multicolor' && this.possibleColors.indexOf(this.bubble0.color) == -1 && this.bubble0.color !== null) {
		randomIndex = Math.floor(BUBBLE.rnd('S - checkCurrentColors')*this.possibleColors.length);
		this.changeColorOfBubble(this.bubble0,this.possibleColors[randomIndex]);
		this.bubble0fade.alpha = 1;
	}
	if (this.bubble1.color != 'bomb' && this.bubble1.color != 'multicolor' && this.possibleColors.indexOf(this.bubble1.color) == -1 && this.bubble1.color !== null) {
		randomIndex = Math.floor(BUBBLE.rnd('S - checkCurrentColors (2)')*this.possibleColors.length);
		this.changeColorOfBubble(this.bubble1,this.possibleColors[randomIndex]);
		this.bubble1fade.alpha = 1;
	}

}


BUBBLE.Shooter.prototype.checkIfInInputRect = function(pointer) {
	return pointer.worldX > this.inputRect.left && pointer.worldX < this.inputRect.right
			&& pointer.worldY > game.camera.y+this.inputRect.topMargin && pointer.worldY < this.inputRect.bottom
}

BUBBLE.Shooter.prototype.refill = function() {

	if (this.bubble0.color === null) {
		this.changeColorOfBubble(this.bubble0,this.getNextColor());
	}

	if (this.bubble1.color === null) {
		this.changeColorOfBubble(this.bubble1,this.getNextColor());
	}
}

BUBBLE.Shooter.prototype.shootAllRestInit = function() {
	this.update = this.winUpdate;
}


BUBBLE.Shooter.prototype.initSprites = function() {

	this.boosterHighlight = BUBBLE.makeImageL(0,-50,'shine',0.5,this);
	this.boosterHighlight.alphaTarget = 0;
	this.boosterHighlight.alpha = 0;
	this.boosterHighlight.shooter = this;
	this.boosterHighlight.update = function() {

		if (this.shooter.aimsBooster > 0 || this.shooter.bubble0.color == 'bomb' || this.shooter.bubble0.color == 'multicolor'
		|| this.shooter.bubble1.color == 'bomb' || this.shooter.bubble1.color == 'multicolor') {
			this.alphaTarget = 1;
		}else {
			this.alphaTarget = 0;
		}

		this.angle += 1;

		if (this.alpha < this.alphaTarget) {
			this.alpha += 0.05;
		}

		if (this.alpha > this.alphaTarget) {
			this.alpha -= 0.05;
		}

		this.alpha = game.math.clamp(this.alpha,0,1);

	};

	this.baseBack =	BUBBLE.makeImageL(0,-50,'cannon_back',[0.5,1],this);

	this.cannon = BUBBLE.makeImageL(0,-60,'cannon_01',[0.5,1],this);
	this.cannon.animating = false;
	this.cannon.animArray = ['cannon_00','cannon_01','cannon_02','cannon_03','cannon_02','cannon_01','cannon_00'];
	this.cannon.animIndex = 0;
	this.cannon.animTimer = 1;
	this.cannon.rotationTarget = 0;

	this.windowBack = BUBBLE.makeImageL(-75,-138,'cannon_windowback',0,this);

	this.bubble0 = BUBBLE.makeImageL(0,-95,'bubble_0',0.5,this);
	this.bubble0.color = '0';
	this.bubble1 = BUBBLE.makeImageL(-60,-73,'bubble_1',0.5,this)
	this.bubble1.color = '1';
	this.changeColorOfBubble(this.bubble0,this.getNextColor());
	this.changeColorOfBubble(this.bubble1,this.getNextColor());

	this.bubble0fade = BUBBLE.makeImageL(0,-95,'cannon_bubble_fade',0.5,this);
	this.bubble1fade = BUBBLE.makeImageL(-60,-73,'cannon_bubble_fade',0.5,this);

	this.bubbleLight = game.add.imageL(0,0,null);
	this.bubbleLight.anchor.setTo(0.5);
	this.add(this.bubbleLight);

	this.baseFront = BUBBLE.makeImageL(0,10,'cannon_front',[0.5,1],this);

	this.movesBg = BUBBLE.makeImageL(-70,-125,'shoot_counter_0b',0.5,this);

	this.movesTxt = game.add.bitmapTextL(-70,-130,'font',this.moves.toString(),35);
	this.movesTxt.anchor.setTo(0.5);
	this.movesTxt.cacheAsBitmap = true;
	this.movesTxt.updateCache();
	this.add(this.movesTxt);
	

	//this.lightsGroup = this.makeLightsGroup();
	//this.lightsGroup.bubbleLight = this.bubbleLight;

	this.swapButton = game.make.buttonL(57,-65,'bubble_change_balls',this.swapBubbles,this);
	this.swapButton.anchor.setTo(0.5);
	this.swapButton.hitArea = new Phaser.Circle(BUBBLE.l(-57),BUBBLE.l(10),BUBBLE.l(200));
	this.add(this.swapButton);
	
	this.shootAnimation = this.initShootAnimation();

}

BUBBLE.Shooter.prototype.initShootAnimation = function() {

	var shootAnim = BUBBLE.makeImageL(0,0,'shoot_0_0',[0.5,1]);
	this.add(shootAnim);

	shootAnim.kill();

	shootAnim.type = '0';
	shootAnim.animTimer = 2;
	shootAnim.frameIndex = 0;

	shootAnim.shoot = function(type) {
		if (this.alive) return;

		this.type = isNaN(parseInt(type)) ? '1' : type;
		this.frameIndex = 0;
		this.animTimer = 2;
		this.loadTexture('shootsheet','shoot_'+this.type+'_'+this.frameIndex);
		this.revive();

	};


	shootAnim.update = function() {

		this.rotation = this.parent.cannon.rotation;
		this.x = BUBBLE.utils.lengthdir_x(this.rotation-1.5708,BUBBLE.l(100),true);
		this.y = this.parent.cannon.y+BUBBLE.utils.lengthdir_y(this.rotation-1.5708,BUBBLE.l(100),true);


		if (!this.alive) return;

		if (this.animTimer-- == 0) {
			this.animTimer = 2;
			this.frameIndex++;

			if (this.frameIndex == 4) {
				this.kill();
			}else {
				this.loadTexture('shootsheet','shoot_'+this.type+'_'+this.frameIndex);
			}

		}

	};

	return shootAnim;

};


BUBBLE.Shooter.prototype.addMoves = function(amount) {

	this.moves += amount;
	this.movesTxt.setText(this.moves.toString());
	this.movesTxt.updateCache();
	this.refill();
	this.movesTxt.scale.setTo(1);
	game.add.tween(this.movesTxt.scale).to({x:1.3,y:1.3},250,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);

};


BUBBLE.Shooter.prototype.aimPointers = function(angle) {

	if (this.bubble0.color === null) return;

	if (!this.pointerGroup.pointerOffset) this.pointerGroup.pointerOffset = 0;
	this.pointerGroup.pointerOffset = (this.pointerGroup.pointerOffset+1) % BUBBLE.l(40);

	var velX = BUBBLE.utils.lengthdir_x(angle,BUBBLE.l(10),true);
	var drawVelX = velX;
	var velY = BUBBLE.utils.lengthdir_y(angle,BUBBLE.l(10),true);
	var clean = true;
	var pointer = null;
	var xx = this.x+BUBBLE.utils.lengthdir_x(this.cannon.rotation-1.5708,BUBBLE.l(160),true);
	var yy = this.y-BUBBLE.l(60)+BUBBLE.utils.lengthdir_y(this.cannon.rotation-1.5708,BUBBLE.l(160),true);
	var prevX, prevY;

	var drawX = this.x+BUBBLE.utils.lengthdir_x(this.cannon.rotation-1.5708,BUBBLE.l(160)+this.pointerGroup.pointerOffset,true);
	var drawY = this.y-BUBBLE.l(60)+BUBBLE.utils.lengthdir_y(this.cannon.rotation-1.5708,BUBBLE.l(160)+this.pointerGroup.pointerOffset,true);
	
	var lastVisible = 0;

	var visibleMod = 0;

	for (var i = 0; i < (this.aimsBooster > 0 ? 150 : 20); i++) {

		xx += velX;
		yy += velY;

		if (xx < this.minX || xx > this.maxX) {
			var offset = xx < this.minX ? this.minX-xx : this.maxX-xx;
			xx = game.math.clamp(xx,this.minX,this.maxX)+offset;
			velX *= -1;
		}

		drawX += drawVelX;
		drawY += velY;

		if (drawX < this.minX || drawX > this.maxX) {
			var offset = drawX < this.minX ? this.minX-drawX : this.maxX-drawX;
			drawX = game.math.clamp(drawX,this.minX,this.maxX)+offset;
			drawVelX *= -1;
		}
		


		if (clean && this.grid.isSpaceFreePx(xx,yy) 
				  && this.grid.isSpaceFreePx(xx-this.flyingBubbleRadius,yy)
				  && this.grid.isSpaceFreePx(xx+this.flyingBubbleRadius,yy)
				  && this.grid.isSpaceFreePx(xx,yy+this.flyingBubbleRadius)
				  && this.grid.isSpaceFreePx(xx+this.flyingBubbleRadius,yy-this.flyingBubbleRadius)
				  && yy > 0) {
			if (visibleMod % 4 == 0) {
				pointer = this.pointerGroup.getChildAt(lastVisible);
				pointer.loadTexture('ssheet','aim_dot_'+this.bubble0.color)
				pointer.x = drawX;
				pointer.y = drawY;
				pointer.visible = true;
				lastVisible++;
				if (lastVisible == 30) break;
			}
			visibleMod++;
			
		}else {
			clean = false;
			if (pointer) {
				pointer.visible = false;
			}
			break;
		}
	}

	for (var j = 0; j < 30; j++) {
		pointer = this.pointerGroup.getChildAt(j);
		pointer.alpha = Math.max(0,(lastVisible-j)/lastVisible);
	}

};
BUBBLE.ShooterEndless = function(grid) {

	BUBBLE.Shooter.call(this, grid);
	this.moves = 999999999;

	this.movesBg.destroy();
	this.movesTxt.destroy();
	this.gridOffset = 0; 

}

BUBBLE.ShooterEndless.prototype = Object.create(BUBBLE.Shooter.prototype);
BUBBLE.ShooterEndless.constructor = BUBBLE.ShooterEndless;

BUBBLE.ShooterEndless.prototype.shoot = function(angle,popout) {
	
	if (!popout) {
		if (!this.active || this.bubble0.color == null || this.duringAnimation) return;
	} 

	this.shootAnimation.shoot(this.bubble0.color);
	
	this.pointerGroup.alpha = 0;

	game.sfx.launch_ball.play();
	this.chargeUpSfx.stop();

	this.aimsBooster = Math.max(0,this.aimsBooster-1);

	BUBBLE.events.onBubbleShoot.dispatch(this.x,this.y-BUBBLE.l(60),angle,this.bubble0.color,popout);

	this.cannon.animating = true;

	this.bomb = false;
	this.multicolor = false;

	this.changeColorOfBubble(this.bubble0,this.bubble1.color);
	this.changeColorOfBubble(this.bubble1,this.getNextColor());

	if (this.bubble0.color === null) return;

	this.duringAnimation = true;

	this.bubble0.x = BUBBLE.l(-60);
	this.bubble0.y = BUBBLE.l(-55);
	this.bubble1.x = BUBBLE.l(-60);
	this.bubble1.y = BUBBLE.l(22);

	game.add.tween(this.bubble0).to({x:0,y:BUBBLE.l(-95)},500,Phaser.Easing.Sinusoidal.InOut,true)
	.onComplete.add(function() {
		this.duringAnimation = false;
	},this);

	game.add.tween(this.bubble1).to({x:BUBBLE.l(-60),y:BUBBLE.l(-55)},500,Phaser.Easing.Sinusoidal.InOut,true)
	.onComplete.add(function() {
		this.duringAnimation = false;
	},this)

};

BUBBLE.ShooterEndless.prototype.explode = function() {

	BUBBLE.events.fxExplosion.dispatch({x: this.x, y: this.y});
	game.time.events.add(700,function() {

		BUBBLE.events.fxExplosion.dispatch({x: this.x+BUBBLE.l(30), y: this.y-BUBBLE.l(30)});

	},this);

	game.time.events.add(1400,function() {

		BUBBLE.events.fxExplosion.dispatch({x: this.x-BUBBLE.l(30), y: this.y-BUBBLE.l(70)});
	},this);

};

BUBBLE.Timer = function() {
		
	Phaser.BitmapText.call(this,game,BUBBLE.l(320),BUBBLE.l(80),'font-outline',BUBBLE.utils.formatTime(BUBBLE.settings.time),60);


		this.fixedToCamera = true;
		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(320);
		this.cameraOffset.y = BUBBLE.horizontal ? BUBBLE.l(-5) : BUBBLE.l(80);
		
		this.alpha = 0.5;
		this.anchor.setTo(0.5,0);
		this.time = BUBBLE.settings.time;
		this.timeInterval = 60;
		this.active = false;
		this.update = function() {
			if (BUBBLE.pause) return;
			if (this.wl.length > 0) return;
            if (!this.active) return;
			
			this.timeInterval--
			if (this.timeInterval == 0 && this.time > 0) {
				this.timeInterval = 60;
				this.time--;
				this.setText(BUBBLE.utils.formatTime(this.time));
				if (this.time == 0) {
					game.state.getCurrentState().endGame();

				}
			}
		}

		BUBBLE.events.onLevelUp.add(function() {
			this.time += BUBBLE.settings.timeRefill;
		},this);
		
		BUBBLE.events.onScreenResize.add(function() {
			this.cameraOffset.x = game.width*0.5;
			this.cameraOffset.y = BUBBLE.horizontal ? BUBBLE.l(-5) : BUBBLE.l(80);
		},this)

		game.add.existing(this)
	
};

BUBBLE.Timer.prototype = Object.create(Phaser.BitmapText.prototype);


BUBBLE.TopFxLayer = function(grid,endless) {

	
	Phaser.Group.call(this,game);

	this.grid = grid;
	this.init(this.grid,endless);

	BUBBLE.events.fxMatchParticle.add(this.initMatchParticle,this);
	BUBBLE.events.fxMatchParticleNew.add(this.initMatchParticleNew,this);
	BUBBLE.events.fxCloudParticle.add(this.initCloudParticle,this);
	BUBBLE.events.fxChameleonColorChange.add(this.initChameleonColorChange,this);
	BUBBLE.events.fxExplosion.add(this.initExplosion,this);

}

BUBBLE.TopFxLayer.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.TopFxLayer.constructor = BUBBLE.BottomFxLayer;


BUBBLE.TopFxLayer.prototype.initExplosion = function(bubble) {

	var mainExplosion = this.getFreeBubble(); 

	game.sfx.explosion_2.play();
	
	mainExplosion.initExplosionMain(bubble);
	this.getFreeBubble().initExplosionPart(bubble,'fire2',60,30);
	this.getFreeBubble().initExplosionPart(bubble,'fire2',180,30);
	this.getFreeBubble().initExplosionPart(bubble,'fire2',320,30);

	this.getFreeBubble().initExplosionPart(bubble,'fire',0,20);
	this.getFreeBubble().initExplosionPart(bubble,'fire',120,20);
	this.getFreeBubble().initExplosionPart(bubble,'fire',240,20);

	mainExplosion.bringToTop();

};

BUBBLE.TopFxLayer.prototype.initCloudParticle = function(bubble) {
	this.getFreeBubble().initCloudParticle(bubble);
}

BUBBLE.TopFxLayer.prototype.initMatchParticle = function(bubble) {
	this.getFreeBubble().initMatchParticle(bubble);
}

BUBBLE.TopFxLayer.prototype.initMatchParticleNew = function(bubble) {
	this.getFreeBubble().initMatchParticleNew(bubble);
}

BUBBLE.TopFxLayer.prototype.initChameleonColorChange = function(bubble) {
	this.getFreeBubble().initChameleonColorChange(bubble);
}

BUBBLE.TopFxLayer.prototype.childrenUpdate = function() {

	var i = this.children.length;

    while (i--)
    {
        this.children[i].update();
    }

};


BUBBLE.TopFxLayer.prototype.getFreeBubble = function() {
	if (this.endless) {
		return this.getFirstDead() || this.add(new BUBBLE.BubbleFxEndless(this.grid));
	}else {
		return this.getFirstDead() || this.add(new BUBBLE.BubbleFx());
	}
};

BUBBLE.TopFxLayer.prototype.init = function(grid,endless) {

	

	this.grid = grid;
	this.endless = endless || false;
	
	
	for (var i = 0 ; i < 5; i++) {
		if (endless) {
			
			this.add(new BUBBLE.BubbleFxEndless(grid));
		}else {
			this.add(new BUBBLE.BubbleFx());
		}
	}

	if (grid.ghostMode) {
		this.x = grid.x;
		this.y = grid.y;
		this.update = function() {
			this.rotation = this.grid.rotation;
			this.childrenUpdate();
		}

	}
};



UnderBurstAnimation = function() {

	Phaser.Group.call(this,game);


	this.makeParticle(0,0,'burst_glow',3,1,0.15);
	this.makeParticle(39,-6,'burst_glow',7,1,0.15);
	this.makeParticle(5,-39,'burst_glow',2,1,0.15);
	this.makeParticle(-38,6,'burst_glow',1,1,0.15);
	this.makeParticle(-11,34,'burst_glow',4,1,0.15);

	this.makeParticle2(-20,-24,'burst_cros',3,1,0.15);
	this.makeParticle2(26,8,'burst_cros',0,1,0.15);
	this.makeParticle2(0,23,'burst_cros',6,1,0.15);

}

UnderBurstAnimation.prototype = Object.create(Phaser.Group.prototype);

UnderBurstAnimation.prototype.updateAnim = UnderBurstAnimation.prototype.update;

UnderBurstAnimation.prototype.update = function() {};

UnderBurstAnimation.prototype.makeParticle = function(x,y,sprite,delay,maxScale,scaleDelta) {

	var x = x+100;
	var y = y+100;

	var part = BUBBLE.makeImageL(x,y,sprite,0.5,this);
	part.scale.setTo(0);
	part.delay = delay;
	part.maxScale = maxScale;
	part.scaleDelta = scaleDelta;

	part.update = function() {
		if (this.delay-- > 0) return;
		
		this.scale.setTo(this.scale.x+this.scaleDelta);

		if (this.scale.x > this.maxScale) {
			this.scale.setTo(this.maxScale);
			this.scaleDelta *= -1;
		}

		if (this.scale.x < 0) {
			this.destroy();
		}

	};

};


UnderBurstAnimation.prototype.makeParticle2 = function(x,y,sprite,delay,maxScale,scaleDelta) {

	var x = x+100;
	var y = y+100;

	var part = BUBBLE.makeImageL(x,y,sprite,0.5,this);
	part.scale.setTo(0);
	part.delay = delay;
	part.maxScale = maxScale;
	part.scaleDelta = scaleDelta;


	part.angleDelta = (Math.random()*8)-4;
	part.angleDelta += part.angleDelta;
	part.angleDelta += part.angleDelta;

	part.update = function() {

		

		if (this.delay-- > 0) return;

		//this.angle += this.angleDelta;

		this.scale.setTo(this.scale.x+this.scaleDelta);

		if (this.scale.x > this.maxScale) {
			this.scale.setTo(this.maxScale);
			this.scaleDelta *= -1;
		}

		if (this.scale.x < 0) {
			this.destroy();
		}

	};

};
BUBBLE = BUBBLE || {};

gDBG = [];

BUBBLE.config = {
    configs: {
        hd: 1,
        sd: 0.6,
        ssd: 0.4
    },
    current: 0,
    multiplier: 1,

    setConfig: function(name) {
        this.multiplier = this.configs[name];
        this.current = name;
    }
};

BUBBLE.seed = 1;

BUBBLE.rnd = function random(dbg) {
    var x = Math.sin(BUBBLE.seed++) * 10000;
    gDBG.push(dbg+' seed: '+BUBBLE.seed);
    return x - Math.floor(x);
};

BUBBLE.rndBetween = function(min,max,dbg) {

  return Math.floor(BUBBLE.rnd(dbg)*(max-min+1))+min;

};

BUBBLE.l = function(value) {
    return Math.floor(value*BUBBLE.config.multiplier);
};

BUBBLE.lnf = function(value) {
    return value*BUBBLE.config.multiplier;
};

BUBBLE.detectConfig = function() {

	var getAndroidVersion = function(ua) {
    ua = (ua || navigator.userAgent).toLowerCase(); 
    var match = ua.match(/android\s([0-9\.]*)/);
    return match ? match[1] : false;
	};

  var android_version = getAndroidVersion();

  game.ie10 = navigator.userAgent.indexOf("MSIE 10.0") > -1;

   if (game.device.desktop) {
      BUBBLE.config.setConfig('hd');
  }else if (android_version && parseFloat(android_version) < 4.4) {
      BUBBLE.config.setConfig('ssd');
  }else {
      BUBBLE.config.setConfig('sd');
  }  

};

BUBBLE.dbgUnlockAllLevels = function() {

    BUBBLE.saveState.data.levels = [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];
    BUBBLE.events.onChangeLevel.dispatch('MenuWorld');

};

BUBBLE.utils = {

    getMaxOfArray: function (numArray) {
        return Math.max.apply(null, numArray);
    },

    lengthdir_x: function(angle, length, rads) {
      var rads = rads || false;
      if (rads) {
        return Math.cos(angle) * length;
      }else {
        return Math.cos(game.math.degToRad(angle)) * length;
      }
    },

    lengthdir_y: function(angle, length, rads) {
      var rads = rads || false;
      if (rads) {
        return Math.sin(angle) * length;
      }else {
        return Math.sin(game.math.degToRad(angle)) * length;
      }
    },

    lerp: function(a,b,t) {
        return a+t*(b-a);
    },

    formatTime: function(sec) {
        var m = Math.floor(sec/60);
    	var s = sec - (m*60);
    	return m+':'+('0'+s).slice(-2);
    },

    shuffle: function (array) {

        for (var i = array.length - 1; i > 0; i--)
        {
            var j = Math.floor(BUBBLE.rnd('utils shuffle') * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;

    }

};


BUBBLE.makeImageL = function(x,y,image,anchor,groupToAdd) {
	var image = game.make.imageL(x,y,image);

	if (anchor) {
		if (typeof anchor == 'number') {
			image.anchor.setTo(anchor);
		}else {
			image.anchor.setTo(anchor[0],anchor[1]);
		}
	}

	if (groupToAdd) {
  	(groupToAdd.add || groupToAdd.addChild).call(groupToAdd,image);
  }else {
    game.world.add(image);
  }

	return image;
};

BUBBLE.checkSheet = function(frame) {
    if (game.cache.getFrameData('ssheet').getFrameByName(frame)) {
        return 'ssheet';
    }else if (game.cache.getFrameData('explosionsheet').getFrameByName(frame)) {
        return 'explosionsheet';
    }else if (game.cache.getFrameData('bubblesheet').getFrameByName(frame)) {
        return 'bubblesheet';
    }else if (game.cache.getFrameData('burstsheet').getFrameByName(frame)) {
        return 'ballburst';
    }else if (game.cache.getFrameData('shootsheet').getFrameByName(frame)) {
        return 'shootsheet';
    }else {
        return '';
    }

};

BUBBLE.stopTweens = function(obj) {
    game.tweens._tweens.forEach(function(tween) {
        if (tween.target == obj) tween.stop();
    });
};

Phaser.GameObjectCreator.prototype.imageL = function(x, y, frame) {
    var sheet = BUBBLE.checkSheet(frame);
    if (sheet == '') {
        return game.make.image(BUBBLE.l(x),BUBBLE.l(y),frame);
    } else {
        return game.make.image(BUBBLE.l(x),BUBBLE.l(y),sheet,frame);
    }
};

Phaser.GameObjectCreator.prototype.spriteL = function(x, y, frame) {

    var sheet = BUBBLE.checkSheet(frame);
    if (sheet == '') {
        return game.make.sprite(BUBBLE.l(x),BUBBLE.l(y),frame);
    } else {
        return game.make.sprite(BUBBLE.l(x),BUBBLE.l(y),sheet,frame);
    }
};

Phaser.GameObjectCreator.prototype.bitmapTextL = function(x, y, font, text, size, align)  {
    return game.make.bitmapText(BUBBLE.l(x), BUBBLE.l(y), font, text, BUBBLE.l(size), align);
};

Phaser.GameObjectCreator.prototype.buttonL = function(x, y, frame, callback, callbackContext, overFrame, outFrame, downFrame, upFrame)  {
    var button = game.make.button(BUBBLE.l(x), BUBBLE.l(y), null, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
    button.loadTexture('ssheet',frame);
    return button;
};


Phaser.GameObjectFactory.prototype.imageL = function(x, y, frame) {
    var sheet = BUBBLE.checkSheet(frame);
    if (sheet == '') {
        return game.add.image(BUBBLE.l(x),BUBBLE.l(y),frame);
    } else {
        return game.add.image(BUBBLE.l(x),BUBBLE.l(y),sheet,frame);
    }
};

Phaser.GameObjectFactory.prototype.spriteL = function(x, y, frame) {
    var sheet = BUBBLE.checkSheet(frame);
    if (sheet == '') {
        return game.add.sprite(BUBBLE.l(x),BUBBLE.l(y),frame);
    } else {
        return game.add.sprite(BUBBLE.l(x),BUBBLE.l(y),sheet,frame);
    }
};


Phaser.GameObjectFactory.prototype.bitmapTextL = function(x, y, font, text, size, align)  {
    return game.add.bitmapText(BUBBLE.l(x), BUBBLE.l(y), font, text, BUBBLE.l(size), align);
};

Phaser.GameObjectFactory.prototype.buttonL = function(x, y, frame, callback, callbackContext, overFrame, outFrame, downFrame, upFrame)  {
    var button = game.add.button(BUBBLE.l(x), BUBBLE.l(y), null, callback, callbackContext, overFrame, outFrame, downFrame, upFrame);
    button.loadTexture('ssheet',frame);
    return button;
};

Phaser.RectangleL = function(x,y,width,height) {
    return new Phaser.Rectangle(BUBBLE.l(x),BUBBLE.l(y),BUBBLE.l(width),BUBBLE.l(height));
};

BUBBLE.WindowLayer = function() {
	
	this.fadeImg = game.add.image(0,0,'ssheet','window_shader');
	this.fadeImg.fixedToCamera = true;
	this.fadeImg.cameraOffset.x = -5;
	this.fadeImg.width = game.width+10;
	this.fadeImg.height = game.height;
	this.fadeImg.alpha = 0;

	Phaser.Group.call(this, game);
	this.fixedToCamera = true;

	this.resize();

	this.prevLength = 0;
	this.dispatch = false;

	this.queue = [];

	BUBBLE.events.onScreenResize.add(this.resize,this);
	BUBBLE.events.onWindowOpened.add(this.cacheWindow,this);
	BUBBLE.events.onWindowClosed.add(this.onWindowClosed,this);
	BUBBLE.events.pushWindow.add(this.pushWindow,this);

	this.onAllWindowsClosed = new Phaser.Signal();

}

BUBBLE.WindowLayer.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.WindowLayer.constructor = BUBBLE.WindowLayer;

BUBBLE.WindowLayer.prototype.resize = function() {
	this.cameraOffset.x = Math.floor(game.width*0.5);
	this.cameraOffset.y = Math.floor(game.height*0.5);

	this.fadeImg.cacheAsBitmap = false;
	this.fadeImg.width = game.width+10;
	this.fadeImg.height = game.height+10;
	this.fadeImg.cacheAsBitmap = true;
}

BUBBLE.WindowLayer.prototype.update = function() {

	if (this.prevLength > 0 && this.length == 0) {
		this.dispatch = true;
	}

	if (this.length == 0) {
		this.fadeImg.alpha = Math.max(0,this.fadeImg.alpha-0.05);
		if (this.dispatch && this.fadeImg.alpha == 0) {
			BUBBLE.events.onWindowClosed.dispatch(this);
			this.dispatch = false;
		}
	}else {
		if (!this.children[0].stopFade) {
			this.fadeImg.alpha = Math.min(1,this.fadeImg.alpha+0.05);
		}
	}

	if (this.length > 0) {
		this.children[0].update();
	}
}

BUBBLE.WindowLayer.prototype.onWindowClosed = function() {

	

	if (this.queue.length > 0) {
		var args = this.queue.splice(0,1);
		
		new BUBBLE.Window(args[0]);
	}else {
		this.onAllWindowsClosed.dispatch();
	}

};

BUBBLE.WindowLayer.prototype.cacheWindow = function(win) {

	this.add(win);

};

BUBBLE.WindowLayer.prototype.pushWindow = function(type,unshift) {

	

	if (this.queue.length == 0 && this.children.length == 0) {
		
		new BUBBLE.Window(type);
	}else {
		
		if (unshift) {
			this.queue.unshift(type);
		}else {
			this.queue.push(type);
		}
		
	}

};



BUBBLE.WorldMap = function(lvl) {

	

	Phaser.Group.call(this, game);

	this.x = game.width * 0.5;
	this.y = game.height;


	this.bgArray = [];
	this.bgHeight = 0;

	BUBBLE.settings.worldMap.forEach(function(elem,i) {
		this.bgArray[i] = game.add.image(0,i == 0 ? 0 : this.bgArray[i-1].top,'map'+i);
		this.bgArray[i].anchor.setTo(0.5,1);
		this.bgArray[i].scale.setTo(1.5);
		this.bgArray[i].autoCull = true;
		this.bgHeight += this.bgArray[i].height;
	},this);


	this.addMultiple(this.bgArray);

	/*
	this.bg = game.add.imageL(0,0,'map_100');
	this.bg.anchor.setTo(0.5,1);
	this.bg.scale.setTo(1.5);
	//this.bg.cacheAsBitmap = true;
	this.add(this.bg);
	*/

	


	this.mapPointHl = game.make.imageL(0,0,'mapPoint_hl');
	this.add(this.mapPointHl);
	
	
	this.lvlButtonGroup = game.add.group();
	this.add(this.lvlButtonGroup);
	this.initLvlButtons();
	//this.lvlButtonGroup.visible = false;


	this.makeTeddy(BUBBLE.saveState.getLastLevel());
	

	this.prevX = null;
	this.prevY = null;
	this.targetY = game.height;
	this.inputLocked = false;

	this.resize();

	this.centerOn(this.teddy);

	this.checkTimer = 5;

	this.checkVisiblity();


	if (BUBBLE.config.current != 'ssd') {
		this.easternAnimation = new BUBBLE.BgAnimEastern(0,-267);
		this.add(this.easternAnimation);
		this.egyptAnimation = new BUBBLE.BgAnimEgypt(50,-2293);
		this.add(this.egyptAnimation);
		this.vulcanoAnimation = new BUBBLE.BgAnimVulcano(-240,-3030);
		this.add(this.vulcanoAnimation);
		this.planetAnimation = new BUBBLE.BgAnimPlanet(6,-3580);
		this.add(this.planetAnimation);
		this.waterfallAnimation = new BUBBLE.BgAnimWaterfall(170,-4600);
		this.add(this.waterfallAnimation);
		this.chaineseWallAnimation = new BUBBLE.BgAnimChineseWall(20,-5610);
		this.add(this.chaineseWallAnimation);
		this.iceIslandAnimation = new BUBBLE.BgAnimIceIsland(-150,-5000);
		this.add(this.iceIslandAnimation);
		if (BUBBLE.config.current == 'hd') {
			this.westAnimation = new BUBBLE.BgAnimWest(-253,-1735);
			this.add(this.westAnimation);
		}
	}

	BUBBLE.events.onScreenResize.add(this.resize,this);
	BUBBLE.events.onWindowOpened.add(this.disableInput,this);
	BUBBLE.events.onWindowClosed.add(this.enableInput,this);


}

BUBBLE.WorldMap.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.WorldMap.constructor = BUBBLE.WorldMap;


BUBBLE.WorldMap.prototype.update = function() {

	var i = this.children.length;
  while (i--)
  {
    this.children[i].update();
  }

	
	if (!this.inputLocked && game.input.activePointer.isDown) {
		if (this.prevY === null) {
			this.prevY = game.input.activePointer.y
			this.prevX = game.input.activePointer.x;
		}else {
			this.targetX -= (this.prevX-game.input.activePointer.x)*3;
			this.targetY -= (this.prevY-game.input.activePointer.y)*3;
			this.prevY = game.input.activePointer.y;
			this.prevX = game.input.activePointer.x;
		}

	}else {
		this.prevY = null;
	}


	this.checkVisiblity();
	/*if (--this.checkTimer == 0) {
		this.checkTimer = 5;
		this.checkVisiblity();
	}*/

	this.targetX = game.math.clamp(Math.floor(this.targetX),this.positionBounds.xMin,this.positionBounds.xMax);
	this.targetY = game.math.clamp(Math.floor(this.targetY),this.positionBounds.yMin,this.positionBounds.yMax+game.world.bounds.y);

	this.x = Math.floor(BUBBLE.utils.lerp(this.x,this.targetX,0.05));
	this.y = Math.floor(BUBBLE.utils.lerp(this.y,this.targetY,0.05));

	//this.bg.cameraOffset.y = game.height-(game.height-this.bg.height)*((this.y-this.positionBounds.yMin)/(this.positionBounds.yMax-this.positionBounds.yMin));

	
}


BUBBLE.WorldMap.prototype.initLvlButtons = function() {

	BUBBLE.levels.forEach(function(lvl,lvl_index) {

		var button = new BUBBLE.LevelButton(lvl.worldMapPosition,lvl_index,this.editorMode ? true : false);
		this.lvlButtonGroup.add(button);

	},this);



}


BUBBLE.WorldMap.prototype.getPositionForLevel = function(x,y) {

	return [x-this.x,y - this.y];

}


BUBBLE.WorldMap.prototype.resize = function() {

	//this.x = game.world.bounds.x+game.width * 0.5;
	//this.bg.cameraOffset.x = game.width*0.5;
	
	var center = game.world.bounds.x+game.width * 0.5;
	center = Math.floor(center);
	var width = Math.max(0,((this.bgArray[0].width*0.8)-game.width)*0.5);
	width = Math.floor(width);
	this.positionBounds = {center: center, 
		"width": width, 
		xMin: center - width, 
		xMax: center + width, 
		yMin: game.height, 
		yMax: this.bgHeight};

	this.targetX = center;

	this.centerOn(this.teddy);

	this.checkVisiblity();

}

BUBBLE.WorldMap.prototype.disableInput = function() {

	this.lvlButtonGroup.forEach(function(child) {
		child.input.enabled = false;
	});
	this.inputLocked = true;

}

BUBBLE.WorldMap.prototype.enableInput = function() {
	this.lvlButtonGroup.forEach(function(child) {
		if (!child.locked) child.input.enabled = true;
	});
	this.inputLocked = false;
}

BUBBLE.WorldMap.prototype.makeTeddy = function(lastLevel) {

	this.teddy = game.make.imageL(0,0,'teddy');
	this.teddy.scale.setTo(0.3);
	this.teddy.anchor.setTo(0.5,1);
	this.teddy.cacheAsBitmap = true;
	var lastButton = this.lvlButtonGroup.children[lastLevel];
	this.teddy.x = lastButton.x;
	this.teddy.y = lastButton.y-BUBBLE.l(50);
	this.mapPointHl.anchor.setTo(0.5,0.5);
	this.mapPointHl.x = lastButton.x;
	this.mapPointHl.y = lastButton.y;
	this.mapPointHl.alpha = 0.5;
	game.add.tween(this.mapPointHl).to({alpha: 1},500,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
	game.add.tween(this.teddy).to({y: lastButton.y-BUBBLE.l(20)},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
	this.add(this.teddy);

}

BUBBLE.WorldMap.prototype.centerOn = function(element) {

	var center = game.world.bounds.x+game.width * 0.5;
	this.x = center - element.x;
	this.targetX = this.x;
	this.y = game.height - element.y - (game.height*0.5);
	this.targetY = this.y;

	this.x = game.math.clamp(Math.floor(this.x),this.positionBounds.xMin,this.positionBounds.xMax);
	this.y = game.math.clamp(Math.floor(this.y),this.positionBounds.yMin,this.positionBounds.yMax);
	this.targetX = game.math.clamp(Math.floor(this.targetX),this.positionBounds.xMin,this.positionBounds.xMax);
	this.targetY = game.math.clamp(Math.floor(this.targetY),this.positionBounds.yMin,this.positionBounds.yMax);

}

BUBBLE.WorldMap.prototype.checkVisiblity = function() {

	//dolna granica
	var minY = (this.y - game.height)*-1;
	//gorna
	var maxY = minY - game.height;


	len = this.lvlButtonGroup.length;
	for (i = 0; i < len; i++) {
		child = this.lvlButtonGroup.children[i];
		if (child.y - child.height > minY || child.y + child.height < maxY) {
			child.visible = false;
		}else {
			child.visible = true;
		}
	}


}
BUBBLE.Bubble = function(cx,cy,x,y,type) {

	Phaser.Sprite.call(this,game,x,y,null);

	this.state = game.state.getCurrentState();

	this.anchor.setTo(0.5);
	this.cell = new Phaser.Point(cx,cy);
	this.cellX = cx;
	this.cellY = cy;
	this.orgX = x;
	this.orgY = y;
	this.type = type;
	this.checked = false;
	this.bounceable = true;
	this.bombResistant = false;
	this.special = false;
	this.animated = false;
	this.collCircle = new Phaser.Circle(x,y,BUBBLE.l(58));

	this.duringBounce = false;

	this.velX = 0;
	this.velY = 0;
	this.pullX = 0;
	this.pullY = 0;

	this.gridPosition = new Phaser.Point(x,y);
	this.outsidePosition = new Phaser.Point(x,y);

}

BUBBLE.Bubble.prototype = Object.create(Phaser.Sprite.prototype);
BUBBLE.Bubble.constructor = BUBBLE.Bubble;

BUBBLE.Bubble.prototype.isMatchingType = function(type) {
	return this.type == type;
};

BUBBLE.Bubble.prototype.clearCheck = function() {
	this.checked = false;
};

BUBBLE.Bubble.prototype.checkType = function(type) {
	if (this.checked) {
		return false;
	}else {
		this.checked = true;
		return this.isMatchingType(type);
	}
};

BUBBLE.Bubble.prototype.vanish = function() {
	this.grid.vanishBubble(this);
};


BUBBLE.Bubble.prototype.onPreciseHit = function(bubble) {};

BUBBLE.Bubble.prototype.onHit = function() {};

BUBBLE.Bubble.prototype.onPut = function() {};

BUBBLE.Bubble.prototype.onMatchHit = function() {};

BUBBLE.Bubble.prototype.getWorldPosition = function() {
	return this.grid.cellToOutsidePx(this.cellX,this.cellY);
}

BUBBLE.Bubble.prototype.getWorldAngle = function() {
	if (this.parent === null) return 0;

	return this.parent.angle+this.angle;
}

BUBBLE.Bubble.prototype.startBounce = function(velX,velY) {

	if (!this.bounceable) return;
	if (this.keyhole) return;	

	
	BUBBLE.events.onBubbleStartBounce.dispatch(this);
	


	this.duringBounce = true;
	this.velX = velX;
	this.velY = velY;

}

BUBBLE.Bubble.prototype.update = function() {
	if (!this.alive) return;
	this.bounceUpdate();
}


BUBBLE.Bubble.prototype.bounceUpdate = function() {
	if (this.duringBounce && this.alive) {

		this.x += this.velX;
		this.y += this.velY;
		this.velX *= 0.9;
		this.velY *= 0.9;

		this.pullX = (this.x - this.orgX) * -0.2;
		this.pullY = (this.y - this.orgY) * -0.2;
		this.x += this.pullX;
		this.y += this.pullY;


		if (Math.abs(this.velX) < 0.1 && Math.abs(this.velY) < 0.1 && 
			Math.abs(this.x - this.orgX) < 1 && Math.abs(this.y - this.orgY) < 1) {
			this.x = this.orgX;
			this.y = this.orgY
			this.duringBounce = false;
			BUBBLE.events.onBubbleFinishBounce.dispatch(this);
		}

	}
};

BUBBLE.Bubble.prototype.onMatch = function() {

	this.update = this.onMatchUpdate;
	this.grid.moveToMatchGroup(this);
	BUBBLE.events.fxMatchParticle.dispatch(this);
	BUBBLE.events.fxCircleParticle.dispatch(this);
	BUBBLE.events.fxUnderMatch.dispatch(this);
	
}

BUBBLE.Bubble.prototype.onMatchUpdate = function() {

	this.scale.setTo(this.scale.x+0.02);
	this.alpha -= 0.05;
	if (this.alpha < 0) this.destroy();
	
}


BUBBLE.Bubble.prototype.onPopOut = function() {

	this.update = this.popOutUpdate;
	
	this.gravity = BUBBLE.lnf(0.25);
	this.initVelX = BUBBLE.lnf(4);
	this.initVelY = BUBBLE.lnf(-5);
	this.minX = BUBBLE.l(40);
	this.maxX = BUBBLE.l(600);
	this.velX = (-0.5*this.initVelX)+BUBBLE.rnd('B - onPopOut velX')*this.initVelX;
	this.velY = BUBBLE.rnd('B - onPopOut - velY')*this.initVelY;

	this.grid.moveToPopOutGroup(this);

}

BUBBLE.Bubble.prototype.popOutUpdate = function() {
	if (!this.alive) return;
	
	this.x += this.velX;
	this.y += this.velY;
	this.velY += this.gravity;
	this.angle += this.velX;

	if (this.x < this.minX || this.x > this.maxX) {
		game.sfx.hit.play();
		var offset = this.x < this.minX ? this.minX-this.x : this.maxX-this.x;
		this.x = game.math.clamp(this.x,this.minX,this.maxX)+offset;
		this.velX *= -1;
	}

	this.collCircle.x = this.x;
	this.collCircle.y = this.y;
	if (this.y > BUBBLE.potBottomY+this.collCircle.radius) {
		BUBBLE.events.onPopOutDestroyed.dispatch(this);
		this.destroy();
	}
	
}

BUBBLE.BubbleAnimal =  function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_animal_'+BUBBLE.rndBetween(0,2,'BAnimal constr'));
	this.special = true;
	this.animated = false;
	this.bombResistant = true;
	this.type = 'ANIMAL';

}

BUBBLE.BubbleAnimal.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleAnimal.prototype.checkType = function() {return false};

BUBBLE.BubbleAnimal.prototype.onPopOut = function() {

	this.update = this.popOutUpdate;
	BUBBLE.events.onAnimalFree.dispatch(this);
	this.grid.moveToPopOutGroup(this);
}

BUBBLE.BubbleAnimal.prototype.popOutUpdate = function() {
	this.scale.setTo(this.scale.x+0.05);
	this.alpha -= 0.03;
	if (this.alpha <= 0) {
		this.destroy();
	}
}
BUBBLE.BubbleBlackHole =  function(cx,cy,x,y,grid) {
	BUBBLE.Bubble.apply(this,arguments);
		
	this.blackholeImg = game.add.image(0,0,'bubblesheet','bubble_blackhole');
	this.blackholeImg.anchor.setTo(0.5);
	this.blackholeImg.angle = Math.random()*360;

	this.addChild(this.blackholeImg);

	this.special = true;
	this.animated = true;
	this.destructable = false;
	this.bombResistant = true;

	this.type = "blackhole";

	this.hp = 3;

	this.dying = false;

	this.bubbles = [];

	this.scaleVel = 0;

}

BUBBLE.BubbleBlackHole.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleBlackHole.prototype.checkType = function() {return false};

BUBBLE.BubbleBlackHole.prototype.update = function() {
	this.blackholeImg.angle+= 0.5;

	if (this.dying) {

		this.scale.setTo(this.scale.x-0.04);

		if (this.scale.x <= 0) {
			this.destroy();
		}

	}else {
		this.blackholeImg.scale.setTo(Math.max(1,this.blackholeImg.scale.x+this.scaleVel));
		this.scaleVel = game.math.clamp(this.scaleVel-0.08,-0.01,0.01);
	}
	

	this.bubbles.forEach(this.processBubbleImposter,this);
}

BUBBLE.BubbleBlackHole.prototype.onPreciseHit = function(bubble) {

	

	if (bubble.type == 'bomb') {
		this.dying = true;
		this.grid.moveToPopOutGroup(this);
		return;
	}

	if (!bubble.alive) return;

	this.makeBubbleImposter(bubble);

	this.hp--;

	bubble.vanish();

	if (this.hp == 0) {
		this.onPopOut();
	}

}

BUBBLE.BubbleBlackHole.prototype.processBubbleImposter = function(bubble) {


	bubble.velX *= 0.9;
	bubble.velY *= 0.9;

	bubble.velX += bubble.x*-0.15;
	bubble.velY += bubble.y*-0.15;
	bubble.x += bubble.velX;
	bubble.y += bubble.velY;

	bubble.scale.setTo(bubble.scale.x-0.01);
	if (bubble.scale.x < 0.002) {
		bubble.kill();
		if (this.hp <= 0) {

		}
	}

	this.scaleVel += 0.001;

};

BUBBLE.BubbleBlackHole.prototype.makeBubbleImposter = function(bubble) {

	//dystans od srodka
	bubble.x = bubble.x-this.x;
	bubble.y = bubble.y-this.y;

	var bubbleImposter = game.make.image(bubble.x,bubble.y,'bubblesheet','bubble_'+bubble.type);
	bubbleImposter.anchor.setTo(0.5);
	bubbleImposter.velX = bubble.velX;
	bubbleImposter.velY = bubble.velY;

	game.sfx.blackhole.play();

	this.bubbles.push(bubbleImposter);
	this.addChild(bubbleImposter);

}

BUBBLE.BubbleBlackHole.prototype.trueDestroy = BUBBLE.BubbleBlackHole.prototype.destroy;

BUBBLE.BubbleBlackHole.prototype.onHit = function(bubble) {
	if (bubble.type == 'bomb') {
		this.dying = true;
		this.grid.moveToPopOutGroup(this);
		return;
	}
}



BUBBLE.BubbleBlackHole.prototype.onPopOut = function() {

	this.dying = true;
	this.grid.moveToPopOutGroup(this);

}
BUBBLE.BubbleBlocker =  function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_blocker');
	this.special = true;
	this.type = "black";

	//this.angle = BUBBLE.rnd()*360;

}

BUBBLE.BubbleBlocker.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleBlocker.prototype.checkType = function() {return false};
BUBBLE.BubbleBomb = function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_bomb');
	this.type = 'bomb';
}

BUBBLE.BubbleBomb.prototype = Object.create(BUBBLE.Bubble.prototype);
BUBBLE.BubbleBomb.prototype.onPut = function() {

	//BUBBLE.events.fxBlastCircleParticle.dispatch(this);

	BUBBLE.saveState.data.sawBomb = true;
	BUBBLE.saveState.save();
	
	BUBBLE.events.fxExplosion.dispatch(this);

	this.grid.popOutBubbles(this.getToPopOut());

	//var pos = this.getWorldPosition();

	//this.state.aboveUI.add(new BUBBLE.Explosion(pos[0],pos[1],true,true));


	this.vanish();

};

BUBBLE.BubbleBomb.prototype.getToPopOut = function() {

	var result = [];
	var allBubbles = Array.prototype.concat(this,this.grid.getNeighbours(this.cellX,this.cellY),this.grid.getOuterRing(this.cellX,this.cellY));
	allBubbles.forEach(function(child) {
		if (!child.bombResistant && this.grid.isBelowLock(child)) {
			result.push(child);
		}
	},this);

	return result;

};
BUBBLE.BubbleChain =  function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	this.type = "chain";
	this.visible = false;
	this.bouncable = false;

	BUBBLE.events.unlockLock.add(function(unlockY) {
		
		if (this.cellY == unlockY) {
			this.vanish();
		}

	},this);

}

BUBBLE.BubbleChain.prototype = Object.create(BUBBLE.Bubble.prototype);
BUBBLE.BubbleChameleon =  function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	
	this.special = 'cham';
	this.type = BUBBLE.rndBetween(0,4,'B - Cham const').toString();
	this.loadTexture('bubblesheet','cham_'+this.type);
	this.animated = false;


	BUBBLE.events.onMoveDone.add(this.onMoveDone, this);

}

BUBBLE.BubbleChameleon.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleChameleon.prototype.onMoveDone = function(possibleColors) {

	if (!this.alive) return;
	if (possibleColors.length == 0) return;
	if (this.parent == this.grid.matchGroup || this.parent == this.grid.popOutGroup) return;

	BUBBLE.events.fxChameleonColorChange.dispatch(this);

	var rndIndex = Math.floor(BUBBLE.rnd('B Cham - on Move Done')*possibleColors.length)
	if (possibleColors[rndIndex] == this.type && possibleColors.length > 1) {
		rndIndex = (rndIndex+1) % possibleColors.length;
	}

	//console.log('DBG_len: '+dbg.length)
	//dbg.push(this.cellX+'x'+this.cellY+' new type: '+possibleColors[rndIndex].toString() + 'seed: '+BUBBLE.seed);

	this.type = possibleColors[rndIndex].toString();
	this.loadTexture('bubblesheet','cham_'+this.type);
	this.grid.orderCacheAfterUpdate = true;

};
BUBBLE.BubbleCloud =  function(cx,cy,x,y,type) {
	if (type == 'r') {
		type = BUBBLE.rndBetween(0,5,'B Cloud const').toString();
	}

	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','cloud_0');
	this.special = true;
	this.animated = false;
	this.type = type;

	this.covered = true;

}

BUBBLE.BubbleCloud.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleCloud.prototype.onPopOut = function() {

	if (!this.grid.ghostMode) {
		this.onHit();
	} 

	this.update = this.popOutUpdate;
	this.gravity = BUBBLE.lnf(0.25);
	this.initVelX = BUBBLE.lnf(4);
	this.initVelY = BUBBLE.lnf(-5);
	this.minX = BUBBLE.l(40);
	this.maxX = BUBBLE.l(600);
	this.velX = (-0.5*this.initVelX)+BUBBLE.rnd('B Cloud onPopOut velX')*this.initVelX;
	this.velY = BUBBLE.rnd('B Cloud onPopOut velY')*this.initVelY;

	this.grid.moveToPopOutGroup(this);
}

BUBBLE.BubbleCloud.prototype.onHit = function() {
	if (this.covered) {
		this.loadTexture('bubblesheet','bubble_'+this.type);
		this.covered = false;
	
		BUBBLE.events.fxCloudParticle.dispatch(this);
		if (this.parent == this.grid) {
			this.grid.orderCacheAfterUpdate = true;
		}
	}

}

BUBBLE.BubbleCloud.prototype.onMatch = function() {

	this.update = this.onMatchUpdate;
	this.grid.moveToMatchGroup(this);
	this.onHit();
	BUBBLE.events.fxMatchParticle.dispatch(this);
	BUBBLE.events.fxCircleParticle.dispatch(this);
}

BUBBLE.BubbleCloud.prototype.onMatchHit = function() {
	this.onHit();
}
BUBBLE.BubbleDoom =  function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_doom');
	this.type = "doom";

	//this.angle = BUBBLE.rnd()*360;

}

BUBBLE.BubbleDoom.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleDoom.prototype.checkType = function() {return false};

BUBBLE.BubbleDoom.prototype.onPreciseHit = function(bubble) {
	
	BUBBLE.events.fxExplosion.dispatch(this);

	BUBBLE.events.flash.dispatch(1,0.01);

	game.time.events.add(500,function() {
		BUBBLE.events.pushWindow.dispatch(['continueFor','doomBubble']);
	});
	this.vanish();

};
BUBBLE.BubbleExplosive = function(cx,cy,x,y,type2) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_explosive_'+type2);
	this.type = 'explosive';
	this.type2 = type2;
	this.exploded = false;
}

BUBBLE.BubbleExplosive.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleExplosive.prototype.onPopOut = function() {
	if (!this.exploded) {
		this.onPreciseHit();
	}
};

BUBBLE.BubbleExplosive.prototype.onPreciseHit = function(bubble) {

	this.exploded = true;


	BUBBLE.events.fxExplosion.dispatch(this);

	this.grid.popOutBubbles(this.getBubblesToPopOut());
	this.grid.checkAndProcessHold();

	this.vanish();

};

BUBBLE.BubbleExplosive.prototype.horizontalCoordinates = [[-5,0],[-4,0],[-3,0],[-2,0],[-1,0],[1,0],[2,0],[3,0],[4,0],[5,0]];
BUBBLE.BubbleExplosive.prototype.verticalCoordinates = [[0,-5],[0,-4],[0,-3],[0,-2],[0,-1],[0,1],[0,2],[0,3],[0,4],[0,5]];
BUBBLE.BubbleExplosive.prototype.verticalWideCoordinates = [
[[-1,-1],[0,-1],[0,-2],[-1,-3],[0,-3],[0,-4],[-1,1],[0,1],[0,2],[0,3],[-1,3],[0,4]],
[[0,-1],[1,-1],[0,-2],[0,-3],[1,-3],[0,-4],[0,1],[1,1],[0,2],[0,3],[1,3],[0,4]],
];

BUBBLE.BubbleExplosive.prototype.getBubblesToPopOut = function() {

	var result = [];

	if (this.type2 == 'normal') {
		Array.prototype.concat(this,this.grid.getNeighbours(this.cellX,this.cellY),this.grid.getOuterRing(this.cellX,this.cellY)).forEach(function(bubble) {
			if (!bubble.bombResistant && this.grid.isBelowLock(bubble)) {
				result.push(bubble);
			}
		},this);
	}
	
	if (this.type2 == 'horizontal') {

		this.horizontalCoordinates.forEach(function(coords) {
			var bubble = this.grid.getBubble(this.cellX+coords[0],this.cellY+coords[1]);
			if (bubble && !bubble.bombResistant && this.grid.isBelowLock(bubble)) {
				result.push(bubble);
			}
		},this);

	}
	
	if (this.type2 == 'vertical') {

		this.verticalCoordinates.forEach(function(coords) {
			var bubble = this.grid.getBubble(this.cellX+coords[0],this.cellY+coords[1]);
			if (bubble && !bubble.bombResistant && this.grid.isBelowLock(bubble)) {
				result.push(bubble);
			}
		},this);

	}

	return result;

};
BUBBLE.BubbleGhost =  function(cx,cy,x,y,type) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','ghost_01');
	this.animations.add("idle",['ghost_01','ghost_02','ghost_03','ghost_04','ghost_03','ghost_02','ghost_01','ghost_01','ghost_01',
								'ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01',
								'ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01',
								'ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01',
								'ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01',
								'ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01',
								'ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01','ghost_01'],
								30,true);
	this.play('idle');
	this.bombResistant = true;
	this.bounceable = false;
	this.special = true;
	this.animated = true;
	this.popOutForSure = false;
	this.type = "GHOST";
}

BUBBLE.BubbleGhost.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleGhost.prototype.checkType = function() {return false};

BUBBLE.BubbleGhost.prototype.onPopOut = function() {
	if(!this.popOutForSure)return;

	this.update = this.popOutUpdate;
	this.grid.moveToPopOutGroup(this);
}

BUBBLE.BubbleGhost.prototype.popOutUpdate = function() {
	this.scale.setTo(this.scale.x+0.05);
	this.alpha -= 0.03;
	if (this.alpha <= 0) {
		this.destroy();
	}
}
BUBBLE.BubbleInfected =  function(cx,cy,x,y) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_infected');
	this.type = "infected";

	this.active = true;

	this.cancelSpread = false;

	BUBBLE.events.onBubbleShoot.add(function() {
		this.cancelSpread = false;
	},this);

	BUBBLE.events.onMoveDone.add(function() {

		if (!this.alive || !this.active || this.cancelSpread) return;
		if (!this.grid.isBelowLock(this)) return;
		if (this.y > ((game.camera.y+game.camera.height) - BUBBLE.l(900))  || this.grid.ghostMode) {
			this.tryToSpread();
		}	
	},this);

	BUBBLE.events.onInfectionSpreaded.add(function() {
		this.cancelSpread = true;
	},this);
}

BUBBLE.BubbleInfected.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleInfected.prototype.typesToInfect = ["0","1","2","3","4","5"];

BUBBLE.BubbleInfected.prototype.tryToSpread = function() {

	

	if (this.cancelSpread) {
		
		this.cancelSpread = false;
		return;
	}

	var bubble0, bubble1, tmp;

	if (this.cellY % 2 == 0) {
		bubble0 = this.grid.getBubble(this.cellX-1,this.cellY+1);
		bubble1 = this.grid.getBubble(this.cellX,this.cellY+1);
	}else {
		bubble0 = this.grid.getBubble(this.cellX+1,this.cellY+1);
		bubble1 = this.grid.getBubble(this.cellX,this.cellY+1);
	}

	if (BUBBLE.rnd('B Inf tryToSpread')>0.5) {
		tmp = bubble1;
		bubble1 = bubble0;
		bubble0 = tmp;
	}

	
	

	if (bubble0){
		if (this.typesToInfect.indexOf(bubble0.type) != -1 && !bubble0.duringBounce) {
			this.infect(bubble0);
			return;
		}
	}

	if (bubble1) {
	 	if (this.typesToInfect.indexOf(bubble1.type) != -1 && !bubble1.duringBounce) {
			this.infect(bubble1);
			return;
		}
	}

};

BUBBLE.BubbleInfected.prototype.infect = function(bubble) {

	
	BUBBLE.events.onInfectionSpreaded.dispatch(bubble);
	BUBBLE.events.fxDummyBubble.dispatch(bubble);
	bubble.vanish();

	var newInfected = this.grid.makeBubble(bubble.cellX,bubble.cellY,'infected');

	this.grid.moveToNonCacheGroup(newInfected);
	game.add.tween(newInfected).from({alpha: 0},500,Phaser.Easing.Sinusoidal.InOut,true).onComplete.add(function() {
		if (this.duringBounce) return;
		this.grid.moveToCacheGroup(this);
	},newInfected)

};

BUBBLE.BubbleInfected.prototype.onPopOut = function() {

	this.active = false;
	
	this.update = this.popOutUpdate;
	
	this.gravity = BUBBLE.lnf(0.25);
	this.initVelX = BUBBLE.lnf(4);
	this.initVelY = BUBBLE.lnf(-5);
	this.minX = BUBBLE.l(40);
	this.maxX = BUBBLE.l(600);
	this.velX = (-0.5*this.initVelX)+BUBBLE.rnd('B Inf onPopOut vX')*this.initVelX;
	this.velY = BUBBLE.rnd('B Inf onPopOut vY')*this.initVelY;

	this.grid.moveToPopOutGroup(this);

};
BUBBLE.BubbleKeyhole =  function(cx,cy,x,y,type) {
	BUBBLE.Bubble.apply(this,arguments);
	
	this.keyhole = true;
	this.loadTexture('bubblesheet','bubble_'+type);
	BUBBLE.events.newLock.dispatch(this);

}

BUBBLE.BubbleKeyhole.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleKeyhole.prototype.onMatch = function() {

	this.update = this.onMatchUpdate;
	this.grid.moveToMatchGroup(this);
	BUBBLE.events.fxMatchParticle.dispatch(this);
	BUBBLE.events.fxCircleParticle.dispatch(this);
	BUBBLE.events.unlockLock.dispatch(this.cellY);

};
BUBBLE.BubbleMonster =  function(cx,cy,x,y,grid) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_monster');
	this.special = true;
	this.type = "monster";
	this.animated = true;

	this.eyes = [];
	this.makeEye(-15,2,0);
	this.makeEye(15,2,1);
	this.makeEye(0,-20,2);

	this.grid = grid;
	this.eyesOpen = 0;
	this.ghostMode  = this.grid.lvl.mode == "Ghost"; 
	this.bubbleWorldPosition = this.getWorldPosition();

	this.closeEyesIn = -1;

	this.bombResistant = false;
	this.active = true;


	BUBBLE.events.onMoveDone.add(function(possibleColors) {

		if (!this.alive || !this.active) return;
		if (!this.grid.isBelowLock(this)) return;
		this.possibleColors = possibleColors;
		this.bubbleWorldPosition = this.getWorldPosition();
		if (this.y > ((game.camera.y+game.camera.height) - BUBBLE.l(900)) || this.grid.ghostMode) {
			this.onMoveDone();
		}	
	},this);
}

BUBBLE.BubbleMonster.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleMonster.prototype.checkType = function() {return false};

BUBBLE.BubbleMonster.prototype.onMoveDone = function() {

		this.eyesOpen++;
		this['eye'+(this.eyesOpen-1)+'open'].play();

		if (this.eyesOpen == 3) {
			this.eyesOpen = 0;
			this.closeEyesIn = 30;
			this.putThreeBubbles();
		}

};

BUBBLE.BubbleMonster.prototype.update = function() {

	this.bounceUpdate();

	if (this.closeEyesIn > 0) {
		if (--this.closeEyesIn == 0) {
			this.eye0close.play();
			this.eye1close.play();
			this.eye2close.play();
		}
	}

}

BUBBLE.BubbleMonster.prototype.makeEye = function(x,y,nr) {

	var eye = game.make.spriteL(x,y,'monster_eyelid_2');
	eye.anchor.setTo(0.5);
	this['eye'+nr+'open'] = eye.animations.add('open',['monster_eyelid_2','monster_eyelid_1','monster_eyelid_0','empty'],20);
	this['eye'+nr+'close'] = eye.animations.add('close',['monster_eyelid_1','monster_eyelid_2','monster_eyelid_3'],20);
	this.eyes[nr] = eye;
	this.addChild(eye);

};

BUBBLE.BubbleMonster.prototype.putThreeBubbles = function() {

	var spaceToPutBubbles = this.getSpacesToPut();	

	var possibleColors = this.possibleColors;

	if (possibleColors.length == 0) return;

	var bubbles = [];

	spaceToPutBubbles.forEach(function(coords) {
		var randomIndex = Math.floor(BUBBLE.rnd('B Monster put3Bubbles')*possibleColors.length)
		var newBubble = this.grid.makeBubble(coords[0],coords[1],possibleColors[randomIndex]);
		bubbles.push(newBubble);
	},this);

	bubbles.forEach(function(bubble) {

		bubble.grid.moveToNonCacheGroup(bubble);
		bubble.alpha = 0;
		bubble.update = function() {
			this.alpha += 0.04;
			if (this.alpha >= 1) {
				this.alpha = 1;
				this.grid.moveToCacheGroup(this);
				this.update = BUBBLE.Bubble.prototype.update;
			}
			
		};

		var pos = bubble.getWorldPosition();

		BUBBLE.events.fxCircleParticle.dispatch(bubble);

	});
	
};

BUBBLE.BubbleMonster.prototype.getSpacesToPut = function() {

	var spaceToPutBubbles = [];
	var bubbles,len,bubble,freeSpaces,randomIndex, pxPos;

	if (this.ghostMode) {

		bubbles = this.grid.children;
		len = bubbles.length;

		for (var i = 0; i < 20; i++) {
			bubble = bubbles[Math.floor(BUBBLE.rnd('BM - gestSpacesToPut (1)')*len)];
			freeSpaces = this.grid.getFreeSpacesAround(bubble.cellX,bubble.cellY);
			if (freeSpaces.length > 0) {
				randomIndex = Math.floor(BUBBLE.rnd('BM - gestSpacesToPut (2)')*freeSpaces.length);

				//check if cell is not to far
				pxPos = this.grid.cellToOutsidePx(freeSpaces[randomIndex][0],freeSpaces[randomIndex][1]);
				if (pxPos[0] > this.grid.closeToEdgeBorder && pxPos[0] < BUBBLE.l(640)-this.grid.closeToEdgeBorder
					&& pxPos[1] > this.grid.closeToEdgeBorder && pxPos[1] < this.grid.maxY-this.grid.closeToEdgeBorder &&
					this.checkIfSpaceNotRepeat(spaceToPutBubbles,freeSpaces[randomIndex])) {
					spaceToPutBubbles.push(freeSpaces[randomIndex]);
					if (spaceToPutBubbles.length == 3) {
						break;
					}
				}

				
			}
		}


	}else {

		var rowOnScreen = Math.floor(this.bubbleWorldPosition[0]/this.grid.cellH);

		bubbles = this.grid.getBubblesInRange(this.cellY-rowOnScreen,this.cellY+10);
		len = bubbles.length;

		if (len == 0) return;

		for (i=0; i < 20; i++) {
			bubble = bubbles[Math.floor(BUBBLE.rnd('BM - gestSpacesToPut (3)')*len)];
			freeSpaces = this.grid.getFreeSpacesAround(bubble.cellX,bubble.cellY);
			if (freeSpaces.length > 0) {
				randomIndex = Math.floor(BUBBLE.rnd('BM - gestSpacesToPut (4)')*freeSpaces.length);
				if (this.checkIfSpaceNotRepeat(spaceToPutBubbles,freeSpaces[randomIndex])) {
					spaceToPutBubbles.push(freeSpaces[randomIndex]);
					if (spaceToPutBubbles.length == 3) {
						break;
					}
				}
			}
		}

	}
	

	return spaceToPutBubbles;
};


BUBBLE.BubbleMonster.prototype.checkIfSpaceNotRepeat = function(spaceToPutBubbles,freeSpace) {
	var result = true;

	spaceToPutBubbles.forEach(function(child) {
		if (child[0] == freeSpace[0] && child[1] == freeSpace[1]) {
			result = false;
		}
	});

	return result;
}


BUBBLE.BubbleMonster.prototype.popOutUpdate = function() {
	this.scale.setTo(this.scale.x+0.05);
	this.alpha -= 0.03;
	if (this.alpha <= 0) {
		this.destroy();
	}
}

BUBBLE.BubbleMonster.prototype.onHit = function(bubble) {

	if (bubble.type == "bomb") {
		this.onPopOut();
	}
	
}


BUBBLE.BubbleMonster.prototype.onPopOut = function() {

	this.update = this.popOutUpdate;
	this.active = false;
	this.grid.moveToPopOutGroup(this);

}
BUBBLE.BubbleRegular =  function(cx,cy,x,y,type) {
	BUBBLE.Bubble.apply(this,arguments);
	this.loadTexture('bubblesheet','bubble_'+type);
	this.type = type;
	this.typeName = this.typeNames[parseInt(type)];

}

BUBBLE.BubbleRegular.prototype = Object.create(BUBBLE.Bubble.prototype);

BUBBLE.BubbleRegular.prototype.typeNames = ['red','yellow','green','blue','violet','orange']

BUBBLE.BubbleRegular.prototype.onMatch = function() {

	this.grid.moveToMatchGroup(this);
	this.update = this.onMatchUpdate;

	if (this.typeName) {
		this.animTimer = 10;
		this.frameIndex = 1;
		BUBBLE.events.fxMatchParticleNew.dispatch(this);
		BUBBLE.events.fxUnderMatch.dispatch(this);
	}else {
		BUBBLE.events.fxMatchParticle.dispatch(this);
		BUBBLE.events.fxCircleParticle.dispatch(this);

	}
	
	
	
}

BUBBLE.BubbleRegular.prototype.onMatchUpdate = function() {

	if (this.typeName) {

		if (this.animTimer-- == 0) {
			this.animTimer = 2;
			this.frameIndex++;
			if (this.frameIndex == 9) {
				this.destroy();
			}else {
				this.loadTexture('burstsheet','burst'+this.typeName+this.frameIndex);
			}
		}

	} else {

		this.scale.setTo(this.scale.x+0.02);
		this.alpha -= 0.05;
		if (this.alpha < 0) this.destroy();

	}


}

BUBBLE.EditorMapCircle = function(lvl) {

	Phaser.Group.call(this, game);

	this.onMoveSelectedLevelHere = new Phaser.Signal();


	this.circle = game.make.image(0,0,'esheet','map_circle');
	this.circle.anchor.setTo(0.5);
	this.add(this.circle);

	this.lvlSelected = null;

	BUBBLE.events.onLevelSelected.add(function(nr) {

		if (null) {
			this.lvlSelected = null;
			this.moveSelectedLevelHere.alpha = 0.5;
			this.hide();
		}else {
			this.lvlSelected = nr;
        	this.moveSelectedLevelHere.alpha = 1;
        	this.hide();
		}
        
    },this);

	this.makeNewLevel = game.make.bitmapText(60,-40,'font_dbg','Make new level',30);
	this.makeNewLevel.inputEnabled = true;
	this.makeNewLevel.input.useHandCursor = true;
	this.makeNewLevel.hitArea = new Phaser.Rectangle(0,0,200,30);
	this.makeNewLevel.events.onInputDown.add(function() {
		BUBBLE.events.makeLevel.dispatch(this.x,this.y);
		this.hide();
	},this);
	this.addChild(this.makeNewLevel);

	this.moveSelectedLevelHere = game.make.bitmapText(60,30,'font_dbg','Move selected lvl here',30);
	this.moveSelectedLevelHere.inputEnabled = true;
	this.moveSelectedLevelHere.input.useHandCursor = true;
	this.moveSelectedLevelHere.hitArea = new Phaser.Rectangle(0,0,300,30);
	this.moveSelectedLevelHere.events.onInputDown.add(function() {
		if (this.lvlSelected === null) return;
		BUBBLE.events.moveLevelTo.dispatch(this.lvlSelected, this.x,this.y);
		this.hide();
	},this);
	this.addChild(this.moveSelectedLevelHere);
	this.moveSelectedLevelHere.alpha = 0.5;

	this.x = -9999;
	this.y = -9999;

}

BUBBLE.EditorMapCircle.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.EditorMapCircle.constructor = BUBBLE.EditorMapCircle;




BUBBLE.EditorMapCircle.prototype.moveTo = function(x,y) {
	if (Math.abs(this.y - y) < 70 && x > this.x+50 && x < this.x+400) {
		
		return;
	}

	this.x = x;
	this.y = y;
}

BUBBLE.EditorMapCircle.prototype.hide = function(x,y) {
	this.x = -9999;
	this.y = -9999;
};
BUBBLE.EditorMoveRecorder = function(state) {
	
	Phaser.Group.call(this,game);

	this.lvl = state.lvl; 
	this.ghost = this.lvl.mode == 'Ghost';
	this.grid = state.grid;

	this.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	this.clear = game.input.keyboard.addKey(Phaser.Keyboard.C);

	this.recording = false;

	this.space.onDown.add(function() {
		this.recording = !this.recording;
	},this);

	this.clear.onDown.add(function() {
		this.lvl.walkthrough = [];
	},this);

	this.passed = 0;

	BUBBLE.events.flyingBubbleToBePut.add(function(flyingBubble) {

		if (!this.recording) return;

		this.lvl.walkthrough[this.lvl.walkthrough.length-1].push({
			c: [flyingBubble.cellX,flyingBubble.cellY],
			p: [flyingBubble.x,flyingBubble.y],
			type: flyingBubble.type
		});

	},this);


	BUBBLE.events.onBubbleShoot.add(function(x,y,angle,type,popout) {
		if (popout || !this.recording) return;

		if (!this.lvl.walkthrough) {
			this.lvl.walkthrough = [];
		}

		if (this.ghost) {
			this.lvl.walkthrough.push(['shootGhost',angle,this.passed,this.grid.rotation,this.grid.angleSpd]);
		}else {
			this.lvl.walkthrough.push(['shoot',angle,this.passed]);
		}

		
		
		this.passed = 0;
	},this);

	BUBBLE.events.onBubbleSwap.add(function() {
		if (!this.recording) return;
		if (!this.lvl.walkthrough) {
			this.lvl.walkthrough = [];
		}
		this.lvl.walkthrough.push(['swap',0,this.passed]);
		this.passed = 0;
	},this);

};

BUBBLE.EditorMoveRecorder.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.EditorMoveRecorder.prototype.update = function() {
	if (this.recording) {	
		this.passed++;
	}
}


BUBBLE.EditorShooterWindow = function(lvl,grid) {

	Phaser.Group.call(this, game);

	this.grid = grid;
	this.lvl = lvl;

	this.modeButton = game.make.button(30,20,null)
	this.modeButton.bitmapText = game.make.bitmapText(0,0,'font_dbg','Shooter mode: ' + this.lvl.shooter.mode,30);
	this.modeButton.addChild(this.modeButton.bitmapText);
	this.modeButton.lvl = lvl;
	this.modeButton.onInputDown.add(function() {

		if (this.lvl.shooter.mode == 'pattern') {
			this.lvl.shooter.mode = 'random';
		}else {
			this.lvl.shooter.mode = 'pattern';
		}
		this.bitmapText.setText('Shooter mode: ' + this.lvl.shooter.mode);
		this.parent.refreshPattern();

	},this.modeButton);
	this.modeButton.hitArea = new Phaser.Rectangle(0,0,350,30);

	this.numberButton = game.make.button(30,70,null)
	this.numberButton.bitmapText = game.make.bitmapText(0,0,'font_dbg','Bubbles number: ' + this.lvl.shooter.bubblesNumber,30);
	this.numberButton.addChild(this.numberButton.bitmapText);
	this.numberButton.lvl = lvl;
	this.numberButton.onInputDown.add(function() {

		var newValue = parseInt(prompt("How many bubbles should shooter have?"));

		if (newValue) {
			this.lvl.shooter.bubblesNumber = newValue;
			this.bitmapText.setText('Bubbles number: ' + this.lvl.shooter.bubblesNumber);
			this.parent.refreshPattern();
		}
	},this.numberButton);
	this.numberButton.hitArea = new Phaser.Rectangle(0,0,350,30);

	this.patternGroup = game.add.group();

	this.refreshPattern();

	this.randomizeBtn = this.makePatternRandomButton(250,800);
	this.loopBtn = this.makePatternLoop(250,850);
	this.addMultiple([this.modeButton,this.numberButton,this.patternGroup,this.randomizeBtn,this.loopBtn]);

	this.x = -600;


}

BUBBLE.EditorShooterWindow.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.EditorShooterWindow.constructor = BUBBLE.EditorUI;


BUBBLE.EditorShooterWindow.prototype.show = function() {

	BUBBLE.events.onWindowOpen.dispatch();
	this.x = 0;

}

BUBBLE.EditorShooterWindow.prototype.hide = function() {

	BUBBLE.events.onWindowClose.dispatch();
	this.x = -640;

}


BUBBLE.EditorShooterWindow.prototype.refreshPattern = function() {

	if (this.lvl.shooter.mode == 'random') {
		this.patternGroup.alpha = 0.5;
	}else {
		this.patternGroup.alpha = 1;
	}

	this.patternGroup.removeAll();

	this.refillPatternGroup();

}

BUBBLE.EditorShooterWindow.prototype.refillPatternGroup = function() {



	var marginX = 80;
	var marginY = 150;
	var currentRow = 0;
	var currentCollumn = 0;
	var spading = 50;
	var collumns = 10;
	var bubble = null;

	for (var i = 0; i < this.lvl.shooter.bubblesNumber; i++) {

		if (!this.patternGroup.children[i]) {

			if (!this.lvl.shooter.pattern[i]) {
				this.lvl.shooter.pattern[i] = game.rnd.between(0,4);
			}

			bubble = this.makePatternBubbleButton(	marginX+currentCollumn*spading,
													marginY+currentRow*spading,
													this.lvl.shooter.pattern[i],
													this.lvl,
													i,
													0.8);

			this.patternGroup.add(bubble);

		}

		currentCollumn++;
		if (currentCollumn == collumns) {
			currentRow++;
			currentCollumn = 0;
		}
	}


	if (this.lvl.shooter.bubblesNumber < this.patternGroup.length) {

		
		var toDestroy = [];

		this.patternGroup.forEach(function(child) {
			if (child.indexNr >= i) {
				toDestroy.push(child);
			}
		});


		toDestroy.forEach(function(child) {
			child.destroy();
		})
	}

	

}

BUBBLE.EditorShooterWindow.prototype.makePatternBubbleButton = function(x,y,type,lvl,indexNr,scale) {

	var bubble = game.make.button(x,y,null);

	bubble.loadTexture('bubblesheet','bubble_'+type);
	bubble.scale.setTo(scale || 1);
	bubble.anchor.setTo(0.5);
	bubble.lvl = lvl;
	bubble.type = type;
	bubble.indexNr = indexNr;

	bubble.onInputDown.add(function() {
		this.type++;
		this.type = this.type % 5;
		this.loadTexture('bubblesheet','bubble_'+this.type);
		this.lvl.shooter.pattern[this.indexNr] = this.type; 

	},bubble);

	return bubble;

};


BUBBLE.EditorShooterWindow.prototype.makePatternRandomButton = function(x,y,type,lvl,indexNr,scale) {
	
	

	var modeButton = game.make.button(x,y,null)
	modeButton.bitmapText = game.make.bitmapText(0,0,'font_dbg','Randomize pattern',30);
	
	modeButton.addChild(modeButton.bitmapText);
	modeButton.onInputDown.add(function() {

		var colors = this.grid.getAllColorsOnBoard();
		for (var i = 0; i < this.lvl.shooter.pattern.length; i++) {
			this.lvl.shooter.pattern[i] = colors[Math.floor(Math.random()*colors.length)]; 
		}
		this.refreshPattern();

	},this);
	modeButton.hitArea = new Phaser.Rectangle(0,0,350,30);


	return modeButton;
	

};

BUBBLE.EditorShooterWindow.prototype.makePatternLoop = function(x,y,type,lvl,indexNr,scale) {
	
	

	var modeButton = game.make.button(x,y,null)
	modeButton.bitmapText = game.make.bitmapText(0,0,'font_dbg','Loop colors',30);
	
	modeButton.addChild(modeButton.bitmapText);
	modeButton.onInputDown.add(function() {

		var colors = this.grid.getAllColorsOnBoard();
		if (colors.length==0) colors = ['0','1','2','3','4'];

		

		for (var i = 0; i < this.lvl.shooter.pattern.length; i++) {
			this.lvl.shooter.pattern[i] = colors[i % colors.length]; 
		}
		this.refreshPattern();

	},this);
	modeButton.hitArea = new Phaser.Rectangle(0,0,350,30);


	return modeButton;
	

};
BUBBLE.EditorUI = function(lvl,grid) {

	Phaser.Group.call(this, game);

	this.x = 660;
	this.lvl = lvl;



	this.selectToolButtonGroup = game.add.group();
	this.add(this.selectToolButtonGroup);

	this.modeButtonGroup = game.add.group();
	this.add(this.modeButtonGroup);


	this.makeTrashButton(460,40);

	this.makeModeButtons(10);
	this.makeElementsButtons(120);
	this.makeStarPointsField(740);
	this.makeTutField(830);


	this.classicModeNr = game.add.bitmapText(200,10,'font_dbg','Target: '+this.lvl.goalTarget,20);
	this.classicModeNr.inputEnabled = true;
	this.classicModeNr.events.onInputDown.add(function() {
		if (this.lvl.mode == "Classic") {

			var value = parseInt(prompt('Target:'));
			if (isNaN(value)) {
				this.lvl.goalTarget = 6;
			}else {
				this.lvl.goalTarget = game.math.clamp(value,1,11);
				
			}

			this.classicModeNr.setText('Target: '+this.lvl.goalTarget);

		}
	},this); 
	this.add(this.classicModeNr);



	this.shooterWindow = new BUBBLE.EditorShooterWindow(this.lvl,grid);


	

	BUBBLE.events.onModeChange.add(function(mode) {

		BUBBLE.events.onToolChange.dispatch('');

		this.selectToolButtonGroup.forEach(function(child) {

			if (child.type.length > 3) {
				if (child.type[3] == mode) {
					child.onInputDown.active = true;
					child.alpha = 1;
				}else {
					child.onInputDown.active = false;
					child.alpha = 0.5;
				}
			}

			child.loadTexture('esheet','button');

		},this)

	},this);

	this.keyboardInput = game.input.keyboard.addKeys({one: Phaser.Keyboard.ONE,two: Phaser.Keyboard.TWO,
	three: Phaser.Keyboard.THREE,four: Phaser.Keyboard.FOUR,five: Phaser.Keyboard.FIVE,six: Phaser.Keyboard.SIX,tilde: Phaser.Keyboard.TILDE,

	q: Phaser.Keyboard.Q,w: Phaser.Keyboard.W,
	e: Phaser.Keyboard.E,r: Phaser.Keyboard.R,t: Phaser.Keyboard.T,y: Phaser.Keyboard.Y,

	a: Phaser.Keyboard.A,s: Phaser.Keyboard.S,
	d: Phaser.Keyboard.D,f: Phaser.Keyboard.F,g: Phaser.Keyboard.G,h: Phaser.Keyboard.H});



	this.keyboardInput.one.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[0]);
	});
	this.keyboardInput.two.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[1]);
	});
	this.keyboardInput.three.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[2]);
	});
	this.keyboardInput.four.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[3]);
	});
	this.keyboardInput.five.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[4]);
	});
	this.keyboardInput.six.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[5]);
	});

	this.keyboardInput.q.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[7]);
	});
	this.keyboardInput.w.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[8]);
	});
	this.keyboardInput.e.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[9]);
	});
	this.keyboardInput.r.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[10]);
	});
	this.keyboardInput.t.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[11]);
	});
	this.keyboardInput.y.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[12]);
	});


	this.keyboardInput.a.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[6]);
	});
	this.keyboardInput.s.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[13]);
	});
	this.keyboardInput.d.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[14]);
	});
	this.keyboardInput.f.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[15]);
	});
	this.keyboardInput.g.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[16]);
	});
	this.keyboardInput.h.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[17]);
	});



	this.keyboardInput.tilde.onDown.add(function() {
		BUBBLE.events.onToolChange.dispatch(BUBBLE.e_elements.common_elements[23]);
	});

	BUBBLE.e_elements


	BUBBLE.events.onModeChange.dispatch(this.lvl.mode);

}

BUBBLE.EditorUI.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.EditorUI.constructor = BUBBLE.EditorUI;



BUBBLE.EditorUI.prototype.makeElementsButtons = function(y) {

	this.elementsButtonsLabel =  game.add.bitmapText(10,y,'font_dbg','Elements:',20);
	this.add(this.elementsButtonsLabel);

	var elements = BUBBLE.e_elements.common_elements;

	var marginLeft = 20;
	var collumns = 6;
	var currentCollumn = 0;
	var currentRow = 0;

	for (var i = 0; i < elements.length; i++) {
		this.makeSelectToolButton(marginLeft+(currentCollumn*70),y+30+(currentRow*70),elements[i]);
		currentCollumn++;
		if (currentCollumn == collumns) {
			currentCollumn = 0;
			currentRow++;
		}
	}

	this.spElementsButtonsLabel =  game.add.bitmapText(10,y+40+(currentRow*70),'font_dbg','Special elements:',20);
	this.add(this.spElementsButtonsLabel);

	var spElements = BUBBLE.e_elements.special_elements;

	currentCollumn = 0
	for (var i = 0; i < spElements.length; i++) {
		this.makeSelectToolButton(marginLeft+(currentCollumn*70),y+70+(currentRow*70),spElements[i]);
		currentCollumn++;
		if (currentCollumn == collumns) {
			currentCollumn = 0;
			currentRow++;
		}
	}
}

BUBBLE.EditorUI.prototype.makeModeButtons = function(y) {

	this.modeLabel = game.add.bitmapText(10,y,'font_dbg','MODE: '+this.lvl.mode,20);
	this.add(this.modeLabel);
	BUBBLE.events.onModeChange.add(function(mode) {
		this.setText('MODE: '+mode);
	},this.modeLabel)

	var modes = BUBBLE.e_elements.modes;

	for (var i = 0; i < 4; i++) {
		var button = this.makeModeButton(20+(i*70),y+30,modes[i]);
		if (modes[i][0] == this.lvl.mode) {
			button.loadTexture('esheet','button_select');
		}
	}

}

BUBBLE.EditorUI.prototype.makeSelectToolButton = function(x,y,e_array) {
	var button = game.add.button(x,y,null);
	button.loadTexture('esheet','button');
	button.type = e_array;
	button.label = game.make.image(33,33,e_array[1],e_array[2]);
	button.label.anchor.setTo(0.5);
	button.label.scale.setTo(0.7);

	if (button.label.width > 60) {
		button.label.width = 60;
		button.label.height = 60;
	}

	button.addChild(button.label);

	button.onInputDown.add(function() {
			this.parent.forEach(function(child) {
				child.loadTexture('esheet','button');
			});
			this.loadTexture('esheet','button_select');
			BUBBLE.events.onToolChange.dispatch(this.type);
	},button)

	this.selectToolButtonGroup.add(button);

	return button;
}



BUBBLE.EditorUI.prototype.makeModeButton = function(x,y,e_array) {

	var button = game.add.button(x,y,null);
	button.loadTexture('esheet','button');
	button.type = e_array;
	button.label = game.make.image(33,33,e_array[1],e_array[2]);
	button.label.anchor.setTo(0.5);
	button.label.scale.setTo(0.7);
	button.addChild(button.label);

	button.onInputDown.add(function() {
			

			if (confirm("Changing mode can destroy your current level! Are you sure?")) {

				this.parent.forEach(function(child) {
					child.loadTexture('esheet','button');
				});
				this.loadTexture('esheet','button_select');
				BUBBLE.events.onModeChange.dispatch(this.type[0]);
			}
			
	},button)

	this.modeButtonGroup.add(button);

	return button;
}


BUBBLE.EditorUI.prototype.makeStarPointsField = function(y) {

	this.starsRequirements = game.add.bitmapText(40,y,'font_dbg','Stars requirements:',20);
	this.add(this.starsRequirements);

	for (var i = 0; i < 3; i++) {

		var star = game.make.image(20+(i*180),y+40,'esheet','star_'+(i+1));
		star.scale.setTo(0.5);
		var star_button = game.make.button(70+(i*180),y+40,null);
		star_button.bitmapText = game.make.bitmapText(0,0,'font_dbg',this.lvl.starsRequirements[i].toString(),30);
		star_button.reqIndex = i;
		star_button.lvl = this.lvl;
		star_button.addChild(star_button.bitmapText);
		star_button.onInputDown.add(function() {
			var new_value = parseInt(prompt("Put point requirement for star:"));
			if (new_value) {
				this.lvl.starsRequirements[this.reqIndex] = new_value;
				this.bitmapText.setText(this.lvl.starsRequirements[this.reqIndex].toString())
			}
		},star_button);

		this.addMultiple([star,star_button]);
	}
}

BUBBLE.EditorUI.prototype.makeTrashButton = function(x,y) {
	var button = game.add.button(x,y,null);
	button.loadTexture('esheet','button');
	button.label = game.make.image(30,30,'esheet','trash');
	button.label.anchor.setTo(0.5);
	button.label.scale.setTo(0.7);
	button.addChild(button.label);
	button.onInputDown.add(function() {
		if (confirm("Are you sure you want to clear all elements?")) {
			BUBBLE.events.onDeleteAllElements.dispatch();
		}
	},this);
	this.add(button);
}

BUBBLE.EditorUI.prototype.makeTutField = function(y) {
	this.tutLabel = game.add.bitmapText(40,y,'font_dbg','Tutorial:',20);
	this.tut0 = game.make.bitmapText(150,y,'font_dbg',this.lvl.tut0 || 'null',20);
	this.tut1 = game.make.bitmapText(210,y,'font_dbg',this.lvl.tut1 || 'null',20);
	this.tut0.inputEnabled = true;
	this.tut0.events.onInputDown.add(function() {
		var value = prompt('Tutorial 1 nr');
		if (value == '') {
			this.lvl.tut0 = null;
			this.tut0.setText('null');
		}else {
			this.lvl.tut0 = value;
			this.tut0.setText(value);
		}
	},this);
	this.tut1.inputEnabled = true;
	this.tut1.events.onInputDown.add(function() {
		var value = prompt('Tutorial 1 nr');
		if (value == '') {
			this.lvl.tut1 = null;
			this.tut1.setText('null');
		}else {
			this.lvl.tut1 = value;
			this.tut1.setText(value);
		}
	},this);
	
	this.timerLabel = game.add.bitmapText(280,y,'font_dbg','Timer:',20);
	this.timer0 = game.make.bitmapText(380,y,'font_dbg',this.lvl.time || '0',20);
	this.timer0.inputEnabled = true;
	this.timer0.events.onInputDown.add(function() {
		var value = prompt('Time in sec:');
		if (value == '') {
			this.lvl.time = 0;
			this.timer0.setText('0');
		}else {
			this.lvl.time = value;
			this.timer0.setText(value);
		}
	},this);


	this.walkTxt = game.make.bitmapText(40,y+40,'font_dbg',this.lvl.walkthrough ? 'Walkthrough: '+ this.lvl.walkthrough.length+' steps' : "Walkthrough: ---", 20);
	

	this.addMultiple([this.tutLabel,this.tut0,this.tut1,this.timer0,this.timerLabel,this.walkTxt]);

}
BUBBLE.EditorWorldSidePanel = function() {

    Phaser.Group.call(this,game);

    this.x = 1500;

    this.lvl = null;
    this.lvlNr = null;

    this.levelNrTxt = game.make.bitmapText(10,10,'font_dbg','Level nr: --', 40);
    this.modeTxt = game.make.bitmapText(10,60,'font_dbg','Mode: --', 30);
    this.shooterTxt = game.make.bitmapText(10,90,'font_dbg','Shooter: --', 30);
    this.starsReqTxt = game.make.bitmapText(10,120,'font_dbg','Stars: --', 30);
    this.walkTxt = game.make.bitmapText(10,150,'font_dbg','Walkthrough: --', 30);
    this.tutorialsTxt = game.make.bitmapText(10,180,'font_dbg','Tuts: --', 30);

    this.bgPreview = game.make.image(-9999,-9999,null);


    this.lvlPreview = game.make.bitmapData(500,550);
    this.lvlPreviewBitmapImg = this.lvlPreview.addToWorld(10, 220, 0, 0);
    this.lvlPreviewImg = game.make.image(-9999,-9999,null);
    this.lvlPreviewImg.anchor.setTo(0.5);

    this.makeButtons(30,850);


    this.addMultiple([this.levelNrTxt,this.modeTxt,this.shooterTxt,this.starsReqTxt,this.lvlPreviewBitmapImg,this.walkTxt,this.tutorialsTxt]);


    this.lookUpObject = {}
    var elements = Array.prototype.concat(BUBBLE.e_elements.common_elements,BUBBLE.e_elements.special_elements);
    elements.forEach(function(child) {
        this.lookUpObject[child[0]] = child;
    },this)


    BUBBLE.events.onLevelSelected.add(this.loadLevelNr,this);


    

}

BUBBLE.EditorWorldSidePanel.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.EditorWorldSidePanel.constructor = BUBBLE.EditorWorldSidePanel;



BUBBLE.EditorWorldSidePanel.prototype.loadLevelNr = function(nr) {

    if (nr === null) {
        this.deselectLevel();
        return;
    }

    this.lvl = BUBBLE.levels[nr];
    this.lvlNr = nr;
    this.updateTexts();
    this.updatePreview();

}

BUBBLE.EditorWorldSidePanel.prototype.deselectLevel = function() {


    this.lvl = null;
    this.lvlNr = null;
    this.levelNrTxt.setText("Level nr: --");
    this.modeTxt.setText('Mode: --');
    this.shooterTxt.setText('Shooter: --');
    this.starsReqTxt.setText('Stars: --');
    this.lvlPreview.clear();

}


BUBBLE.EditorWorldSidePanel.prototype.updateTexts = function() {

    this.levelNrTxt.setText("Level nr: "+(this.lvlNr+1));

    var mode = (this.lvl.time && this.lvl.time != '0') ? 'Mode: '+this.lvl.mode+' (time limit: '+this.lvl.time+')' : 'Mode: '+this.lvl.mode;
    this.modeTxt.setText(mode);
    this.shooterTxt.setText('Shooter: '+this.lvl.shooter.bubblesNumber+' bubbles, '+this.lvl.shooter.mode);
    this.starsReqTxt.setText('Stars: '+ this.lvl.starsRequirements.join(', '));
    this.walkTxt.setText(this.lvl.walkthrough ? 'Walkthrough: '+ this.lvl.walkthrough.length+' steps' : "Walkthrough: ---");

    var tutTxt = 'Tutorials: ';
    tutTxt += (this.lvl.tut0 ? ' '+this.lvl.tut0+' ' : ' -- ');
    tutTxt += (this.lvl.tut1 ? ' '+this.lvl.tut1+' ' : ' -- ');

    this.tutorialsTxt.setText(tutTxt);
    
}

BUBBLE.EditorWorldSidePanel.prototype.updatePreview = function() {

    this.lvlPreview.clear();

    if (this.lvl.background != "") {
        this.bgPreview.loadTexture(this.lvl.background);
        this.bgPreview.height = 600;
        this.bgPreview.scale.x = this.bgPreview.scale.y;
        this.lvlPreview.draw(this.bgPreview,0,0);
    }

    var multi = this.lvlPreview.width/960;

    this.lvl.level.forEach(function(child) {

        var type = child[2];       

        if (child[2].indexOf('keyhole') != -1) {
            this.lvlPreviewImg.loadTexture('bubblesheet','chain');
            this.lvlPreview.draw(this.lvlPreviewImg, 0, child[1]*(51*multi)+(51*multi*0.5), this.bgPreview.width, 58*multi*0.5);
            type = child[2].slice(-1)
        };

        var element = this.lookUpObject[type];

        this.lvlPreviewImg.loadTexture(element[1],element[2]);

        var xx = child[0]*(58*multi);
        var yy = child[1]*(51*multi)+(51*multi*0.5);
        if (child[1] % 2 == 1) xx += 58*multi*0.5;

        var cacheImg = game.cache.getFrameByName(element[1],element[2])

        var w = cacheImg.width*multi;
        var h = cacheImg.height*multi;

        this.lvlPreview.draw(this.lvlPreviewImg, xx, yy, w, h);

    },this)

}

BUBBLE.EditorWorldSidePanel.prototype.makeButtons = function(x,y) {

    this.moveBackButton = game.make.button(x,y);
    this.moveBackButton.loadTexture('esheet','lvl_moveBack');
    this.moveBackButton.onInputDown.add(function() {
        if (this.lvlNr === null) return;
        if (this.lvlNr == 0) return;
        
        /*
        var tmpPos = BUBBLE.levels[this.lvlNr].worldMapPosition;
        BUBBLE.levels[this.lvlNr].worldMapPosition = BUBBLE.levels[this.lvlNr-1].worldMapPosition;
        BUBBLE.levels[this.lvlNr-1].worldMapPosition = tmpPos;
        */
        BUBBLE.levels[this.lvlNr] = BUBBLE.levels[this.lvlNr-1];
        BUBBLE.levels[this.lvlNr-1] = this.lvl;
        BUBBLE.events.onLevelSelected.dispatch(this.lvlNr-1);

        BUBBLE.events.requestRefresh.dispatch()
    },this);


    this.moveForwardButton = game.make.button(x+90,y);
    this.moveForwardButton.loadTexture('esheet','lvl_moveForward');
    this.moveForwardButton.onInputDown.add(function() {
        if (this.lvlNr === null) return;
        if (this.lvlNr < BUBBLE.levels.length-1) {
            /*
            var tmpPos = BUBBLE.levels[this.lvlNr].worldMapPosition;
            BUBBLE.levels[this.lvlNr].worldMapPosition = BUBBLE.levels[this.lvlNr+1].worldMapPosition;
            BUBBLE.levels[this.lvlNr+1].worldMapPosition = tmpPos;
            */
            BUBBLE.levels[this.lvlNr] = BUBBLE.levels[this.lvlNr+1]
            BUBBLE.levels[this.lvlNr+1] = this.lvl;
            BUBBLE.events.onLevelSelected.dispatch(this.lvlNr+1);

            BUBBLE.events.requestRefresh.dispatch()
        }

    },this);


    this.deleteLevelButton = game.make.button(x+90+90,y);
    this.deleteLevelButton.loadTexture('esheet','lvl_deleteLevel');
    this.deleteLevelButton.onInputDown.add(function() {

        if (this.lvlNr === null) return;
        if (confirm("Are you sure you want to delete level?")) {
            BUBBLE.levels.splice(this.lvlNr,1);
            BUBBLE.events.onLevelSelected.dispatch(null);
            BUBBLE.events.requestRefresh.dispatch();
        }
        

    },this);


    this.editLevelButton = game.make.button(x+180,y-90);
    this.editLevelButton.loadTexture('esheet','lvl_edit');
    this.editLevelButton.onInputDown.add(function() {
        if (this.lvlNr === null) return;
        game.state.start('Editor',true,false,this.lvl);

    },this);


    this.changeBgButton = game.make.button(x,y-90);
    this.changeBgButton.loadTexture('esheet','lvl_changeBackground');
    this.changeBgButton.onInputDown.add(function() {

        if (this.lvlNr === null) return;
        
        if (this.lvl.background == "") {
            this.lvl.background = BUBBLE.assets.backgrounds[0];
        }else {
            var index = BUBBLE.assets.backgrounds.indexOf(this.lvl.background);
            index = (index+1) % BUBBLE.assets.backgrounds.length;
            this.lvl.background = BUBBLE.assets.backgrounds[index];
        }

        this.updatePreview();

    },this);


    this.exportButton = game.make.button(x+180+90,y);
    this.exportButton.loadTexture('esheet','lvl_export');
    this.exportButton.onInputDown.add(function() {
        var obj = {
            levels:BUBBLE.levels,
        }
        var blob = new Blob([JSON.stringify(obj)],{type: "text/plain;charset=utf-8"});
        saveAs(blob, "levels.json");

    });


    this.addMultiple([this.changeBgButton,this.moveBackButton,this.moveForwardButton,this.deleteLevelButton, this.editLevelButton, this.exportButton]);
};

BUBBLE.GameGridEditor = function(lvl) {
	
	Phaser.Group.call(this, game);

	this.offsetX = 0;
	this.offsetY = 0;
	this.lvl = lvl;

	this.initGrid(11,1);

	this.cursors = game.input.keyboard.createCursorKeys();


	this.element = false;

	this.mode = 'Classic';

	this.lockInput = false;

	this.previewImage = game.add.image(0,0,null);
	this.previewImage.anchor.setTo(0.5,0.5);
	this.previewImage.alpha = 0.8;



	this.shooterLine = game.add.image(0,700,'esheet','warning_line');
	this.shooterLine.visible = false;
 
	BUBBLE.events.onToolChange.add(function(element) {
		this.element = element;
		this.previewImage.loadTexture(element[1],element[2]);
	},this);

	BUBBLE.events.onDeleteAllElements.add(function() {
		var allKids = [];

		this.forEach(function(child) {
			allKids.push(child);
		});

		this.destroyBubbles(allKids);
	},this);

	BUBBLE.events.onModeChange.add(function(mode) {

		if (this['changeFrom'+this.mode]) {
			this['changeFrom'+this.mode]();
		}

		this.mode = mode;

		if (this['changeTo'+mode]) {
			this['changeTo'+mode]();
		}

	},this);


	game.input.onDown.add(function(pointer) {

		if (this.lockInput) return;

		if (pointer.worldX > 0 && pointer.worldX < 640) {
			this.processClick(pointer.worldX,pointer.worldY);
		}

	},this);


	this.importLevel(this.lvl.level);

}

BUBBLE.GameGridEditor.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.GameGridEditor.constructor = BUBBLE.GameGridEditor;

BUBBLE.GameGridEditor.prototype.initGrid = function(width,height) {

	this.cellW = 58;
	this.cellH = 51;

	this.gridArray = new BUBBLE.GridArray();
	
}


BUBBLE.GameGridEditor.prototype.getTargetY = function() {
	return Math.min(0,this.maxY - this.height)
}


BUBBLE.GameGridEditor.prototype.update = function() {

	if (this.cursors.down.isDown) {
		this.y -= 10;
		
	}
	if (this.cursors.up.isDown) {
		this.y += 10;

	}

	this.y = Math.min(0,this.y);

	if (this.mode == 'Ghost') {
		this.y = 0;
	}

	if (this.mode == 'Boss') {

	}

	var cell = this.outsidePxToCell(game.input.activePointer.worldX,game.input.activePointer.worldY);
	if (this.isCellValid(cell)) {

		var pxPos = this.cellToOutsidePx(cell[0],cell[1]);
		this.previewImage.visible = true;
		this.previewImage.x = pxPos[0];
		this.previewImage.y = pxPos[1];
	}else {
		this.previewImage.visible = false;
	}

	if (game.input.activePointer.isDown) {
		var pointer = game.input.activePointer

		if (this.lockInput) return;
		if (pointer.worldX > 0 && pointer.worldX < 640) {
			this.processClick(pointer.worldX,pointer.worldY);
		}

	}
}

BUBBLE.GameGridEditor.prototype.makeBubble = function(x,y,element) {

	var pxPos = this.cellToInsidePx(x,y);
	var bubble = new BUBBLE.Bubble(x,y,pxPos[0],pxPos[1],'0')
	bubble.type = element[0];
	bubble.loadTexture(element[1],element[2]);
	this.gridArray.set(x,y,bubble);
	this.add(bubble);
	return bubble;
}

BUBBLE.GameGridEditor.prototype.processClick = function(x,y) {

	if (!this.element) return;

	var cell = this.outsidePxToCell(x,y);

	if (!this.isCellValid(cell)) return;

	if (this.element[0] == 'ERASER') {
			
		var bubbleOnPlace = this.getBubble(cell[0],cell[1]);

		if (bubbleOnPlace && bubbleOnPlace.type.slice(0,6) == "SHIELD") {
			this.destroyShield(cell[0],cell[1]);
		}else if (bubbleOnPlace) {
			this.destroyBubbles([this.getBubble(cell[0],cell[1])]);
		}

		
	} else if (this.element[0] == "GHOST") {

		var ghost = null;

		

		this.forEach(function(child) {
			if (child.type == "GHOST") {
				ghost = child;
			}
		});

		

		if (ghost !== null) {
			this.destroyBubbles([ghost]);
		}

		var bubble = this.getBubble(cell[0],cell[1]);
		if (bubble) {
			this.destroyBubbles([this.getBubble(cell[0],cell[1])]);
		}
		this.makeBubble(cell[0],cell[1],this.element);


	} else if (this.element[0].slice(0,6) == "SHIELD") {

		this.makeShield(cell[0],cell[1],this.element);

	}	else if (this.element[0] == "keyhole") {

		var bubble = this.getBubble(cell[0],cell[1]);
		if (bubble && ["0","1","2","3","4","5"].indexOf(bubble.type) != -1) {

			bubble.type = 'keyhole_'+bubble.type;
			bubble.keyhole = bubble.addChild(game.make.image(0,0,'bubblesheet','keyhole'));
			bubble.keyhole.anchor.setTo(0.5);

		};

	}else {
	
		var bubble = this.getBubble(cell[0],cell[1]);

		

		if (bubble) {
			if (bubble.type.slice(0,6) == "SHIELD") {
				return;
			}else {
				this.destroyBubbles([this.getBubble(cell[0],cell[1])]);
			}
			
		}
		this.makeBubble(cell[0],cell[1],this.element);
	
	}

}


BUBBLE.GameGridEditor.prototype.makeShield = function(cx,cy,element) {

	if (cx == 0 || (cx == 10 && cy % 2 == 0) || (cx == 9 && cy % 2 == 1) || cy == 0) {
		return;
	}


	var neighbours = this.getNeighbours(cx,cy);
	neighbours.push(this.getBubble(cx,cy));
	
	var onShield = false;

	neighbours.forEach(function(child) {
		if (child) {
			if (child.type.slice(0,6) == "SHIELD") {
				onShield = true;
			} 
		}
	});

	if (onShield) return;

	this.destroyBubbles(neighbours);


	var center = this.makeBubble(cx,cy,element);
	center.centerOfShield = center;

	var left = this.makeBubble(cx-1,cy,['SHIELD',null,null]);
	left.centerOfShield = center;
	var right = this.makeBubble(cx+1,cy,['SHIELD',null,null]);
	right.centerOfShield = center;

	var offset = cy % 2 == 0 ? -1 : 0;

	var topLeft = this.makeBubble(cx+offset,cy-1,['SHIELD',null,null]);
	topLeft.centerOfShield = center;
	var topRight = this.makeBubble(cx+offset+1,cy-1,['SHIELD',null,null]);
	topRight.centerOfShield = center;
	var bottomLeft = this.makeBubble(cx+offset,cy+1,['SHIELD',null,null]);
	bottomLeft.centerOfShield = center;
	var bottomRight = this.makeBubble(cx+offset+1,cy+1,['SHIELD',null,null]);
	bottomRight.centerOfShield = center;

}

BUBBLE.GameGridEditor.prototype.destroyShield = function(cx,cy) {

	

	var center = this.getBubble(cx,cy).centerOfShield;
	var neighbours = this.getNeighbours(center.cellX,center.cellY);
	neighbours.push(this.getBubble(center.cellX,center.cellY));
	this.destroyBubbles(neighbours);
}


BUBBLE.GameGridEditor.prototype.isCellValid = function(cell) {

	if (cell[1] < 0) return false;

	if (cell[1] % 2 == 0) {
		return cell[0] >= 0 && cell[0] <= 10; 
	}else {
		return cell[0] >= 0 && cell[0] <= 9; 
	}

}


BUBBLE.GameGridEditor.prototype.isSpaceFreePx = function(px,py) {
	var cell = this.outsidePxToCell(px,py);
	return this.isSpaceFree(cell[0],cell[1]);
}

BUBBLE.GameGridEditor.prototype.isSpaceFree = function(cx,cy) {
	return this.getBubble(cx,cy) ? false : true;
}

BUBBLE.GameGridEditor.prototype.outsidePxToCell = function(x,y) {
	return this.insidePxToCell(x-this.x,y-this.y);
}

BUBBLE.GameGridEditor.prototype.insidePxToCell = function(x,y) {

		var clean;

		if (y < 0) {
			clean = y % 51 > -34;
		}else {
			clean = y % 51 > 17;
		}

		var xx,yy,modX,modY;

		yy = Math.floor(y/51);

		if (!clean) {
			
			modX = yy % 2 == 0 ? x % 58 : (x-29) % 58;
			modX = modX < 0 ? 58+modX : modX;
			modY = y > 0 ? y % 51 : 51-Math.abs(y % 51);

			if (modX+modY < 23 || modX+modY > 52) {
				yy--;
			}

			if (yy % 2 == 0) {
				xx = Math.floor(x/58);
			}else {
				xx = Math.floor((x-29)/58)
			}
				
		}else {
			if (yy % 2 == 0) {
				xx = Math.floor(x/58);
			}else {
				xx = Math.floor((x-29)/58)
			}
		}

		return [xx,yy];

		
}


BUBBLE.GameGridEditor.prototype.cellToInsidePx = function(x,y) {

	if (y % 2 == 0) {
		return [x*this.cellW+(this.cellW*0.5)-this.offsetX, y*this.cellH+(this.cellW*0.5)-this.offsetY];
	}else {
		return [x*this.cellW+this.cellW-this.offsetX, y*this.cellH+(this.cellW*0.5)-this.offsetY];
	}

}

BUBBLE.GameGridEditor.prototype.cellToOutsidePx = function(x,y) {

	if (y % 2 == 0) {
		return [x*this.cellW+(this.cellW*0.5)-this.offsetX, y*this.cellH+(this.cellW*0.5)-this.offsetY+this.y];
	}else {
		return [x*this.cellW+this.cellW-this.offsetX, y*this.cellH+(this.cellW*0.5)-this.offsetY+this.y];
	}

}


BUBBLE.GameGridEditor.prototype.outsidePxToInsidePx = function(x,y) {
	return [x,y-this.y];
} 


BUBBLE.GameGridEditor.prototype.getBubble = function(cellX,cellY) {
	return this.gridArray.get(cellX,cellY); 
}


BUBBLE.GameGridEditor.prototype.getNeighbours = function(cellX,cellY) {

	if (cellY % 2 == 0) {

		return [
			this.getBubble(cellX-1,cellY-1),
			this.getBubble(cellX-1,cellY),
			this.getBubble(cellX-1,cellY+1),
			this.getBubble(cellX,cellY-1),
			this.getBubble(cellX,cellY+1),
			this.getBubble(cellX+1,cellY)
		]

	}else {

		return [
			this.getBubble(cellX,cellY-1),
			this.getBubble(cellX-1,cellY),
			this.getBubble(cellX,cellY+1),
			this.getBubble(cellX+1,cellY-1),
			this.getBubble(cellX+1,cellY+1),
			this.getBubble(cellX+1,cellY)
		]

	}

}



BUBBLE.GameGridEditor.prototype.destroyBubbles = function(array) {
	array.forEach(function(child) {
		if (!child) return;
		this.gridArray.set(child.cellX,child.cellY,null);
		child.destroy();
		BUBBLE.events.onBubbleDestroyed.dispatch(child);
	},this);
}




BUBBLE.GameGridEditor.prototype.changeFromGhost = function() {

	this.shooterLine.visible = false;
	this.y = 0;

	var ghost = [];

	this.forEach(function(child) {
		if (child.type == 'GHOST') {
			ghost.push(child);
		}
	});

	this.destroyBubbles(ghost);

}

BUBBLE.GameGridEditor.prototype.changeToGhost = function() {

	this.shooterLine.visible = true;
	this.y = 0;

	var toDestroy = [];

	this.forEach(function(child) {
		if (child.cellY > 12) {
			toDestroy.push(child);
		}
	});

	this.destroyBubbles(toDestroy);

}


BUBBLE.GameGridEditor.prototype.changeFromAnimals = function() {

	var animals = [];

	this.forEach(function(child) {
		if (child.type == "ANIMAL") {
			animals.push(child);
		}
	});

	this.destroyBubbles(animals);

}

BUBBLE.GameGridEditor.prototype.changeFromBoss = function() {

	var shield = [];

	this.forEach(function(child) {
		if (child.type.slice(0,6) == "SHIELD") {
			shield.push(child);
		}
	});
	
	this.destroyBubbles(shield);

}


BUBBLE.GameGridEditor.prototype.exportLevel = function() {

	if (!this.checkConditionsToExportLevel()) return null;

	var result = [];

	this.setGoalTarget();

	this.forEach(function(child) {
		//check if not outer parts of shield
		if (child.type !== "SHIELD") {
			result.push([child.cellX,child.cellY,child.type]);
		}
	});

	return result;

}

BUBBLE.GameGridEditor.prototype.importLevel = function(level) {

	var lookUpObject = {}

	var elements = Array.prototype.concat(BUBBLE.e_elements.common_elements,BUBBLE.e_elements.special_elements);
	elements.forEach(function(child) {
		lookUpObject[child[0]] = child;
	});
	

	level.forEach(function(child) {

		if (child[2].slice(0,6) == "SHIELD") {
			this.makeShield(child[0],child[1],lookUpObject[child[2]]);
		}
		else if (child[2].indexOf('keyhole') != -1) {
			var bubble = this.makeBubble(child[0],child[1],lookUpObject[child[2][8]]);
			bubble.type = 'keyhole_'+bubble.type;
			bubble.keyhole = bubble.addChild(game.make.image(0,0,'bubblesheet','keyhole'));
			bubble.keyhole.anchor.setTo(0.5);

		}else {
			this.makeBubble(child[0],child[1],lookUpObject[child[2]]);
		}
		


	},this);

}

BUBBLE.GameGridEditor.prototype.checkConditionsToExportLevel = function() {
	
	

	var pass = false;

	if (this.mode == "Classic") {

		var count = 0;
		this.forEach(function(child) {
			if (child.cellY == 0) {
				count++;
			}
		});

		pass = count >= 6;
		

		if (!pass) alert("Level should have at least 6 bubbles in top row (to hold bubbles below)!");


	}else if (this.mode == "Animals") {

		this.forEach(function(child) {
			if (child.cellY == 0) {
				pass=true;
			}
		});

		if (!pass) alert("Level should have at least 1 bubbles in top row (to hold bubbles below)!");


	}else if (this.mode == "Ghost") {

		this.forEach(function(child) {
			if (child.type == "GHOST") {
				pass=true;
			}
		});

		if (!pass) alert("Level should have GHOST!");

	}else if (this.mode == "Boss") {

		this.forEach(function(child) {
			if (child.type.slice(0,6) == "SHIELD") {
				pass=true;
			}
		});

		if (!pass) alert("Level should have at least one boss shield!");

	} 

	return pass;

}


BUBBLE.GameGridEditor.prototype.setGoalTarget = function() {

	switch(this.lvl.mode) {

		case 'Classic':
			break;

		case 'Ghost':
			this.lvl.goalTarget = 1;
			break;

		case 'Animals':
			var nrOfAnimals = 0;
			this.forEach(function(child) {
				if (child.type == "ANIMAL") nrOfAnimals++;
			});
			this.lvl.goalTarget = nrOfAnimals;
			break;

		case 'Boss':
			var nrOfShields = 0;
			this.forEach(function(child) {
				if (child.type.slice(0,7) == "SHIELD_") nrOfShields++;
			});
			this.lvl.goalTarget = nrOfShields;
			break;

	}

};

BUBBLE.GameGridEditor.prototype.getAllColorsOnBoard = function() {
	var result = [];

	this.forEach(function(child) {
	
		if (child.type == 0 || child.type == 1 || child.type == 2 || child.type == 3 || child.type == 4 || child.type == 5) {
			if (child.special == 'cham') return;
			if (result.indexOf(child.type) == -1) {
				result.push(child.type);
			}
		}
	});
	
	return result;
};

BUBBLE.Boot = function (game) {

};

BUBBLE.Boot.prototype = {

    init: function () {

        BUBBLE.detectConfig();

        //  Unless you specifically know your game needs to support multi-touch I would recommend setting this to 1
        this.input.maxPointers = 1;

        this.stage.backgroundColor = 0xffffff;
        game.time.advancedTiming = true;

        game.tweens.frameBased = true;

        //  Phaser will automatically pause if the browser tab the game is in loses focus. You can disable that here:
        this.stage.disableVisibilityChange = false;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;




        this.scaleGameSizeUpdate = function() {

            var ratio = window.innerWidth/window.innerHeight;
            var state = game.state.getCurrentState();
            var standardWidth = BUBBLE.l(640);
            var standardHeight = BUBBLE.l(960);
            var maxWidth = BUBBLE.l(2200);
            var maxHeight = BUBBLE.l(1300);
            
            BUBBLE.topStripeHeight = BUBBLE.l(94);
            BUBBLE.bottomStripeHeight = BUBBLE.l(110);

            if (state.NOTRESIZABLE) return;

            
            if (ratio > 1.31) {
                 

                BUBBLE.horizontal = true;

                var minWidth = BUBBLE.l(1135);
                var newWidth = Math.max(minWidth,Math.ceil(standardHeight*ratio));
                newWidth = Math.min(maxWidth,newWidth);
                game.scale.setGameSize(newWidth,standardHeight);
                var boundsX = Math.min(BUBBLE.l(-310),Math.ceil((newWidth-standardWidth)*-0.5));
                game.world.setBounds(boundsX,-BUBBLE.topStripeHeight,newWidth,10000);
            }else {

                BUBBLE.horizontal = false;
                //1050
                var minHeight = standardHeight+BUBBLE.bottomStripeHeight;
                var newHeight = Math.max(minHeight,Math.ceil(standardWidth*(window.innerHeight/window.innerWidth)));
                var newWidth = Math.max(standardWidth,Math.ceil(minHeight*ratio));
                newWidth = Math.min(maxWidth,newWidth);
                var yBoundsOffset = minHeight-game.height-BUBBLE.topStripeHeight; 
                game.scale.setGameSize(newWidth,Math.min(maxHeight,newHeight));
                game.world.setBounds(Math.ceil((newWidth-standardWidth)*-0.5), yBoundsOffset ,newWidth,10000);

            }
            
            
            if (BUBBLE.events) {
                BUBBLE.events.onScreenResize.dispatch(game.width,game.height);
            }   

            //!!! WORLD SCALING
            if (false) {
                c = document.getElementsByTagName('canvas')[0];
                var c_width = c.width;
                var c_height = c.height;
                c.width = parseInt(c.style.width);
                c.height = parseInt(c.style.height);
                game.world.scale.x = parseInt(c.style.width)/c_width;
                game.world.scale.y = parseInt(c.style.height)/c_height;
            }

        };

        SG_Hooks.setResizeHandler(this.scaleGameSizeUpdate);
        SG_Hooks.setOrientationHandler(this.scaleGameSizeUpdate);
        SG_Hooks.setPauseHandler(function() {
            game.paused = true;
        });
        SG_Hooks.setUnpauseHandler(function() {
            game.paused = false;
        });


        BUBBLE.SGconfig = JSON.parse(window.atob(SG_Hooks.getGameConfig()));


        if( SG_Hooks.isEnabledIncentiviseButton() ) {
            game.incentivise = true;
        }else {
            game.incentivise = false;
        }
        
        game.resizeGame = this.scaleGameSizeUpdate;
        this.scale.onSizeChange.add(this.scaleGameSizeUpdate);

        this.scale.setResizeCallback(function() {
            if (BUBBLE.old_w != window.innerWidth || BUBBLE.old_h != window.innerHeight) {
                BUBBLE.old_w = window.innerWidth;
                BUBBLE.old_h = window.innerHeight;
                game.resizeGame();
            }
        });
        
        
    },

    preload: function () {
        var folder = BUBBLE.config.current;
        game.load.text('assets', 'assets/json/assets.json');
        game.load.text('settings', 'assets/json/settings.json');
        game.load.text('languages', 'assets/json/languages.json');
        game.load.json('refillData', 'assets/json/refillData.json');
        game.load.image('logo_softgames','assets/'+folder+'/images/logo_softgames.png')
        game.load.image('logo','assets/'+folder+'/images/logo.png');
        game.load.image('teddy','assets/'+folder+'/images/teddy.png');
    
    },

    create: function () {

        BUBBLE.settings = JSON.parse(game.cache.getText('settings'));
        BUBBLE.assets = JSON.parse(game.cache.getText('assets'));
        BUBBLE.langdata = JSON.parse(game.cache.getText('languages'));
        BUBBLE.langdata.current = SG_Hooks.getLanguage(Object.keys(BUBBLE.langdata));
        BUBBLE.txt = function(text) {return this.langdata[this.langdata.current][text] || 'NO TEXT IN LANGUAGE.JSON! ' +text};

        BUBBLE.saveState.load();
        this.state.start('Preloader');

    }

};



BUBBLE.pause = false;

BUBBLE.events = {

    onIncreasePoints: new Phaser.Signal(),
    onBoosterUnlock: new Phaser.Signal(),
    onLevelUp: new Phaser.Signal(),

    testEvent: new Phaser.Signal(),

    onBubbleShoot: new Phaser.Signal(),
    onBubblePutToGrid: new Phaser.Signal(),
    onBubblePopOut: new Phaser.Signal(),
    outOfBubbles: new Phaser.Signal(),
    onBubbleDestroyed: new Phaser.Signal(),
    onBubbleOutOfGrid: new Phaser.Signal(),
    onFlyingBubbleMoved: new Phaser.Signal(),
    onInfectionSpreaded: new Phaser.Signal(),
    newLock: new Phaser.Signal(),
    unlockLock: new Phaser.Signal(),
    onBubbleSwap: new Phaser.Signal(),
    flash: new Phaser.Signal(),
    pushWindow: new Phaser.Signal(),

    reachedStar: new Phaser.Signal(),

    refreshGiftCounter: new Phaser.Signal(),

    onBoosterChange: new Phaser.Signal(),
    onScoreCoinHit: new Phaser.Signal(),
    flyingBubbleToBePut: new Phaser.Signal(),
    shakeCamera: new Phaser.Signal(),

    onPotBottomYChange: new Phaser.Signal(),

    onGoToAnimationReached: new Phaser.Signal(),
    onEndlessAddRows: new Phaser.Signal(),

    onBubblesMatch: new Phaser.Signal(),
    onBubblesPopOut: new Phaser.Signal(),
    onPopOutDestroyed: new Phaser.Signal(),
    onGoalAchieved: new Phaser.Signal(),
    onWindowOpened: new Phaser.Signal(),
    onWindowClosed: new Phaser.Signal(),
    onCoinsChange: new Phaser.Signal(),
    onLivesChange: new Phaser.Signal(),
    onMoveDone: new Phaser.Signal(),

    onGoodShoot: new Phaser.Signal(),
    onMissShoot: new Phaser.Signal(),
    onDoublePointsActivate: new Phaser.Signal(),

    onScreenResize: new Phaser.Signal(),
    requestDestroy: new Phaser.Signal(),
    onShieldDefeated: new Phaser.Signal(),
    onGhostFree: new Phaser.Signal(),
    onAnimalFree: new Phaser.Signal(),
    onCellingChange: new Phaser.Signal(),
    onCellingFree: new Phaser.Signal(),
    onCellingBlock: new Phaser.Signal(),

    onBubbleStartBounce: new Phaser.Signal(),
    onBubbleFinishBounce: new Phaser.Signal(),

    onChangeLevel: new Phaser.Signal(),

    onBoosterBought: new Phaser.Signal(),
    onOpenBoosterStrip: new Phaser.Signal(),
    onCloseBoosterStrip: new Phaser.Signal(),

    useOfbomb: new Phaser.Signal(),
    useOfmulticolor: new Phaser.Signal(),
    useOfaim: new Phaser.Signal(),
    useOfextraMoves: new Phaser.Signal,

    onShooterMovesCountUp: new Phaser.Signal(),

    fxBurstParticles: new Phaser.Signal(),
    fxCircleParticle: new Phaser.Signal(),
    fxBlastCircleParticle: new Phaser.Signal(),
    fxMatchParticle: new Phaser.Signal(),
    fxMatchParticleNew: new Phaser.Signal(),
    fxCloudParticle: new Phaser.Signal(),
    fxChameleonColorChange: new Phaser.Signal(),
    fxDummyBubble: new Phaser.Signal(),
    fxExplosion: new Phaser.Signal(),
    fxUnderMatch: new Phaser.Signal(),


    clear: function() {
        var keys = Object.keys(this);
        keys.forEach(function(child) {
            if (this[child].removeAll) {
                this[child].removeAll();
            }
        },this)
    }
}



BUBBLE.Endless = function (game) {

    this.GAMESTATE = true;

};
BUBBLE.Endless.prototype = {

    init: function() {

        s = game.state.getCurrentState();

        BUBBLE.saveState.startLevel();

        BUBBLE.events.clear();

        BUBBLE.seed = Math.floor(Math.random()*99999);

        //BUBBLE.currentLvlNr = lvlNr;
        this.lvl = this.LEVEL;
        this.lvlNr = 'ENDLESS';
        SG_Hooks.levelStarted(1);

        game.resizeGame();

        this.topGrid = true;

        if (BUBBLE.horizontal) {
            BUBBLE.potBottomY = game.camera.y + game.height;
        }else {
            BUBBLE.potBottomY = game.camera.y + game.height-BUBBLE.stripeHeight;
        }
    },

    create: function () {

        this.cameraShaker = new BUBBLE.CameraShaker();

        this.cameraController = new BUBBLE.CameraController();

        this.bg = BUBBLE.bg.addImgToWorld(this.lvl.background);
        this.doublePointsRopes = new BUBBLE.DoublePointsRopes();


        this.alarmGlow = new BUBBLE.EndlessAlarmGlow();

        this.redLine = game.add.imageL(320,58*10-10,'endless_red_line');
        this.redLine.anchor.setTo(0.5);

        this.bottomFxLayer = new BUBBLE.BottomFxLayer();
        this.bottomFxLayer.update = this.bottomFxLayer.childrenUpdate;

        
        game.add.existing(this.alarmGlow);

        this.grid = new BUBBLE.GameGrid(this.lvl);

        this.bottomFxLayer.init(this.grid,true);

        this.endlessController = new BUBBLE.EndlessController(this.grid);

        this.alarmGlow.grid = this.grid;
        BUBBLE.events.onMoveDone.add(this.alarmGlow.moveDone, this.alarmGlow);

        this.bottomFxLayer.init(this.grid);

        this.flyingBubbles = game.add.group();
        for (var i = 0; i < 10; i++) {
            this.flyingBubbles.add(new BUBBLE.BubbleFlying(this.grid));
        }

       this.scoreCoinsGroup = new BUBBLE.ScoreCoinsGroup();

        this.shooter = new BUBBLE.ShooterEndless(this.grid);
        this.cameraController.shooter = this.shooter;

        this.pots = new BUBBLE.PotsGroup(this.grid,this.scoreCoinsGroup);
        this.shooter.pots = this.pots;
        this.grid.popOutGroup = this.pots.bubbles;

        this.topFxLayer = new BUBBLE.TopFxLayer(this.grid,true);
        
        game.world.bringToTop(this.grid.locksGroup);

        //this.effectsBubbles = new BUBBLE.EffectsBubbles(this.grid);

        this.goalText = new BUBBLE.GoalText({mode:'Endless'});

        this.comboMsg = new BUBBLE.UI_ComboMsg();

        if (!BUBBLE.saveState.data.sawBomb) {
            this.uiTutBombText = new BUBBLE.TutBombText();
        }

        this.coverDoor = new BUBBLE.UI_CoverDoor();
        this.topHudBg = new BUBBLE.UI_TopHudBg();
        this.pointsController = new BUBBLE.UI_PointsController(this.pots,this.scoreCoinsGroup);
        this.pointsController.displayChangeMaxMin = 100;
        this.moneyUI = new BUBBLE.UI_Money();
        this.boosterStrip = new BUBBLE.UI_BoosterStrip();
        this.pauseButton = new BUBBLE.UI_PauseButton();
        
        this.aboveUI = new BUBBLE.AboveUI();

        if (!BUBBLE.saveState.data.sawTutorial) this.handTut = new UI_HandTutorial(this.goalText,this.pointsController,this.moneyUI,this.boosterStrip);
        this.boosterPointer = new UI_BoosterPointer(this.boosterStrip);

        this.flash = new BUBBLE.Flash();

        this.windowLayer = new BUBBLE.WindowLayer();
        this.fadeLayer = new BUBBLE.FadeLayerCross();

        this.goalText.wl = this.windowLayer;

        s = game.state.getCurrentState();
        g = s.grid;


        BUBBLE.events.onBubbleShoot.add(this.onShoot,this);

        BUBBLE.events.onMoveDone.add(function() {
            if (this.grid.getLowestBubble() > 10) {
                this.endGame();
            }
        },this);

        this.startLevel();

    },

    update: function() {

    },

    startLevel: function() {
        this.shooter.active = false;
        this.coverDoor.open();
        game.time.events.add(1000,function() {
            this.cameraController.startFlyOver();
        },this);
        this.cameraController.onFlyOverFinished.add(function() {
            this.shooter.active = true;
            if (this.timer) this.timer.active = true;
            this.boosterStrip.active = true;
            //if (this.lvl.tut0) {
            //this.windowLayer.pushWindow(['tutorial',0]);
            //}

            this.goalText.start();

        },this);
    },

    getLevel: function() {
        return this.lvl;
    },

    getLevelNr: function() {
        return this.lvlNr;
    },

    getScore: function() {
        return this.pointsController.pointsTarget;
    },

    endGame: function() {
        this.shooter.active = false;
        this.shooter.explode();

        game.time.events.add(1500,function() {

            if (this.windowLayer.children.length > 0) {
                this.windowLayer.forEach(function(c){c.closeWindow()});
            }
            this.windowLayer.pushWindow(['levelEndlessEnd']);

        },this);
       

    },

    onShoot: function(x,y,angle,type,popout) {
    	
			var bubble;
			if (popout) {
				var xx = x+BUBBLE.utils.lengthdir_x(this.shooter.cannon.angle-90,BUBBLE.l(170))
				var yy = y+BUBBLE.utils.lengthdir_y(this.shooter.cannon.angle-90,BUBBLE.l(170))
				bubble = new BUBBLE.BubbleRegular(-999,-999,xx,yy,'0');
				bubble.grid = this.grid;
				bubble.onPopOut();
				bubble.loadTexture('bubblesheet','bubble_'+(type || '0'));
				bubble.x = xx;
				bubble.y = yy;
				bubble.velX = BUBBLE.utils.lengthdir_x(this.shooter.cannon.angle-90,BUBBLE.l(15));
				bubble.velY = BUBBLE.utils.lengthdir_y(this.shooter.cannon.angle-90,BUBBLE.l(15));
			}else {
				bubble = this.flyingBubbles.getFirstDead();
				if (bubble) {
					bubble.init(x,y,angle,type || '0');
				}
			}
   },

   LEVEL: {"mode":"Classic","starsRequirements":[440,1770,2660],
   "worldMapPosition":[396.21033868092695,-338.8126159554731],
   "background":"levelBg",
   "shooter":{"mode":"pattern","bubblesNumber":30,
   "pattern":["0","1","3","2","0","1","3","2","0","1","3","2","0","1","3","2","0","1","3","2","0","1","3","2","0","1","3","2","0","1"]},
   "level":[[0,0,"0"],[0,1,"0"],[1,0,"0"],[1,1,"0"],[4,0,"1"],[3,0,"1"],[3,1,"1"],[4,1,"1"],[9,0,"3"],[10,0,"3"],[9,1,"3"],[8,1,"3"],[7,0,"2"],[6,1,"2"],[6,0,"2"],[5,1,"2"],[2,2,"3"],[3,2,"3"],[2,3,"3"],[7,2,"1"],[7,3,"1"],[8,2,"1"],[5,2,"0"],[4,3,"0"],[5,3,"0"],[1,3,"3"],[8,3,"1"],[1,4,"2"],[0,4,"2"],[0,5,"2"],[3,4,"1"],[4,4,"1"],[3,5,"1"],[9,4,"0"],[9,5,"0"],[10,4,"0"],[6,4,"3"],[7,4,"3"],[6,5,"3"]],
   "goalTarget":8,
   "tut0":null,
   "walkthrough":[["shoot",-1.5824318055394464,71],["shoot",-1.7305492576555208,84],["shoot",-1.78184327915485,76],["shoot",-2.228886839396505,134],["shoot",-1.2003597684353036,99],["shoot",-1.1032856987493345,89],["shoot",-1.2488624015661347,69],["shoot",-1.864346106319646,69]]
    },
  render: function() {
    /*
  	var cell = this.grid.outsidePxToCell(game.input.activePointer.worldX,game.input.activePointer.worldY)
  	var bubble = this.grid.getBubble(cell[0],cell[1]);
    game.debug.text(cell,10,15,'#ffff00');
    game.debug.text(bubble ? bubble.type : '--',10,25,'#ffff00');

    game.debug.text(this.pointsController.combo,10,50,'#ffff00');
    */
  }

};

BUBBLE.MainMenu = function (game) {


};

BUBBLE.MainMenu.prototype = {

	init: function() {
		game.renderer.clearBeforeRender = false;
		BUBBLE.events.clear();
		if (!game.sfx.music.isPlaying && !game.sound.mute) game.sfx.music.play('', 0, game.ie10 ? 1 : 0.3, true);

	}, 

	create: function () {

		SG_Hooks.start();
		
		//this.bg = BUBBLE.bg.addImgToWorld('main_menu_backgr', true);
		this.bg = game.add.imageL(320,0,'main_menu_backgr');
		this.bg.anchor.setTo(0.5,0);
		this.bg.onResize = function() {

			this.height = game.height;
			this.scale.x = this.scale.y;
			this.width = Math.max(game.width,this.width);

			if (this.cacheAsBitmap) {
					this.updateCache();
			}else {
				this.cacheAsBitmap = true;
			}
		}
		BUBBLE.events.onScreenResize.add(this.bg.onResize,this.bg);
		this.bg.onResize();

		this.mainGroup = game.add.group();

		this.teddy = game.add.imageL(400,700,'teddy');
		this.teddy.anchor.setTo(1);
		game.add.tween(this.teddy).to({y: BUBBLE.l(650)},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
		
		this.logo = game.add.imageL(320,200,'logo');
		this.logo.anchor.setTo(0.5);
		this.logo.angle = -10;

		game.add.tween(this.logo).to({angle: 10}, 3000, Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
		game.add.tween(this.logo.scale).to({x: 1.2}, 2800, Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
		game.add.tween(this.logo.scale).to({x: 1.2}, 2600, Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);


		this.mainMenuWin = new BUBBLE.Window('mainMenu');
		this.mainMenuWin.x = BUBBLE.l(320);
		this.mainMenuWin.y = BUBBLE.l(700);


		this.mainGroup.addMultiple([this.teddy,this.logo,this.mainMenuWin]);
		this.mainGroup.y = (game.height-BUBBLE.l(960))*0.5;

		BUBBLE.events.onScreenResize.add(function() {
			this.mainGroup.y = (game.height-BUBBLE.l(960))*0.5;
		},this);

		/*
		this.play = game.add.bitmapText(BUBBLE.l(320),BUBBLE.l(600),'font','PLAY',BUBBLE.l(80));
		this.play.anchor.setTo(0.5);
		this.play.inputEnabled = true;
		this.play.input.useHandCursor = true;
		this.play.events.onInputDown.add(function() {
			BUBBLE.events.onChangeLevel.dispatch('MenuWorld');
		});

		this.editor = game.add.bitmapText(BUBBLE.l(320),BUBBLE.l(750),'font','EDITOR',BUBBLE.l(80));
		this.editor.anchor.setTo(0.5);
		this.editor.inputEnabled = true;
		this.editor.input.useHandCursor = true;
		this.editor.events.onInputDown.add(function() {
			game.state.start("EditorWorld");
		});*/

		//this.makeEditorGate();


		this.fadeLayer = new BUBBLE.FadeLayerCross();

	},

	update: function () {


	},

	render: function() {

       //game.debug.text(BUBBLE.config.current, 2, 100, "#00ff00");

    }

    /*makeEditorGate: function() {

    	this.keys = game.input.keyboard.addKeys({e: Phaser.Keyboard.E, d: Phaser.Keyboard.D});
		this.keys.successfulPresses = 0;
		this.keys.lastKeyPressed = null;
		
		this.keys.e.onDown.add(function() {
			if (this.keys.lastKeyPressed === 'd' || this.keys.lastKeyPressed === null) {
				this.keys.successfulPresses++;
				this.keys.lastKeyPressed = 'e';
				if (this.keys.successfulPresses == 10) game.state.start("EditorWorld");
			}else {
				this.keys.lastKeyPressed = null;
				this.keys.successfulPresses = 0;
			}
		},this);

		this.keys.d.onDown.add(function() {
			if (this.keys.lastKeyPressed === 'e') {
				this.keys.successfulPresses++;
				this.keys.lastKeyPressed = 'd';
				if (this.keys.successfulPresses == 10) game.state.start("EditorWorld");
			}else {
				this.keys.lastKeyPressed = null;
				this.keys.successfulPresses = 0;
			}
		},this);

    }
    */

};

BUBBLE.Preloader = function (game) {

};


BUBBLE.Preloader.prototype = {

	preload: function () {

		this.teddy = game.add.image(BUBBLE.l(400),BUBBLE.l(700),'teddy');
		this.teddy.anchor.setTo(1);
		game.add.tween(this.teddy).to({y: BUBBLE.l(650)},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

		this.softgames = game.add.button(BUBBLE.l(320),BUBBLE.l(800),'logo_softgames',function() {
	        window.open("http://m.softgames.de/","_blank");
	    },this);
    	this.softgames.anchor.setTo(0.5,0.5);

    	this.preload_bg = game.add.image(BUBBLE.l(320),0,'logo');
    	this.preload_bar = game.add.image(0,0,'logo');
    	this.preload_bg.y = BUBBLE.l(200);
    	this.preload_bg.x -= this.preload_bg.width*0.5
    	this.preload_bg.alpha = 0.2;
    	this.preload_bar.y = this.preload_bg.y;
    	this.preload_bar.x = this.preload_bg.x;
    	game.load.setPreloadSprite(this.preload_bar);


		var folder = BUBBLE.config.current;
		game.load.image('cpiIcon',BUBBLE.SGconfig.crossPromotion.link.iconPath);

		//CPI ICON

		game.load.atlasJSONHash('ssheet','assets/'+folder+'/spritesheets/spritesheet.png','assets/'+folder+'/spritesheets/spritesheet.json');
		game.load.atlasJSONHash('bubblesheet','assets/'+folder+'/spritesheets/bubblesheet.png','assets/'+folder+'/spritesheets/bubblesheet.json');
		game.load.atlasJSONHash('explosionsheet','assets/'+folder+'/spritesheets/explosionsheet.png','assets/'+folder+'/spritesheets/explosionsheet.json');
		game.load.atlasJSONHash('burstsheet','assets/'+folder+'/spritesheets/burstsheet.png','assets/'+folder+'/spritesheets/burstsheet.json');
		game.load.atlasJSONHash('shootsheet','assets/'+folder+'/spritesheets/shootsheet.png','assets/'+folder+'/spritesheets/shootsheet.json');

		game.load.bitmapFont('font','assets/'+folder+'/fonts/font.png','assets/'+folder+'/fonts/font.fnt');
		game.load.bitmapFont('font-shadow','assets/'+folder+'/fonts/font-shadow.png','assets/'+folder+'/fonts/font-shadow.fnt');
		game.load.bitmapFont('font-outline','assets/'+folder+'/fonts/font-outline.png','assets/'+folder+'/fonts/font-outline.fnt');		
		game.load.bitmapFont('font-pots','assets/'+folder+'/fonts/font-pots.png','assets/'+folder+'/fonts/font-pots.fnt');

		game.load.image('levelBg','assets/'+folder+'/images/levelBg.jpg');
		game.load.image('tuthand','assets/'+folder+'/images/tuthand.png');

		game.load.image('main_menu_backgr','assets/'+folder+'/images/main_menu_backgr.jpg');



		game.load.audio('cash_register','assets/sfx/cash_register.mp3');
    game.load.audio('explosion_2','assets/sfx/explosion_2.mp3');
    game.load.audio('hit_1','assets/sfx/hit_1.mp3');
    game.load.audio('hit_2','assets/sfx/hit_2.mp3');
    game.load.audio('hit_3','assets/sfx/hit_3.mp3');
		game.load.audio('l_pop','assets/sfx/l_pop.mp3');
		game.load.audio('launch_ball','assets/sfx/launch_ball.mp3');
		game.load.audio('lose','assets/sfx/lose.mp3');
		game.load.audio('music','assets/sfx/music.mp3');
		game.load.audio('pop','assets/sfx/pop.mp3');
		game.load.audio('booster','assets/sfx/booster.mp3');
		game.load.audio('pot','assets/sfx/pot.mp3');
		game.load.audio('whoosh','assets/sfx/whoosh.mp3');
    game.load.audio('transition','assets/sfx/transition.mp3');
    game.load.audio('win','assets/sfx/win.mp3');

    game.load.audio('charge_up','assets/sfx/charge_up.mp3');
    game.load.audio('charge_up2','assets/sfx/charge_up2.mp3');
    game.load.audio('charge_up3','assets/sfx/charge_up3.mp3');
    game.load.audio('charge_up4','assets/sfx/charge_up4.mp3');
    game.load.audio('monster_ugh','assets/sfx/monster_ugh.mp3');

    game.load.audio('blackhole','assets/sfx/blackhole.mp3');
    game.load.audio('drop','assets/sfx/drop.mp3');
    game.load.audio('scorecoin','assets/sfx/scorecoin.mp3');
    game.load.audio('splash0','assets/sfx/splash0.mp3');
		game.load.audio('splash1','assets/sfx/splash1.mp3');
		game.load.audio('splash2','assets/sfx/splash2.mp3');
		game.load.audio('splash3','assets/sfx/splash3.mp3');
		game.load.audio('splash4','assets/sfx/splash4.mp3');
		game.load.audio('xylophone_positive','assets/sfx/xylophone_positive.mp3');
		game.load.audio('xylophone_positive2','assets/sfx/xylophone_positive2.mp3');


		game.load.audio('denied','assets/sfx/denied.mp3');
	},

	create: function () {

		BUBBLE.bg = new BUBBLE.Background();

		game.sfx = {};

		game.sfx.denied = game.add.audio('denied');

		game.sfx.blackhole = game.add.audio('blackhole');
		game.sfx.drop = game.add.audio('drop');
		game.sfx.scorecoin = game.add.audio('scorecoin');
		game.sfx.scorecoin.volume = 0.15;
		game.sfx.splash0 = game.add.audio('splash0');
		game.sfx.splash1 = game.add.audio('splash1');
		game.sfx.splash2 = game.add.audio('splash2');
		game.sfx.splash3 = game.add.audio('splash3');
		game.sfx.splash4 = game.add.audio('splash4');
		game.sfx.splash = {
			play: function() {
				game.sfx['splash'+game.rnd.between(0,4)].play();
			}
		}
		game.sfx.xylophone_positive1 = game.add.audio('xylophone_positive');
		game.sfx.xylophone_positive1.volume = 0.3;
		game.sfx.xylophone_positive2 = game.add.audio('xylophone_positive2');
		game.sfx.xylophone_positive2.volume = 0.3;
		game.sfx.xylophone_positive = {
			lastPlaying: {isPlaying: false},
			play: function() {
				if (!this.lastPlaying.isPlaying) {
					this.lastPlaying = game.sfx['xylophone_positive'+game.rnd.between(1,2)];
					this.lastPlaying.play();
				}
			}
		};


		game.sfx.cash_register = game.add.audio('cash_register');
		game.sfx.explosion_2 = game.add.audio('explosion_2');
		game.sfx.hit_1 = game.add.audio('hit_1');
		game.sfx.hit_2 = game.add.audio('hit_2');
		game.sfx.hit_3 = game.add.audio('hit_3');
		game.sfx.hit = {
			play: function() {
				game.sfx['hit_'+game.rnd.between(1,3)].play();
			}
		};
		
		game.sfx.music = game.add.audio('music');
		game.sfx.pop = game.add.audio('pop');
		game.sfx.booster = game.add.audio('booster');
		game.sfx.whoosh = game.add.audio('whoosh');
		game.sfx.transition = game.add.audio('transition');
		game.sfx.win = game.add.audio('win');
		game.sfx.lose = game.add.audio('lose');
		game.sfx.l_pop = game.add.audio('l_pop');
		game.sfx.charge_up = game.add.audio('charge_up');
		game.sfx.charge_up.volume = 0.2;
		game.sfx.charge_up2 = game.add.audio('charge_up2');
		game.sfx.charge_up2.volume = 0.2;
		game.sfx.charge_up3 = game.add.audio('charge_up3');
		game.sfx.charge_up3.volume = 0.2;
		game.sfx.charge_up4 = game.add.audio('charge_up4');
		game.sfx.charge_up4.volume = 0.2;
		game.sfx.monster_ugh = game.add.audio('monster_ugh');
		game.sfx.launch_ball = game.add.audio('launch_ball');

		for (var key in game.sfx) {
			if (game.sfx.hasOwnProperty(key)) {
				var sound = game.sfx[key];
				sound.playNorm = sound.play;
				sound.play = function() {
					if (!game.sound.mute) {
						this.playNorm.apply(this,arguments);
					}
				}
	        
			}
		}

		if (!game.sound.mute) {game.sfx.music.play('', 0, game.ie10 ? 1 : 0.3, true)};


	},

	update: function () {
		
		if (this.cache.isSoundDecoded('music')) {
			this.state.start('MainMenu');
		}
		
	}

};

BUBBLE.GoalGoToAnimation = function(target) {
	Phaser.Image.call(this,game,0,0,null);

	this.anchor.setTo(0.5);

	this.animating = false;
	this.animIndex = 1;
	this.aboveTarget = false;

}

BUBBLE.GoalGoToAnimation.prototype = Object.create(Phaser.Image.prototype);


BUBBLE.GoalGoToAnimation.prototype.init = function(object,target) {

	this.revive();
	this.loadTexture(object.key,object.frameName);
	this.x = object.x;
	this.y = object.y;
	this.target = target;
	this.alpha = 1;
	this.spd = 0.2;
	this.maxSpd = BUBBLE.l(15)
	this.velY = object.velDown || BUBBLE.l(15);
	this.aboveTarget = false;
	this.scale.setTo(1);
	this.animating = object.animating;

	game.add.tween(this.scale).to({x:1.4,y:1.4},1000,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);


};

BUBBLE.GoalGoToAnimation.prototype.update = function() {
	if (!this.alive) return;

	if (this.animating) {
		this.animIndex++;
		this.animIndex = this.animIndex > 11 ? 1 : this.animIndex;
		this.loadTexture('bubblesheet', this.animIndex < 10 ? 'star_0'+this.animIndex : 'star_'+this.animIndex);
	};

	this.updatePosition();

};

BUBBLE.GoalGoToAnimation.prototype.updatePosition = function() {

	if (this.aboveTarget) {
		this.x = this.target.world.x;
		this.y = this.target.world.y;
 
	}else {

		var direction = game.math.radToDeg(game.math.angleBetween(this.x,this.y,this.target.world.x,this.target.world.y));
		this.x += BUBBLE.utils.lengthdir_x(direction,this.maxSpd*this.spd);
		this.y += BUBBLE.utils.lengthdir_y(direction,this.maxSpd*this.spd);
		this.spd = Math.min(1,this.spd+0.025);

		this.y +=this.velY;
		this.velY = Math.max(0,this.velY-0.25);

		if (game.math.distance(this.x,this.y,this.target.world.x,this.target.world.y) < this.maxSpd) {
			this.aboveTarget = true;
			this.x = this.target.world.x;
			this.y = this.target.world.y;
			game.add.tween(this.scale).to({x:1.5,y:1.5},300,Phaser.Easing.Cubic.Out,true);
			game.add.tween(this).to({alpha: 0},300,Phaser.Easing.Cubic.Out,true).onComplete.add(this.kill,this);
			this.animation = false;
			BUBBLE.events.onGoToAnimationReached.dispatch(this.target);
			
			
		}

	}

};
UI_BoosterHighlight = function(boosterToFollow) {
	
	Phaser.Image.call(this,game,0,0,null);

	this.boosterStrip = game.state.getCurrentState().boosterStrip;
	if (!this.boosterStrip) return;

	this.anchor.setTo(0.5);


	this.boosterType = boosterToFollow;
	this.boosterToFollow;

	this.boosterStrip.boosters.forEach(function(group) {
		if (group && group.button && group.button.booster == boosterToFollow) {
			this.boosterToFollow = group;
		}
	},this);
	
	this.update = function() {
		this.shine.angle++;
		this.x = this.boosterToFollow.button.world.x
		this.y = this.boosterToFollow.button.world.y
	};

	this.mimic();


	game.add.existing(this);

};

UI_BoosterHighlight.prototype = Object.create(Phaser.Image.prototype);

UI_BoosterHighlight.prototype.mimic = function() {

	

	var boosterAmount = BUBBLE.saveState.getBooster(this.boosterType);

	this.shine = BUBBLE.makeImageL(0,0,'shine',0.5,this);
	this.button = BUBBLE.makeImageL(0,0,this.boosterToFollow.button.frameName,0.5,this);
	this.label = BUBBLE.makeImageL(0,0,this.boosterToFollow.button.label.frameName,0.5,this);
	this.boosterPcs = BUBBLE.makeImageL(30,25,boosterAmount == 0 ? 'button_booster_buy' : 'bg_booster_counter',0.5,this);
	this.boosterPcs.txt = game.make.bitmapTextL(0,-5,'font',boosterAmount.toString(),35);
	this.boosterPcs.txt.anchor.setTo(0.5);
	this.boosterPcs.addChild(this.boosterPcs.txt);

};
UI_BoosterPointer = function(boosterUI) {

	Phaser.Image.call(this,game,0,0,'tuthand');
	this.alpha = 0;

	this.boosterUI = boosterUI;
	this.hiding = true;

	this.missCombo = 0;
	this.refillNr = 0;

	BUBBLE.events.onScreenResize.add(this.onResize,this);

	this.levelUpHiding = false;

	this.shootNr = 0;

	BUBBLE.events.onLevelUp.add(function() {
		this.levelUpHiding = true;
		game.time.events.add(1000,function() {
			this.levelUpHiding = true;
		},this);
	},this);

	BUBBLE.events.onGoodShoot.add(function() {
		this.missCombo = 0;
		this.addShootNr();
	},this);

	BUBBLE.events.onMissShoot.add(function() {
		this.missCombo++;
		this.addShootNr();
		if (this.missCombo == 3) {
			this.pointBoosters();
			this.missCombo = 0;
		};
	},this);

	game.add.existing(this);

};

UI_BoosterPointer.prototype = Object.create(Phaser.Image.prototype);

UI_BoosterPointer.prototype.onResize = function() { 
	this.hiding = true;
};

UI_BoosterPointer.prototype.update = function() {
	if (this.hiding) this.alpha = Math.max(0,this.alpha-0.02);
};

UI_BoosterPointer.prototype.addShootNr = function() {

	this.shootNr++;

	if (this.shootNr % 7 == 0 && !BUBBLE.saveState.data.sawAim  && !BUBBLE.saveState.data.sawMulticolor && !BUBBLE.saveState.data.bombUseByStrip) {
		this.pointBoosters();
	}

};

UI_BoosterPointer.prototype.pointBoosters = function(skipAddingEvent) {

 
	if(!this.hiding && !this.levelUpHiding && this.alpha > 0) return;

	if (!skipAddingEvent) { 
		game.time.events.add(2500,function() {
			this.hiding = true;
		},this);
	}


	this.stage = 4;
	this.hiding = false;
	if (this.tween) this.tween.stop();

	if (this.alpha == 0) {
		game.add.tween(this).to({alpha:1},300,Phaser.Easing.Sinusoidal.InOut,true);
	}

	if (BUBBLE.horizontal) {
		this.scale.x = -1;
		this.scale.y = 1;
		this.x = BUBBLE.settings.ui.booster.h.x-BUBBLE.l(40);
		this.y = game.world.bounds.y+BUBBLE.settings.ui.booster.h.y+BUBBLE.l(110);
		this.tween = game.add.tween(this).to({y:this.y + BUBBLE.l(350)},700,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

	}else {

		this.scale.x = -1;
		this.scale.y = -1;
		this.x = this.boosterUI.x-BUBBLE.l(30);
		this.y = this.boosterUI.y;
		this.tween = game.add.tween(this).to({x:this.boosterUI.x+BUBBLE.l(240)},700,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

	}

};



BUBBLE.UI_BoosterStrip = function() {

	Phaser.Group.call(this,game);

	this.fixedToCamera = true;

	this.bg = game.make.imageL(0,0,'hud_below');
	this.bg.anchor.setTo(0.5,0);
	this.add(this.bg);

	this.active = false;

	this.horizontal = false;

	this.boosters = [];
	this.boosters[0] = this.makeBooster(0,0,'aim');
	//this.boosters[1] = this.makeBooster(0,0,'extraMoves');
	this.boosters[1] = this.makeBooster(0,0,'multicolor');
	this.boosters[2] = this.makeBooster(0,0,'bomb');
	this.addMultiple(this.boosters);

	BUBBLE.events.onWindowOpened.add(this.lockInput,this);
	BUBBLE.events.onWindowClosed.add(this.unlockInput,this);
	BUBBLE.events.onScreenResize.add(this.onResize,this);

	this.onResize();

}

BUBBLE.UI_BoosterStrip.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.UI_BoosterStrip.constructor = BUBBLE.UI_BoosterStrip;

BUBBLE.UI_BoosterStrip.prototype.lockInput = function() {
	this.forEach(function(el) {
		if (el.lockInput) {
			el.lockInput();
		}
	});
};



BUBBLE.UI_BoosterStrip.prototype.unlockInput = function() {
	this.forEach(function(el) {
		if (el.unlockInput) {
			el.unlockInput();
		}
	});
};

BUBBLE.UI_BoosterStrip.prototype.boosterSpriteLookUp = {
	bomb: 'booster_bomb',
	multicolor: 'booster_multicolor',
	aim: 'booster_aim',
	extraMoves: 'booster_extraMoves'
};


BUBBLE.UI_BoosterStrip.prototype.onResize = function() {
	this.horizontal = BUBBLE.horizontal;
	this.sliding = !this.horizontal;	



	if (this.horizontal) {

		var pos = BUBBLE.settings.ui.booster.h;
		var xx = -game.world.bounds.x+BUBBLE.l(pos.x);
		var yy = BUBBLE.l(pos.y);

		this.bg.visible = false;
		this.cameraOffset.x = xx;
		this.cameraOffset.y = yy;
		this.boosters[0].x = this.boosters[1].x = this.boosters[2].x = 0;
		this.boosters[0].y = BUBBLE.l(130);
		this.boosters[1].y = BUBBLE.l(290);
		this.boosters[2].y = BUBBLE.l(450);
	}else {
		this.bg.visible = true;
		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(320);
		this.cameraOffset.y = game.height-BUBBLE.bottomStripeHeight;
		this.boosters[0].y = this.boosters[1].y = this.boosters[2].y = BUBBLE.bottomStripeHeight*0.55;
		this.boosters[0].x = BUBBLE.l(-80);
		this.boosters[1].x = BUBBLE.l(80);
		this.boosters[2].x = BUBBLE.l(240);
	}

	var handTut = game.state.getCurrentState().handTut

	if (handTut && handTut.alive && handTut.stage == 3) {
		handTut.onResize();
	}

}

BUBBLE.UI_BoosterStrip.prototype.makeBooster = function(x,y,type) {


	var boosterAmount = BUBBLE.saveState.getBooster(type);

	var g = game.make.group();
	g.x = x;
	g.y = y;

	var shine = BUBBLE.makeImageL(0,0,'shine',0.5,g);
	shine.alpha = 0;
	shine.update = function() {
		this.angle++;
	};

	g.shine = shine;

	var button = new BUBBLE.Button(0,0,'button_booster', function() {
		var nrOfBooster = BUBBLE.saveState.getBooster(this.booster);
		if (nrOfBooster > 0) {
			BUBBLE.events['useOf'+this.booster].dispatch();
			if (this.booster == 'bomb') {
				BUBBLE.saveState.data.bombUseByStrip = true;
			}
			this.boosterPcs.refresh()
		} else {
			//new BUBBLE.Window('shop');
			new BUBBLE.Window('shopOneItem',this.booster);
		}
	},button);

	//BOMB AND MULTICOLOR OVERLAY
	if (type == 'bomb' || type == 'multicolor') {
		button.fill = BUBBLE.makeImageL(0,0,'button_booster_green',0.5,button);
		button.fill.pulseAlpha = 1;
		game.add.tween(button.fill).to({pulseAlpha: 0},250,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
		button.fill.alphaMulti = 0;
		button.fill.active = false;
		button.fill.shooter = game.state.getCurrentState().shooter;
		button.fill.myType = type;

		button.fill.update = function() {
			this.active = this.shooter.bubble0.color == this.myType || this.shooter.bubble1.color == this.myType;
			this.alphaMulti = game.math.clamp(this.alphaMulti + (this.active ? 0.05 : -0.05),0,1);
			this.alpha = this.alphaMulti * this.pulseAlpha;
		}

		button.update = function() {
			this.fill.update();
		}

	}

	//AIM GREEN OVERLAY
	if (type == 'aim') {
		button.fill = BUBBLE.makeImageL(0,0,'button_booster_green',[0.5,1]);
		button.addChild(button.fill);
		button.fill.y = button.fill.height*0.5;
		
		button.fill.maxHeight = button.fill.height;
		button.fill.cropRect = new Phaser.Rectangle(0,0,button.fill.width,0);
		button.fill.updateCrop();
		
		
		button.fill.shooter = game.state.getCurrentState().shooter;
		
		button.fill.refresh = function() {
			this.cropRect.y = this.maxHeight - ((this.shooter.aimsBooster/this.maxAimsBooster) * this.maxHeight);
			this.cropRect.height = this.maxHeight;
			this.updateCrop();
		};

		BUBBLE.events.useOfaim.add(function() {
			this.maxAimsBooster = this.shooter.aimsBooster;
			this.refresh();
		},button.fill);

		BUBBLE.events.onMoveDone.add(button.fill.refresh,button.fill);

	}

	button.addTerm(function() {return this.active},this);
	button.addImageLabel(this.boosterSpriteLookUp[type]);

	button.booster = type;

	g.button = button;

	var boosterPcs = game.make.imageL(30,25,boosterAmount == 0 ? 'button_booster_buy' : 'bg_booster_counter');

	boosterPcs.anchor.setTo(0.5);
	boosterPcs.txt = game.make.bitmapTextL(0,-5,'font',BUBBLE.saveState.getBooster(type).toString(),35);
	boosterPcs.booster = type;
	boosterPcs.txt.anchor.setTo(0.5);
	boosterPcs.txt.visible = boosterAmount > 0;
	boosterPcs.addChild(boosterPcs.txt);
	boosterPcs.type = type;
	boosterPcs.button = button;
	BUBBLE.events.onBoosterChange.add(function(type) {
		if (this.type == type) {
			this.refresh();
		}
	},boosterPcs);
	boosterPcs.refresh = function() {
		var amount = BUBBLE.saveState.getBooster(this.booster);
		this.scale.setTo(1);
		game.add.tween(this.scale).to({x:1.3,y:1.3},200,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);
		this.txt.setText(BUBBLE.saveState.getBooster(this.booster).toString());

		this.button.loadTexture('ssheet',amount == 0 ? 'button_booster_empty' : 'button_booster');
		this.loadTexture('ssheet',amount == 0 ? 'button_booster_buy' : 'bg_booster_counter');
		this.txt.visible = amount > 0;

	}
	button.boosterPcs = boosterPcs;

	g.boosterPcs = boosterPcs;

	BUBBLE.events.onBoosterBought.add(function(booster) {
		
		
		if (this.booster == booster) this.refresh();
	},boosterPcs)

	g.add(button);
	g.add(boosterPcs);
	g.lockInput = function() {
		this.button.input.enabled = false;
	};

	g.unlockInput = function() {
		this.button.input.enabled = true;
		this.button.input.useHandCursor = true;
	};


	g.unlockBooster = function() {
		this.unlocked = true;
		game.sfx.xylophone_positive1.play();
		this.button.loadTexture('ssheet','button_booster');
		game.add.tween(this.button.label).to({alpha:1},500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.boosterPcs).to({alpha:1},500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.lockImg).to({alpha: 0},500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.lockImg.scale).to({x:1.5,y:1.5},500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.shine).to({alpha: 1},1000,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);
	};

	return g;


};
BUBBLE.UI_CoinPoints = function(scoreCoin) {

  Phaser.BitmapText.call(this, game, scoreCoin.x, scoreCoin.y, 'font-outline', '', BUBBLE.l(45));
  this.cacheAsBitmap = true;
  this.kill();

  this.coin = scoreCoin;
  this.distanceFromCoin = BUBBLE.l(30)
};

BUBBLE.UI_CoinPoints.prototype = Object.create(Phaser.BitmapText.prototype);

BUBBLE.UI_CoinPoints.prototype.update = function() {

	this.x = this.coin.x;
	this.y = this.coin.y-this.distanceFromCoin;

	if (this.alive) {
		this.scale.setTo(this.scale.x+0.05);
		this.alpha -= 0.03;
		if (this.alpha <= 0) {
			this.kill();
		}
	}

};


BUBBLE.UI_CoinPoints.prototype.start = function(points) {
		this.revive();
		this.scale.setTo(0);
		this.alpha = 1;
		this.setText(points.toString());
		this.updateCache();
		this._cachedSprite.anchor.setTo(0.5);
	}
BUBBLE.UI_ComboMsg = function() {

	BUBBLE.OneLineText.call(this,0,0,'font-outline','',100,640,0.5,0.5);

	this.alpha = 0;

	this.combo = 0;
	this.fixedToCamera = true;
	this.cameraOffset.y = game.height*0.3;
	this.cameraOffset.x = game.width*0.5;

	BUBBLE.events.onScreenResize.add(function() {

		this.cameraOffset.x = game.width*0.5;
		this.fixedToCamera.y = game.height*0.3;

	},this);

	BUBBLE.events.onGoodShoot.add(this.onGoodShoot,this);

	BUBBLE.events.onMissShoot.add(function() {
		this.combo = 0;
	},this);

	this.msgData = [
		[4,'Good!'],
		[6,'Double Score!'],
		[8,'Nice!'],
		[10,'Awesome!'],
		[12,'On Fire!'],
		[14,'Bubblicious!']
	];

	game.add.existing(this);

};

BUBBLE.UI_ComboMsg.prototype = Object.create(BUBBLE.OneLineText.prototype);


BUBBLE.UI_ComboMsg.prototype.startAnimation = function(text,tint) {

	if (this.tween1) {
		this.tween1.stop();
		this.tween2.stop();
	}


	
	this.alpha = 1;
	this.setText(text);
	this.scale.setTo(0);
	this.tween1 = game.add.tween(this.scale).to({x:1,y:1},500,Phaser.Easing.Elastic.Out,true);
	this.tween2 = game.add.tween(this).to({alpha: 0},500,Phaser.Easing.Sinusoidal.Out,true,1000);

};

BUBBLE.UI_ComboMsg.prototype.onGoodShoot = function() {
	this.combo++;

	for (var i = 0, len = this.msgData.length, row; i < len; i++) {
		row = this.msgData[i];
		if (this.combo == row[0]) {
			this.startAnimation(BUBBLE.txt(row[1]),row[2]);
		}
	}

	if (this.combo > row[0] && this.combo % 3 == 0) {
		this.startAnimation(BUBBLE.txt(row[1]),row[2]);
	}

};

/*
- If 6 Boubbles are removed please display "Good!"
- If 7-8 Boubbles are removed please display "Nice!"
- If 9-10 Boubbles are removed please display "Awesome!"
- If 11-13 Boubbles are removed please display "On Fire!"
- If 14 or more Boubbles are removed please display "Bubblicious!"
*/
BUBBLE.UI_ComboText = function() {

	Phaser.Group.call(this,game);

	this.fixedToCamera = true;
	this.cameraOffset.x = -game.world.bounds.x + 50;
	this.cameraOffset.y = game.height*0.8;

	BUBBLE.events.onScreenResize.add(function() {
		this.cameraOffset.x = -game.world.bounds.x + 50;
		this.cameraOffset.y = game.height*0.8;
	},this);

	this.splash = game.add.imageL(0,0,'bubble_0');
	this.splash.anchor.setTo(0.5);

	this.nr = game.add.imageL(0,0,'combo_2');
	this.nr.anchor.setTo(0.5);
	this.comboTxt = new BUBBLE.OneLineText(50,0,'font-outline','COMBO',50,200,0,0.5);

	this.addMultiple([this.splash,this.comboTxt,this.nr]);


	this.dbg = game.add.image(0,0,'bubblesheet','bubble_4');
	this.dbg.anchor.setTo(0.5);
	this.dbg.width = this.dbg.height = 5;
	this.add(this.dbg);



	this.hiding = false;
	this.alpha = 1;
	this.combo = 0;
	this.showCombo = [2,3,4,5]

	BUBBLE.events.onGoodShoot.add(function() {
		this.combo++;
		if (this.showCombo.indexOf(this.combo) != -1) {
			this.show();
		}
	},this);

	BUBBLE.events.onMissShoot.add(function() {
		this.combo = 0;
	},this);

};

BUBBLE.UI_ComboText.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.UI_ComboText.prototype.update = function() {
	if (this.hiding) {
		this.alpha = Math.max(0,this.alpha-0.03);
	}
	this.splash.angle += 1;
};

BUBBLE.UI_ComboText.prototype.show = function() {

	console.log("-------------------------COMBO TEXT SHOW")

	this.alpha = 1;
	this.hiding = false;

	this.splash.scale.setTo(0);
	var splashT = game.add.tween(this.splash.scale)
		.to({x:2.5,y:2.5},500,Phaser.Easing.Cubic.Out)
		.to({x:1,y:1},400,Phaser.Easing.Sinusoidal.In);
		splashT.start();


		this.nr.loadTexture('ssheet','combo_'+this.combo);
		this.nr.scale.setTo(0);

		var nrT = game.add.tween(this.nr.scale)
			.to({x:2,y:2},500,Phaser.Easing.Cubic.InOut)
			.to({x:1,y:1},800,Phaser.Easing.Cubic.Out);
		nrT.onComplete.add(function() {
			this.hiding = true;
		},this);
		nrT.start();



	this.comboTxt.scale.setTo(0,1);

	var comboTxtT = game.add.tween(this.comboTxt.scale)
		.to({x:1.5,y:0.5},500,Phaser.Easing.Cubic.Out)
		.to({x:1,y:1},400,Phaser.Easing.Cubic.Out);
	comboTxtT.start();




};
BUBBLE.UI_CoverDoor = function() {
	
	Phaser.Group.call(this,game);

	this.doorBottom = BUBBLE.makeImageL(320,0,'door_02',[0.5,0],this);
	this.doorTileSprite = game.add.tileSprite(BUBBLE.l(320),0,this.doorBottom.width,0,'ssheet','door_01');
	this.doorTileSprite.anchor.setTo(0.5,0);
	this.add(this.doorTileSprite);


	this.fixedToCamera = true;
	this.cameraOffset.x = -game.world.bounds.x;
	this.progress = 1;

	BUBBLE.events.onScreenResize.add(function() {
		this.cameraOffset.x = -game.world.bounds.x;
	},this);

};

BUBBLE.UI_CoverDoor.prototype = Object.create(Phaser.Group.prototype);


BUBBLE.UI_CoverDoor.prototype.updateCover = function(progress) {

	this.doorBottom.y = game.height*progress;
	this.doorTileSprite.height = this.doorTileSprite.tilePosition.y = game.height*progress;

};

BUBBLE.UI_CoverDoor.prototype.update = function() {


	if (this.progress == 0) {
		this.visible = false;
		return;
	}else {
		this.visible = true;
	}

	this.updateCover(this.progress);

};

BUBBLE.UI_CoverDoor.prototype.close = function(callback,context) {

	game.add.tween(this).to({progress: 1},1050,Phaser.Easing.Sinusoidal.Out,true);
	if (callback) {
		tween.onComplete.add(callback,context || this);
	}	

};

BUBBLE.UI_CoverDoor.prototype.open = function(callback,context) {

	var tween = game.add.tween(this).to({progress: 0},1050,Phaser.Easing.Sinusoidal.In,true);
	if (callback) {
		tween.onComplete.add(callback,context || this);
	}
};
BUBBLE.UI_EndlessTop = function(x,y,lvlNr) {
	Phaser.Group.call(this,game);

	//this.bg = this.add(game.make.imageL(0,0,'ui_endlessTop'));
	//this.bg.anchor.setTo(0.5,0);

	this.fixedToCamera = true;


	this.yPos = [200,280,360,440,520];

	this.add(game.make.imageL(0,this.yPos[0],'ui_endlessTopBg'));
	this.add(game.make.imageL(0,this.yPos[1],'ui_endlessTopBg'));
	this.add(game.make.imageL(0,this.yPos[2],'ui_endlessTopBg'));
	this.add(game.make.imageL(0,this.yPos[3],'ui_endlessTopBg'));
	this.add(game.make.imageL(0,this.yPos[4],'ui_endlessTopBg'));

	this.children.forEach(function(c){c.anchor.setTo(0.5,0); c.y -= BUBBLE.l(5)});

	//-120/-70
	this.myTopScore = new BUBBLE.OneLineText(0,30,'font-shadow',BUBBLE.txt('My high score:'),40,250,0.5,0.5);
	this.myTopScore2 = new BUBBLE.OneLineText(0,75,'font-shadow',BUBBLE.saveState.getEndlessScore().toString(),40,250,0.5,0.5);
	this.add(this.myTopScore);
	this.add(this.myTopScore2);

	this.topScores = new BUBBLE.OneLineText(0,140,'font-shadow',BUBBLE.txt('Top scores:'),40,300,0.5,0.5);
	this.add(this.topScores);

	this.lvlNr = lvlNr+1;
	this.x = x;
	this.y = y;



	this.placeholders = [];
	this.placeholders[0] = this.makePlaceholder(0,this.yPos[0]+35);
	this.placeholders[1] = this.makePlaceholder(0,this.yPos[1]+35);
	this.placeholders[2] = this.makePlaceholder(0,this.yPos[2]+35);
	this.placeholders[3] = this.makePlaceholder(0,this.yPos[3]+35);
	this.placeholders[4] = this.makePlaceholder(0,this.yPos[4]+35);
	this.addMultiple(this.placeholders);

	SG_Hooks.getHighscoresPerLevel(0,this.parseResponse.bind(this));

	this.cacheAsBitmap = true;

	this.updateAfterResize(game.width,game.height);
	BUBBLE.events.onScreenResize.add(this.updateAfterResize,this);

};

BUBBLE.UI_EndlessTop.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.UI_EndlessTop.prototype.updateAfterResize = function(width,height) {

	if (BUBBLE.horizontal) {

		this.visible = true;
		this.cameraOffset.x = -game.world.bounds.x-BUBBLE.l(155);
		this.cameraOffset.y = BUBBLE.l(300);

	}else {

		this.y = -999;
		this.visible = false;
	}

};

BUBBLE.UI_EndlessTop.prototype.parseResponse = function(response) {

	if (!response) return;
	if (response == 'error') return;


	

	var xx = 0;
	var yy = 0;
	this.response = response[0];

	this.tile = [];
	this.tile[0] = this.makeTile(xx,this.yPos[0],this.response.list[0],0);
	this.tile[1] = this.makeTile(xx,this.yPos[1],this.response.list[1],1);
	this.tile[2] = this.makeTile(xx,this.yPos[2],this.response.list[2],2);
	this.tile[3] = this.makeTile(xx,this.yPos[3],this.response.list[3],3);
	this.tile[4] = this.makeTile(xx,this.yPos[4],this.response.list[4],4);
	
};

BUBBLE.UI_EndlessTop.prototype.makePlaceholder = function(x,y) {

	return new BUBBLE.OneLineText(x,y,'font','--',30,400,0.5,0.5)

};

BUBBLE.UI_EndlessTop.prototype.makeTile = function(x,y,user,index) {
	if (!user) {
		return;
	}

	this.placeholders[index].destroy();

	var g = game.make.group();
	//g.position.set(x,y);
	this.add(g);

	g.avatar = game.add.imageL(x-120,y,'avatar_default');
	g.avatar.scale.setTo(1.5);
	g.name = new BUBBLE.OneLineText(x-35,y+15,'font-shadow',user.name,30,200,0,0.5);
	g.name.width = Math.min(g.name.width,BUBBLE.l(150));
	g.score = new BUBBLE.OneLineText(x-35,y+50,'font-shadow',user.score.toString(),30,200,0,0.5);
	g.score.width = Math.min(g.score.width,BUBBLE.l(150));
	g.addMultiple([g.avatar,g.name,g.score]);

	var salt = Math.floor(Math.random()*999999999)

	if (user.avatar) {

		var file = {           
		 type: 'image',            
		 key: 'highscoreAvatar'+salt,            
		 url: user.avatar,            
		 data: null,            
		 error: false,            
		 loaded: false        
		};        
		file.data = new Image();        
		file.data.name = file.key;        
		file.data.onload = function () {
			
			try {      
			file.loaded = true;           
		 	game.cache.addImage(file.key, file.url, file.data); 
		 	g.avatar.loadTexture(file.key);
		 	g.avatar.width = g.avatar.height = BUBBLE.l(50);
		 	g.avatar.scale.setTo(1.5);
		 	g.parent.updateCache();
		 }catch(e) {

		 }
		};
		file.data.onerror = function () {
		 file.error = true;        
		};        
		file.data.crossOrigin = '';        
		file.data.src = file.url;

	}

	

	return g;	

}
UI_HandTutorial = function(goalTextUI,pointsUI,moneyUI,boosterUI) {

	Phaser.Image.call(this,game,0,0,'tuthand');

	BUBBLE.saveState.data.sawTutorial = true;
	BUBBLE.saveState.save();

	this.goalTextUI = goalTextUI;
	this.pointsUI = pointsUI;
	this.moneyUI = moneyUI;
	this.boosterUI = boosterUI;

	this.stage = 0;
	this.active = false;
	this.alpha = 0;

	game.add.existing(this);

	this.textStage2 = new BUBBLE.MultiLineText(320,300,'font-outline',BUBBLE.txt("More score means more coins"),45,500,400,'center',0.5,0);
	this.textStage2.alpha = 0;
	game.add.existing(this.textStage2);

	this.textStage3 = new BUBBLE.MultiLineText(320,300,'font-outline',BUBBLE.txt("Use coins to buy amazing boosters!"),45,500,400,'center',0.5,0);
	this.textStage3.alpha = 0;
	game.add.existing(this.textStage3);

	BUBBLE.events.onScreenResize.add(this.onResize,this);
	BUBBLE.events.onMoveDone.add(function() {
		this.hide(function() {
				this.destroy();
				this.textStage2.destroy();
				this.textStage3.destroy();
			},this);
	},this)

};

UI_HandTutorial.prototype = Object.create(Phaser.Image.prototype);

UI_HandTutorial.prototype.startStage = function(nr) {

	if (nr == 1) this.startGoalTextUI();
	if (nr == 2) this.startPointsMoneyUI();
	if (nr == 3) this.startBoosterUI();

};

UI_HandTutorial.prototype.hide = function(callback,context) {

	this.hiding = true;

	var tween = game.add.tween(this).to({alpha:0},300,Phaser.Easing.Sinusoidal.InOut,true);

	if (this.textStage2.alpha > 0) {
		game.add.tween(this.textStage2).to({alpha:0},300,Phaser.Easing.Sinusoidal.InOut,true);
	}

	if (this.textStage3.alpha > 0) {
		game.add.tween(this.textStage3).to({alpha:0},300,Phaser.Easing.Sinusoidal.InOut,true);
	}

	tween.onComplete.add(function() {
		if (this.tween) this.tween.stop();
	},this);

	if (callback) {
		tween.onComplete.add(callback,context || this);
	}

};

UI_HandTutorial.prototype.startGoalTextUI = function() {

	this.hiding = false;
	this.stage = 1;

	game.add.tween(this).to({alpha:1},300,Phaser.Easing.Sinusoidal.InOut,true);

	this.x = this.goalTextUI.x+(this.goalTextUI.goalTxt.width*0.5);
	this.y = this.goalTextUI.y + this.goalTextUI.goalTxt.y + (this.goalTextUI.goalTxt.height*0.5)

	this.tween = game.add.tween(this).to({x: this.x+BUBBLE.l(30),y:this.y+BUBBLE.l(30)},250,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

};

UI_HandTutorial.prototype.onResize = function() { 
	if (this.hiding) return;

	if (this.stage == 2) {
		this.startPointsMoney(true);
	}

	if (this.stage == 3) {
		this.startBooster(true);
	}

};

UI_HandTutorial.prototype.startBooster = function(skipAddingEvent) {

	if (!skipAddingEvent) {
		game.time.events.add(3500,function() {
			this.hide(function() {
				this.destroy();
				this.textStage2.destroy();
				this.textStage3.destroy();
			},this);
		},this);
		game.add.tween(this.textStage3).to({alpha:1},300,Phaser.Easing.Sinusoidal.InOut,true);
	}


	game.add.tween(this.textStage2).to({alpha:0},300,Phaser.Easing.Sinusoidal.InOut,true);


	this.stage = 3;
	this.hiding = false;
	if (this.tween) this.tween.stop();

	if (this.alpha == 0) {
		game.add.tween(this).to({alpha:1},300,Phaser.Easing.Sinusoidal.InOut,true);
	}

	if (BUBBLE.horizontal) {
		this.scale.x = -1;
		this.scale.y = 1;
		this.x = BUBBLE.settings.ui.booster.h.x-BUBBLE.l(40);
		this.y = game.world.bounds.y+BUBBLE.settings.ui.booster.h.y+BUBBLE.l(110);
		this.tween = game.add.tween(this).to({y:this.y + BUBBLE.l(350)},700,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

	}else {

		this.scale.x = -1;
		this.scale.y = -1;
		this.x = this.boosterUI.x-BUBBLE.l(30);
		this.y = this.boosterUI.y;
		this.tween = game.add.tween(this).to({x:this.boosterUI.x+BUBBLE.l(240)},700,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

	} 


};

UI_HandTutorial.prototype.startPointsMoney = function(skipAddingEvent) {

	
	

	if (!skipAddingEvent) { 
		
		game.time.events.add(3500,function() {
			this.startBooster();
			
		},this);
		game.add.tween(this.textStage2).to({alpha:1},300,Phaser.Easing.Sinusoidal.InOut,true);
	}

	this.stage = 2;
	this.hiding = false;
	if (this.tween) this.tween.stop();

	if (this.alpha == 0) {
		game.add.tween(this).to({alpha:1},300,Phaser.Easing.Sinusoidal.InOut,true);
	}

	if (BUBBLE.horizontal) {
		this.x = BUBBLE.settings.ui.money.h.x;
		this.y = game.world.bounds.y+BUBBLE.settings.ui.money.h.y;
		this.tween = game.add.tween(this).to({y:game.world.bounds.y+BUBBLE.settings.ui.points.h.y},900,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

	}else {

		this.x = BUBBLE.settings.ui.money.v.x;
		this.y = game.world.bounds.y+BUBBLE.settings.ui.money.v.y+BUBBLE.l(10);
		this.tween = game.add.tween(this).to({x:game.world.bounds.y+BUBBLE.settings.ui.points.v.x},700,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);

	}

};
BUBBLE.HelperMessage = function() {
	Phaser.Group.call(this,game);

	this.fixedToCamera = true; 
	this.cameraOffset.x = Math.abs(game.world.bounds.x)+BUBBLE.l(320);
	this.cameraOffset.y = game.height*0.45;


	this.bg = BUBBLE.makeImageL(0,0,'inropepopupsmall',0.5,this);
	this.add(this.bg);

	this.helperBear = BUBBLE.makeImageL(-230,0,'help_popup_bear',0.5);
	this.add(this.helperBear);


	this.txt = new BUBBLE.MultiLineText(90,0,'font',BUBBLE.txt('Match 3 bubbles!'),45,410,170,'left',0.5,0.5);
	this.add(this.txt);
	this.cacheAsBitmap = true;

	this.alpha = 0;


	this.missCombo = 0;
	BUBBLE.events.onGoodShoot.add(function() {
		this.missCombo = 0;
	},this);
	BUBBLE.events.onMissShoot.add(function() {
		this.missCombo++;
		if (this.missCombo == 2) {
			this.show();
		}
	},this);

	BUBBLE.events.onScreenResize.add(function() {
			this.cameraOffset.x = Math.abs(game.world.bounds.x)+BUBBLE.l(320);
			this.cameraOffset.y = game.height*0.5;
	},this);

};

BUBBLE.HelperMessage.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.HelperMessage.prototype.show = function() {

	if (this.alpha > 0) return; 

	game.add.tween(this).to({alpha: 1},225,Phaser.Easing.Sinusoidal.InOut,true);

	game.time.events.add(750,function() {
		game.add.tween(this).to({alpha: 0},225,Phaser.Easing.Sinusoidal.InOut,true);
		this.missCombo = 0;
	},this);

};
BUBBLE.UI_HighscorePanel = function(x,y,lvlNr) {
	Phaser.Group.call(this,game);

	this.lvlNr = lvlNr+1;
	this.x = x;
	this.y = y;

	this.placeholders = [];
	this.placeholders[0] = this.makePlaceholder(-110,0);
	this.placeholders[1] = this.makePlaceholder(0,0);
	this.placeholders[2] = this.makePlaceholder(110,0);
	this.addMultiple(this.placeholders);

	SG_Hooks.getHighscoresPerLevel(this.lvlNr,this.parseResponse.bind(this));

};

BUBBLE.UI_HighscorePanel.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.UI_HighscorePanel.prototype.parseResponse = function(response) {
	if (response == 'error' || !response) {
		return;
	}

	

	var xx = 0;
	var yy = 0;
	this.response = response[this.lvlNr];

	this.tile = [];
	this.tile[0] = this.makeTile(xx-155,yy,this.response.list[0],0);
	this.tile[1] = this.makeTile(xx,yy,this.response.list[1],1);
	this.tile[2] = this.makeTile(xx+155,yy,this.response.list[2],2);
	
};

BUBBLE.UI_HighscorePanel.prototype.makePlaceholder = function(x,y) {

	return new BUBBLE.OneLineText(x,y,'font','--',30)

};

BUBBLE.UI_HighscorePanel.prototype.makeTile = function(x,y,user,index) {
	if (!user) {
		return;
	}

	this.placeholders[index].destroy();

	var g = game.make.group();
	//g.position.set(BUBBLE.l(x),BUBBLE.l(y));

	g.avatar = game.add.imageL(x-60,y,'avatar_default');
	g.name = new BUBBLE.OneLineText(x-2,y+5,'font',user.name,20,200,0,0);
	g.name.width = Math.min(g.name.width,BUBBLE.l(90));
	g.score = new BUBBLE.OneLineText(x-2,y+25,'font',user.score.toString(),20,200,0,0);
	g.score.width = Math.min(g.score.width,BUBBLE.l(90));
	g.addMultiple([g.avatar,g.name,g.score]);

	var salt = Math.floor(Math.random()*999999999);

	if (user.avatar) {

		var file = {           
		 type: 'image',            
		 key: 'highscoreAvatar'+salt,            
		 url: user.avatar,            
		 data: null,            
		 error: false,            
		 loaded: false        
		};        
		file.data = new Image();        
		file.data.name = file.key;        
		file.data.onload = function () {
			
			try {      
			file.loaded = true;           
		 	game.cache.addImage(file.key, file.url, file.data); 
		 	g.avatar.loadTexture(file.key);
		 	g.avatar.width = g.avatar.height = BUBBLE.l(50)
		 }catch(e) {

		 }
		};
		file.data.onerror = function () {
		 file.error = true;        
		};        
		file.data.crossOrigin = '';        
		file.data.src = file.url;

	}

	this.add(g);

	return g;	

}



BUBBLE.UI_LevelLabel = function(lvl) {

	Phaser.Image.call(this, game, 0, 0, 'ssheet', 'iu_lvl');
	this.fixedToCamera = true;
	this.anchor.setTo(0.5);

	if (lvl == 'ENDLESS') {
		this.txt =  new BUBBLE.OneLineText(0,-10,'font-shadow',BUBBLE.txt('Endless!'),55,280,0.5,0.5);
	}else {
		this.lvlNr = BUBBLE.levels.indexOf(lvl)+1;
		this.txt =  new BUBBLE.OneLineText(0,-10,'font-shadow',BUBBLE.txt('Level')+' '+this.lvlNr,55,280,0.5,0.5);
	}
	
	this.addChild(this.txt);
	

	this.updateAfterResize(game.width,game.height);
	BUBBLE.events.onScreenResize.add(this.updateAfterResize,this);

	game.add.existing(this);

}

BUBBLE.UI_LevelLabel.prototype = Object.create(Phaser.Image.prototype);
BUBBLE.UI_LevelLabel.constructor = BUBBLE.UI_LevelLabel;


BUBBLE.UI_LevelLabel.prototype.updateAfterResize = function(width,height) {

	if (BUBBLE.horizontal) {

		this.revive();
		this.cameraOffset.x = -game.world.bounds.x-BUBBLE.l(155);
		this.cameraOffset.y = BUBBLE.l(80);

	}else {

		this.kill();

	}

};


BUBBLE.UI_Money = function() {

	Phaser.Group.call(this,game);



	
	this.fixedToCamera = true;

	var conf = {
				btn: {
					x: 0,
					y: 0,
					sprite: 'btn_more_coins'
				},
				txt: {
					x: -45,
					y: -5,
					fontSize: 35,
					width: 200
			}
		};

	if (game.incentivise) {
		this.moreMoneyBtn = new BUBBLE.Button(conf.btn.x,conf.btn.y,conf.btn.sprite,function() {
			BUBBLE.events.pushWindow.dispatch(['needMoreMoney']);
		},this);

		this.add(this.moreMoneyBtn);
	}else {
		this.coinIco = BUBBLE.makeImageL(conf.btn.x,conf.btn.y,'coin_big');
		this.coinIco.anchor.setTo(0.5);
		this.add(this.coinIco);

	}

	this.amountTxt =  new BUBBLE.OneLineText(conf.txt.x,conf.txt.y,'font',BUBBLE.saveState.getCoins().toString(),conf.txt.fontSize,conf.txt.width,1,0.5);
	this.amountTxt.tint = 0xfed930;
	this.amountTxt.updateCache();
	this.amount = BUBBLE.saveState.getCoins();
	this.amountTarget = this.amount;

	this.multipliers = BUBBLE.settings.coinsMultipliers;
	this.level = 0;
	this.coinsMultiplier = 0;
	this.updateCoinsMultiplier();


	BUBBLE.events.onCoinsChange.add(function(amount) {
		this.amountTarget = amount;
	},this);

	this.add(this.amountTxt);

	BUBBLE.events.onScreenResize.add(this.updateAfterResize,this);
	this.updateAfterResize(game.width,game.height);

	BUBBLE.events.onIncreasePoints.add(function(points) {
		BUBBLE.saveState.changeCoins(Math.round(points*this.coinsMultiplier));
	},this);

	BUBBLE.events.onLevelUp.add(this.onLevelUp,this);
	

}

BUBBLE.UI_Money.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.UI_Money.constructor = BUBBLE.UI_Money;

BUBBLE.UI_Money.prototype.update = function() {
	if (this.amount != this.amountTarget) {
			this.amount += game.math.clamp(this.amountTarget-this.amount,-3,3);
			this.amountTxt.setText(this.amount.toString());
	}
}

BUBBLE.UI_Money.prototype.updateAfterResize = function(width,height) {

	var pos = BUBBLE.settings.ui.money;

	if (BUBBLE.horizontal) {

		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(pos.h.x);
		this.cameraOffset.y = BUBBLE.l(pos.h.y);
		this.amountTxt.orgFontSize = BUBBLE.l(35);
		this.amountTxt.maxUserWidth = BUBBLE.l(130);
		this.amountTxt.setText(this.amountTxt.text);

	}else {

		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(pos.v.x);
		this.cameraOffset.y = BUBBLE.l(pos.v.y);
		this.amountTxt.maxUserWidth = BUBBLE.l(300);
		this.amountTxt.setText(this.amountTxt.text);
	}
	

};

BUBBLE.UI_Money.prototype.onLevelUp = function() {

	this.level++;
	this.updateCoinsMultiplier();

};

BUBBLE.UI_Money.prototype.updateCoinsMultiplier = function() {

	for (var i = 0, len = this.multipliers.length; i < len; i++) {
		var row = this.multipliers[i];
		if (this.level >= row[0]) {
			this.coinsMultiplier = row[1];
		}else {
			return;
		}
	} 

};



BUBBLE.UI_MoneyWindow = function(lvl) {

	Phaser.Group.call(this, game, 0, 0);

	this.y = -BUBBLE.l(960*0.45);

	this.amountTxt =  game.add.bitmapTextL(60,-8,'font-shadow',BUBBLE.saveState.getCoins().toString(),55);
	this.amountTxt.anchor.setTo(1,0.5);

	this.amount = BUBBLE.saveState.getCoins();
	this.amountTarget = this.amount;

	this.coinIco = game.add.imageL(this.amountTxt.x-this.amountTxt.width,0,'coin');
	this.coinIco.scale.setTo(0.75);
	this.coinIco.anchor.setTo(1,0.5);


	BUBBLE.events.onScreenResize.add(function() {
		this.y = -BUBBLE.l(960*0.45);
	},this);

	BUBBLE.events.onCoinsChange.add(function(amount) {
		this.amountTarget = amount;
	},this)

}

BUBBLE.UI_MoneyWindow.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.UI_MoneyWindow.constructor = BUBBLE.UI_MoneyWindow;

BUBBLE.UI_MoneyWindow.prototype.update = function() {
	if (this.amount != this.amountTarget) {
		this.amount += game.math.clamp(this.amountTarget-this.amount,-1,1);
		this.amountTxt.setText(this.amount.toString());
	}
};



BUBBLE.UI_PauseButton = function(walkthrough) {

	BUBBLE.Button.call(this,0,0,'btn_pause',walkthrough ? 

	function() {
		BUBBLE.events.onChangeLevel.dispatch('Game',BUBBLE.currentLvlNr);
	}

	:
	
	function() {
			new BUBBLE.Window('pause');
	}

	,this);

	this.fixedToCamera = true;

	BUBBLE.events.onWindowOpened.add(this.lockInput,this);
	BUBBLE.events.onWindowClosed.add(this.unlockInput,this);
	BUBBLE.events.onScreenResize.add(this.onResize,this);
	this.onResize(game.width,game.height);

	game.add.existing(this);

}

BUBBLE.UI_PauseButton.prototype = Object.create(BUBBLE.Button.prototype);
BUBBLE.UI_PauseButton.constructor = BUBBLE.UI_PauseButton;

BUBBLE.UI_PauseButton.prototype.onResize = function(width,height) {

	if (BUBBLE.horizontal) {
		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(700);
		this.cameraOffset.y = BUBBLE.l(50);	
	}else {
		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(45);
		this.cameraOffset.y = game.height-BUBBLE.l(50);
	}

}

BUBBLE.UI_PauseButton.prototype.lockInput = function() {
	this.input.enabled = false;
};

BUBBLE.UI_PauseButton.prototype.unlockInput = function() {
	this.input.enabled = true;
	this.input.useHandCursor = true;
};

BUBBLE.UI_PlayerStrip = function() {

	Phaser.Group.call(this,game);

	this.fixedToCamera = true;

	this.bg = game.make.imageL(0,0,'hud_below');
	this.bg.anchor.setTo(0.5,0);
	this.add(this.bg);

	this.active = false;

	this.horizontal = false;


	this.continueBtn = new BUBBLE.Button(0,0,'btn_green_continue',function() {
		BUBBLE.events.onChangeLevel.dispatch('Game',BUBBLE.currentLvlNr);
	},this);
	this.continueBtn.addTextLabel('font',BUBBLE.txt('Continue'),40);
	this.continueBtn.label.y = BUBBLE.l(-5);
	this.add(this.continueBtn);


	BUBBLE.events.onWindowOpened.add(this.lockInput,this);
	BUBBLE.events.onWindowClosed.add(this.unlockInput,this);
	BUBBLE.events.onScreenResize.add(this.onResize,this);

	this.onResize();

}

BUBBLE.UI_PlayerStrip.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.UI_PlayerStrip.constructor = BUBBLE.UI_PlayerStrip;

BUBBLE.UI_PlayerStrip.prototype.lockInput = function() {
	this.forEach(function(el) {
		if (el.lockInput) {
			el.lockInput();
		}
	});
};



BUBBLE.UI_PlayerStrip.prototype.unlockInput = function() {
	this.forEach(function(el) {
		if (el.unlockInput) {
			el.unlockInput();
		}
	});
};


BUBBLE.UI_PlayerStrip.prototype.onResize = function() {
	this.horizontal = BUBBLE.horizontal;
	this.sliding = !this.horizontal;	

	if (this.horizontal) {

		var pos = BUBBLE.settings.ui.booster.h;
		var xx = -game.world.bounds.x+BUBBLE.l(pos.x);
		var yy = game.height*0.5;

		this.bg.visible = false;
		this.cameraOffset.x = xx;
		this.cameraOffset.y = yy;
		this.continueBtn.x = 0;
		//this.skipBtn.y = BUBBLE.l(60);
		this.continueBtn.y =0;
	}else {

		this.bg.visible = true;
		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(320);
		this.cameraOffset.y = game.height-BUBBLE.bottomStripeHeight;
		//this.skipBtn.x = BUBBLE.l(150);
		this.continueBtn.x = 0;
		this.continueBtn.y = BUBBLE.l(60);

	}
};




BUBBLE.UI_PointsController = function(potsGroup,scoreCoinsGroup,endless) {

	Phaser.Group.call(this, game);

	/*
	this.bg = game.add.group();
	this.add(this.bg);
	this.bg.bg = game.add.imageL(0,-20,'bg_score_goals_h');
	this.bg.bg.anchor.setTo(0.5);
	this.bg.add(this.bg.bg);
	var scoreTxt = BUBBLE.txt('score:');
	scoreTxt = scoreTxt[0].toUpperCase() + scoreTxt.slice(1)
	this.bg.scoreTxt = new BUBBLE.OneLineText(0,-105,'font-shadow',scoreTxt,30,220,0.5,0.5)
	this.bg.add(this.bg.scoreTxt);
	*/


	this.fixedToCamera = true;

	this.walkthrough = game.state.getCurrentState().walkthrough;


	this.points = 0;
	this.pointsTarget = 0;
	this.scoreCoinsGroup = scoreCoinsGroup;

	/*
	this.bgPoints = game.add.imageL(0,5,'bg_points');
	this.bgPoints.anchor.setTo(0.5);
	this.add(this.bgPoints);
	*/

	this.pointsTxt = new BUBBLE.OneLineText(0,0,'font-shadow','0',35,160,0.5,0.5);

	
	this.bestScoreText = new BUBBLE.OneLineText(0,55,'font-shadow',BUBBLE.txt("Best score")+': '+BUBBLE.saveState.data.highscores[0],20,180,0.5,0.5);
	this.bestScoreText.preTxt = BUBBLE.txt("Best score");
	this.bestScoreText.currentPoints = BUBBLE.saveState.data.highscores[0];
	this.bestScoreText.controller = this;
	this.bestScoreText.firstTimePassed = false;
	this.bestScoreText.update = function() {

		//new highscore effect
		if (this.controller.pointsTarget > this.currentPoints) {
			if (!this.firstTimePassed) {
				this.firstTimePassed = true;
				if (BUBBLE.saveState.data.highscores[0] == 0) return;
				BUBBLE.events.fxExplosion.dispatch({
					x: BUBBLE.l(320),
					y: BUBBLE.l(400)
				});
				var txt = new BUBBLE.OneLineText(320,400,'font-outline',BUBBLE.txt("New highscore!"),60,640,0.5,0.5);
				game.add.existing(txt);
				txt.popUpAnimation();
				game.add.tween(txt).to({alpha: 0},500,Phaser.Easing.Sinusoidal.InOut,true,1000).onComplete.add(function() {
					txt.destroy();
				});
			}

			this.currentPoints = this.controller.pointsTarget;
			BUBBLE.saveState.data.highscores[0] = this.currentPoints;
			BUBBLE.saveState.save();
			this.setText(this.preTxt+': '+this.currentPoints);
		}
	};
	this.add(this.bestScoreText);


	this.endless = endless;

	this.combo = 0;
	this.comboMultiplier = BUBBLE.settings.comboMultiplier;
	this.missCombo = 0;
	this.comboCondition = false;

	this.initPointsGroup();
	this.coinPointsGroup = game.add.group();
	this.initCoinPoints(scoreCoinsGroup);

	this.add(this.pointsTxt);
	this.potsRanges = potsGroup.potsRanges;
	this.whichPot = potsGroup.whichPot;
	this.potsPoints = BUBBLE.settings.potsPoints;
	this.displayChangeMaxMin = 20;
	this.pointsLights = [this.makePointsLight(0),this.makePointsLight(1),this.makePointsLight(2),this.makePointsLight(3),this.makePointsLight(4)];

	BUBBLE.events.onBubblesMatch.add(this.processMatch,this);
	BUBBLE.events.onPopOutDestroyed.add(this.processPopOut,this);
	BUBBLE.events.onScreenResize.add(this.updateAfterResize,this);

	//combo
	BUBBLE.events.onMoveDone.add(function() {
		if (this.comboCondition) {
			this.combo++;
			BUBBLE.events.onGoodShoot.dispatch();
			if (this.combo == 6) {
				BUBBLE.events.onDoublePointsActivate.dispatch();
			}
		}else {
			this.combo = 0;
			BUBBLE.events.onMissShoot.dispatch();
				this.scoreCoinsGroup.deactivateCoin();
				this.scoreCoinsGroup.deactivateCoin();
		}
		this.comboCondition = false;
	},this);


	BUBBLE.events.onScoreCoinHit.add(this.scoreCoinHit,this);




	BUBBLE.events.onGoalAchieved.add(function() {
		this.displayChangeMaxMin = 200;
	},this);

	BUBBLE.events.onBubblesMatch.add(function() {
		this.comboCondition = true;
	},this);

	BUBBLE.events.onBubblesPopOut.add(function() {
		this.comboCondition = true;
	},this);

	BUBBLE.events.onShieldDefeated.add(function() {
		this.comboCondition = true;
	},this);


	this.updateAfterResize(game.width,game.height);



}

BUBBLE.UI_PointsController.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.UI_PointsController.constructor = BUBBLE.UI_PointsController;

BUBBLE.UI_PointsController.prototype.update = function() {
	if (this.points != this.pointsTarget) {
		this.points += Math.min(this.pointsTarget-this.points,this.displayChangeMaxMin);
		this.pointsTxt.setText(this.points.toString());
	}

	this.bestScoreText.update();
}

BUBBLE.UI_PointsController.prototype.processMatch = function(match) {

	var points = 10+(this.combo*5);

	var arrayOfPoints = [];

	match.forEach(function(child,index) {
		if (child) {
			var pos = child.getWorldPosition();
			arrayOfPoints.push(new Phaser.Point(pos[0],pos[1]));
		}
	},this);

	var pos = Phaser.Point.centroid(arrayOfPoints);

	this.initMatchPoints(pos.x,pos.y,(10+(this.combo*5))*match.length,0);
	this.scoreCoinsGroup.activateCoin(pos,this.combo);

};


BUBBLE.UI_PointsController.prototype.processPopOut = function(bubble) {

	var potNr = this.whichPot(bubble);
	this.initPointsLights(potNr);

}

BUBBLE.UI_PointsController.prototype.updateAfterResize = function(width,height) {

	var endless = game.state.getCurrentState().lvlNr == 'ENDLESS'

	var pos = BUBBLE.settings.ui.points

	if (BUBBLE.horizontal) {

		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(pos.h.x);
		this.cameraOffset.y = BUBBLE.l(pos.h.y);
		this.pointsTxt.orgFontSize = BUBBLE.l(35);
		this.pointsTxt.maxUserWidth = BUBBLE.l(300);
		this.pointsTxt.setText(this.pointsTxt.text);
		//this.bg.visible = true;

	}else {

		this.cameraOffset.x = -game.world.bounds.x+BUBBLE.l(pos.v.x);
		this.cameraOffset.y = BUBBLE.l(pos.v.y)-BUBBLE.l(3);
		this.pointsTxt.orgFontSize = BUBBLE.l(35);
		this.pointsTxt.maxUserWidth = BUBBLE.l(180);
		this.pointsTxt.setText(this.pointsTxt.text);
		//this.bg.visible = false;

	}

	this.pointsLights.forEach(function(child) {
		child.updateAfterResize();
	});

	this.bestScoreText.visible = BUBBLE.horizontal;

	if (this.walkthrough) {

		this.pointsTxt.visible = false;

	}

}


//POINTS GROUP ---------------------------------------------------

BUBBLE.UI_PointsController.prototype.initPointsGroup = function() {

	this.pointsGroup = game.add.group();
	for (var i = 0; i < 5; i++) {
		var points = game.add.bitmapTextL(0,0,'font-outline','',60);
		points.cacheAsBitmap = true;
		points.kill();
		this.pointsGroup.add(points);
	};


};

BUBBLE.UI_PointsController.prototype.initMatchPoints = function(x,y,score,delay,fixed) {

	BUBBLE.events.onIncreasePoints.dispatch(score);

	this.pointsTarget += score;

	var points = this.pointsGroup.getFirstDead();
	if (points === null) return;

	points.updateCache();

	points.revive();
	
	points.scale.setTo(1);
	points.alpha = 1;
	points.setText(score.toString());
	points.updateCache();
	points._cachedSprite.anchor.setTo(0.5);


	points.scale.setTo(0);
	points.x = x;
	points.y = y;
	

	BUBBLE.Animations.play('popOutAngle',points);

};


BUBBLE.UI_PointsController.prototype.initPointsLights  = function(potNr,points) {
	game.sfx.splash.play();
	var pointsToAdd = Math.floor(this.potsPoints[potNr]*this.comboMultiplier[Math.min(this.combo,this.comboMultiplier.length-1)]);
	BUBBLE.events.onIncreasePoints.dispatch(pointsToAdd);
	this.pointsTarget += pointsToAdd;
	this.pointsLights[potNr].start(pointsToAdd);

}


BUBBLE.UI_PointsController.prototype.makePointsLight = function(potNr) {

	var xx = (this.potsRanges[potNr][0]+this.potsRanges[potNr][1])*0.5;

	var pointsLight = game.add.bitmapTextL(0,0,'font-pots',this.potsPoints[potNr].toString(),60);
	pointsLight.cacheAsBitmap = true;
	pointsLight._cachedSprite.anchor.setTo(0.5);
	pointsLight.xx = xx;
	pointsLight.fixedToCamera = true;
	pointsLight.cameraOffset.x = -game.world.bounds.x+xx;
	pointsLight.cameraOffset.y = BUBBLE.horizontal ? game.height-BUBBLE.l(100) : game.height-BUBBLE.l(100)-BUBBLE.bottomStripeHeight;

	pointsLight.update = function() {
		if (this.alive) {
			this.scale.setTo(this.scale.x+0.05);
			this.alpha -= 0.03;
			if (this.alpha <= 0) {
				this.kill();
			}
		}
	}
	pointsLight.start = function(points) {
		this.revive();
		this.scale.setTo(0);
		this.alpha = 1;
		this.setText(points.toString());
		this.updateCache();
		this._cachedSprite.anchor.setTo(0.5);
	}
	pointsLight.updateAfterResize = function() {
		pointsLight.cameraOffset.x = -game.world.bounds.x+xx;
		pointsLight.cameraOffset.y = BUBBLE.horizontal ? game.height-BUBBLE.l(100) : game.height-BUBBLE.l(100)-BUBBLE.bottomStripeHeight;

	}

	pointsLight.kill();

	return pointsLight
};

BUBBLE.UI_PointsController.prototype.initCoinPoints = function(scoreCoinsGroup) {

	var len = scoreCoinsGroup.length;
	this.coinPoints = [];

	for (var i = 0; i < len; i++) {
		this.coinPoints[i] = new BUBBLE.UI_CoinPoints(scoreCoinsGroup.children[i]);
		scoreCoinsGroup.children[i].coinIndex = i;
	}

	this.coinPointsGroup.addMultiple(this.coinPoints);
};

BUBBLE.UI_PointsController.prototype.scoreCoinHit = function(coin) {

	var points = Math.floor(coin.points*this.comboMultiplier[Math.min(this.combo,this.comboMultiplier.length-1)]);
	this.pointsTarget += points;
	BUBBLE.events.onIncreasePoints.dispatch(points);
	this.coinPoints[coin.coinIndex].start(points);

};
BUBBLE.UI_TopHudBg = function() {

	Phaser.Group.call(this,game);

	this.bg = BUBBLE.makeImageL(320,0,'hud_top',[0.5,0],this);


	var moneyPos = BUBBLE.settings.ui.money.v;
	this.moneyBg = BUBBLE.makeImageL(moneyPos.x,moneyPos.y,'bg_bar_empty',[1,0.5],this);

	var pointsPos = BUBBLE.settings.ui.points.v;
	this.pointsBg = BUBBLE.makeImageL(pointsPos.x,pointsPos.y,'bg_bar_empty',[0.5,0.5],this);
	

	this.cacheAsBitmap = true;
	this.fixedToCamera = true;

	BUBBLE.events.onScreenResize.add(this.onResize,this);
	this.onResize();

	game.add.existing(this);

};

BUBBLE.UI_TopHudBg.prototype = Object.create(Phaser.Group.prototype);

BUBBLE.UI_TopHudBg.prototype.onResize = function() {
	this.cameraOffset.x = -game.world.bounds.x;
	this.visible = !BUBBLE.horizontal;

};

BUBBLE.TutBombText = function() {
	BUBBLE.MultiLineText.call(this,400,game.height*0.7,'font-outline',BUBBLE.txt('Use bomb to see what happens'),30,200,200,'center',0,0);
	this.alpha = 0;
  this.update = function() {
      this.y = game.height*(BUBBLE.horizontal ? 0.7 : 0.65);
      if (BUBBLE.saveState.data.sawBomb) {
          this.alpha -= 0.02;
          if (this.alpha < 0) {
              this.destroy();
          }   
      }
  };

  BUBBLE.events.onDoublePointsActivate.add(function() {
    if (!this.alive) return;
    if (BUBBLE.saveState.data.sawBomb) return;
    game.add.tween(this).to({alpha: 1}, 500, Phaser.Easing.Sinusoidal.InOut,true);    
  },this);

  game.add.existing(this);
}

BUBBLE.TutBombText.prototype = Object.create(BUBBLE.MultiLineText.prototype);

BUBBLE.Window = function(type) {

	Phaser.Group.call(this, game);
	this.buttonsList = [];
	this.state = game.state.getCurrentState();
	
	if (type.constructor === Array) {
		this[type[0]].apply(this,type.slice(1));
	}else {
		this[type].apply(this,Array.prototype.slice.call(arguments,1));	
	}
	

	game.add.tween(this.scale).from({x:2},300,Phaser.Easing.Sinusoidal.In,true);
	game.add.tween(this).from({alpha:0},300,Phaser.Easing.Sinusoidal.In,true);

	game.sfx.whoosh.play();

	BUBBLE.events.onWindowOpened.dispatch(this);

	BUBBLE.events.onChangeLevel.add(this.lockInput,this);

}

BUBBLE.Window.prototype = Object.create(Phaser.Group.prototype);
BUBBLE.Window.constructor = BUBBLE.Window;

BUBBLE.Window.prototype.closeWindow = function(callback,context) {

	this.lockInput();
	game.add.tween(this.scale).to({x:2},300,Phaser.Easing.Quadratic.Out,true);
	game.add.tween(this).to({alpha: 0},300,Phaser.Easing.Sinusoidal.Out,true).onComplete.add(function() {
		
		BUBBLE.events.onWindowClosed.dispatch();
		this.destroy();
		if (callback) {
			callback.call(context||false);
		}

	},this);
};

BUBBLE.Window.prototype.addBackground = function(image) {
	var image = image || 'popup';
	this.bg = game.make.imageL(0,0,image);
	this.bg.anchor.setTo(0.5);
	this.add(this.bg);
};

BUBBLE.Window.prototype.addCloseButton = function(x,y,callback,context) {

	var callback = callback || false;
	var context = context || this;

	this.closeButton = new BUBBLE.Button(x || 240,y || -330,'btn_close',function() {
			this.closeWindow(callback,context);
	},this);

	this.registerButtons(this.closeButton);

};

BUBBLE.Window.prototype.makeHomeButton = function(x,y) {
	var home = new BUBBLE.Button(x,y,'btn_menu', function() {
		if (game.state.getCurrentState().editorMode) {
			return game.state.start('Editor',true,false,BUBBLE.currentLvlNr);
		}
		BUBBLE.events.onChangeLevel.dispatch('MainMenu');
	});
	this.registerButtons(home);
};

BUBBLE.Window.prototype.makeReplayButton = function(x,y,sprite) {
	var replay = new BUBBLE.Button(x,y,sprite || 'btn_replay', function() {
		if (game.state.getCurrentState().editorMode) {
			return game.state.start('Game',true,false,BUBBLE.currentLvlNr,true);
		}

		if (game.state.getCurrentState().lvlNr == 'ENDLESS') {
			BUBBLE.events.onChangeLevel.dispatch('Endless');
		}else {
			BUBBLE.events.onChangeLevel.dispatch('Game',BUBBLE.currentLvlNr);
		}
	});
	this.registerButtons(replay);
};

BUBBLE.Window.prototype.makeOneLineText = function(x,y,font,text,size) {
	var txt = game.make.bitmapTextL(x,y,font,text.toString(),size);
	txt.width = Math.min(418*this.bg.scale.x,txt.width);
	txt.anchor.setTo(0.5);
	this.add(txt);
	return txt;
};

BUBBLE.Window.prototype.registerButtons = function(obj) {
	for (var i = 0; i < arguments.length; i++) {
		this.buttonsList.push(arguments[i]);
		this.add(arguments[i]);
		arguments[i].addTerm(function() { return this.scale.x == 1 },this);
	}
};

BUBBLE.Window.prototype.lockInput = function() {
	this.buttonsList.forEach(function(child) {
		child.input.enabled = false;
	})
};

BUBBLE.Window.prototype.unlockInput = function() {
	this.buttonsList.forEach(function(child) {
		child.input.enabled = true;
		child.input.useHandCursor = true;
	})
};




BUBBLE.Window.prototype.empty = function() {
	this.addBackground();

};


BUBBLE.Window.prototype.mainMenu = function() {

	this.playButton = new BUBBLE.Button(0,-70,'btn_big_play',function() {
		BUBBLE.events.onChangeLevel.dispatch('Endless');
	});

	this.moreGamesButtton = new BUBBLE.Button(160,140,'btn_more_games',function() {
		window.open("http://m.softgames.de/","_blank");
	});

	this.soundButton = new BUBBLE.Button(-160,140,game.sound.mute ? 'btn_sound_off' :'btn_sound_on', function() {
		game.sound.mute = !game.sound.mute;
		BUBBLE.saveState.save();
		this.loadTexture('ssheet', game.sound.mute ? 'btn_sound_off' :'btn_sound_on');
		
		if (game.sound.mute) {
			game.sound.stopAll();
		}else {
			game.sfx.music.play('', 0, game.ie10 ? 1 : 0.3, true);
		}
	});

	this.registerButtons(this.playButton,this.moreGamesButtton,this.soundButton);

};


BUBBLE.Window.prototype.thanksForWatching = function(amount) {
	this.addBackground();

	this.txt = new BUBBLE.MultiLineText(0,-50,'font',BUBBLE.txt("Thanks for watching!"),60,450,250,'center',0.5,0.5);
	this.add(this.txt);

	this.okButton = new BUBBLE.Button(0,200,'btn_yes',function() {
		this.closeWindow();
	},this);

	this.registerButtons(this.okButton);

};


BUBBLE.Window.prototype.gainedLives = function() {
	this.addBackground();
	this.addCloseButton(200,-350, function() {new BUBBLE.Window('addCoins',41)});
};



BUBBLE.Window.prototype.pause = function() {
	this.addBackground('inropepopup');

	this.stopFade = true;

	this.pauseTxt = new BUBBLE.OneLineText(10,-160,'font-outline',BUBBLE.txt('Pause').toUpperCase(),80,650,0.5,1);
	this.add(this.pauseTxt);
	

	this.soundButton = new BUBBLE.Button(0,-30,game.sound.mute ? 'btn_sound_off_2' : 'btn_sound_on_2', function() {
		game.sound.mute = !game.sound.mute;
		this.loadTexture('ssheet', game.sound.mute ? 'btn_sound_off_2' : 'btn_sound_on_2');
		BUBBLE.saveState.save();
		if (game.sound.mute) {
			game.sound.stopAll();
		}else {
			game.sfx.music.play('', 0, game.ie10 ? 1 : 0.3, true);
		}
	},this.soundButton);


	this.makeReplayButton(-160,-30);
	this.makeHomeButton(160,-30);
	this.continueBtn = new BUBBLE.Button(0,160,'btn_green',function() {
		this.closeWindow();
	},this);
	this.continueBtn.addTextLabel('font',BUBBLE.txt('Continue').toUpperCase(),45);

	this.registerButtons(this.continueBtn, this.soundButton);

};






BUBBLE.Window.prototype.tutorial = function(nr) {

	var lookUpObject = [
		"Match 3 or more bubbles!",
		"Clear top bubbles to reveal ceiling lights!",
		"Clear bubbles around animals to free them!",
		"Clear bubbles around the ghost to free him!",
		"Match color of monster to defeat him!",
		"Hit cloud bubble to reveal their true color!",
		"Clear bubbles around rocks to remove them!",
		"Ring bubbles change color after your every move!",
		"Little monster creates new bubbles every 3 moves!",
		"Black holes can devour 3 bubbles!",
		"Need more moves? Use extra moves booster!",
		"Aim booster helps you plan your moves!",
		"Multicolor booster makes match with any color!",
		"Bomb booster removes obstacles in your way!",
		"Hit bomb bubble to detonate it!",
		"Hit bomb bubble to detonate it!",
		"Make a match with keyhole to remove chain!",
		"Infected bubbles are spreading on your every move!",
		"Never hit doom bubble! It will end your game!"
	]

	var imgPosY = {
		'11' : -340,
		'12' : -330,
		'13' : -330,
		'14' : -280,
		'18' : -310
	};

	var boosters = {
		'10' : ['extraMoves', "Enjoy %AMOUNT% +5 extra moves!"],
		'11' : ['aim', "Enjoy %AMOUNT% aim boosters!"],
		'12' : ['multicolor', "Enjoy %AMOUNT% multicolor boosters!"],
		'13' : ['bomb', "Enjoy %AMOUNT% bomb boosters!"]
	}


	this.addBackground();
	this.bg.scale.setTo(1.1);

	this.tutImg = game.make.image(0,BUBBLE.l(-230),nr>9 ? 'tutsheet2' : 'tutsheet','tut_'+nr);
	this.tutImg.anchor.setTo(0.5,0);
	this.add(this.tutImg);

	if (imgPosY[nr.toString()]) {
		this.tutImg.y = BUBBLE.l(imgPosY[nr.toString()]);
	}
	
	this.txt = new BUBBLE.MultiLineText(0,40,'font',BUBBLE.txt(lookUpObject[nr]),'30',450,80);
	this.add(this.txt);

	if (BUBBLE.saveState.getLastLevel() == this.state.lvlNr && boosters[nr.toString()] ){
		this.boosterHighlight = new UI_BoosterHighlight(boosters[nr.toString()][0]);
		game.add.tween(this.boosterHighlight).from({alpha: 0},500,Phaser.Easing.Sinusoidal.Out,true);
		this.enjoyTxt = new BUBBLE.OneLineText(0,160,'font',boosters[nr.toString()][1].replace('%AMOUNT%',BUBBLE.settings.boostersOnStart),30,450,0.5,0.5);
		this.add(this.enjoyTxt);
	}



	this.okButton = new BUBBLE.Button(0,290,'btn_yes',function() {
			if (this.boosterHighlight) {
				game.add.tween(this.boosterHighlight.shine).to({alpha: 0},800,Phaser.Easing.Sinusoidal.Out,true).onComplete.add(function() {
					this.boosterHighlight.destroy();
				},this);
			}
			this.closeWindow();
	},this);

	this.registerButtons(this.okButton);

};











BUBBLE.Window.prototype.continueFor = function(reason) {

 
	this.addBackground();
	this.closeButton = new BUBBLE.Button(240,-330,'btn_close',function() {
			BUBBLE.events.pushWindow.dispatch('gameOver');
			this.closeWindow();
	},this);
	this.registerButtons(this.closeButton);

	this.moneyUI = this.addMoneyUI(-140,-280,'small',['continueFor',reason]);

	var priceOfContinue = BUBBLE.settings.priceOfContinue * Math.max(1,2*this.state.continuedForMoney);
	
	
	

	this.bg = BUBBLE.makeImageL(0,0,'bg_shop',0.5);
	this.add(this.bg);


	var title;
	var txt;

	switch (reason) {

		case 'outOfBubbles':
			title = BUBBLE.txt("+5 Moves");
			txt = BUBBLE.txt('Get +5 bubbles!');	
			this.descTxt = new BUBBLE.OneLineText(-80,-40,'font',txt,60,280,0,0.5);
			this.priceTxt = new BUBBLE.OneLineText(-80,20,'font','$$'+priceOfContinue,60,280,0,0.5);
			this.boosterIco = BUBBLE.makeImageL(-150,0,'button_booster',0.5,this);
			this.boosterIco.addChild(BUBBLE.makeImageL(0,0,'booster_extraMoves',0.5));
			break;

		case 'doomBubble':
			title = BUBBLE.txt("Revive!");
			txt = BUBBLE.txt('Revive and continue!');
			this.descTxt = new BUBBLE.OneLineText(0,-40,'font',txt,60,400,0.5,0.5);
			this.priceTxt = new BUBBLE.OneLineText(0,20,'font','$$'+priceOfContinue,60,400,0.5,0.5);
			break;

		case 'outOfTime':
			title = BUBBLE.txt("+1 minute!");
			txt = BUBBLE.txt('Get 1 more minute!');
			this.descTxt = new BUBBLE.OneLineText(0,-40,'font',txt,60,400,0.5,0.5);
			this.priceTxt = new BUBBLE.OneLineText(0,20,'font','$$'+priceOfContinue,60,400,0.5,0.5);
			break;

	};

	this.titleTxt = new BUBBLE.OneLineText(0,-185,'font-outline',title.toUpperCase(),60,480,0.5,0.5);
	
	this.addMultiple([this.titleTxt,this.descTxt,this.priceTxt]);


	this.continueBtn = new BUBBLE.Button(0,230,'btn_green',function() {

		switch (reason) {

			case 'outOfBubbles':
				this.shooter.addMoves(5); 
				break;

			case 'outOfTime':
				this.timer.time += 60;
				this.timer.setText(BUBBLE.utils.formatTime(60));
				break;

		}

		BUBBLE.saveState.changeCoins(-priceOfContinue);

		this.continuedForMoney++;

		this.windowLayer.children[0].closeWindow();

	},this.state);

	this.continueBtn.addTextLabel('font',BUBBLE.txt('Continue').toUpperCase(),50);
	this.continueBtn.addTerm(function() {
		return BUBBLE.saveState.isEnoughToBuy(priceOfContinue);
	});
	this.continueBtn.alpha = BUBBLE.saveState.isEnoughToBuy(priceOfContinue) ? 1 : 0.5;

	this.registerButtons(this.continueBtn);

};

BUBBLE.Window.prototype.CPIgift = function(incentivise,reason) {

	this.incentivise = incentivise || false;

	

	this.claimed = false;

	this.addBackground();
	this.closeButton = new BUBBLE.Button(260,-330,'btn_close',function() {
			if (!this.claimed) BUBBLE.saveState.pushGift('CPI');
			this.closeWindow();
	},this);
	this.registerButtons(this.closeButton);

	this.shine = this.makeShine(0,0,0);
	game.add.tween(this.shine).to({alpha: 1},500,Phaser.Easing.Sinusoidal.InOut,true,500);
	this.add(this.shine);

	this.giftTxt = new BUBBLE.OneLineText(10,-240,'font-outline',BUBBLE.txt('Gift'),70,470,0.5,1);
	this.add(this.giftTxt);

	this.checkOutTxt = new BUBBLE.MultiLineText(0,-170,'font-outline',BUBBLE.txt('Check out this game for free!'),35,470,100,'center',0.5,0.5);
	this.add(this.checkOutTxt);

	this.cpiIcon = BUBBLE.makeImageL(0,0,'cpiIcon',0.5,this);
	this.cpiIcon.width = BUBBLE.l(100);
	this.cpiIcon.height = BUBBLE.l(100);

	this.claimButton = new BUBBLE.Button(0,260,'btn_green',function() {
		this.claimed = true;
		SG_Hooks.triggerGift(SG_Hooks.giftTypeCpi,function(){
			if (this.alive && this.scale.x == 1) {
				this.closeWindow();
			}
		}.bind(this))
	},this);

	this.claimButton.addTerm(function() {return !this.claimed},this);
	this.claimButton.addTextLabel('font',BUBBLE.txt('Continue').toUpperCase(),50);

	this.registerButtons(this.claimButton);
	



};


BUBBLE.Window.prototype.daily = function() {

	this.addBackground();
	this.addCloseButton();

	this.giftTxt = new BUBBLE.OneLineText(10,-240,'font-outline',BUBBLE.txt('DAILY GIFT'),70,470,0.5,1);
	this.add(this.giftTxt);

	

	this.playCounter = 0;


	this.gift = this.makeGift();


	this.shadowGroup = game.make.group();
	this.add(this.shadowGroup);

	this.shine = BUBBLE.makeImageL(0,0,'shine',0.5);
	this.shine.update = function() {
		this.angle += 1;
	}
	this.shine.alpha = 0;
	this.add(this.shine);

	this.giftPanel = this.makeGiftPanel(0,0,this.gift);
	this.giftPanel.alpha = 0;
	this.add(this.giftPanel);
	
	this.cupGroup = game.make.group();
	this.add(this.cupGroup);
	this.makeDailyCup(-170,80,this.shadowGroup,this.cupGroup);
	this.makeDailyCup(0,80,this.shadowGroup,this.cupGroup);
	this.makeDailyCup(170,80,this.shadowGroup,this.cupGroup);

	this.cupGroup.forEach(function(obj) {
		obj.inputEnabled = false;
	});

	game.time.events.add(500,function() {
		this.cupGroup.forEach(function(obj) {
			obj.inputEnabled = true;
			obj.input.useHandCursor = true;
		});
	},this);

	this.guessTxt = new BUBBLE.MultiLineText(0,150,'font-outline',BUBBLE.txt('Guess where is your daily gift!'),40,470,100,'center',0.5,0.5);
	this.add(this.guessTxt);


	this.chooseCup = function(nr) {

		this.cupGroup.forEach(function(obj) {
			obj.inputEnabled = false;
		});
		var cup = this.cupGroup.children[nr];
		this.winnerCup = cup;
		game.add.tween(cup).to({y:cup.y+BUBBLE.l(-120)},500,Phaser.Easing.Sinusoidal.Out,true);
		
		if (Math.random() < 0.66) {
			this.shine.x = cup.x;
			game.add.tween(this.shine).to({alpha:1}, 500,Phaser.Easing.Sinusoidal.Out,true);
			this.giftPanel.x = cup.x;
			this.giftPanel.alpha = 1;
			if (this.gift[0] == 'coin') {
				BUBBLE.saveState.changeCoins(this.gift[1]);
			}else {
				BUBBLE.saveState.changeBooster(this.gift[0],this.gift[1]);
			}
		}

		if (this.playCounter == 0 && game.incentivise) {

			this.watchAgain = new BUBBLE.Button(0,270,'btn_more_gifts',function() {
				this.restartGame();
				this.watchAgain.inputEnabled = false;
				game.add.tween(this.watchAgain).to({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
			},this);
			this.btnLabel = new BUBBLE.MultiLineText(-90,0,'font-outline',BUBBLE.txt('Watch the video to play again!'),30,280,85,'left',0,0.5);
			this.watchAgain.addChild(this.btnLabel);
			game.add.tween(this.watchAgain).from({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
			this.registerButtons(this.watchAgain);


		}else {

			this.okButton = new BUBBLE.Button(0,270,'btn_yes',this.closeWindow,this);
			game.add.tween(this.okButton).from({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
			this.registerButtons(this.okButton);

		}

		this.playCounter++;

	};

	this.restartGame = function() {
		game.add.tween(this.shine).to({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.giftPanel).to({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true).onComplete.add(this.giftPanel.destroy,this.giftPanel);
		game.add.tween(this.winnerCup).to({y:this.winnerCup.y+BUBBLE.l(120)},500,Phaser.Easing.Sinusoidal.Out,true);

		this.gift = this.makeGift();
		this.giftPanel = this.makeGiftPanel(0,0,this.gift);
		this.giftPanel.alpha = 0;
		this.add(this.giftPanel);
		this.setChildIndex(this.giftPanel,5);
		game.time.events.add(500,function() {
			this.cupGroup.forEach(function(obj) {
				obj.inputEnabled = true;
				obj.input.useHandCursor = true;
			},this);
		},this);

	};

};

BUBBLE.Window.prototype.makeDailyCup = function(x,y,shadowGroup,cupGroup) {

	if (typeof this.cupNr == 'undefined') this.cupNr = 0;

	var shadow = BUBBLE.makeImageL(x,y+10,'cup_shadow',[0.5,1]);
	shadowGroup.add(shadow);

	var cupNr = this.cupNr++;

	var cup = new BUBBLE.Button(x,y,'cup',function() {
		this.chooseCup(cupNr);
	},this);
	this.registerButtons(cup);
	cup.y -= cup.height*0.5;
	cupGroup.add(cup);

};
BUBBLE.Window.prototype.daily2 = function() {

	d = this;
	this.plays = 0;

	this.addBackground();
	this.addCloseButton();

	this.giftTxt = new BUBBLE.OneLineText(10,-240,'font-outline',BUBBLE.txt('DAILY GIFT'),70,470,0.5,1);
	this.add(this.giftTxt);

	this.guessTxt = new BUBBLE.MultiLineText(0,150,'font-outline',BUBBLE.txt('Guess where is your daily gift!'),40,470,100,'center',0.5,0.5);
	this.add(this.guessTxt);

	this.shuffled = false;
	this.shufflesLeft = 10;

	this.cups = [];
	this.cupsGroup = game.make.group();
	this.add(this.cupsGroup);

	this.makeCup(-180,30);
	this.makeCup(0,30);
	this.makeCup(180,30);

	game.time.events.add(700,function() {
		this.cups[0].open();
		this.cups[1].open();
		this.cups[2].open();
	},this);

	game.time.events.add(2000,function() {
		this.cups[0].close();
		this.cups[1].close();
		this.cups[2].close();
	},this);

	game.time.events.add(2600,function() {
		this.shuffle();
	},this);


};


BUBBLE.Window.prototype.shuffle = function() {

	game.sfx.whoosh.play();

	this.tweensInProgress = 4;

	var random = Math.floor((Math.random()*3))
	var random2 = random + (Math.floor(Math.random()*2))+1;
	var cup1 = this.cups[random]
	var cup2 = this.cups[random2 % 3];

	this.cupsGroup.bringToTop(cup1);
	this.cupsGroup.sendToBack(cup2);

	game.add.tween(cup1).to({x: cup2.x},200,Phaser.Easing.Sinusoidal.InOut,true).onComplete.add(this.onTweenComplete,this);
	game.add.tween(cup2).to({x: cup1.x},200,Phaser.Easing.Sinusoidal.InOut,true).onComplete.add(this.onTweenComplete,this);
	game.add.tween(cup1).to({y: cup1.y + BUBBLE.l(40)},100,Phaser.Easing.Sinusoidal.InOut,true,0,0,true).onComplete.add(this.onTweenComplete,this);
	game.add.tween(cup2).to({y: cup2.y - BUBBLE.l(40)},100,Phaser.Easing.Sinusoidal.InOut,true,0,0,true).onComplete.add(this.onTweenComplete,this);

};

BUBBLE.Window.prototype.onTweenComplete = function() {

	if (--this.tweensInProgress == 0) {
		if (--this.shufflesLeft > 0) {
			this.shuffle();
		}else {
			this.shuffled = true;
		}
	}

};

BUBBLE.Window.prototype.restartGame = function() {

	

	this.cups.forEach(function(child) {
		

		if (child.openProgress > 0) {

			child.close();

			child.openCloseTween.onComplete.add(function() {
				this.claimed = false;
			},child);

			child.openCloseTween.onComplete.add(function() {
				this.shufflesLeft = 10;
				this.shuffled = false;
				this.shuffle();
			},this);

		}
	},this);


};


BUBBLE.Window.prototype.giftClaimed = function() {

	this.plays++;

	if (this.plays == 1) {

		this.watchAgain = new BUBBLE.Button(0,270,'btn_more_gifts',function() {
			this.restartGame();
			this.watchAgain.inputEnabled = false;
			game.add.tween(this.watchAgain).to({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
		},this);
		this.btnLabel = new BUBBLE.MultiLineText(-90,0,'font-outline',BUBBLE.txt('Watch the video to play again!'),30,280,85,'left',0,0.5);
		this.watchAgain.addChild(this.btnLabel);
		game.add.tween(this.watchAgain).from({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
		this.registerButtons(this.watchAgain);


	}else {

		this.okButton = new BUBBLE.Button(0,270,'btn_yes',this.closeWindow,this);
		game.add.tween(this.okButton).from({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
		this.registerButtons(this.okButton);

	}

};

BUBBLE.Window.prototype.makeCup = function(x,y) {

	var cup = game.make.group();
	cup.window = this;
	cup.x = BUBBLE.l(x);
	cup.y = BUBBLE.l(y);

	cup.shadow = BUBBLE.makeImageL(0,0,'cup_shadow',0.5,cup);

	cup.shine = BUBBLE.makeImageL(0,-50,'shine',0.5,cup);
	cup.shine.update = function() {
		this.angle += 1;
	}
	cup.shine.alpha = 0;

	cup.gift = this.makeGift();
	cup.giftPanel = this.makeGiftPanel(0,-50,cup.gift);
	cup.add(cup.giftPanel);

	cup.cup = new BUBBLE.Button(0,0,'cup',function() {
		
		this.parent.bringToTop(this);	

		if (this.gift && this.gift[0] == 'coin') {
			
			BUBBLE.saveState.changeCoins(this.gift[1]);
		}else {
			  
			BUBBLE.saveState.changeBooster(this.gift[0],this.gift[1]);
		}

		this.claimed = true;
		this.open();
		this.window.giftClaimed();
		this.window.shuffled = false;

	},cup);
	cup.cup.anchor.setTo(0.5,0.9);
	cup.cup.addTerm(function() {return this.shuffled},this);
	cup.add(cup.cup);

	cup.claimed = false;
	cup.highPos = BUBBLE.l(-120);
	cup.openProgress = 0;
	cup.update = function() {
		this.cup.y = this.openProgress*this.highPos;
		this.giftPanel.scale.x = this.openProgress;
		if (this.claimed && this.gift) {
			this.shine.alpha = this.openProgress;
		}	
		this.shine.update();
	};

	cup.open = function() {
		if (this.openCloseTween) this.openCloseTween.stop();
		this.openCloseTween = game.add.tween(this).to({openProgress: 1},350,Phaser.Easing.Sinusoidal.InOut,true);
	};

	cup.close = function(callback,context) {
		
		if (this.openCloseTween) this.openCloseTween.stop();
		this.openCloseTween = game.add.tween(this).to({openProgress: 0},350,Phaser.Easing.Sinusoidal.InOut,true);
	};

	this.cups.push(cup);

	this.cupsGroup.add(cup);

};
BUBBLE.Window.prototype.gameOver = function() {




	BUBBLE.giftWinsInARow = 0;

	this.teddy = game.make.image(0,game.height*0.6,'teddy_sad');
	this.teddy.anchor.setTo(0.5,0);
	this.add(this.teddy);

	this.addBackground();
	this.bg.y = BUBBLE.l(110);

	this.closeButton = new BUBBLE.Button(260,-220,'btn_close',function() {
			BUBBLE.events.onChangeLevel.dispatch('MenuWorld');
	},this);
	this.registerButtons(this.closeButton);

	
	game.sfx.lose.play();

	
	this.levelTxt = new BUBBLE.OneLineText(0,-125,'font-outline',BUBBLE.txt('Level')+' '+(this.state.lvlNr+1),75,450,0.5,1);
	this.add(this.levelTxt);

	this.failedTxt = new BUBBLE.OneLineText(0,-60,'font-outline',BUBBLE.txt('Level failed!'),45,450,0.5,1);
	this.add(this.failedTxt);



	this.goalStripe = game.make.group();
	this.goalStripe.y = BUBBLE.l(50);
	this.bgGoal = BUBBLE.makeImageL(0,0,'bg_goal',0.5,this);
	this.goalCurrentTxt = new BUBBLE.OneLineText(20,-5,'font-shadow',this.state.goalController.goalState.toString(),50,200,0,0.5);
	this.goalCurrentTxt.tint = 0xfc590e;
	this.goalCurrentTxt.updateCache();
	this.lvlTarget = new BUBBLE.OneLineText(20,-5,'font-shadow','/ '+this.state.lvl.goalTarget.toString(),50,200,0,0.5);
	this.ico = BUBBLE.makeImageL(-20,0,'goalControllerIco_'+this.state.lvl.mode,[0,0.5]);
	var startX = (this.ico.width+BUBBLE.l(20)+this.goalCurrentTxt.width+this.lvlTarget.width)*-0.5;
	
	this.ico.x = startX;
	this.goalCurrentTxt.x = this.ico.x+this.ico.width+BUBBLE.l(20);
	this.lvlTarget.x = this.goalCurrentTxt.x+this.goalCurrentTxt.width;
	this.goalStripe.addMultiple([this.bgGoal,this.goalCurrentTxt,this.lvlTarget,this.ico]);
	this.add(this.goalStripe);






	game.add.tween(this.teddy).to({y: BUBBLE.l(-870)},1500,Phaser.Easing.Cubic.Out,true,500).onComplete.add(function() {
		game.add.tween(this.teddy).to({y: this.teddy.y+50},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
	},this);



	var walkthrough = BUBBLE.saveState.data.walkthrough && BUBBLE.saveState.getStars(game.state.getCurrentState().lvlNr) != 3;

	var adGift = BUBBLE.giftGameOversInARow >= BUBBLE.settings.amountOfGameOversForEncouragingAdGift;

	this.makeReplayButton(0,(walkthrough || adGift)  ? 240 : 270,'btn_replay_lost');


	if (adGift) {

		this.giftBtn = new BUBBLE.Button(0,370,'btn_gift',function() {
			
			SG_Hooks.triggerIncentivise((function(result) {
				if (result == true) {
					BUBBLE.events.pushWindow.dispatch(['gift',false]);
					BUBBLE.events.pushWindow.dispatch(['gameOver']);
					BUBBLE.giftGameOversInARow = 0;
					this.closeWindow();
				}else {
					new BUBBLE.NoMoreAds();
					this.giftBtn.inputEnabled = false;
					game.add.tween(this.giftBtn).to({alpha:0.3},300,Phaser.Easing.Sinusoidal.InOut,true);
				}
			}).bind(this));

		},this);
		this.btnLabel = new BUBBLE.MultiLineText(-90,8,'font-outline',BUBBLE.txt('Watch movie to receive gift!'),30,280,85,'left',0,0.5);
		this.giftBtn.addChild(this.btnLabel);
		this.registerButtons(this.giftBtn);


	}else if (walkthrough) {
		this.walkthroughBtn = new BUBBLE.Button(0,370,'btn_help_movie_green',function() {
			BUBBLE.events.onChangeLevel.dispatch("GameWalkthrough",this.state.lvlNr,'Game');
		},this);

		this.walkthroughBtn.label = new BUBBLE.MultiLineText(-65,0,'font',BUBBLE.txt('Watch how to beat this level'),30,270,this.walkthroughBtn.height*0.9,'left',0,0.5);
		this.walkthroughBtn.addChild(this.walkthroughBtn.label);
		this.registerButtons(this.walkthroughBtn);
	}


	if (!this.state.gameOverSGHooks) {
		
		SG_Hooks.gameOver(this.state.lvlNr+1, this.state.getScore());
		this.state.gameOverSGHooks = true;
		BUBBLE.giftGameOversInARow++;
	}
	

};
BUBBLE.Window.prototype.gift = function(incentivise,reason) {

	this.incentivise = incentivise || false;

	

	this.claimed = false;

	this.addBackground();
	this.closeButton = new BUBBLE.Button(260,-330,'btn_close',function() {
			if (!this.claimed) BUBBLE.saveState.pushGift(this.incentivise ? "I" : "P");
			this.closeWindow();
	},this);
	this.registerButtons(this.closeButton);


	if (reason) {

		if (reason == '3 stars') {
			this.giftTxt = new BUBBLE.OneLineText(10,-240,'font-outline',BUBBLE.txt('Gift'),70,350,0.5,1);
			this.giftStars = BUBBLE.makeImageL(0,-265,'lvl_star_3',[0,1],this);
			var startX = (this.giftTxt.width+BUBBLE.l(10)+this.giftStars.width) * -0.5;
			this.giftStars.x = startX;
			this.giftTxt.x = startX+this.giftStars.width+BUBBLE.l(10)+(this.giftTxt.width*0.5)
		}else {
			this.giftTxt = new BUBBLE.OneLineText(10,-240,'font-outline',BUBBLE.txt('Achievement Gift'),70,470,0.5,1);	
		}

	}else {

		this.giftTxt = new BUBBLE.OneLineText(10,-240,'font-outline',BUBBLE.txt('Gift'),70,470,0.5,1);

	}

	this.add(this.giftTxt);

	

	this.shine = this.makeShine(0,-25,0);
	this.add(this.shine);

	this.gift = this.makeGift();

	this.giftPanel = this.makeGiftPanel(0,-25,this.gift);
	this.add(this.giftPanel);
	this.giftPanel.alpha = 0;

	this.giftImg = BUBBLE.makeImageL(0,-25,'gift',0.5);
	this.add(this.giftImg);


	this.openGift = function() {
		this.claimed = true;
		game.add.tween(this.shine).to({alpha:1}, 500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.giftImg).to({alpha: 0}, 500,Phaser.Easing.Sinusoidal.Out,true);
		game.add.tween(this.giftImg.scale).to({x: 2, y:2}, 500,Phaser.Easing.Sinusoidal.Out,true);
		this.giftPanel.alpha = 1;
		this.okButton = new BUBBLE.Button(0,250,'btn_yes',this.closeWindow,this);
		game.add.tween(this.okButton).from({alpha:0},500,Phaser.Easing.Sinusoidal.Out,true);
		this.registerButtons(this.okButton);

		if (this.gift[0] == 'coin') {
			BUBBLE.saveState.changeCoins(this.gift[1]);
		}else {
			BUBBLE.saveState.changeBooster(this.gift[0],this.gift[1]);
		}
	};



	if (reason && reason != 'achievementTitle') {
		this.giftTxt.y = BUBBLE.l(-260);
		this.giftPanel.y = this.shine.y = this.giftImg.y = BUBBLE.l(40);

		var txt ;

		switch (reason) {
			case '3 stars':
				txt = BUBBLE.txt("Nice job! You earned 3 stars! Enjoy your gift!");
				break;
			case '3 in row':
				txt = BUBBLE.txt("Nice job! You won 3 times in a row! Enjoy your gift!");
				break;
		}

		this.reasonTxt = new BUBBLE.MultiLineText(0,-170,'font-outline',txt,35,470,100,'center',0.5,0.5);
		this.add(this.reasonTxt);
	}


	if (incentivise && game.incentivise) {

		this.giftImg.y = BUBBLE.l(-60);
		this.watchTxt = new BUBBLE.MultiLineText(0,120,'font-outline',BUBBLE.txt('Watch the video to unpack it!'),35,470,100,'center',0.5,0.5);
		this.add(this.watchTxt);

		this.watchButton = new BUBBLE.Button(0,260,'btn_green',function() {

			SG_Hooks.triggerIncentivise((function(result) {
				if (result == true) {
					this.watchButton.inputEnabled = false;
					game.add.tween(this.watchButton).to({alpha:0},500,Phaser.Easing.Sinusoidal.In,true);
					game.add.tween(this.watchTxt).to({alpha:0},500,Phaser.Easing.Sinusoidal.In,true);
					game.add.tween(this.giftImg).to({y:BUBBLE.l(-25)},500,Phaser.Easing.Sinusoidal.Out,true).onComplete.add(this.openGift,this);
				}else {
					new BUBBLE.NoMoreAds();
					this.watchButton.inputEnabled = false;
					game.add.tween(this.watchButton).to({alpha:0},500,Phaser.Easing.Sinusoidal.In,true);
					game.add.tween(this.watchTxt).to({alpha:0},500,Phaser.Easing.Sinusoidal.In,true);
				}
			}).bind(this));

		},this);
		this.watchButton.addTextLabel('font',BUBBLE.txt('Watch!'),50);
		this.registerButtons(this.watchButton);

	}else {

		this.claimButton = new BUBBLE.Button(0,260,'btn_green',function() {
			this.claimButton.inputEnabled = false;
			game.add.tween(this.claimButton).to({alpha:0},500,Phaser.Easing.Sinusoidal.In,true);
			this.openGift();
		},this);
		this.claimButton.addTextLabel('font',BUBBLE.txt('Unpack it!'),50);
		this.registerButtons(this.claimButton);

	}
	

};

BUBBLE.Window.prototype.makeGiftPanel = function(x,y,gift) {
	if (gift[0] == 'coin') {
		var g = game.make.group();
		g.x = BUBBLE.l(x);
		g.y = BUBBLE.l(y);
		var txt = new BUBBLE.OneLineText(0,0,'font-outline','+'+gift[1],40,200,0,0.5);
		txt.tint = 0xfcc402;
		txt.updateCache();
		var coin = BUBBLE.makeImageL(0,10,'coin',[0,0.5]);
		var startX = txt.width+coin.width+BUBBLE.l(5);
		txt.x = startX*-0.5;
		coin.x = txt.x + txt.width + BUBBLE.l(5);
		g.addMultiple([txt,coin]);
		return g;
	}else {
		var booster = BUBBLE.makeImageL(x,y,'button_booster',0.5);
		var label = BUBBLE.makeImageL(0,3,'booster_'+gift[0],0.5);
		booster.addChild(label);
		return booster;
	}
};

BUBBLE.Window.prototype.makeGift = function() {

	var boosters = ['extraMoves','aim','bomb','multicolor'];
	var availableBoosters = [];

	boosters.forEach(function(type) {
		if (BUBBLE.saveState.isBooosterUnlocked(0,type)) {
			availableBoosters.push(type);
		}
	});


	if (availableBoosters.length == 0 || Math.random() < 0.5) {

		var min = BUBBLE.settings.minCoinsFromGift;
		var max = BUBBLE.settings.maxCoinsFromGift;
		var diff = max - min;

		return ['coin',min+Math.ceil(Math.random()*diff)];

	}else {

		return [availableBoosters[Math.floor(Math.random()*availableBoosters.length)],1]

	}

};

BUBBLE.Window.prototype.makeShine = function(x,y,alpha) {

	shine = game.make.group();
	shine.x = BUBBLE.l(x);
	shine.y = BUBBLE.l(y);
	var shine0 = BUBBLE.makeImageL(0,0,'shine',0.5);
	shine0.update = function() {
		this.angle += 1;
	}
	var shine1 = BUBBLE.makeImageL(0,0,'shine_2',0.5);
	shine1.update = function() {
		this.angle -= 1;
	}
	shine.addMultiple([shine0,shine1]);
	
	shine.alpha = alpha;

	return shine;


};
BUBBLE.Window.prototype.level = function(lvlNr) {

	this.addBackground();
	
	this.closeButton = new BUBBLE.Button(260,-330,'btn_close',function() {
			this.closeWindow();
	},this);
	this.registerButtons(this.closeButton);


	lvl = BUBBLE.levels[lvlNr];




	this.lvlTxt = new BUBBLE.OneLineText(0,-200,'font-outline',BUBBLE.txt('Level')+' '+(lvlNr+1),70,450,0.5,1);
	this.add(this.lvlTxt);



	var starsAchieved = BUBBLE.saveState.getStars(lvlNr);
	var stars = [];
	for(var i = 0; i < 3; i++) {
		var star = game.make.imageL(-90+(i*90),-300, 'star_big');
		star.anchor.setTo(0.5,1);
		star.scale.setTo(i % 2 == 0 ? 0.7 : 1);
		if (!(starsAchieved-1 >= i)) {
			star.loadTexture('ssheet','star_big_empty');
		}
		stars.push(star);
	}
	stars.reverse();
	this.addMultiple([stars[0],stars[2],stars[1]]);



	this.goalTxt = new BUBBLE.OneLineText(0,-130,'font-outline',BUBBLE.txt('Goal').toUpperCase()+':',45,450,0.5,0.5);
	this.add(this.goalTxt);

	this.goalStripe = game.make.group();
	this.goalStripe.y = BUBBLE.l(-30);
	this.bgGoal = BUBBLE.makeImageL(0,0,'bg_goal',0.5,this);
	this.lvlTarget = new BUBBLE.OneLineText(20,-5,'font-shadow',BUBBLE.levels[lvlNr].goalTarget.toString(),50,200,0,0.5);
	this.ico = BUBBLE.makeImageL(-20,0,'goalControllerIco_'+BUBBLE.levels[lvlNr].mode,[0,0.5]);
	var startX = (this.ico.width+BUBBLE.l(20)+this.lvlTarget.width)*-0.5;
	
	this.ico.x = startX;
	this.lvlTarget.x = this.ico.x + this.ico.width + BUBBLE.l(20);
	this.goalStripe.addMultiple([this.bgGoal,this.lvlTarget,this.ico]);
	this.add(this.goalStripe);
















	/*
	var lookUp = {Ghost: BUBBLE.txt("Free the ghost!"), Classic: BUBBLE.txt("Clear the top!"), Animals: BUBBLE.txt("Free all animals!"), Boss: BUBBLE.txt("Defeat the monster!")};

	
	this.modeTxt = new BUBBLE.OneLineText(0,-160,'font-outline',lookUp[lvl.mode],40,450,0.5,1);
	this.myScoreTxt = new BUBBLE.OneLineText(0,0,'font',BUBBLE.txt('score:')+' '+BUBBLE.saveState.getScore(lvlNr),40,450,0.5,1);


	lvl = this.lvlTxt;
	m = this.modeTxt;

	
	
	this.topscoresTxt = new BUBBLE.OneLineText(0,60,'font',BUBBLE.txt('Top scores:'),40,450,0.5,1);
	*/
	//this.highscorePanel = new BUBBLE.UI_HighscorePanel(-5,BUBBLE.l(85),lvlNr);


	var walkthrough = BUBBLE.saveState.data.walkthrough && BUBBLE.saveState.getStars(lvlNr) != 3;

	

	this.playButton = new BUBBLE.Button(0,walkthrough ? 110 : 180,walkthrough ? 'btn_yellown' : 'btn_green',function() {
		BUBBLE.events.onChangeLevel.dispatch("Game",lvlNr);
	},this);
	this.playButton.addTextLabel('font',BUBBLE.txt("Continue").toUpperCase(),50);
	this.registerButtons(this.playButton);


	if (walkthrough) {
		this.walkthroughBtn = new BUBBLE.Button(0,250,'btn_help_movie_green',function() {
			BUBBLE.events.onChangeLevel.dispatch("GameWalkthrough",lvlNr,'MenuWorld');
		},this);

		this.walkthroughBtn.label = new BUBBLE.MultiLineText(-65,0,'font',BUBBLE.txt('Watch how to beat this level'),30,270,this.walkthroughBtn.height*0.9,'left',0,0.5);
		this.walkthroughBtn.addChild(this.walkthroughBtn.label);
		this.registerButtons(this.walkthroughBtn);
	}
	

};
BUBBLE.Window.prototype.levelEnd = function(prereward) {

	var firstLevelFirstTime = (this.state.lvlNr == 0 && BUBBLE.saveState.getStars(0) == 0);
	var first3inRow = (this.state.lvlNr == 2 && BUBBLE.saveState.getStars(2) == 0);
	var firstTime = BUBBLE.saveState.getStars(this.state.lvlNr) < 3;
	BUBBLE.giftWinsInARow++;
	BUBBLE.giftGameOversInARow = 0;

	var result = BUBBLE.saveState.levelEnd(this.state.lvlNr,this.state.getScore());
	SG_Hooks.levelFinished(this.state.lvlNr+1, result.points);

	if (firstLevelFirstTime) {
		game.time.events.add(10,function(){BUBBLE.events.pushWindow.dispatch(['gift',false, result.stars == 3 ? '3 stars' : 'achievementTitle'])});
	}else if(first3inRow) {
		game.time.events.add(10,function(){BUBBLE.events.pushWindow.dispatch(['gift',false, '3 in row'])});
	}else if (result.stars == 3 && firstTime && Math.random() < BUBBLE.settings.chanceFor3StarsGift) {
		game.time.events.add(10,function(){BUBBLE.events.pushWindow.dispatch(['gift',false,'3 stars'])});
	}else if (BUBBLE.giftWinsInARow >= 3 && firstTime && Math.random() < BUBBLE.settings.chanceFor3WinsInARowGift) {
		game.time.events.add(10,function(){BUBBLE.events.pushWindow.dispatch(['gift',false,'3 in row'])});
		BUBBLE.giftWinsInARow = 0;
	}


	game.sfx.win.play();
	if (BUBBLE.config.current != 'hd') {
		this.particlesEmitter = game.add.emitter(0,0,45);
	  this.particlesEmitter.makeParticles('ssheet','star_part');
		this.particlesEmitter.setSize(0,0);
	  this.particlesEmitter.setXSpeed(BUBBLE.l(-400), BUBBLE.l(400));
	  this.particlesEmitter.setYSpeed(BUBBLE.l(-500), 0);
	  this.particlesEmitter.gravity = BUBBLE.l(1000);
	  this.particlesEmitter.setRotation(-50,50);
	  this.particlesEmitter.setScale(1, 1, 1, 1,0);
	  this.particlesEmitter.setAlpha(1,0,2000);
	  this.particlesEmitter.fixedToCamera = true;
	}

  //LIGHT AND TEDDY
  /*
	this.light = game.make.imageL(0,0,'pot_light');
	this.light.anchor.setTo(0.5,1);
	this.light.scale.setTo(4);
	this.light.cacheAsBitmap = true;
	this.light.alpha = 0;
	this.add(this.light);
	*/
  this.teddy = game.make.image(0,game.height*0.6,'teddy');
	this.teddy.anchor.setTo(0.5,0);
	this.add(this.teddy);
	


	this.addBackground();
	this.bg.y = BUBBLE.l(150);

	this.closeButton = new BUBBLE.Button(260,-170,'btn_close',function() {
		this.state.windowLayer.onAllWindowsClosed.add(function() {
			BUBBLE.events.onChangeLevel.dispatch('MenuWorld');
		});
		this.closeWindow();
	},this);
	this.registerButtons(this.closeButton);


	var delay = 500;
	this.star = [
		game.add.imageL(-110,-170, 0 < result.stars ? 'star_big' : 'star_big_empty'),
		game.add.imageL(0,-190, 1 < result.stars ? 'star_big' : 'star_big_empty'),
		game.add.imageL(110,-170, 2 < result.stars ? 'star_big' : 'star_big_empty'),
	];
	this.star.forEach(function(c,index) {
		c.alpha = index < result.stars ? 1 : 0.5; 
		c.anchor.setTo(0.5);
		c.scale.setTo(0);
		var tweenTo = index % 2 == 0 ? 0.7 : 1;
		game.add.tween(this.star[index].scale).to({x:tweenTo,y:tweenTo},500,Phaser.Easing.Elastic.Out,true,delay);

		this.star[index].angle = -20;
		this.star[index].angleTween = game.add.tween(this.star[index]).to({angle: 20},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
		this.star[index].angleTween.timeline[0].dt = (0.1*index)*this.star[index].angleTween.timeline[0].duration;
		delay += 180;
		if (BUBBLE.config.current != 'hd') {
			game.time.events.add(delay,function() {
				this.particlesEmitter.emitX = this.star[index].world.x;
				this.particlesEmitter.emitY = this.star[index].world.y;
				this.particlesEmitter.explode(2000,BUBBLE.config.current == 'hd' ? 15 : 5);
				game.sfx.launch_ball.play();
			},this);
		}
		
	},this);
	this.addMultiple(this.star.reverse());



	this.levelTxt = new BUBBLE.OneLineText(0,-75,'font-outline',BUBBLE.txt("Level")+' '+(this.state.lvlNr+1),35,500,0.5,1);
	this.add(this.levelTxt);
	game.add.tween(this.levelTxt).from({alpha: 0},500,Phaser.Easing.Sinusoidal.InOut,true,600);

	this.youWinTxt = new BUBBLE.OneLineText(0,0,'font-outline',BUBBLE.txt("YOU WIN!"),70,500,0.5,1);
	this.add(this.youWinTxt);
	this.youWinTxt.alpha = 0;
	game.time.events.add(800,function(){this.youWinTxt.alpha = 1; this.youWinTxt.popUpAnimation()},this);



	//score
	this.scoreGroup = game.add.group();
	this.scoreGroup.y = BUBBLE.l(60);
	var scoreTxt = BUBBLE.txt('score:');
	scoreTxt = scoreTxt[0].toUpperCase() + scoreTxt.slice(1);
	this.scoreGroup.label = new BUBBLE.OneLineText(0,0,'font',scoreTxt,30,460,0.5,1);
	this.scoreGroup.add(this.scoreGroup.label);
	this.scoreGroup.bg = BUBBLE.makeImageL(0,50,'bg_score_game_over',0.5,this.scoreGroup);
	this.scoreGroup.pointsTxt = new BUBBLE.OneLineText(30,65,'font',result.points.toString(),40,180,0.5,1);
	this.scoreGroup.add(this.scoreGroup.pointsTxt);
	this.add(this.scoreGroup);


	//coins
	this.coinGroup = game.add.group();
	this.coinGroup.y = BUBBLE.l(200);
	this.coinGroup.label = new BUBBLE.OneLineText(0,0,'font',BUBBLE.txt('Coins:'),30,200,0.5,1);
	this.coinGroup.add(this.coinGroup.label);
	this.coinGroup.bg = BUBBLE.makeImageL(0,50,'bg_coins_game_over',0.5,this.coinGroup);
	this.coinGroup.pointsTxt = new BUBBLE.OneLineText(20,70,'font','+'+result.reward.toString(),40,180,0.5,1);
	this.coinGroup.pointsTxt.update = function() {
		if (this.result != this.resultTarget) {
			this.setText('+'+(++this.result));
		}
	};
	this.coinGroup.pointsTxt.result = result.reward;
	this.coinGroup.pointsTxt.resultTarget = result.reward;
	this.coinGroup.pointsTxt.tint = 0xf39e02;
	this.coinGroup.pointsTxt.updateCache();
	this.coinGroup.add(this.coinGroup.pointsTxt);
	this.add(this.coinGroup);

	if (result.reward > 0 && game.incentivise) {

		this.coinGroup.btn = new BUBBLE.Button(160,50,'btn_x2',function() {

				SG_Hooks.triggerIncentivise((function(result) {
				if (result == true) {
					this.coinGroup.btn.input.enabled = false;
					game.add.tween(this.coinGroup.btn).to({alpha:0.3},500,Phaser.Easing.Sinusoidal.InOut,true);
					this.coinGroup.pointsTxt.resultTarget += this.coinGroup.pointsTxt.resultTarget;
					BUBBLE.saveState.changeCoins(this.coinGroup.pointsTxt.result);
					/*
					this.particlesEmitter.emitX = this.coinGroup.pointsTxt.world.x-(this.coinGroup.pointsTxt.width*0.5);
					this.particlesEmitter.emitY = this.coinGroup.pointsTxt.world.y+(this.coinGroup.pointsTxt.height*0.8);
					this.particlesEmitter.explode(2000,15);
					*/
				}	else {
					new BUBBLE.NoMoreAds();
					this.coinGroup.btn.input.enabled = false;
					game.add.tween(this.coinGroup.btn).to({alpha:0.3},500,Phaser.Easing.Sinusoidal.InOut,true);
				}
				}).bind(this));

		},this);

		this.coinGroup.add(this.coinGroup.btn);

	}


	this.continueBtn = new BUBBLE.Button(0,400,'btn_green',

		(this.state.lvlNr+1 != BUBBLE.levels.length) ?

		function() {
			SG_Hooks.levelUp(this.state.lvlNr+1,result.points);
			this.lockInput();
			
			this.state.windowLayer.onAllWindowsClosed.add(function() {
				BUBBLE.events.onChangeLevel.dispatch('Game',game.state.getCurrentState().lvlNr+1);
			});
			this.closeWindow();
		}

		:

		function() {

			this.state.windowLayer.onAllWindowsClosed.add(function() {
				BUBBLE.events.onChangeLevel.dispatch('MenuWorld');
			});
			this.closeWindow();
		}


	,this);
	this.continueBtn.addTextLabel('font',BUBBLE.txt('Continue').toUpperCase(),50);
	this.registerButtons(this.continueBtn);



	//game.add.tween(this.light).to({alpha: 0.5},500,Phaser.Easing.Sinusoidal.Out,true,300);
	game.add.tween(this.teddy).to({y: BUBBLE.l(-900)},1000,Phaser.Easing.Cubic.Out,true).onComplete.add(function() {
		game.add.tween(this.teddy).to({y: this.teddy.y+50},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
	},this);

};
BUBBLE.Window.prototype.levelEndless = function() {
	this.addBackground();
	this.addCloseButton();


	this.lvlTxt = new BUBBLE.OneLineText(0,-225,'font-outline',BUBBLE.txt('Endless Mode'),70,450,0.5,1);
	this.modeTxt = new BUBBLE.OneLineText(0,-160,'font-outline',BUBBLE.txt('Beat the highscore!'),40,450,0.5,1);
	this.myScoreTxt = new BUBBLE.OneLineText(0,-85,'font',BUBBLE.txt('My high score:'),40,450,0.5,1);
	this.myScoreTxt2 = new BUBBLE.OneLineText(0,-35,'font',BUBBLE.saveState.getEndlessScore().toString(),40,450,0.5,1);


	this.topscoresTxt = new BUBBLE.OneLineText(0,50,'font',BUBBLE.txt('Top scores:'),40,450,0.5,1);

	this.highscorePanel = new BUBBLE.UI_HighscorePanel(BUBBLE.l(-5),BUBBLE.l(65),0);


	this.playButton = new BUBBLE.Button(0,210,'btn_play',function() {
		this.lockInput();
		BUBBLE.events.onChangeLevel.dispatch("Endless");
	},this);



	this.addMultiple([this.lvlTxt,this.modeTxt,this.myScoreTxt,this.myScoreTxt2,this.highscorePanel,this.topscoresTxt]);
	this.registerButtons(this.playButton);

};
BUBBLE.Window.prototype.levelEndlessEnd = function() {

	var highscorePos = BUBBLE.saveState.levelEnd(this.state.getScore());

	var result = {reward: 0};
	SG_Hooks.gameOver(1, this.state.getScore());
	SG_Hooks.levelFinished(1, this.state.getScore());

	this.teddy = game.make.image(0,game.height*0.6,'teddy');
	this.teddy.anchor.setTo(0.5,0);
	this.add(this.teddy);

	this.addBackground();
	this.bg.y = BUBBLE.l(100)

	this.youWinTxt = new BUBBLE.OneLineText(0,-130,'font-outline',BUBBLE.txt("Game Over"),70,500,0.5,1);
	this.add(this.youWinTxt);
	this.youWinTxt.alpha = 0;
	game.time.events.add(500,function(){this.youWinTxt.alpha = 1; this.youWinTxt.popUpAnimation()},this);

	this.bScoreBg = game.make.imageL(0,20,'bg_goal');
	this.bScoreBg.anchor.setTo(0.5);
	this.bScoreBg.scale.setTo(0.75);
	this.add(this.bScoreBg);

	this.scoreTxt = new BUBBLE.OneLineText(0,-25,'font',BUBBLE.txt('Score')+':',35,460,0.5,1);
	this.add(this.scoreTxt);
	this.scoreTxt.alpha = 0;
	game.time.events.add(500,function(){this.scoreTxt.alpha = 1; this.scoreTxt.popUpAnimation()},this);

	this.scoreNrTxt = new BUBBLE.OneLineText(0,45,'font',this.state.getScore().toString(),50,200,0.5,1);
	this.add(this.scoreNrTxt);
	this.scoreNrTxt.alpha = 0;
	game.time.events.add(500,function(){this.scoreNrTxt.alpha = 1; this.scoreNrTxt.popUpAnimation()},this);


	this.bScoreBg2 = game.make.imageL(0,185,'bg_score_game_over');
	this.bScoreBg2.anchor.setTo(0.5);
	this.add(this.bScoreBg2);

	this.bScoreTxt = new BUBBLE.OneLineText(0,130,'font',BUBBLE.txt('Best score')+':',35,460,0.5,1);
	this.add(this.bScoreTxt);
	this.bScoreTxt.alpha = 0;
	game.time.events.add(500,function(){this.bScoreTxt.alpha = 1; this.bScoreTxt.popUpAnimation()},this);

	this.bScoreNrTxt = new BUBBLE.OneLineText(20,205,'font',BUBBLE.saveState.data.highscores[0].toString(),50,200,0.5,1);
	this.add(this.bScoreNrTxt);
	this.bScoreNrTxt.alpha = 0;
	game.time.events.add(500,function(){this.bScoreNrTxt.alpha = 1; this.bScoreNrTxt.popUpAnimation()},this);

	
	var buttonsY = 280;

	this.continueBtn = new BUBBLE.Button(0,350,'btn_green',function() {
		BUBBLE.events.onChangeLevel.dispatch('Endless');
	});
	this.continueBtn.addTextLabel('font',BUBBLE.txt('Continue').toUpperCase(),50);
	this.registerButtons(this.continueBtn);
	/*
	this.makeHomeButton(-100,buttonsY);
	this.makeReplayButton(100,buttonsY);
	*/

	game.add.tween(this.teddy).to({y: BUBBLE.l(-900)},1000,Phaser.Easing.Cubic.Out,true).onComplete.add(function() {
		game.add.tween(this.teddy).to({y: this.teddy.y+50},2000,Phaser.Easing.Sinusoidal.InOut,true,0,-1,true);
	},this);
};
BUBBLE.Window.prototype.needMoreMoney = function(windowToBack) {
	this.addBackground();
	
	this.addCloseButton(240,-310);

	this.needMore = new BUBBLE.OneLineText(0,-250,'font-outline',BUBBLE.txt('Get more coins').toUpperCase(),55,480,0.5,0.5);
	this.bg = BUBBLE.makeImageL(0,-80,'bg_shop',0.5);
	this.moneyImg = BUBBLE.makeImageL(0,-80,'icon_video_coins',0.5);
	var txt  = BUBBLE.txt('Watch the full movie to get XXX $$').replace('XXX',BUBBLE.settings.coinsForWatchingAd);
	this.watchTxt = new BUBBLE.MultiLineText(0,80,'font-outline',txt,35,480,150,'center',0.5,0.5);
	this.watchTxt.cacheAsBitmap = false;
	BUBBLE.OneLineText.prototype.insertCoin.call(this.watchTxt,this.watchTxt.fontSize)
	this.watchTxt.cacheAsBitmap = true;
	this.watchTxt._cachedSprite.anchor.setTo(0.5);
	this.addMultiple([this.needMore,this.bg,this.moneyImg,this.watchTxt]);


	





	this.watchAdButton = new BUBBLE.Button(0,230,'btn_big_green',function() {

		SG_Hooks.triggerIncentivise((function(result) {
			if (result == true) {
				BUBBLE.events.pushWindow.dispatch('youGained',true);
				if (windowToBack) {
					BUBBLE.events.pushWindow.dispatch(windowToBack);
				}
				this.closeWindow();
			}else {
				new BUBBLE.NoMoreAds();
				this.watchAdButton.inputEnabled = false;
				game.add.tween(this.watchAdButton).to({alpha:0.3},300,Phaser.Easing.Sinusoidal.InOut,true);
			}
		}).bind(this));

	},this);

	this.watchAdButton.addTextLabel('font',BUBBLE.txt('Watch!'),50);

	this.registerButtons(this.watchAdButton);
	/*
	if (windowToBack) {

		

		

	}else {

		this.addCloseButton();
		this.watchAdButton = new BUBBLE.Button(0,120,'btn_big_green',function() {
			SG_Hooks.triggerIncentivise((function(result) {
				if (result == true) {
					this.closeWindow(function() {new BUBBLE.Window('youGained')});
				}
			}).bind(this));
		},this);
	}

	var adIco = game.make.imageL(-100,0,'movie_icon');
	adIco.scale.setTo(1.5);
	adIco.anchor.setTo(0.5);
	this.watchAdButton.addChild(adIco);
	
	this.watchAdButton.addTextLabel('font','         '+BUBBLE.settings.coinsForWatchingAd.toString()+'$$');

	this.registerButtons(this.watchAdButton);
	*/
};
BUBBLE.Window.prototype.shop = function() {

	this.addBackground('inropepopup');
	this.addCloseButton(300,-230);
	this.stopFade = true;

	this.moneyUI = this.addMoneyUI(0,170,'big',['shop']);

	this.shopTxt = new BUBBLE.OneLineText(0,-180,'font-outline',BUBBLE.txt("SHOP"),80,600,0.5,1);
	this.add(this.shopTxt);

	this.pcsGroup = game.add.group();
	this.makePowerUpButton(-240,-40,'aim');
	this.makePowerUpButton(-80,-40,'extraMoves');
	this.makePowerUpButton(80,-40,'bomb');
	this.makePowerUpButton(240,-40,'multicolor');
	this.add(this.pcsGroup);

	/*
	this.okButton = new BUBBLE.Button(-100,130,'btn_yes',function() {
		this.closeWindow();
	},this);

	this.watchForMoreButton = new BUBBLE.Button(100,130,'btn_morecoins',function() {
		this.closeWindow(function() {
			new BUBBLE.Window('needMoreMoney','shop');
		});
	},this);
	
	this.registerButtons(this.okButton,this.watchForMoreButton);
	*/

	if (!game.incentivise) {
		this.watchForMoreButton.destroy();
		this.okButton.x = 0;
	}

};

BUBBLE.Window.prototype.makePowerUpButton = function(x,y,type) {

	if (!BUBBLE.saveState.isBooosterUnlocked(game.state.getCurrentState().lvlNr,type)) {

		var img = game.make.image(x,y,'ssheet','button_booster_empty');
		img.anchor.setTo(0.5);

		return img;

	}

	var boosterAmount = BUBBLE.saveState.getBooster(type);

	var button = new BUBBLE.Button(x,y,boosterAmount == 0 ? 'button_booster_empty' : 'button_booster', function() {

		if (BUBBLE.saveState.isEnoughToBuyBooster(this.booster)) {

			BUBBLE.saveState.buyBooster(this.booster);
			game.sfx.cash_register.play();
			
			if (BUBBLE.saveState.getBooster(this.booster) == 99) {
				this.input.enabled = false;
				//this.active = false;
				this.alpha = 0.5;
				this.price.alpha = 0.5;
				this.coin.alpha = 0.5;
			}
			this.boosterPcs.refresh();

		}else {
			if (game.incentivise) {
				BUBBLE.events.pushWindow.dispatch(['needMoreMoney','shop']);
				this.parent.closeWindow();
			}
		}

	});
	button.addImageLabel('booster_'+type);

	button.booster = type;

	var boosterPcs = game.make.imageL(x+30,y+25,boosterAmount == 0 ? 'button_booster_buy' : 'bg_booster_counter');
	boosterPcs.anchor.setTo(0.5);
	boosterPcs.button = button;
	boosterPcs.txt = game.make.bitmapTextL(0,-5,'font',BUBBLE.saveState.getBooster(type).toString(),35);
	boosterPcs.booster = type;
	boosterPcs.txt.anchor.setTo(0.5);
	boosterPcs.txt.visible = boosterAmount > 0;
	boosterPcs.addChild(boosterPcs.txt);
	boosterPcs.refresh = function() {
		var amount = BUBBLE.saveState.getBooster(this.booster);

		this.scale.setTo(1);
		game.add.tween(this.scale).to({x:1.3,y:1.3},200,Phaser.Easing.Sinusoidal.InOut,true,0,0,true);
		this.txt.setText(BUBBLE.saveState.getBooster(this.booster).toString());

		this.button.loadTexture('ssheet',amount == 0 ? 'button_booster_empty' : 'button_booster');
		this.loadTexture('ssheet',amount == 0 ? 'button_booster_buy' : 'bg_booster_counter');
		this.txt.visible = amount > 0;

	}
	button.boosterPcs = boosterPcs;

	var price = game.make.bitmapTextL(x,y+60,'font',BUBBLE.settings['costOf'+type].toString(),40);
	var coin  = game.make.imageL(x,y+70,'coin');
	coin.scale.setTo(0.5);
	var startX = BUBBLE.l(x)+((price.width+coin.width)*-0.5);
	price.x = startX;
	coin.x = price.x + price.width;

	button.price = price;
	button.coin = coin;

	this.registerButtons(button);
	this.add(price);
	this.add(coin);
	this.pcsGroup.add(boosterPcs);

	if (BUBBLE.saveState.getBooster(type) == 99) {
		button.input.enabled = false;
		//button.active = false;
		button.alpha = 0.5;
		price.alpha = 0.5;
		coin.alpha = 0.5;
	}

};


BUBBLE.Window.prototype.addMoneyUI = function(x,y,type,windowToOpen) {

	var size = {
		big: {
			bg: 'bg_coins_game_over',
			btn: {
				x: 150,
				y: 0,
				sprite: 'btn_more_coins'
			},
			txt: {
				x: 10,
				y: -5,
				fontSize: 50,
				width: 200
			}
		},
		small: {
			bg: 'bg_coins_game_small',
			btn: {
				x:75,
				y:0,
				sprite:'btn_more_coins_small'
			},
			txt: {
				x:0,
				y:-4,
				fontSize: 30,
				width:100
			}
		}
	}

	var conf = size[type || 'big'];

	g = game.add.group()
	g.x = BUBBLE.l(x);
	g.y = BUBBLE.l(y);

	g.bg = BUBBLE.makeImageL(0,0,conf.bg,[0.5,0.5]);
	g.add(g.bg);

	if (game.incentivise) {

		g.moreMoneyBtn = new BUBBLE.Button(conf.btn.x,conf.btn.y,conf.btn.sprite,function() {
			BUBBLE.events.pushWindow.dispatch(['needMoreMoney',windowToOpen]);
			this.closeWindow();
			this.inputEnabled = false;
		},this);

		g.add(g.moreMoneyBtn);

	}

	g.amountTxt =  new BUBBLE.OneLineText(game.incentivise ? conf.txt.x : conf.txt.x + 10,conf.txt.y,'font',BUBBLE.saveState.getCoins().toString(),conf.txt.fontSize,conf.txt.width,0.5,0.5);
	g.amountTxt.tint = 0xfed930;
	g.amountTxt.updateCache();
	g.amount = BUBBLE.saveState.getCoins();
	g.amountTarget = g.amount;


	BUBBLE.events.onCoinsChange.add(function(amount) {
		
		this.amountTarget = amount;
	},g);

	g.add(g.amountTxt);

	this.add(g);

	g.update = function() {

		if (this.amount != this.amountTarget) {
			this.amount += game.math.clamp(this.amountTarget-this.amount,-3,3);
			this.amountTxt.setText(this.amount.toString());
		}
	}

	return g;

};
BUBBLE.Window.prototype.shopOneItem = function(booster) {

	this.addBackground();
	this.addCloseButton(270,-330);

	this.booster = booster;

	this.moneyUI = this.addMoneyUI(-150,-270,'small',['shopOneItem',booster]);

	var title = {
		'aim' : BUBBLE.txt('Aim Booster'),
		'extraMoves' : BUBBLE.txt('+5 Moves'),
		'multicolor' : BUBBLE.txt('Multicolor'),
		'bomb' : BUBBLE.txt('Bomb')
	}[booster];

	var desc = {
		'aim' : BUBBLE.txt('Get +1 aim booster!'),
		'extraMoves' : BUBBLE.txt('Get +5 bubbles!'),
		'multicolor' : BUBBLE.txt('Get +1 multicolor!'),
		'bomb' : BUBBLE.txt('Get +1 bomb!')
	}[booster];



	this.bg = BUBBLE.makeImageL(0,0,'bg_shop',0.5,this);
	
	this.titleTxt = new BUBBLE.OneLineText(0,-185,'font-outline',title.toUpperCase(),60,480,0.5,0.5);

	this.boosterIco = BUBBLE.makeImageL(-150,0,'button_booster',0.5,this);
	this.boosterIco.addChild(BUBBLE.makeImageL(0,0,'booster_'+booster,0.5));

	this.descTxt = new BUBBLE.OneLineText(-80,-40,'font',desc,60,280,0,0.5);
	this.priceTxt = new BUBBLE.OneLineText(-80,20,'font','$$'+BUBBLE.settings['costOf'+booster],60,280,0,0.5);

	this.addMultiple([this.titleTxt,this.descTxt,this.priceTxt]);


	this.continueBtn = new BUBBLE.Button(0,250,'btn_green',function() {

		if (BUBBLE.saveState.isEnoughToBuyBooster(this.booster)) {

			//BUBBLE.saveState.buyBooster(this.booster);
			BUBBLE.saveState.buyAndUseBooster(this.booster);
			game.sfx.cash_register.play();
			this.closeWindow();

		}else {
			if (game.incentivise) {
				BUBBLE.events.pushWindow.dispatch(['needMoreMoney']);
				BUBBLE.events.pushWindow.dispatch(['shopOneItem',this.booster]);
				
				this.closeWindow();
			} else {
				game.sfx.denied.play();
			}
		}

	},this);
	/*
	if (!game.incentivise) {
		this.continueBtn.addTerm(function() {return BUBBLE.saveState.isEnoughToBuyBooster(booster)});
	}*/
	this.continueBtn.addTextLabel('font',BUBBLE.txt("Buy").toUpperCase(),50); 
	this.registerButtons(this.continueBtn); 


};

BUBBLE.Window.prototype.youGained = function() {

	this.addBackground();

	this.thanks = new BUBBLE.MultiLineText(0,-240,'font-outline',BUBBLE.txt('Thanks for watching!').toUpperCase(),70,450,120,'center',0.5,0.5);
	this.youGained = new BUBBLE.OneLineText(0,-60,'font-outline',BUBBLE.txt('You gained')+':',50,450,0.5,1);

	this.bg = new BUBBLE.makeImageL(0,15,'bg_coins_game_over',0.5);
	this.amountTxt = new BUBBLE.OneLineText(20,12,'font','+'+BUBBLE.settings.coinsForWatchingAd.toString(),50,200,0.5,0.5);
	this.amountTxt.tint = 0xfed930;
	this.amountTxt.updateCache();

	this.addMultiple([this.thanks,this.youGained,this.bg,this.amountTxt]);

	this.okButton = new BUBBLE.Button(0,250,'btn_yes',function() {
		BUBBLE.saveState.changeCoins(BUBBLE.settings.coinsForWatchingAd);
		this.closeWindow();
	},this);

	this.registerButtons(this.okButton);

}