let player, bullets, enemies, cursors, spaceKey, scoreText;
let score = 0;
let lastFired = 0;

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
  player = this.physics.add.sprite(400, 550, 'player');
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

  bullets = this.physics.add.group({
    defaultKey: 'bullet',
    maxSize: 30
  });

  enemies = this.physics.add.group();

  scoreText = this.add.text(16, 16, 'Score: 0', {
    fontSize: '24px',
    fill: '#ffffff'
  });

  this.time.addEvent({
    delay: 1000,
    callback: () => {
      const x = Phaser.Math.Between(50, 750);
      const enemy = enemies.create(x, 0, 'enemy');
      enemy.setVelocityY(100);
    },
    loop: true
  });

  this.physics.add.overlap(bullets, enemies, hitEnemy, null, this);
}

function update(time, delta) {
  player.setVelocityX(0);

  if (cursors.left.isDown) {
    player.setVelocityX(-200);
  } else if (cursors.right.isDown) {
    player.setVelocityX(200);
  }

  // Tembakan dengan cooldown 250ms
  if (spaceKey.isDown && time > lastFired) {
    const bullet = bullets.get(player.x, player.y - 20);

    if (bullet) {
      bullet.enableBody(true, player.x, player.y - 20, true, true);
      bullet.setVelocityY(-400);
      lastFired = time + 250;
    }
  }

  // Nonaktifkan peluru yang keluar layar
  bullets.children.each(function (b) {
    if (b.active && b.y < 0) {
      b.disableBody(true, true);
    }
  }, this);

  // Jika musuh tembus ke bawah layar
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

