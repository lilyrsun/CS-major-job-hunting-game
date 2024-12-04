// Referenced the following video for getting started with Phaser: https://www.youtube.com/watch?v=0qtg-9M3peI
// Referenced the following video for creating a tilemap: https://www.youtube.com/watch?v=3jOz8k5c5vY

import Phaser from 'phaser';
import './index.css';

const sizes = {
    width: 800,
    height: 600,
}

const speed = 500;

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
      this.playerSpeed = speed;
      this.collectable;
      this.collections = 0;
      this.backgroundMusic;
      this.jumpSFX;
      this.collectSFX;
    }

    preload() {
      //tile map
      this.load.image('tiles', 'assets/Tilemap/tilemap_packed.png');
      this.load.tilemapTiledJSON('tilemap', 'assets/Tilemap/level1.json');


      this.load.image('background', 'assets/background.png');

      // this.load.image('player', 'assets/green_player.gif');
      this.load.atlas('player', 'assets/dino.png', 'assets/dino.json');

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
      this.backgroundMusic.loop = true;
      this.backgroundMusic.stop();

      this.add.image(0, 0, 'background')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

      // create cursor keys
      this.cursor = this.input.keyboard.createCursorKeys();

      this.platform = this.physics.add.staticGroup();
      const platformTile = this.platform.create(400, 500, 'platform');
      platformTile.setScale(3);
      platformTile.refreshBody();

      // tile map
      const map = this.make.tilemap({key: 'tilemap'});
      const tileset = map.addTilesetImage('330-game-map-2', 'tiles');

      // calculate the y-coordinate for the tilemap layer
      const tilemapHeight = map.heightInPixels;
      const yOffset = sizes.height - tilemapHeight;

      // const ground = map.createLayer('ground', tileset, 0, yOffset);
      const ground = map.createLayer('ground', tileset, 0, yOffset);
      ground.setCollisionByProperty({ collides: true });

      // calc height of ground layer
      const groundHeight = map.tileHeight * map.height;

      const worldWidth = map.widthInPixels;
      const worldHeight = map.heightInPixels;
      
      this.cameras.main.setBounds(0, 0, worldWidth, sizes.height);
      this.physics.world.setBounds(0, 0, worldWidth, sizes.height);

      // create player animations

      this.createPlayerAnimations();

      // establishing objects layer and spawning player if a spawn point exists
      const objectsLayer = map.getObjectLayer('objects');

      objectsLayer.objects.forEach(object => {
        const { x = 0, y = 0 , name } = object;

        if (name === 'player-spawn') {

          console.log({
              x,
              y,
              yOffset,
              tilemapHeight,
              groundHeight,
          });
          console.log('Ground offset:', yOffset);
          console.log('Camera Bounds:', this.cameras.main.getBounds());
          console.log('World Bounds:', this.physics.world.bounds);

          this.player = this.physics.add.sprite(x, y + yOffset - 100, 'player').play('idle');
          // this.player.setCollideWorldBounds(true); --> was messing with player spawn so commented out and manually calculated wall bounds instead
          this.physics.add.collider(this.player, this.platform);
          this.physics.add.collider(this.player, ground);

          this.player.setScale(2.5);
          this.player.setSize(this.player.width / 3, this.player.height / 1.3);
      
          // camera follows player after it is initialized
          this.cameras.main.startFollow(this.player);
        }
      });

      this.collectable = this.physics.add.staticGroup();
      const referral = this.collectable.create(platformTile.x, platformTile.y - 50, 'collectable');
      referral.setScale(0.1);
      referral.refreshBody();

      this.textCollections = this.add.text(sizes.width - 250, 10, 'Referrals Collected: 0', {
        fontSize: '24px',
        fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
        fill: '#fff'
      });

      this.physics.add.overlap(this.player, this.collectable, this.collectCollectable, null, this);
    }

    update() {
      if (!this.player) {
        return;
      }

      const { left, right} = this.cursor;
    
      if (this.cursor.left.isDown) {
        this.player.flipX = true;
        this.player.setVelocityX(-this.playerSpeed*0.4);
        this.player.play('walk', true);
      } else if (this.cursor.right.isDown) {
        this.player.flipX = false;
        this.player.setVelocityX(this.playerSpeed*0.4);
        this.player.play('walk', true);
      } else {
        this.player.setVelocityX(0);
        this.player.play('idle', true);
      }

      if (this.player.x < 0) {
        this.player.setX(0);
        this.player.setVelocityX(0);
      } else if (this.player.x > this.physics.world.bounds.width) {
          this.player.setX(this.physics.world.bounds.width);
          this.player.setVelocityX(0);
      }

      const spaceJustPressed = Phaser.Input.Keyboard.JustDown(this.cursor.space);
      const upJustPressed = Phaser.Input.Keyboard.JustDown(this.cursor.up); 
    
      if ((spaceJustPressed || upJustPressed) && this.player.body.blocked.down) {
        this.jumpSFX.play();
        this.player.setVelocityY(-300);
      }
    }

    createPlayerAnimations() {
      this.anims.create({
        key: 'idle',
        frameRate: 3,
        frames: [
          { key: 'player', frame: 'tile000.png' },
          { key: 'player', frame: 'tile001.png' },
          { key: 'player', frame: 'tile003.png' }
        ],
        repeat: -1,
      })

      this.anims.create({
        key: 'walk',
        frameRate: 7,
        frames: this.anims.generateFrameNames('player', { 
          start: 4, 
          end: 9, 
          prefix: 'tile00',
          suffix: '.png'
        }),
        repeat: -1,
      })

      // this.anims.create({
      //   key: 'run',
      //   frames: this.anims.generateFrameNames('player', {
      //     prefix: 'dino-run-',
      //     start: 1,
      //     end: 2,
      //   }),
      //   frameRate: 10,
      //   repeat: -1,
      // });
    
      // this.anims.create({
      //   key: 'jump',
      //   frames: [{ key: 'player', frame: 'dino-jump' }],
      //   frameRate: 10,
      // })
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
            gravity: { y: speed},
            debug: true,
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