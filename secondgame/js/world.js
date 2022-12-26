

var BootScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function BootScene() {
      Phaser.Scene.call(this, { key: 'BootScene' });

    },

  preload: function () {

    //this.load.image('background', 'assets/images/background.png');
    //this.load.image('spike', 'assets/images/spike.png');
    // At last image must be loaded with its JSON
    //this.load.atlas('player', 'assets/images/kenney_player.png', 'assets/images/kenney_player_atlas.json');
    this.load.image('tiles', 'assets/tilesets/tilesheet.png');

    //Main player spritesheet image
    this.load.spritesheet('player', 'assets/images/RPG_assets.png', { frameWidth: 16, frameHeight: 16 });
    // Load the export Tiled JSON
    this.load.tilemapTiledJSON('map', 'assets/tilemaps/map.json');
    this.load.tilemapTiledJSON('houseaulamap', 'assets/tilemaps/houseaulamap.json');

  },

  create: function () {
    if (config.debug == true) {
      console.log(config.debug);
      this.scene.start('houseAulaScene');
    } else {
      this.scene.start('WorldScene');
    }

  }
});

function update() { }

var WorldScene = new Phaser.Class({

  Extends: Phaser.Scene,

  initialize:

    function WorldScene() {
      Phaser.Scene.call(this, { key: 'WorldScene' });
    },

  preload: function () {

  },

  create: function () {

    const map = this.make.tilemap({ key: 'map' });
    const tiles = map.addTilesetImage('tilesheet', 'tiles');

    const platforms = map.createStaticLayer('Ground', tiles, 0, 0);
    const obstacles = map.createStaticLayer('Obstacles', tiles, 0, 0);
    const obstacles2 = map.createStaticLayer('Obstacles2', tiles, 0, 0);

    // make all tiles in obstacles collidable
    obstacles.setCollisionByExclusion([-1]);
    obstacles2.setCollisionByExclusion([-1]);

    //Set anims
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { frames: [25, 19, 31, 25] }),
      frameRate: 10,
      repeat: -1
    });

    // animation with key 'right'
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { frames: [25, 19, 31, 25] }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('player', { frames: [26, 20, 32, 26] }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('player', { frames: [24, 18, 30, 24] }),
      frameRate: 10,
      repeat: -1
    });

    // our player sprite created through the physics system
    this.player = new Player(this, 50, 100, 'player', 18, 100, 20, 'Alice');
    //this.player.scale(2);
    console.log(this.player);
    this.add.existing(this.player);

    // don't go out of the map
    this.physics.world.bounds.width = map.widthInPixels;
    this.physics.world.bounds.height = map.heightInPixels;
    this.player.setCollideWorldBounds(true);

    // don't walk on trees
    this.physics.add.collider(this.player, obstacles);
    this.physics.add.collider(this.player, obstacles2);

    // limit camera to map
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.roundPixels = true; // avoid tile bleed

    // user input
    this.cursors = this.input.keyboard.createCursorKeys();


    // where the enemies will be
    this.zones = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
    this.zones.create(753, 314, 16, 16);


    //this.doorZone.create
    /* for (var i = 0; i < 30; i++) {
      var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
      var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
      // parameters are x, y, width, height
      this.spawns.create(x, y, 20, 20);
    } */
    // add collider
    this.physics.add.overlap(this.player, this.zones, this.onOpenDoor, false, this);
    // we listen for 'wake' event
    this.sys.events.on('wake', this.wake, this);

    this.scene.run('UIScene', "Welcome to Haunted House Game v.0.0.0.0.0.1 !");
    this.UIScene = this.scene.get("UIScene");
  },


  update: function (time, delta) {
    //    this.controls.update(delta);

    this.player.body.setVelocity(0);

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-95);
    }
    else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(95);
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-95);
    }
    else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(95);
    }

    // Update the animation last and give left/right animations precedence over up/down animations
    if (this.cursors.left.isDown) {
      this.player.anims.play('left', true);
      this.player.flipX = true;
    }
    else if (this.cursors.right.isDown) {
      this.player.anims.play('right', true);
      this.player.flipX = false;
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
    //console.log(this.player.x, this.player.y);
  },

  wake: function () {
    this.cursors.left.reset();
    this.cursors.right.reset();
    this.cursors.up.reset();
    this.cursors.down.reset();

    console.log(this.player);
    this.score += 100;
    //this.infoText = this.add.text(16, 16, 'score: 0', { fontSize: '16px', fill: '#000' });
    this.infoText.setText('Score: ' + this.score);
  },

  onOpenDoor: function () {
    if (this.cursors.up.isDown) {
      console.log("opened!");
      this.scene.switch('houseAulaScene');
    }
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
    this.setScale(2);
  }
};

var UIScene = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize:
    function UIScene() {
      Phaser.Scene.call(this, { key: 'UIScene' });
    },

  
  create: function () {


    // draw some background for the menu
    /*      this.graphics = this.add.graphics();
         this.graphics.lineStyle(1, 0xffffff);
         this.graphics.fillStyle(0x031f4c, 1);
         this.graphics.strokeRect(2, 150, 90, 100);
         this.graphics.fillRect(2, 150, 90, 100);
         this.graphics.strokeRect(95, 150, 90, 100);
         this.graphics.fillRect(95, 150, 90, 100);
         this.graphics.strokeRect(188, 150, 130, 100);
         this.graphics.fillRect(188, 150, 130, 100); */



    // listen for keyboard events
    this.input.keyboard.on("keydown", this.onKeyInput, this);

    //After nextturn
    //this.battleScene.events.on("UpdateInfoBox", this.onUpdateInfoBox, this);

    // when the scene receives wake event
    this.sys.events.on('wake', this.onWake, this);

    // the message describing the current action
    //this.message = new Message(this, this.WorldScene.events);
    //this.add.existing(this.message);
    this.createMenu();
  },

  createMenu: function () {

  },

  onWake: function () {
    this.createMenu();
  },

  init: function (data) {
    this.message = new Message(this, data);
    this.add.existing(this.message);
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

  onUpdateInfoBox: function () {
    console.log(this.infoboxes);
    if (typeof this.infoboxes != "undefined") {
      this.infoboxes.forEach(element => {
        element.updateBox();
      });
    }
  }
});

var Message = new Phaser.Class({
  Extends: Phaser.GameObjects.Container,
  initialize:
    function Message(scene, input, type) {
      Phaser.GameObjects.Container.call(this, scene, 400, 30);
      var graphics = this.scene.add.graphics();
      this.add(graphics);
      graphics.lineStyle(1, 0xffffff, 0.8);
      graphics.fillStyle(0x031f4c, 0.3);
      graphics.strokeRect(-90, -20, 180, 45);
      graphics.fillRect(-90, -20, 180, 45);
      this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 13, wordWrap: { width: 160, useAdvancedWrap: true } });
      this.add(this.text);
      this.text.setOrigin(0.5);
      this.showMessage(input);
      //this.visible = false;
    },
  showMessageFlash: function (text) {
    this.text.setText(text);
    this.visible = true;
    if (this.hideEvent)
      this.hideEvent.remove(false);
    this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
    //this.destroy();
  },

  showMessage: function (text) {
    this.text.setText(text);
    this.visible = true;
     },

  hideMessage: function () {
    this.hideEvent = null;
    this.visible = false;
  }
});