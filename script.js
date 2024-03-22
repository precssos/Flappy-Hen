var ctx = myCanvas.getContext('2d');
var FPS = 40;
var jump_amount = -10;
var max_fall_speed = +10;
var acceleration = 1;
var pipe_speed = -2;
var game_mode = 'prestart';
var time_game_last_running;
var bottom_bar_offset = 0;
var pipes = [];
var score = 0; // Adding score variable
var highScore = 0; // Adding high score variable
var backgroundMusic = document.getElementById("backgroundMusic"); // Get background music element
var gameOverMusic = document.getElementById("gameOverMusic"); // Get game over music element

// Function to play background music
function playBackgroundMusic() {
  backgroundMusic.play();
}

// Function to pause background music
function pauseBackgroundMusic() {
  backgroundMusic.pause();
}

// Function to restart background music
function restartBackgroundMusic() {
  backgroundMusic.currentTime = 0; // Reset the background music to the beginning
  playBackgroundMusic(); // Start playing background music
}

// Function to play game over music
function playGameOverMusic() {
  gameOverMusic.play();
}

// Function to pause game over music
function pauseGameOverMusic() {
  gameOverMusic.pause();
}

function MySprite(img_url) {
  this.x = 0;
  this.y = 0;
  this.visible = true;
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.MyImg = new Image();
  this.MyImg.src = img_url || '';
  this.angle = 0;
  this.flipV = false;
  this.flipH = false;
}
MySprite.prototype.Do_Frame_Things = function () {
  ctx.save();
  ctx.translate(this.x + this.MyImg.width / 2, this.y + this.MyImg.height / 2);
  ctx.rotate((this.angle * Math.PI) / 180);
  if (this.flipV) ctx.scale(1, -1);
  if (this.flipH) ctx.scale(-1, 1);
  if (this.visible)
    ctx.drawImage(this.MyImg, -this.MyImg.width / 2, -this.MyImg.height / 2);
  this.x = this.x + this.velocity_x;
  this.y = this.y + this.velocity_y;
  ctx.restore();
};
function ImagesTouching(thing1, thing2) {
  if (!thing1.visible || !thing2.visible) return false;
  if (
    thing1.x >= thing2.x + thing2.MyImg.width ||
    thing1.x + thing1.MyImg.width <= thing2.x
  )
    return false;
  if (
    thing1.y >= thing2.y + thing2.MyImg.height ||
    thing1.y + thing1.MyImg.height <= thing2.y
  )
    return false;
  return true;
}
function Got_Player_Input(MyEvent) {
  switch (game_mode) {
    case 'prestart': {
      game_mode = 'running';
      restartBackgroundMusic(); // Restart background music on game start
      break;
    }
    case 'running': {
      bird.velocity_y = jump_amount;
      break;
    }
    case 'over':
      if (new Date() - time_game_last_running > 1000) {
        reset_game();
        game_mode = 'running';
        break;
      }
  }
  MyEvent.preventDefault();
}
addEventListener('touchstart', Got_Player_Input);
addEventListener('mousedown', Got_Player_Input);
addEventListener('keydown', Got_Player_Input);
function make_bird_slow_and_fall() {
  if (bird.velocity_y < max_fall_speed) {
    bird.velocity_y = bird.velocity_y + acceleration;
  }
  if (bird.y > myCanvas.height - bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = 'over';
    pauseBackgroundMusic(); // Pause background music on game over
    playGameOverMusic(); // Start playing game over music
  }
  if (bird.y < 0 - bird.MyImg.height) {
    bird.velocity_y = 0;
    game_mode = 'over';
    pauseBackgroundMusic(); // Pause background music on game over
    playGameOverMusic(); // Start playing game over music
  }
}

function add_pipe(x_pos, top_of_gap, gap_width) {
  var top_pipe = new MySprite();
  top_pipe.MyImg = pipe_piece;
  top_pipe.x = x_pos;
  top_pipe.y = top_of_gap - pipe_piece.height;
  top_pipe.velocity_x = pipe_speed;
  pipes.push(top_pipe);
  var bottom_pipe = new MySprite();
  bottom_pipe.MyImg = pipe_piece;
  bottom_pipe.flipV = true;
  bottom_pipe.x = x_pos;
  bottom_pipe.y = top_of_gap + gap_width;
  bottom_pipe.velocity_x = pipe_speed;
  pipes.push(bottom_pipe);
}
function make_bird_tilt_appropriately() {
  if (bird.velocity_y < 0) {
    bird.angle = -15;
  } else if (bird.angle < 70) {
    bird.angle = bird.angle + 4;
  }
}
function show_the_pipes() {
  for (var i = 0; i < pipes.length; i++) {
    pipes[i].Do_Frame_Things();
  }
}
function check_for_end_game() {
  for (var i = 0; i < pipes.length; i++)
    if (ImagesTouching(bird, pipes[i])) {
      game_mode = 'over';
      pauseBackgroundMusic(); // Pause background music on game over
      playGameOverMusic(); // Start playing game over music
    }
}
function display_intro_instructions() {
  ctx.font = '25px Arial, Alice';
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(
    'Touch to start the Game',
    myCanvas.width / 2,
    myCanvas.height / 4
  );
}

