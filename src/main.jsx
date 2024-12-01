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
    }

    preload() {
      this.load.image('background', 'assets/background.png');
      this.load.image('player', 'assets/green_player.gif');
      this.load.image('platform', 'assets/platform.png');
    }
    create() {
      this.add.image(0, 0, 'background').setOrigin(0, 0);
      this.player = this.physics.add.sprite(400, 300, 'player');
      this.player.setCollideWorldBounds(true);
      this.platforms = this.physics.add.staticGroup();
      this.platforms.create(400, 500, 'platform');
      this.physics.add.collider(this.player, this.platforms);
    }
    update() {
      const player = this.player;
      const cursors = this.input.keyboard.createCursorKeys();
      if (cursors.left.isDown) {
        player.setVelocityX(-160);
      } else if (cursors.right.isDown) {
        player.setVelocityX(160);
      } else {
        player.setVelocityX(0);
      }
      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-500);
      }
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