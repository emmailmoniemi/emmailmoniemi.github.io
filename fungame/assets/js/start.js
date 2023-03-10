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