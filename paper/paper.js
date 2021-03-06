(function () {

    // Main game object
    // ----------------

    // **new Game()** Creates the game object with the game state and logic.
    var Game = function () {

        // In index.html, there is a canvas tag that the game will be drawn in.
        // Grab that canvas out of the DOM.
        var canvas = document.getElementById("paper");
        this.viewport = $("#paper");

        // Get the drawing context.  This contains functions that let you draw to the canvas.
        var screen = canvas.getContext('2d');

        // Note down the dimensions of the canvas.  These are used to
        // place game bodies.
        var gameSize = { x: canvas.width, y: canvas.height };
        
        this.background = { x: 0 };

        // Create the bodies array to hold the player and balls.
        this.bodies = [];

        // Add the player to the bodies array.
        this.player = new Player(this, gameSize);

        this.bodies = this.bodies.concat(this.player);

        var self = this;

        // Main game tick function.  Loops forever, running 60ish times a second.
        var tick = function () {

            // Update game state.
            self.update();

            // Draw game bodies.
            self.draw(screen, gameSize);

            // Queue up the next call to tick with the browser.
            requestAnimationFrame(tick);
        };

        // Run the first game tick.  All future calls will be scheduled by
        // the tick() function itself.
        tick();
    };

    Game.prototype = {

        // **update()** runs the main game logic.
        update: function () {
            var self = this;

            for (var i = 0; i < self.bodies.length; i++) {
                self.bodies[i].update();
            }
        },

        // **draw()** draws the game.
        draw: function (screen, gameSize) {
            // Clear away the drawing from the previous tick.
            screen.clearRect(0, 0, gameSize.x, gameSize.y);
            
            var img = document.getElementById("eraser");
            screen.drawImage(img, 420 + this.background.x, 365);
            
            img = document.getElementById("paperclip");
            screen.drawImage(img, 390 + this.background.x, 365);
            screen.drawImage(img, 390 + this.background.x, 420);
            screen.drawImage(img, 390 + this.background.x, 475);
            
            img = document.getElementById("pencil");
            screen.drawImage(img, -35 + this.background.x, 500);
            screen.drawImage(img, 390 + this.background.x, 500);
            screen.drawImage(img, 815 + this.background.x, 500);
            screen.drawImage(img, 1240 + this.background.x, 500);
            screen.drawImage(img, 2090 + this.background.x, 500);
            
            // Draw each body as a rectangle.
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].center.y < 0) {
                    delete this.bodies[i];
                    continue;
                }

                if (this.bodies[i].color) {
                    screen.fillStyle = this.bodies[i].color;
                } else {
                    screen.fillStyle = "#FFFFFF";
                }

                this.bodies[i].draw(screen);
            }

        },

        // **addBody()** adds a body to the bodies array.
        addBody: function (body) {
            this.bodies.push(body);
        },
        
        moveBackgroundRight: function(){
            this.background.x -= 3;
         
            var origLeft = parseInt(this.viewport.css("background-position-x"));
            var newLeft = origLeft - 1;
            this.viewport.css("background-position-x", newLeft + "px");
            
        },
        
        moveBackgroundLeft: function(){
            if (this.background.x < 0) {
                this.background.x += 3;

                var origLeft = parseInt(this.viewport.css("background-position-x"));
                var newLeft = origLeft + 1;
                this.viewport.css("background-position-x", newLeft + "px");
            }
        }

    };

    // Player
    // ------

    // **new Player()** creates a player.
    var Player = function (game, gameSize) {
        this.game = game;
        this.size = { x: 32, y: 64 };
        this.center = { x: 200, y: 495 };
        this.velocity = { x: 0, y: 0 };
        this.id = "dude-standing-1";
        this.spriteChangeCount = 0;
        this.spriteCooldown = 6;
        this.spriteForward = true;
        this.moveRate = 3;
        this.isJumping = false;
        this.jumpDuration = 31;
        this.jumpFrames = 0;
        this.jumpTime = 32;
        this.jumpCooldown = 0;

        // Create a keyboard object to track button presses.
        this.keyboarder = new Keyboarder();
    };

    Player.prototype = {

        draw: function (screen) {
            var x = this.center.x - this.size.x / 2;
            var y = this.center.y - this.size.y / 2;

            var img = document.getElementById(this.id);

            screen.drawImage(img, x, y);

            screen.restore();

            screen.fill();
        },

        // **update()** updates the state of the player for a single tick.
        update: function () {
            if (this.isJumping) {
                if (this.jumpFrames > 15) {
                    this.center.y -= 3;
                } else if (this.jumpFrames >= 0) {
                    this.center.y += 3;
                }
                this.jumpFrames--;
                            
                this.jumpCooldown--;
                
                if (this.jumpCooldown === 0) {
                    this.isJumping = false;
                }
            }
        
        
            // If left cursor key is down...
            if (this.keyboarder.isDown(this.keyboarder.KEYS.LEFT)) {
                if (this.spriteChangeCount === 0 || this.id.indexOf("running-right") > -1) {
                    if (this.spriteForward) {
                        if (this.id.indexOf("1") > -1) {
                            this.id = "dude-running-left-2";
                        } else if (this.id.indexOf("2") > -1) {
                            this.id = "dude-running-left-3";
                        } else if (this.id.indexOf("3") > -1) {
                            this.id = "dude-running-left-4";
                        } else {
                            this.id = "dude-running-left-5";
                            this.spriteForward = false;
                        }
                    } else {
                        if (this.id.indexOf("5") > -1) {
                            this.id = "dude-running-left-4";
                        } else if (this.id.indexOf("4") > -1) {
                            this.id = "dude-running-left-3";
                        } else if (this.id.indexOf("3") > -1) {
                            this.id = "dude-running-left-2";
                        } else {
                            this.id = "dude-running-left-1";
                            this.spriteForward = true;
                        }
                    }
                    this.spriteChangeCount = this.spriteCooldown;
                } else {
                    this.spriteChangeCount--;
                }
                
                this.center.x -= this.moveRate;

                if (this.center.x > 550) {
                    this.center.x = 550;
                } else if (this.center.x < 50) {
                    this.center.x = 50;
                }
                
                if (this.game.background.x < 0) {
                    if (this.center.x < 300) {
                        this.center.x = 300;
                        this.game.moveBackgroundLeft();
                    } else if (this.center.x < 50) {
                        this.center.x = 50;
                    }
                }
            } else if (this.keyboarder.isDown(this.keyboarder.KEYS.RIGHT)) {
                if (this.spriteChangeCount === 0 || this.id.indexOf("running-left") > -1) {
                    if (this.spriteForward) {
                        if (this.id.indexOf("1") > -1) {
                            this.id = "dude-running-right-2";
                        } else if (this.id.indexOf("2") > -1) {
                            this.id = "dude-running-right-3";
                        } else if (this.id.indexOf("3") > -1) {
                            this.id = "dude-running-right-4";                        
                        } else {
                            this.id = "dude-running-right-5";
                            this.spriteForward = false;
                        }
                    } else {
                        if (this.id.indexOf("5") > -1) {
                            this.id = "dude-running-right-4";
                        } else if (this.id.indexOf("4") > -1) {
                            this.id = "dude-running-right-3";
                        } else if (this.id.indexOf("3") > -1) {
                            this.id = "dude-running-right-2";
                        } else {
                            this.id = "dude-running-right-1";
                            this.spriteForward = true;
                        }
                    }
                    this.spriteChangeCount = this.spriteCooldown;
                } else {
                    this.spriteChangeCount--;
                }
               
                this.center.x += this.moveRate;

                if (this.center.x > 550) {
                    this.center.x = 550;
                } else if (this.center.x < 50) {
                    this.center.x = 50;
                }
                
                if (this.center.x > 300) {
                    this.center.x = 300;
                    this.game.moveBackgroundRight();
                } else if (this.center.x < 50) {
                    this.center.x = 50;
                }
            } else {
                if (this.spriteChangeCount === 0) {
                    if (this.id.indexOf("1") > -1) {
                        this.id = "dude-standing-2";
                    } else if (this.id.indexOf("2") > -1) {
                        this.id = "dude-standing-3";
                    } else {
                        this.id = "dude-standing-1";
                    }

                    this.spriteChangeCount = this.spriteCooldown;
                } else {
                    this.spriteChangeCount--;
                }
            }
            
            if (this.isJumping) {
                if (this.id.indexOf("right") > -1) {
                    this.id = "dude-running-right-1";
                    this.spriteForward = true;
                } else if (this.id.indexOf("left") > -1) {
                    this.id = "dude-running-left-1";
                    this.spriteForward = true;
                }
            }
            
            if (this.keyboarder.isDown(this.keyboarder.KEYS.UP)) {
                if (!this.isJumping) {
                    console.log("jump");
                    this.isJumping = true;
                    this.jumpCooldown = this.jumpTime;
                    this.jumpFrames = this.jumpDuration;
                }
            }
        }
    };

    // Keyboard input tracking
    // -----------------------

    // **new Keyboarder()** creates a new keyboard input tracking object.
    var Keyboarder = function () {

        // Records up/down state of each key that has ever been pressed.
        var keyState = {};

        // When key goes down, record that it is down.
        window.addEventListener('keydown', function (e) {
            keyState[e.keyCode] = true;
        });

        // When key goes up, record that it is up.
        window.addEventListener('keyup', function (e) {
            keyState[e.keyCode] = false;
        });

        // Returns true if passed key is currently down.  `keyCode` is a
        // unique number that represents a particular key on the keyboard.
        this.isDown = function (keyCode) {
            return keyState[keyCode] === true;
        };

        // Handy constants that give keyCodes human-readable names.
        this.KEYS = { UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, SPACE: 32, W: 87, S: 83, A: 65, D: 68 };
    };

    // Other functions
    // ---------------

    // **colliding()** returns true if two passed bodies are colliding.
    // The approach is to test for five situations.  If any are true,
    // the bodies are definitely not colliding.  If none of them
    // are true, the bodies are colliding.
    // 1. b1 is the same body as b2.
    // 2. Right of `b1` is to the left of the left of `b2`.
    // 3. Bottom of `b1` is above the top of `b2`.
    // 4. Left of `b1` is to the right of the right of `b2`.
    // 5. Top of `b1` is below the bottom of `b2`.
    var colliding = function (b1, b2) {
        var isColliding = !(
            b1 === b2 ||
                b1.center.x + b1.size.x / 2 < b2.center.x - b2.size.x / 2 ||
                b1.center.y + b1.size.y / 2 < b2.center.y - b2.size.y / 2 ||
                b1.center.x - b1.size.x / 2 > b2.center.x + b2.size.x / 2 ||
                b1.center.y - b1.size.y / 2 > b2.center.y + b2.size.y / 2
            );

        return isColliding;
    };

    // Start game
    // ----------

    // When the DOM is ready, create (and start) the game.
    window.addEventListener('load', function () {
        new Game();
    });
})();