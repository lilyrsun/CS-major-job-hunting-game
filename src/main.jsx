// Referenced the following video for getting started with Phaser: https://www.youtube.com/watch?v=0qtg-9M3peI

import Phaser from 'phaser';
import './index.css';

const sizes = {
    width: 800,
    height: 600,
}

const speedDown = 500;

const gameCanvas = document.getElementById('gameCanvas');

const gameStartDiv = document.getElementById('gameStartDiv');
const startButton = document.getElementById('startButton');
const gameEndDiv = document.getElementById('gameEndDiv');
const gameWinLoseSpan = document.getElementById('gameWinLoseSpan');
const endScoreSpan = document.getElementById('endScoreSpan');

class GameScene extends Phaser.Scene {
    constructor() {
      super('scene-game');
      this.player;
      this.platform;
      this.playerSpeed = speedDown;
      this.collectable;
      this.collections = 0;
      this.backgroundMusic;
      this.jumpSFX;
      this.collectSFX;
    }

    preload() {
      this.load.image('background', 'assets/background.png');
      this.load.image('player', 'assets/green_player.gif');
      this.load.image('platform', 'assets/Tiles/tile_0000.png');
      this.load.image('collectable', 'assets/Collectables/2.png');
      this.load.audio('backgroundMusic', 'assets/Sounds/Music/We-Shop-Song-PM-Music.mp3');
      this.load.audio('jump', 'assets/Sounds/SFX/smb_jump-small.wav');
      this.load.audio('collect', 'assets/Sounds/SFX/smb_coin.wav');
    }

    create() {
      this.scene.pause("scene-game");

      this.jumpSFX = this.sound.add('jump');
      this.collectSFX = this.sound.add('collect');

      this.backgroundMusic = this.sound.add('backgroundMusic');
      this.backgroundMusic.play();
      // this.backgroundMusic.loop = true;
      this.backgroundMusic.stop();

      this.cursor = this.input.keyboard.createCursorKeys();

      this.add.image(0, 0, 'background').setOrigin(0, 0);

      this.player = this.physics.add.sprite(400, 300, 'player');
      this.player.setCollideWorldBounds(true);
      this.player.setScale(3);
      this.player.setSize(this.player.width/1.5, this.player.height/1.3);

      this.platform = this.physics.add.staticGroup();
      const platformTile = this.platform.create(400, 500, 'platform');
      platformTile.setScale(3);
      platformTile.refreshBody();

      this.collectable = this.physics.add.staticGroup();
      const referral = this.collectable.create(platformTile.x, platformTile.y - 50, 'collectable');
      referral.setScale(0.1);
      referral.refreshBody();

      this.textCollections = this.add.text(sizes.width - 250, 10, 'Referrals Collected: 0', {
        fontSize: '24px',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        fill: '#fff'
      });
      
      this.physics.add.collider(this.player, this.platform);

      this.physics.add.overlap(this.player, this.collectable, this.collectCollectable, null, this);
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

      if (up.isDown && this.player.body.touching.down) {
        this.jumpSFX.play();
        this.player.setVelocityY(-300);
      }
  }

  collectCollectable(player, collectable) {
    this.collectSFX.play();
    this.collections += 1;
    this.textCollections.setText(`Referrals Collected: ${this.collections}`);

    collectable.body.enable = false;
    
    // collectable.destroy();

    collectable.setActive(false);
    collectable.setVisible(false);
    
    console.log(this.collections);
  }

  gameOver() {
    this.sys.game.destroy(true);
    if(this.points >= 10) {
      endScoreSpan.innerText = this.collections;
      gameWinLoseSpan.innerText = 'hired!';
    } else {
      endScoreSpan.innerText = this.collections;
      gameWinLoseSpan.innerText = 'rejected.';
    }

    gameEndDiv.style.display = 'flex';
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

startButton.addEventListener('click', () => {
    gameStartDiv.style.display = 'none';
    gameEndDiv.style.display = 'none';
    game.scene.resume('scene-game');
});