// Referenced the following video for getting started with Phaser: https://www.youtube.com/watch?v=0qtg-9M3peI
// Referenced the following video for creating a tilemap: https://www.youtube.com/watch?v=3jOz8k5c5vY

import Phaser from 'phaser';
import '../index.css';

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

class Level3 extends Phaser.Scene {
    constructor() {
      super('level-2');
      this.player;
      this.playerSpeed = speed-150;
      this.collectable;
      this.collections = 0;
      this.totalReferrals = 3;
      this.hasKey = false;
      this.backgroundMusic;
      this.jumpSFX;
      this.collectSFX;
      this.exit;
      this.graphics;
    }

    preload() {
      //tile map
      this.load.image('tiles2', 'assets/Tilemap/tilemap_packed.png');
      this.load.tilemapTiledJSON('tilemap2', 'assets/Tilemap/level2.json');

      // bg img
      this.load.image('background2', 'assets/level2background.jpg');

      // player character
      this.load.atlas('player', 'assets/dino.png', 'assets/dino.json');
      
      // collectables
      this.load.image('referral', 'assets/Collectables/2.png');
      this.load.image('coffee', 'assets/Collectables/3.png');
      this.load.image('key', 'assets/Collectables/key.png');
      this.load.image('door', 'assets/Collectables/door.png');


      // sounds
      this.load.audio('backgroundMusic2', 'assets/Sounds/Music/Ludwigs-Lullaby-PM-Music.mp3');
      this.load.audio('jump', 'assets/Sounds/SFX/smb_jump-small.wav');
      this.load.audio('collect', 'assets/Sounds/SFX/smb_coin.wav');
      this.load.audio('coffee', 'assets/Sounds/SFX/smb_1-up.wav');
      this.load.audio('damage', 'assets/Sounds/SFX/smb_bump.wav');
      this.load.audio('complete', 'assets/Sounds/SFX/smb_stage_clear.wav');
      
    }

    create() {
      this.scene.pause("scene-game");

      this.jumpSFX = this.sound.add('jump');
      this.collectSFX = this.sound.add('collect');
      this.coffeeSFX = this.sound.add('coffee');
      this.damageSFX = this.sound.add('damage');
      this.completeSFX = this.sound.add('complete');

      this.backgroundMusic2 = this.sound.add('backgroundMusic2');
      this.backgroundMusic2.play();
      this.backgroundMusic2.loop = true;
    //   this.backgroundMusic.stop();

      this.add.image(0, 0, 'background2')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

      // zoom in camera a bit (dino is smol)
      this.cameras.main.setZoom(2);
      
      // create cursor keys
      this.cursor = this.input.keyboard.createCursorKeys();

      // tile map
      const map = this.make.tilemap({key: 'tilemap2'});
      const tileset2 = map.addTilesetImage('330-game-map-2', 'tiles2');

      // calculate the y-coordinate for the tilemap layer
      const tilemapHeight = map.heightInPixels;
      const yOffset = sizes.height - tilemapHeight;

      // const ground = map.createLayer('ground', tileset, 0, yOffset);
      const ground2 = map.createLayer('ground', tileset2, 0, yOffset);
      ground2.setCollisionByProperty({ collides: true });

      const obstacles = map.createLayer('obstacles', tileset2, 0, yOffset);
      ground2.setCollisionByProperty({ collides: true });

      // calc height of ground layer
      const groundHeight = map.tileHeight * map.height;

      const worldWidth = map.widthInPixels;
      const worldHeight = map.heightInPixels;
      
      this.cameras.main.setBounds(0, 0, worldWidth, sizes.height);
      this.physics.world.setBounds(0, 0, worldWidth, sizes.height);
      
      // create player animations
      this.createPlayerAnimations();

      // create collectables
      this.collectable = this.physics.add.staticGroup();
      this.exit = this.physics.add.staticGroup();

      // establishing objects layer and spawning player if a spawn point exists
      const objectsLayer = map.getObjectLayer('objects');

      objectsLayer.objects.forEach(object => {
        const { x = 0, y = 0 , name , width = 0, height = 0 } = object;

        if (name === 'player-spawn') {

          // debugging, remove later
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
          this.player.health = 100;
          this.playerHealthBar = this.add.graphics();
          this.player.lastDamaged = 0;

          // this.player.setCollideWorldBounds(true); --> was messing with player spawn so commented out and manually calculated wall bounds instead
          this.physics.add.collider(this.player, ground2);
          this.physics.add.collider(this.player, obstacles);

          // this.player.setScale(1.5);
          this.player.setSize(this.player.width / 3, this.player.height / 1.3);
      
          // camera follows player after it is initialized
          this.cameras.main.startFollow(this.player);
        }

        if (name === 'door') {
          console.log('Door coordinates:', x, y + yOffset);
          const door = this.exit.create(x, y + yOffset, 'door');
          this.physics.add.collider(this.player, this.exit, this.checkDoor, null, this);
        }

        if (name === 'coffee') {
          const coffee = this.collectable.create(x, y + yOffset, 'coffee');
          coffee.setScale(0.05);
          coffee.refreshBody();
        }

        if (name === 'referral') {
          const referral = this.collectable.create(x, y + yOffset, 'referral');
          referral.setScale(0.05);
          referral.refreshBody();
        }

        if (name === 'key') {
          const key = this.collectable.create(x, y + yOffset, 'key');
          key.refreshBody();
        }

        if (name === 'spikes') {
            const spike = this.physics.add.staticImage(x + (width * 0.5), y + yOffset + (height * 0.5), null)
                .setSize(width, height)
                .setDisplaySize(width, height)
                .setOrigin(0, 0)
                .setVisible(false);
            console.log('width and heigh of spikes: ', width, height);

            this.physics.add.collider(this.player, spike, () => {
                this.damageSFX.play();
                this.takeDamage(20);
                console.log('Player hit the spikes');
            });
        }
      });

      this.physics.add.overlap(this.player, this.collectable, this.collectCollectable, null, this);
    }