// Call functions to increment score and update high score
setInterval(function () {
  if (game_mode === 'running') {
    incrementScore();
    updateHighScore();
  }
}, 1000 / FPS);
function display_game_over() {
  var localScore = 0; // local score variable to avoid global score reset
  for (var i = 0; i < pipes.length; i++)
  if (pipes[i].x < bird.x){ localScore = localScore + 1; // increment by 1 when passing the pipe
  pipes[i].passed = true;}
  ctx.font = '30px Arial';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', myCanvas.width / 2, 100);
  ctx.fillStyle = 'purple';
  ctx.fillText('Score: ' + localScore, myCanvas.width / 2, 150); // display local score
   ctx.fillText('High Score: ' + highScore, myCanvas.width / 2, 200);
  ctx.font = '20px Arial';
  ctx.fillStyle = 'black';
  ctx.fillText('Touch to play again', myCanvas.width / 2, 300);
}
function display_bar_running_along_bottom() {
  if (bottom_bar_offset < -23) bottom_bar_offset = 0;
  ctx.drawImage(
    bottom_bar,
    bottom_bar_offset,
    myCanvas.height - bottom_bar.height
  );
}
function reset_game() {
    bird.y = myCanvas.height / 2;
    bird.angle = 0;
    pipes = []; // erase all the pipes from the array
    add_all_my_pipes(); // and load them back in their starting positions
    restartBackgroundMusic(); // Restart background music
  }
  
  function add_all_my_pipes() {
    add_pipe(500, 100, 140);
    add_pipe(800, 50, 140);
    add_pipe(1000, 250, 140);
    add_pipe(1200, 150, 120);
    add_pipe(1600, 100, 120);
    add_pipe(1800, 150, 120);
    add_pipe(2000, 200, 120);
    add_pipe(2200, 250, 120);
    add_pipe(2400, 30, 100);
    add_pipe(2700, 300, 100);
    add_pipe(3000, 100, 80);
    add_pipe(3300, 250, 80);
    add_pipe(3600, 50, 60);
    var finish_line = new MySprite('https://i.postimg.cc/mkFCsGZ3/finishline.png');
    finish_line.x = 3900;
    finish_line.velocity_x = pipe_speed;
    pipes.push(finish_line);
  }
  
  var pipe_piece = new Image();
  pipe_piece.onload = add_all_my_pipes;
  pipe_piece.src = 'https://i.postimg.cc/Fz9Vr0Db/PIPee.png';
  
  // Increment score when bird successfully passes the pipe
  function incrementScore() {
    for (var i = 0; i < pipes.length; i++) {
      if (pipes[i].x + pipes[i].MyImg.width < bird.x && !pipes[i].passed) {
        score++; // increase score by 1 when passing a pipe
        pipes[i].passed = true;
      }
    }
  }
  
  // Call functions to increment score and update high score
  setInterval(function () {
    if (game_mode === 'running') {
      incrementScore();
      updateHighScore();
    }
  }, 1000 / FPS);
  
  // Reset the score to 0 at the beginning of each game
  function resetGame() {
    score = 0;
    resetPassedPipes();
    game_mode = 'prestart'; // Reset game mode to prestart
    restartBackgroundMusic(); // Restart background music
    // Other reset logic...
  }
  
  // Reset the passed flag for all pipes
  function resetPassedPipes() {
    for (var i = 0; i < pipes.length; i++) {
      pipes[i].passed = false;
    }
  }
  
  // Define highScore outside of the game loop
  var highScore = 0;
  
  // Update high score if current score exceeds high score
  function updateHighScore() {
    if (score > highScore) {
      highScore = score;
    }
  }
  
  // Display score and high score
  function displayScore() {
    ctx.font = '20px Arial';
    ctx.textAlign = 'right'; // Align score to the right
    ctx.fillStyle = 'brown';
    ctx.fillText('Score: ' + score, myCanvas.width - 20, 30); // Adjusted position
    ctx.fillText('High Score: ' + highScore, myCanvas.width - 20, 60); // Adjusted position
  }
  
  // Main game loop
  function Do_a_Frame() {
    ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
    bird.Do_Frame_Things();
    display_bar_running_along_bottom();
    displayScore(); // Display score and high score
    switch (game_mode) {
      case 'prestart': {
        display_intro_instructions();
        break;
      }
      case 'running': {
        time_game_last_running = new Date();
        bottom_bar_offset = bottom_bar_offset + pipe_speed;
        show_the_pipes();
        make_bird_tilt_appropriately();
        make_bird_slow_and_fall();
        check_for_end_game();
        break;
      }
      case 'over': {
        make_bird_slow_and_fall();
        display_game_over();
        break;
      }
    }
  }
  
  var bottom_bar = new Image();
  bottom_bar.src = 'https://i.postimg.cc/T2mCpQLP/bottom-bar1.png';
  
  var bird = new MySprite('https://i.postimg.cc/CK4f7t3L/bird3.png');
  bird.x = myCanvas.width / 3;
  bird.y = myCanvas.height / 2;
  
  setInterval(Do_a_Frame, 1000 / FPS);
  