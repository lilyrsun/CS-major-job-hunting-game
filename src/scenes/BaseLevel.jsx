import Phaser from 'phaser';

import '../index.css';

const speed = 500;

const gameCanvas = document.getElementById('gameCanvas');

const gameStartDiv = document.getElementById('gameStartDiv');
const startButton = document.getElementById('startButton');
const gameEndDiv = document.getElementById('gameEndDiv');
const gameWinLoseSpan = document.getElementById('gameWinLoseSpan');
const endScoreSpan = document.getElementById('endScoreSpan');

class BaseLevel extends Phaser.Scene {
    constructor(key) {
        super(key);
        this.player;
        this.cursor;
        this.exit;
    }

    preload() {
        this.load.atlas('player', 'assets/dino.png', 'assets/dino.json');
      
        // collectables
        this.load.image('referral', 'assets/Collectables/2.png');
        this.load.image('coffee', 'assets/Collectables/3.png');
        this.load.image('key', 'assets/Collectables/key.png');
        this.load.image('door', 'assets/Collectables/door.png');
  
  
        // sounds
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
        
        // create cursor keys
        this.cursor = this.input.keyboard.createCursorKeys();
  
        // create player animations
  
        this.createPlayerAnimations();
  
        // create collectables
        this.collectable = this.physics.add.staticGroup();
        this.exit = this.physics.add.staticGroup();
  
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
          this.player.setVelocityY(-225);
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
      }
  
      collectCollectable(player, collectable) {
        console.log(`Collided with: ${collectable.texture.key}`);
  
        if (collectable.texture.key === 'referral' || collectable.texture.key === 'key') {
          this.collectSFX.play();
        }
  
        if (collectable.texture.key === 'referral') {
          this.collections += 1;
          console.log(`Referrals Collected: ${this.collections}`);
        } else if (collectable.texture.key === 'key') {
          this.hasKey = true;
        }
  
        collectable.body.enable = false;
        collectable.setActive(false);
        collectable.setVisible(false);
        
        console.log(`Referrals: ${this.collections}/3, Has Key: ${this.hasKey}`);
      }
}
export default BaseLevel;
