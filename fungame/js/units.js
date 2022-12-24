
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
            console.log(this.thisUnit);


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
        console.log(text);
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
        console.log(this.thisUnit);
        console.log(this.thisUnit.hp);
    },

    destroy: function() {
        this.destroy();
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