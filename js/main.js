/**
 * Created by acinelli on 28/10/2016.
 */
var scenarioWidth = 4000;
var scenarioEight = window.innerHeight;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, '', {preload: preload, create: create, update: update, render: render});
var globalGravity = 1000;
var platforms;
var player;
var cursors;
var stars;

var score = 0;
var scoreText;

var playerJumped = false;

function preload() {
  game.load.image('sky', 'assets/sky.png');
  game.load.image('ground', 'assets/platform.png');
  game.load.image('star', 'assets/star.png');
  game.load.image('block', 'assets/block.png');
  game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
  game.load.spritesheet('baddie', 'assets/baddie.png', 32, 32);
}

function create() {
  //  A simple background for our game
  game.add.tileSprite(0, scenarioEight / 3, scenarioWidth, scenarioEight, 'sky');

  game.world.setBounds(0, 0, scenarioWidth, scenarioEight);

  //  We're going to be using physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  The platforms group contains the ground and the 2 ledges we can jump on
  platforms = game.add.group();

  //  We will enable physics for any object that is created in this group
  platforms.enableBody = true;

  // Here we create the ground.
  var ground = platforms.create(0, game.world.height - 64, 'ground');

  //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
  ground.scale.setTo(game.world.width / 400 + 1, 2);

  //  This stops it from falling away when you jump on it
  ground.body.immovable = true;

  //  Now let's create two ledges
  var i;
  var dist = 5;
  var prevHeight = 0;
  var currHeight = 0;
  for (var k = 0; k < 15; k++) {

    if (prevHeight === 0) {
      currHeight = getRandomWithRange(game.world.height - 200, game.world.height - 400)
    } else {
      currHeight = getRandomWithRange(game.world.height - 200, prevHeight + getRandomWithRange(0, 100) * getRandomSign());
    }

    for (i = 0; i < getRandomWithRange(3, 15); i++) {
      ledge = platforms.create((i + dist) * 31, currHeight, 'block');

      ledge.body.immovable = true;
    }

    prevHeight = currHeight;
    dist += i + getRandomWithRange(3, 15);
  }

  // The player and its settings
  player = game.add.sprite(0, game.world.centerY, 'baddie');

  //  We need to enable physics on the player
  game.physics.arcade.enable(player);

  //  Player physics properties. Give the little guy a slight bounce.
  player.body.bounce.y = 0;
  player.body.gravity.y = globalGravity;
  player.body.collideWorldBounds = true;

  //  Our two animations, walking left and right.
  player.animations.add('left', [0, 1], 10, true);
  player.animations.add('right', [2, 3], 10, true);


  // Stars
  stars = game.add.group();

  //  We will enable physics for any star that is created in this group
  stars.enableBody = true;

  //  Here we'll create 12 of them evenly spaced apart
  for (i = 0; i < getRandomWithRange(50, 100); i++) {
    //  Create a star inside of the 'stars' group
    var star = stars.create(i * 31 + getRandomWithRange(31, 5000), game.world.height - getRandomWithRange(200, 500), 'star');

    //  Let gravity do its thing
    //star.body.gravity.y = 360;

    //  This just gives each star a slightly random bounce value
    star.body.bounce.y = 0.5 + Math.random() * 0.2;
  }

  // Movement
  cursors = game.input.keyboard.createCursorKeys();


  // Score
  scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
  scoreText.fixedToCamera = true;

  game.camera.follow(player);
}

function getRandomWithRange(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

function update() {
  //  Collide the player and the stars with the platforms
  game.physics.arcade.collide(player, platforms);


  //  Reset the players velocity (movement)
  player.body.velocity.x = 0;

  if (cursors.left.isDown) {
    //  Move to the left
    player.body.velocity.x = -350;

    player.animations.play('left');
  }
  else if (cursors.right.isDown) {
    //  Move to the right
    player.body.velocity.x = 350;

    player.animations.play('right');
  }
  else {
    //  Stand still
    player.animations.stop();

    player.frame = 4;
  }

  //  Allow the player to jump if they are touching the ground.
  if (cursors.up.isDown && player.body.touching.down) {
    //  Allow the player to jump if they are touching the ground.
    player.body.velocity.y = -250;
    playerJumped = true;

  } else if (cursors.up.isDown && playerJumped == true)  {
    // reduce players gravity if player recently jumped
    if (player.body.velocity.y >= - 550) {
      player.body.velocity.y = player.body.velocity.y - 50;
    } else {
      playerJumped = false;
    }

    player.body.gravity.y = globalGravity - 4;

  } else {
    // reset gravity once the arrowkey is released
    playerJumped = false;
    player.body.gravity.y = globalGravity;
  }


  // Stars colliding
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.overlap(player, stars, collectStar, null, this);
}

function collectStar (player, star) {
  // Removes the star from the screen
  star.kill();

  //  Add and update the score
  score += 10;
  scoreText.text = 'Score: ' + score;
}

function render() {}