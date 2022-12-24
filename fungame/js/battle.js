var BattleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function BattleScene() {
            Phaser.Scene.call(this, { key: 'BattleScene' });
        },
    create: function () {
        // change the background to green
        this.cameras.main.setBackgroundColor("rgba(0, 200, 0, 0.5)");
        this.WorldScene = this.scene.get("WorldScene");
        this.player = this.WorldScene.player;
        //this.add.existing(this.player);
        this.startBattle();
        // on wake event we call startBattle too
        this.sys.events.on('wake', this.startBattle, this);

    },

    startBattle: function () {
        // player character - warrior
        var warrior = new PlayerCharacter(this, 250, 50, 'player', 52, this.player.name, this.player.hp, this.player.attack);
        this.add.existing(warrior);

        // player character - mage
        var mage = new PlayerCharacter(this, 250, 100, 'player', 48, 'Magedoggo', 80, 13); 
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
        // Update player hp in worldscene
        this.events.emit("endBattle", this.heroes[0].hp);
        //this.player.hp = this.warrior.hp;
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


var Unit = new Phaser.Class({
    Extends: Phaser.GameObjects.Sprite,
    initialize:
        function Unit(scene, x, y, texture, frame, type, hp, damage) {
            Phaser.GameObjects.Sprite.call(this, scene, x, y, texture, frame)
            this.type = type;
            this.maxHp = this.hp = hp;
            this.damage = damage; // default damage     
            this.living = true;
            this.menuItem = null;
        },
    // we will use this to notify the menu item when the unit is dead
    setMenuItem: function (item) {
        this.menuItem = item;
    },
    // attack the target unit
    attack: function (target) {
        if (target.living) {
            target.takeDamage(this.damage);
            this.scene.events.emit("Message", this.type + " attacks " + target.type + " for " + this.damage + " damage");
        }
    },
    takeDamage: function (damage) {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.hp = 0;
            this.menuItem.unitKilled();
            this.living = false;
            this.visible = false;
            this.menuItem = null;
        }
    }
});

var Enemy = new Phaser.Class({
    Extends: Unit,
    initialize:
        function Enemy(scene, x, y, texture, frame, type, hp, damage) {
            Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
            this.setScale(1);
        }

});

var PlayerCharacter = new Phaser.Class({
    Extends: Unit,
    initialize:
        function PlayerCharacter(scene, x, y, texture, frame, type, hp, damage) {
            Unit.call(this, scene, x, y, texture, frame, type, hp, damage);
            // flip the image so I don't have to edit it manually
            this.flipX = false;

            this.setScale(1.5);
        }
});

var MenuItem = new Phaser.Class({
    Extends: Phaser.GameObjects.Text,

    initialize:

        function MenuItem(x, y, text, scene) {
            Phaser.GameObjects.Text.call(this, scene, x, y, text, { color: "#ffffff", align: "left", fontSize: 15 });
        },

    select: function () {
        this.setColor("#f8ff38");
    },

    deselect: function () {
        this.setColor("#ffffff");
    },
    // when the associated enemy or player unit is killed
    unitKilled: function () {
        this.active = false;
        this.visible = false;
    }

});

