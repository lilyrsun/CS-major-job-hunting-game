// Referenced the following video for getting started with Phaser: https://www.youtube.com/watch?v=0qtg-9M3peI

import Phaser from 'phaser';
import './index.css';

const sizes = {
    width: 800,
    height: 600,
}

const speedDown = 300;

class GameScene extends Phaser.Scene {
    constructor() {
      super('scene-game');
      this.player;
      this.platform;
      this.playerSpeed = speedDown+50;
      this.collectable;
      this.collections = 0;
    }

    preload() {
      this.load.image('background', 'assets/background.png');
      this.load.image('player', 'assets/green_player.gif');
      this.load.image('platform', 'assets/Tiles/tile_0000.png');
      this.load.image('collectable', 'assets/Collectables/2.png');
    }
    create() {
      this.add.image(0, 0, 'background').setOrigin(0, 0);

      this.player = this.physics.add.sprite(400, 300, 'player');
      this.player.setCollideWorldBounds(true);
      this.player.setScale(3);

      this.cursor = this.input.keyboard.createCursorKeys();

      this.platform = this.physics.add.staticGroup();
      const platformTile = this.platform.create(400, 500, 'platform');
      platformTile.setScale(3);
      platformTile.refreshBody();

      this.collectable = this.physics.add.staticGroup();
      const referral = this.collectable.create(platformTile.x, platformTile.y - 50, 'collectable');
      referral.setScale(0.1);
      referral.refreshBody();
      
      this.physics.add.collider(this.player, this.platform);

      this.physics.add.overlap(this.player, this.collectable, () => this.collectCollectable, null, this);
    }

    update() {
      const {left, right, up} = this.cursor;

      if (left.isDown) {
        this.player.setVelocityX(-this.playerSpeed);
      } else if (right.isDown) {
        this.player.setVelocityX(this.playerSpeed);
      } else {
        this.player.setVelocityX(0);
      }

      if (up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
      }
  }

  collectCollectable(player, collectable) {
    this.collections += 1;
    collectable.destroy();
    console.log(this.collections);
  }
}

const config = {
    type: Phaser.WEBGL,
    width: sizes.width,
    height: sizes.height,
    canvas: gameCanvas,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: speedDown},
            debug: true
        },
    },
    scene: [GameScene]
}

const game = new Phaser.Game(config);