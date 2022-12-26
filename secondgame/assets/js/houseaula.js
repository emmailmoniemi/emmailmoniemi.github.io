var houseAulaScene = new Phaser.Class({

    Extends: Phaser.Scene,
  
    initialize:
  
      function houseAulaScene() {
        Phaser.Scene.call(this, { key: 'houseAulaScene' });
      },
  
    preload: function () {
  
    },
  
    create: function () {
  
      const houseaulamap = this.make.tilemap({ key: 'houseaulamap' });
      const tiles = houseaulamap.addTilesetImage('tilesheet', 'tiles');
  
      const platforms = houseaulamap.createStaticLayer('Ground', tiles, (config.width / 2 - houseaulamap.widthInPixels / 2), 192);
      console.log(config.width);
      const obstacles = houseaulamap.createStaticLayer('Obstacles', tiles, (config.width / 2 - houseaulamap.widthInPixels / 2), 192);
      //const obstacles2 = map.createStaticLayer('Obstacles2', tiles, 0, 0);
  
      // make all tiles in obstacles collidable
      obstacles.setCollisionByExclusion([-1]);
      //obstacles2.setCollisionByExclusion([-1]);
  
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
  
  
  
      // don't go out of the map
      this.physics.world.bounds.width = houseaulamap.widthInPixels;
      this.physics.world.bounds.height = houseaulamap.heightInPixels;
      this.physics.world.bounds.x = config.width / 2 - houseaulamap.widthInPixels / 2;
      this.physics.world.bounds.y = 192;
  
  
  
  
  
      // our player sprite created through the physics system
      this.player = new Player(this, config.width / 2, this.physics.world.bounds.y + houseaulamap.heightInPixels + 16, 'player', 20, 100, 20, 'Alice');
      //this.player.scale(2);
      console.log(this.player);
      this.add.existing(this.player);
      this.player.setCollideWorldBounds(true);
  
  
      // don't walk on trees
      this.physics.add.collider(this.player, obstacles);
      //this.physics.add.collider(this.player, obstacles2);
  
      // limit camera to map
      this.cameras.main.setBounds(0, 0, houseaulamap.widthInPixels, houseaulamap.heightInPixels);
      this.cameras.main.startFollow(this.player);
      this.cameras.main.roundPixels = true; // avoid tile bleed
  
      // user input
      this.cursors = this.input.keyboard.createCursorKeys();
  
  
      // where the enemies will be
      //this.zones = this.physics.add.group({ classType: Phaser.GameObjects.Zone });
      //this.zones.create(753, 314, 16, 16);
  
      //this.add.existing(this.doorZone);
      console.log(this.doorZone);
      //this.doorZone.create
      /* for (var i = 0; i < 30; i++) {
        var x = Phaser.Math.RND.between(0, this.physics.world.bounds.width);
        var y = Phaser.Math.RND.between(0, this.physics.world.bounds.height);
        // parameters are x, y, width, height
        this.spawns.create(x, y, 20, 20);
      } */
      // add collider
      //this.physics.add.overlap(this.player, this.zones, this.onOpenDoor, false, this);
      // we listen for 'wake' event
      this.sys.events.on('wake', this.wake, this);
  
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
  
      //this.battleScene = this.scene.get("BattleScene");
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