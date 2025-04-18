// FULL GAME WITH MENU, BOSS, MOBILE CONTROL, WEAPON UPGRADE
let player, bullets, enemies, boss, cursors, spaceKey, scoreText, livesText, background;
let score = 0;
let lives = 3;
let lastFired = 0;
let shootSound, explosionSound;
let multiShot = false;
let gameStarted = false;
let startButton, restartButton, titleText;
let touchControls = false;

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload, create, update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('player', 'https://labs.phaser.io/assets/sprites/ship.png');
  this.load.image('bullet', 'https://labs.phaser.io/assets/sprites/bullets/bullet7.png');
  this.load.image('enemy', 'https://labs.phaser.io/assets/sprites/pangball.png');
  this.load.image('boss', 'https://labs.phaser.io/assets/sprites/ufo.png');
  this.load.image('bg', 'https://labs.phaser.io/assets/skies/space3.png');

  this.load.spritesheet('explosion', 'https://labs.phaser.io/assets/sprites/explosion.png', { frameWidth: 64, frameHeight: 64 });

  this.load.audio('shoot', 'https://labs.phaser.io/assets/audio/SoundEffects/pistol.wav');
  this.load.audio('boom', 'https://labs.phaser.io/assets/audio/SoundEffects/explosion.mp3');
}

function create() {
  background = this.add.tileSprite(400, 300, 800, 600, 'bg');

  player = this.physics.add.sprite(400, 550, 'player').setScale(1.5).setVisible(false);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  bullets = this.physics.add.group({ defaultKey: 'bullet', maxSize: 50 });
  enemies = this.physics.add.group();

  shootSound = this.sound.add('shoot');
  explosionSound = this.sound.add('boom');

  this.anims.create({
    key: 'explode',
    frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 23 }),
    frameRate: 30,
    hideOnComplete: true
  });

  scoreText = this.add.text(16, 16, '', { fontSize: '20px', fill: '#ffffff' }).setVisible(false);
  livesText = this.add.text(650, 16, '', { fontSize: '20px', fill: '#ffffff' }).setVisible(false);

  titleText = this.add.text(200, 200, 'SPACE FIGHTER', { fontSize: '48px', fill: '#ffffff' });
  startButton = this.add.text(300, 300, '▶️ START GAME', { fontSize: '28px', fill: '#00ff00' })
    .setInteractive()
    .on('pointerdown', () => startGame.call(this));

  restartButton = this.add.text(300, 350, '🔁 RESTART', { fontSize: '24px', fill: '#ffffff' })
    .setInteractive()
    .setVisible(false)
    .on('pointerdown', () => location.reload());

  this.time.addEvent({
    delay: 1000,
    callback: () => {
      if (gameStarted && score < 100) {
        const x = Phaser.Math.Between(50, 750);
        const enemy = enemies.create(x, 0, 'enemy');
        enemy.setVelocityY(Phaser.Math.Between(80, 150));
      }
    },
    loop: true
  });

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
  this.physics.add.overlap(enemies, player, enemyHitPlayer, null, this);

  this.input.addPointer(1);
  if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
    touchControls = true;
  }
}

function startGame() {
  gameStarted = true;
  score = 0;
  lives = 3;
  multiShot = false;
  titleText.setVisible(false);
  startButton.setVisible(false);
  player.setVisible(true);
  scoreText.setVisible(true);
  livesText.setVisible(true);
  scoreText.setText('Score: 0');
  livesText.setText('Lives: 3');
}

function update(time) {
  if (!gameStarted) return;

  background.tilePositionY -= 1;
  player.setVelocityX(0);

  if (touchControls) {
    if (this.input.pointer1.isDown) {
      const pointerX = this.input.pointer1.x;
      if (pointerX < player.x) player.setVelocityX(-200);
      else player.setVelocityX(200);
    }
  } else {
    if (cursors.left.isDown) player.setVelocityX(-200);
    if (cursors.right.isDown) player.setVelocityX(200);
  }

  if (spaceKey.isDown && time > lastFired) {
    fireBullet(time);
  }

  bullets.children.each(b => { if (b.active && b.y < 0) b.disableBody(true, true); });
  enemies.children.each(enemy => { if (enemy && enemy.y > 600) loseLife.call(this, enemy); });

  if (score >= 100 && !boss) spawnBoss.call(this);
}

function fireBullet(time) {
  const shoot = posX => {
    const bullet = bullets.get(posX, player.y - 20);
    if (bullet) {
      bullet.enableBody(true, posX, player.y - 20, true, true);
      bullet.setVelocityY(-400);
      this.time.delayedCall(2000, () => bullet.disableBody(true, true));
    }
  };

  shootSound.play();
  if (multiShot) {
    shoot(player.x - 15);
    shoot(player.x);
    shoot(player.x + 15);
  } else {
    shoot(player.x);
  }
  lastFired = time + 300;
}

function hitEnemy(bullet, enemy) {
  bullet.disableBody(true, true);
  enemy.disableBody(true, true);
  const boom = enemy.scene.add.sprite(enemy.x, enemy.y, 'explosion');
  boom.play('explode');
  explosionSound.play();
  score += 10;
  scoreText.setText('Score: ' + score);
  if (score === 50) multiShot = true;
}

function enemyHitPlayer(player, enemy) {
  loseLife.call(this, enemy);
}

function loseLife(enemy) {
  if (enemy) enemy.disableBody(true, true);
  lives--;
  livesText.setText('Lives: ' + lives);
  if (lives <= 0) gameOver.call(this);
}

function gameOver() {
  this.scene.pause();
  const overText = this.add.text(250, 250, '💀 GAME OVER 💀', { fontSize: '40px', fill: '#ff0000' });
  restartButton.setVisible(true);
}

function spawnBoss() {
  boss = this.physics.add.sprite(400, -100, 'boss').setScale(2);
  boss.setVelocityY(50);
  this.physics.add.overlap(bullets, boss, hitBoss, null, this);
}

function hitBoss(bullet, boss) {
  bullet.disableBody(true, true);
  boss.setTint(0xff0000);
  this.time.delayedCall(100, () => boss.clearTint());
  boss.hp = (boss.hp || 10) - 1;
  if (boss.hp <= 0) {
    const boom = this.add.sprite(boss.x, boss.y, 'explosion');
    boom.setScale(2);
    boom.play('explode');
    boss.disableBody(true, true);
    score += 100;
    scoreText.setText('Score: ' + score);
  }
}
