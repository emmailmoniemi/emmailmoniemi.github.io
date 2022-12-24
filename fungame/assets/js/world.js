
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
        this.load.spritesheet('potions', 'assets/potions.png', { frameWidth: 16, frameHeight: 16 });

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
        //var collectibles = map.createDynamicLayer('Collectibles', potions, 0, 0);

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
        this.player = new Player(this, 50, 100, 'player', 6, 100, 20, 'Roope');
        console.log(this.player);
        this.add.existing(this.player);

        this.score = 0;
        this.add.existing(this.score);

        this.infoText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#000' });
        this.add.existing(this.infoText);

        this.healthpotionimage = new Image(this, 0, 0, 'potions', 1);

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

        this.healthpotions = this.physics.add.group({ classType: Potion });
        this.physics.add.overlap(obstacles, this.healthpotions, this.removepotion, null, this);

        for (var i = 0; i < 20; i++) {
            var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
            var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
            // parameters are x, y, width, height
            this.healthpotions.create(x, y, 'potions', 1, 'Healthpotion', '20');
        }

        this.physics.add.collider(this.healthpotions, obstacles);
        this.physics.add.overlap(this.player, this.healthpotions, this.drinkPotion, null, this);






        // where the enemies will be
        this.spawns = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
        for (var i = 0; i < 10; i++) {
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

        this.battleScene = this.scene.get("BattleScene");
        this.battleScene.events.on("endBattle", this.onEndBattle, this);


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

    onEndBattle: function (hp) {
        this.player.hp = hp;
        console.log(this.player);
    },

    drinkPotion(player, potion) {
        potion.destroy();
        this.score += 10;
        this.infoText.setText('Score: ' + this.score);
    },

    removePotion(potion) {
        potion.destroy();
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

    wake: function () {
        this.cursors.left.reset();
        this.cursors.right.reset();
        this.cursors.up.reset();
        this.cursors.down.reset();

        this.battleScene = this.scene.get("BattleScene");
        console.log(this.player);
        this.score += 100;
        //this.infoText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#000' });
        this.infoText.setText('Score: ' + this.score);
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

class Player extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, texture, frame, hp, attack, name) {
        super(scene, x, y, texture, frame);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.hp = hp;
        this.attack = attack;
        this.name = name;
    }


};

var Stats = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    initialize:
        function infoBox(scene, events, Unit) {
            Phaser.GameObjects.Container.call(this, scene, Unit.x + 45, Unit.y + 20);
            var graphics = this.scene.add.graphics();
            this.add(graphics);
            this.thisUnit = Unit;

            graphics.lineStyle(1, 0xffffff, 0.8);
            graphics.fillStyle(0x031f4c, 0.3);
            graphics.strokeRect(-90, -20, 40, 40);
            graphics.fillRect(-90, -20, 40, 40);

            this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 10, wordWrap: { width: 40, useAdvancedWrap: true } });
            this.add(this.text);
            this.text.setOrigin(0.5);
            this.showBox("HP " + Unit.hp + " / " + Unit.maxHp);
        },
    showBox: function (text) {
        this.text.setText(text);
        this.visible = true;
   /*  if (this.hideEvent)
        this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideBox, callbackScope: this });
*/    },

    hideBox: function () {
        this.hideEvent = null;
        this.visible = false;
    },

    updateBox: function () {
        this.showBox("HP " + this.thisUnit.hp + " / " + this.thisUnit.maxHp);
    }
});


var Potion = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize:
        function Potion(scene, x, y, texture, frame, type, potency) {
            Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame);
            this.type = type;
            this.potency = potency;
        }
});

