

var BootScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function BootScene() {
            Phaser.Scene.call(this, { key: 'BootScene' });

        },

    preload: function () {

        this.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js')
        // map tiles
        this.load.image('tiles', 'assets/map/spritesheet.png');
        this.load.image('house', 'assets/house.png');

        // map in json format
        this.load.tilemapTiledJSON('map', 'assets/map/map.json');

        // our two characters
        //this.load.spritesheet('player', 'assets/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('player', 'assets/dog.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dragon', 'assets/dragon.png', { frameWidth: 64, frameHeight: 64 });

        // Dialog plugin
        //this.load.plugin('DialogModalPlugin', 'plugins/dialog_plugin.js');

    },

    create: function () {
        // start the WorldScene
        this.scene.start('WorldScene');



    }
});



var WorldScene = new Phaser.Class({

    Extends: Phaser.Scene,

    initialize:

        function WorldScene() {
            Phaser.Scene.call(this, { key: 'WorldScene' });
        },

    preload: function () {

    },

    create: function () {


        // create the map
        var map = this.make.tilemap({ key: 'map' });

        // first parameter is the name of the tilemap in tiled
        var tiles = map.addTilesetImage('spritesheet', 'tiles');




        // creating the layers
        var grass = map.createStaticLayer('Grass', tiles, 0, 0);
        var obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);

        /*         // create the new layer
                var houseLayer = map.createDynamicLayer('House', tiles, 0, 0);
        
                // add the house sprite to the new layer
                houseLayer.putTileAtWorldXY(tiles.getTileIndexByName('house'), this.house.x, this.house.y); */

        // make all tiles in obstacles collidable
        obstacles.setCollisionByExclusion([-1]);

        /*            // create the house sprite
                   this.house = this.add.sprite(map.widthInPixels / 2, map.heightInPixels / 2, 'house');
        
                   // center the anchor point of the house sprite
                   this.house.setOrigin(300, 400);
           
                   // scale the house sprite to make it bigger
                   this.house.setScale(1);
           
                   // add the house sprite to the obstacles layer
                   obstacles.add(this.house); */

        console.log("why u even here");
        //  animation with key 'left', we don't need left and right as we will use one and flip the sprite
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { frames: [53, 52, 54, 53] }),
            frameRate: 10,
            repeat: -1
        });

        // animation with key 'right'
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { frames: [53, 52, 54, 53] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'up',
            frames: this.anims.generateFrameNumbers('player', { frames: [21, 20, 21, 22] }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'down',
            frames: this.anims.generateFrameNumbers('player', { frames: [37, 36, 38, 37] }),
            frameRate: 10,
            repeat: -1
        });

        // our player sprite created through the phycis system
        this.player = this.physics.add.sprite(50, 100, 'player', 6);



        // don't go out of the map
        this.physics.world.bounds.width = map.widthInPixels;
        this.physics.world.bounds.height = map.heightInPixels;
        this.player.setCollideWorldBounds(true);

        // don't walk on trees
        this.physics.add.collider(this.player, obstacles);

        // limit camera to map
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.roundPixels = true; // avoid tile bleed

        // user input
        this.cursors = this.input.keyboard.createCursorKeys();

        // where the enemies will be
        this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
        for (var i = 0; i < 30; i++) {
            var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
            var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
            // parameters are x, y, width, height
            this.spawns.create(x, y, 20, 20);
        }
        // add collider
        this.physics.add.overlap(this.player, this.spawns, this.onMeetEnemy, false, this);
        this.sys.events.on('wake', this.wake, this);
        // launch UI
        //this.scene.launch("UIWorldScene");
    },
    onMeetEnemy: function (player, zone) {
        // we move the zone to some other location
        zone.x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        zone.y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);

        // shake the world
        this.cameras.main.shake(300);

        // switch to BattleScene
        //this.scene.sleep('UIWorldScene');
        this.scene.switch('BattleScene');
    },
    update: function (time, delta) {
        //    this.controls.update(delta);

        this.player.body.setVelocity(0);

        // Horizontal movement
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-80);
        }
        else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(80);
        }

        // Vertical movement
        if (this.cursors.up.isDown) {
            this.player.body.setVelocityY(-80);
        }
        else if (this.cursors.down.isDown) {
            this.player.body.setVelocityY(80);
        }

        // Update the animation last and give left/right animations precedence over up/down animations
        if (this.cursors.left.isDown) {
            this.player.anims.play('left', true);
            this.player.flipX = false;
        }
        else if (this.cursors.right.isDown) {
            this.player.anims.play('right', true);
            this.player.flipX = true;
        }
        else if (this.cursors.up.isDown) {
            this.player.anims.play('up', true);
        }
        else if (this.cursors.down.isDown) {
            this.player.anims.play('down', true);
        }
        else {
            this.player.anims.stop();
        }
    },

    wake: function() {
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
    }



});


var UIWorldScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function UIScene() {
            Phaser.Scene.call(this, { key: 'UIWorldScene' });
        },
    create: function () {

        /* this.sys.install('DialogModalPlugin');

        this.sys.install('DialogModalPlugin');
        console.log(this.sys.dialogModal);
        this.sys.dialogModal.init(); */

        // basic container to hold all menus
        //this.menus = this.add.container();

        //this.heroesMenu = new HeroesMenu(195, 153, this);

        this.WorldScene = this.scene.get("WorldScene");


        // listen for keyboard events
        //this.input.keyboard.on("keydown", this.onKeyInput, this);

        // when the scene receives wake event
        //this.sys.events.on('wake', this.createMenu, this);
    }

});

var BattleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function BattleScene() {
            Phaser.Scene.call(this, { key: 'BattleScene' });
        },
    create: function () {
        // change the background to green
        this.cameras.main.setBackgroundColor("rgba(0, 200, 0, 0.5)");
        this.startBattle();
        // on wake event we call startBattle too
        this.sys.events.on('wake', this.startBattle, this);
    },

    startBattle: function () {
        // player character - warrior
        var warrior = new PlayerCharacter(this, 250, 50, 'player', 52, 'Meleedoggo', 100, 100);//20
        this.add.existing(warrior);

        // player character - mage
        var mage = new PlayerCharacter(this, 250, 100, 'player', 48, 'Magedoggo', 80, 100); //8
        this.add.existing(mage);

        var dragonblue = new Enemy(this, 50, 50, 'dragon', 0, 'Örkkilö', 50, 3);
        this.add.existing(dragonblue);

        var dragonOrange = new Enemy(this, 50, 100, 'dragon', 64, 'Peikkoli', 50, 3);
        this.add.existing(dragonOrange);

        // array with heroes
        this.heroes = [warrior, mage];
        // array with enemies
        this.enemies = [dragonblue, dragonOrange];
        // array with both parties, who will attack
        this.units = this.heroes.concat(this.enemies);

        this.index = -1; // currently active unit

        this.scene.run('UIScene');
        console.log("issue with get uiscene");
        this.UIScene = this.scene.get("UIScene");
        console.log("no issue with get uiscene");
        //this.scene.scale(800, 600);
    },

    nextTurn: function () {
        // if we have victory or game over
        console.log("start of nextturn");

        if (this.checkEndBattle()) {
            this.endBattle();
            return;
        }
        do {
            // currently active unit
            this.index++;
            // if there are no more units, we start again from the first one
            if (this.index >= this.units.length) {
                this.index = 0;
            }
        } while (!this.units[this.index].living);
        // if its player hero
        if (this.units[this.index] instanceof PlayerCharacter) {
            // we need the player to select action and then enemy
            this.events.emit("PlayerSelect", this.index);
        } else { // else if its enemy unit
            // pick random living hero to be attacked
            var r;
            do {
                r = Math.floor(Math.random() * this.heroes.length);
            } while (!this.heroes[r].living)
            // call the enemy's attack function 
            this.units[this.index].attack(this.heroes[r]);
            // add timer for the next turn, so will have smooth gameplay
            this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
        }
        console.log("end of nextturn before update infobox");
        this.events.emit("UpdateInfoBox");
        console.log("end of nextturn after update infobox");

    },

    receivePlayerSelection: function (action, target) {
        if (action == 'attack') {
            this.units[this.index].attack(this.enemies[target]);
        }
        this.time.addEvent({ delay: 3000, callback: this.nextTurn, callbackScope: this });
    },

    exitBattle: function () {
        console.log(this.infoboxes);
        console.log("exitingbattle here");
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();
        this.scene.sleep('UIScene');
        this.scene.switch('WorldScene');
    },

    wake: function () {
        this.scene.run('UIScene');
        this.time.addEvent({ delay: 2000, callback: this.exitBattle, callbackScope: this });
    },

    checkEndBattle: function () {
        var victory = true;
        // if all enemies are dead we have victory
        for (var i = 0; i < this.enemies.length; i++) {
            if (this.enemies[i].living)
                victory = false;
        }
        var gameOver = true;
        // if all heroes are dead we have game over
        for (var i = 0; i < this.heroes.length; i++) {
            if (this.heroes[i].living)
                gameOver = false;
        }
        return victory || gameOver;
    },

    endBattle: function () {
        // clear state, remove sprites
        this.heroes.length = 0;
        this.enemies.length = 0;
        for (var i = 0; i < this.units.length; i++) {
            // link item
            this.units[i].destroy();
        }

        console.log(this.UIScene);
        console.log(this.UIScene.infoboxes);
        if (typeof this.UIScene.infoboxes != "undefined") {
            for (var i = 0; i < this.UIScene.infoboxes.length; i++) {

                this.UIScene.infoboxes[i].destroy();
            }
            this.UIScene.infoboxes = [];
            console.log("if infoboxes succ. destroyed this sh b empty:");
            console.log(this.UIScene.infoboxes);
        }

        this.units.length = 0;
        //this.events.emit("endBattle");
        // sleep the UI
        this.scene.sleep('UIScene');
        // return to WorldScene and sleep current BattleScene
        this.scene.switch('WorldScene');
    }

});

var UIScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function UIScene() {
            Phaser.Scene.call(this, { key: 'UIScene' });
        },
    create: function () {

       
        // draw some background for the menu
        this.graphics = this.add.graphics();
        this.graphics.lineStyle(1, 0xffffff);
        this.graphics.fillStyle(0x031f4c, 1);
        this.graphics.strokeRect(2, 150, 90, 100);
        this.graphics.fillRect(2, 150, 90, 100);
        this.graphics.strokeRect(95, 150, 90, 100);
        this.graphics.fillRect(95, 150, 90, 100);
        this.graphics.strokeRect(188, 150, 130, 100);
        this.graphics.fillRect(188, 150, 130, 100);

        // basic container to hold all menus
        this.menus = this.add.container();

        this.heroesMenu = new HeroesMenu(195, 153, this);
        this.actionsMenu = new ActionsMenu(100, 153, this);
        this.enemiesMenu = new EnemiesMenu(8, 153, this);

        // the currently selected menu 
        this.currentMenu = this.actionsMenu;

        // add menus to the container
        this.menus.add(this.heroesMenu);
        this.menus.add(this.actionsMenu);
        this.menus.add(this.enemiesMenu);

        this.battleScene = this.scene.get("BattleScene");

        // listen for keyboard events
        this.input.keyboard.on("keydown", this.onKeyInput, this);

        // when its player cunit turn to move
        this.battleScene.events.on("PlayerSelect", this.onPlayerSelect, this);

        // when the action on the menu is selected
        // for now we have only one action so we dont send and action id
        this.events.on("SelectEnemies", this.onSelectEnemies, this);

        // an enemy is selected
        this.events.on("Enemy", this.onEnemy, this);

        //After nextturn
        this.battleScene.events.on("UpdateInfoBox", this.onUpdateInfoBox, this);

        // when the scene receives wake event
        this.sys.events.on('wake', this.onWake, this);

        // when the battle ends
        this.battleScene.events.on("endBattle", this.onEndBattle, this);
        // the message describing the current action
        this.message = new Message(this, this.battleScene.events);
        this.add.existing(this.message);
        console.log("before adding infoboxes in uiscene");
        if (typeof this.infoboxes == "undefined") {
            this.infoboxes = [];
            console.log("empty string added");
            //this.add.existing(this.infoboxes);
        }

        if (this.infoboxes.length < this.battleScene.units.length) {
            console.log("adding infoboxes in uiscene if less than length")
            this.battleScene.units.forEach(element => {
                this.infoBox = new infoBox(this.battleScene, this.battleScene.events, element);
                this.add.existing(this.infoBox);
                this.infoboxes.push(this.infoBox);
            })
        };

        this.createMenu();
    },

    createMenu: function () {
        // map hero menu items to heroes
        this.remapHeroes();
        // map enemies menu items to enemies
        this.remapEnemies();
        // first move
        this.battleScene.nextTurn();

    },

    onWake: function () {
        this.createMenu();
        if (typeof this.infoboxes == "undefined") {
            this.infoboxes = [];
            console.log("empty string added");
            //this.add.existing(this.infoboxes);
        }

        if (this.infoboxes.length < this.battleScene.units.length) {
            console.log("adding infoboxes in uiscene if less than length")
            this.battleScene.units.forEach(element => {
                this.infoBox = new infoBox(this.battleScene, this.battleScene.events, element);
                this.add.existing(this.infoBox);
                this.infoboxes.push(this.infoBox);
            })
        }
    },

    remapHeroes: function () {
        var heroes = this.battleScene.heroes;
        this.heroesMenu.remap(heroes);
    },
    remapEnemies: function () {
        var enemies = this.battleScene.enemies;
        this.enemiesMenu.remap(enemies);
    },

    onKeyInput: function (event) {
        if (this.currentMenu && this.currentMenu.selected) {
            if (event.code === "ArrowUp") {
                this.currentMenu.moveSelectionUp();
            } else if (event.code === "ArrowDown") {
                this.currentMenu.moveSelectionDown();
            } else if (event.code === "ArrowRight" || event.code === "Shift") {
            } else if (event.code === "Space" || event.code === "ArrowLeft") {
                this.currentMenu.confirm();
            }
        }
    },

    onPlayerSelect: function (id) {
        this.heroesMenu.select(id);
        this.actionsMenu.select(0);
        this.currentMenu = this.actionsMenu;
    },

    onSelectEnemies: function () {
        this.currentMenu = this.enemiesMenu;
        this.enemiesMenu.select(0);
    },

    onEnemy: function (index) {
        this.heroesMenu.deselect();
        this.actionsMenu.deselect();
        this.enemiesMenu.deselect();
        this.currentMenu = null;
        this.battleScene.receivePlayerSelection('attack', index);
    },

    onUpdateInfoBox: function () {
        console.log(this.infoboxes);
        if (typeof this.infoboxes != "undefined") {
            this.infoboxes.forEach(element => {
                element.updateBox();
            });
        }
    },

    onEndBattle: function () {
        if (typeof this.infoboxes != "undefined") {
            this.infoboxes.forEach(element => {
                element.destroy();
            });
        }
        
    }
});


var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 320,
    height: 240,

    zoom: 2,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false // set to true to view zones
        }
    },
    scene: [
        BootScene,
        WorldScene,
        BattleScene,
        UIScene,
        UIWorldScene
    ]
};


var game = new Phaser.Game(config);


