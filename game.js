let player, bullets, enemies, cursors, spaceKey, scoreText;
let score = 0;

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
}

function create() {
  // Player setup
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  // Controls
  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  // Bullet group
  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 10
  });

  // Enemy group
  enemies = this.physics.add.group();

  // Score display
  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  // Enemy spawner
  this.time.addEvent({
    delay: 1000,
    callback: () => {
      const x = Phaser.Math.Between(50, 750);
      const enemy = enemies.create(x, 0, 'enemy');
      enemy.setVelocityY(100);
      enemy.setCollideWorldBounds(false);
    },
    loop: true
  });

  // Collision detection
  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
}

function update() {
  // Player movement
  player.setVelocityX(0);
  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }

  // Shoot
  if (Phaser.Input.Keyboard.JustDown(spaceKey)) {
    const bullet = bullets.get(player.x, player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.body.velocity.y = -400;
    }
  }

  // Destroy off-screen bullets
  bullets.children.each(function (b) {
    if (b.active && b.y < 0) {
      b.setActive(false);
      b.setVisible(false);
    }
  }, this);

  // Check if any enemy reaches bottom
  enemies.children.iterate(enemy => {
    if (enemy && enemy.y > 600) {
      this.scene.restart();
      alert("Game Over! Skor kamu: " + score);
      score = 0;
    }
  });
}

function hitEnemy(bullet, enemy) {
  bullet.disableBody(true, true);
  enemy.disableBody(true, true);
  score += 10;
  scoreText.setText('Score: ' + score);
}