var Menu = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,

    initialize:

        function Menu(x, y, scene, heroes) {
            Phaser.GameObjects.Container.call(this, scene, x, y);
            this.menuItems = [];
            this.menuItemIndex = 0;
            this.x = x;
            this.y = y;
            this.selected = false;
        },
    addMenuItem: function (unit) {
        var menuItem = new MenuItem(0, this.menuItems.length * 20, unit, this.scene);
        this.menuItems.push(menuItem);
        this.add(menuItem);
        return menuItem;
    },
    // menu navigation 
    moveSelectionUp: function () {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex--;
            if (this.menuItemIndex < 0)
                this.menuItemIndex = this.menuItems.length - 1;
        } while (!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    },
    moveSelectionDown: function () {
        this.menuItems[this.menuItemIndex].deselect();
        do {
            this.menuItemIndex++;
            if (this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
        } while (!this.menuItems[this.menuItemIndex].active);
        this.menuItems[this.menuItemIndex].select();
    },
    // select the menu as a whole and highlight the choosen element
    select: function (index) {
        if (!index)
            index = 0;
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = index;
        while (!this.menuItems[this.menuItemIndex].active) {
            this.menuItemIndex++;
            if (this.menuItemIndex >= this.menuItems.length)
                this.menuItemIndex = 0;
            if (this.menuItemIndex == index)
                return;
        }
        this.menuItems[this.menuItemIndex].select();
        this.selected = true;
    },
    // deselect this menu
    deselect: function () {
        this.menuItems[this.menuItemIndex].deselect();
        this.menuItemIndex = 0;
        this.selected = false;
    },
    confirm: function () {
        // when the player confirms his slection, do the action
    },
    // clear menu and remove all menu items
    clear: function () {
        for (var i = 0; i < this.menuItems.length; i++) {
            this.menuItems[i].destroy();
        }
        this.menuItems.length = 0;
        this.menuItemIndex = 0;
    },
    // recreate the menu items
    remap: function (units) {
        this.clear();
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            unit.setMenuItem(this.addMenuItem(unit.type));
        }
        this.menuItemIndex = 0;
    }
});

var HeroesMenu = new Phaser.Class({
    Extends: Menu,

    initialize:

        function HeroesMenu(x, y, scene) {
            Menu.call(this, x, y, scene);
        }
});

var ActionsMenu = new Phaser.Class({
    Extends: Menu,

    initialize:

        function ActionsMenu(x, y, scene) {
            Menu.call(this, x, y, scene);
            this.addMenuItem('Attack');
        },
    confirm: function () {
        this.scene.events.emit('SelectEnemies');
    }

});

var EnemiesMenu = new Phaser.Class({
    Extends: Menu,

    initialize:

        function EnemiesMenu(x, y, scene) {
            Menu.call(this, x, y, scene);
        },
    confirm: function () {
        this.scene.events.emit("Enemy", this.menuItemIndex);
    }
});

var infoBox = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    initialize:
        function infoBox(scene, events, Unit) {
            Phaser.GameObjects.Container.call(this, scene, Unit.x + 45, Unit.y + 20);
            var graphics = this.scene.add.graphics();
            this.add(graphics);
            this.thisUnit = Unit;


            if (this.Unit === Enemy) {

                graphics.lineStyle(1, 0xffffff, 0.8);
                graphics.fillStyle(0x031f4c, 0.3);
                graphics.strokeRect(-90, -20, 40, 40);
                graphics.fillRect(-90, -20, 40, 40);

            } else {

                graphics.lineStyle(1, 0xffffff, 0.8);
                graphics.fillStyle(0x031f4c, 0.3);
                graphics.strokeRect(-20, -10, 40, 20);
                graphics.fillRect(-20, -10, 40, 20);
            }
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

var Message = new Phaser.Class({
    Extends: Phaser.GameObjects.Container,
    initialize:
        function Message(scene, events) {
            Phaser.GameObjects.Container.call(this, scene, 160, 30);
            var graphics = this.scene.add.graphics();
            this.add(graphics);
            graphics.lineStyle(1, 0xffffff, 0.8);
            graphics.fillStyle(0x031f4c, 0.3);
            graphics.strokeRect(-90, -20, 180, 45);
            graphics.fillRect(-90, -20, 180, 45);
            this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: '#ffffff', align: 'center', fontSize: 13, wordWrap: { width: 160, useAdvancedWrap: true } });
            this.add(this.text);
            this.text.setOrigin(0.5);
            events.on("Message", this.showMessage, this);
            this.visible = false;
        },
    showMessage: function (text) {
        this.text.setText(text);
        this.visible = true;
        if (this.hideEvent)
            this.hideEvent.remove(false);
        this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
    },
    hideMessage: function () {
        this.hideEvent = null;
        this.visible = false;
    }
});




