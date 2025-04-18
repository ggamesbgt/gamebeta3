let player, bullets, enemies, cursors, spaceKey, scoreText, livesText, background;
let score = 0;
let lives = 3;
let lastFired = 0;
let explosionSound, shootSound;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/ship.png');
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullets/bullet7.png');
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/pangball.png');
  this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');

  this.load.spritesheet('explosion', 'https://labs.phaser.io/assets/sprites/explosion.png', {
    frameWidth: 64,
    frameHeight: 64
  });

  this.load.audio('shoot', 'https://labs.phaser.io/assets/audio/SoundEffects/pistol.wav');
  this.load.audio('boom', 'https://labs.phaser.io/assets/audio/SoundEffects/explosion.mp3');
}

function create() {
  background = this.add.tileSprite(400, 300, 800, 600, 'bg');

  player = this.physics.add.sprite(400, 550, 'player').setScale(1.5);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 30 });
  enemies = this.physics.add.group();

  shootSound = this.sound.add('shoot');
  explosionSound = this.sound.add('boom');

  this.anims.create({
    key: 'explode',
    frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23 }),
    frameRate: 30,
    hideOnComplete: true
  });

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  livesText = this.add.text(650, 16, 'Lives: 3', {
    fontSize: '20px',
    fill: '#ffffff'
  });

  this.time.addEvent({
    delay: 1000,
    callback: () => {
      const x = Phaser.Math.Between(50, 750);
      const enemy = enemies.create(x, 0, 'enemy');
      enemy.setVelocityY(Phaser.Math.Between(80, 150));
    },
    loop: true
  });

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
  this.physics.add.overlap(enemies, player, enemyHitPlayer, null, this);
}

function update(time) {
  background.tilePositionY -= 1;

  player.setVelocityX(0);
  if (cursors.left.isDown) player.setVelocityX(-200);
  if (cursors.right.isDown) player.setVelocityX(200);

  if (spaceKey.isDown && time > lastFired) {
    const bullet = bullets.get(player.x, player.y - 20);
    if (bullet) {
      bullet.enableBody(true, player.x, player.y - 20, true, true);
      bullet.setVelocityY(-400);
      shootSound.play();
      lastFired = time + 250;

      // Auto-disable bullet
      this.time.delayedCall(2000, () => {
        if (bullet.active) bullet.disableBody(true, true);
      });
    }
  }

  bullets.children.each(b => {
    if (b.active && b.y < 0) b.disableBody(true, true);
  });

  enemies.children.each(enemy => {
    if (enemy && enemy.y > 600) {
      enemy.disableBody(true, true);
      loseLife.call(this);
    }
  });
}

function hitEnemy(bullet, enemy) {
  bullet.disableBody(true, true);
  enemy.disableBody(true, true);

  const explosion = enemy.scene.add.sprite(enemy.x, enemy.y, 'explosion');
  explosion.play('explode');
  explosionSound.play();

  score += 10;
  scoreText.setText('Score: ' + score);
}

function enemyHitPlayer(player, enemy) {
  enemy.disableBody(true, true);
  loseLife.call(this);
}

function loseLife() {
  lives -= 1;
  livesText.setText('Lives: ' + lives);
  if (lives <= 0) {
    this.scene.pause();
    this.add.text(300, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000'
    });
    this.add.text(260, 350, `Score kamu: ${score}`, {
      fontSize: '28px',
      fill: '#ffffff'
    });
  }
}