    // seeing if player has collected refs and key when colliding w door
    checkDoor(player, door) {
        if (this.collections >= 3 && this.hasKey) {
            this.backgroundMusic2.stop();
            this.completeSFX.play();
          console.log('Level Passed!');
          this.add.text(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY,
            'Level Passed!',
            {
              fontSize: '48px',
              fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
              fill: '#fff',
            }
          ).setOrigin(0.5);

        this.time.delayedCall(6000, () => {
          this.scene.start('level-3'); // switch to level 3 when player passes this level
        });
      } else {
          console.log('You still need to collect all referrals and the key.');
      }
    }

    update() {
      if (!this.player) {
        return;
      }

      this.updatePlayerHealthBar();

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

    updatePlayerHealthBar() {
        this.playerHealthBar.clear();
        const barWidth = 20;
        const barHeight = 3;
        const barX = this.player.x - barWidth / 2; 
        const barY = this.player.y - this.player.height / 2 - 5;
    

        const healthPercent = Phaser.Math.Clamp(this.player.health, 0, 100) / 100;
        this.playerHealthBar.fillStyle(0xa32a2a);
        this.playerHealthBar.fillRect(barX, barY, barWidth, barHeight);
    
        // draw health
        this.playerHealthBar.fillStyle(0x64b357);
        this.playerHealthBar.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    }
    
    takeDamage(amount) {
        // prevent player from accidentally taking too much damage if they hold down the key 
        const currentTime = this.time.now;

        // note 1000 is in ms 
        if (currentTime - this.player.lastDamaged < 1000) {
            return; 
        }
    
        this.player.lastDamaged = currentTime;

        this.player.health = Math.max(0, this.player.health - amount);
        this.updatePlayerHealthBar();

        if (this.player.health <= 0) {
            console.log('Player has died!');
            this.handlePlayerDeath();
        }
    }

    handlePlayerDeath() {
        this.backgroundMusic2.stop();
        this.player.setVelocity(0, 0);
        this.player.setActive(false).setVisible(false);

        const message = this.add.text(
            this.cameras.main.worldView.centerX,
            this.cameras.main.worldView.centerY,
            'You Died',
            {
                fontSize: '48px',
                fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
                fill: '#ff0000',
            }
        ).setOrigin(0.5);

        // restart level
        this.time.delayedCall(2000, () => {
            message.destroy();
            this.scene.restart();
        });
    }
    
    heal(amount) {
        this.player.health = Math.min(100, this.player.health + amount);
    
        this.updatePlayerHealthBar();
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

      if (collectable.texture.key === 'coffee') {
        this.coffeeSFX.play();
        this.heal(20)
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
export default Level3;