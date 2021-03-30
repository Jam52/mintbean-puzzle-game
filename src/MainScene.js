const Phaser = require('phaser');
import Tile from './Tile.js';

// Create a MainScene, preload all images, set background
export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.isGamePlaying = true;
    this.gameData = {};
    this.currentLevel = 1;
    this.lives = 5;
  }

  //setter for isGamePlaying set to true on new level or start again
  setIsGamePlaying = (isGamePlaying) => {
    this.isGamePlaying = isGamePlaying;
  };

  // getter to see if the game is currenty playing
  getIsGamePlaying = () => {
    return this.isGamePlaying;
  };
  // setter for numOfMines
  setNumOfMines = (newNumOfMines) => {
    this.numOfMines = newNumOfMines;
  };

  upCurrentLevelByOne = () => {
    this.currentLevel += 1;
  };

  getLives = () => {
    return this.lives;
  };

  /* ---- InizializeGameData Method ---- 
      - object format = {key: [{},{}]}
      - keys match xIndex of the tiles
      - values as array of objects whos index match the yIndex of the tiles.
      - tile data format = {xIndex: int, yIndex: int, baseImage: string, number: int, isTileClickable: bool }
  */

  initilizeGameData = () => {
    this.gameData = {};
    console.log('initilizing');
    //specifiy index's where bombs cannot be placed
    const bombIndexNotAllowed = [
      [0, 1],
      [1, 0],
      [1, 1],
      [10, 6],
      [10, 7],
      [11, 6],
    ];

    //build gameData object
    for (let x = 0; x < 12; x++) {
      let yIndexArray = [];
      for (let y = 0; y < 8; y++) {
        if (x === 0 && y === 0) {
          yIndexArray.push({
            xIndex: x,
            yIndex: y,
            baseImage: 'startTile',
            number: 0,
          });
        } else if (x === 11 && y === 7) {
          yIndexArray.push({
            xIndex: x,
            yIndex: y,
            baseImage: 'endTile',
            number: 0,
          });
        } else if (
          bombIndexNotAllowed.some((index) => index[0] === x && index[1] === y)
        ) {
          yIndexArray.push({
            xIndex: x,
            yIndex: y,
            baseImage: 'emptyTile',
            number: 0,
          });
        } else {
          //bombs are randomised using a % chance based on numOfMines / num of overall tiles
          const isBomb = Math.random() < (15 + this.currentLevel * 3) / 88;
          let baseImage = 'emptyTile';
          if (isBomb) {
            baseImage = 'bomb';
          }
          yIndexArray.push({
            xIndex: x,
            yIndex: y,
            baseImage,
            number: 0,
          });
        }
      }
      this.gameData[x] = yIndexArray;
    }

    //add number to the tileData of tiles surrounding the mines
    Object.keys(this.gameData).map((xIndex) => {
      this.gameData[xIndex].map((tileData) => {
        if (tileData.baseImage === 'bomb') {
          this.surroundingTilesCoordinatesArray(tileData).forEach(
            (tileCoordinates) => {
              const [x, y] = tileCoordinates;
              this.gameData[x][y].number += 1;
            },
          );
        }
      });
    });

    //set first three tiles to clickable
  };
  /* ---- END initilizeGame Method ----*/

  //method to return coodinates (x,y) of all surrdounding tiles if they exists
  surroundingTilesCoordinatesArray = (tileData) => {
    let surroundingTileArray = [];
    const { xIndex, yIndex } = tileData;
    if (xIndex > 0) {
      surroundingTileArray.push([xIndex - 1, yIndex]);
    }
    if (xIndex < 11) {
      surroundingTileArray.push([xIndex + 1, yIndex]);
    }
    if (yIndex > 0) {
      surroundingTileArray.push([xIndex, yIndex - 1]);
    }
    if (yIndex < 7) {
      surroundingTileArray.push([xIndex, yIndex + 1]);
    }
    if (xIndex > 0 && yIndex > 0) {
      surroundingTileArray.push([xIndex - 1, yIndex - 1]);
    }
    if (xIndex > 0 && yIndex < 7) {
      surroundingTileArray.push([xIndex - 1, yIndex + 1]);
    }
    if (xIndex < 11 && yIndex > 0) {
      surroundingTileArray.push([xIndex + 1, yIndex - 1]);
    }
    if (xIndex < 11 && yIndex < 7) {
      surroundingTileArray.push([xIndex + 1, yIndex + 1]);
    }
    return surroundingTileArray;
  };

  preload() {
    this.load.image('bomb', require('./assets/Puzzle_Bomb.jpg'));
    this.load.image('emptyTile', require('./assets/Puzzle_Uncovered.jpg'));
    this.load.image('hiddenTile', require('./assets/Puzzle_Hidden.jpg'));
    this.load.image(
      'hiddenTileClickable',
      require('./assets/Puzzle_Hidden_clickable.jpg'),
    );
    this.load.image('flagTile', require('./assets/Puzzle_Flag.jpg'));
    this.load.image('startTile', require('./assets/Puzzle_Start.jpg'));
    this.load.image('endTile', require('./assets/Puzzle_End.jpg'));
    this.load.image('fail', require('./assets/fail_game.jpg'));
    this.load.image('win', require('./assets/win_game.jpg'));
    this.load.image('heart', require('./assets/heart.png'));
    this.load.image('background', require('./assets/Puzzle_dirt.png'));
  }

  create() {
    const sceneWidth = this.sys.game.config.width;
    const sceneHeight = this.sys.game.config.height;
    let tileSize = 38;
    let startingX = (sceneWidth - tileSize * 12 + tileSize) / 2;
    let startingY = 60;
    let tiles = [];

    // Set Background position
    let background = this.add.sprite(0, 0, 'background');
    background.setOrigin(0, 0);
    background.displayWidth = sceneWidth;

    // Set level text
    let level = this.add.text(sceneWidth - startingX + 18, 10, 'level: 1', {
      fontSize: '20px',
    });

    //set heart image
    let heartImage = this.add.sprite(45, 60, 'heart');
    heartImage.displayWidth = 50;
    heartImage.displayHeight = 50;

    let livesText = this.add.text(39, 50, this.lives, {
      fontSize: '20px',
      fontStyle: 'bold',
    });

    const setLives = (newLives) => {
      this.lives = newLives;
      livesText.setText(newLives);
    };

    /* function called when game is lost, sets the isGameplaying to false to stop tiles from 
    being able to the clicked when clicked re-initializes and restarts the game.
    */
    const loseLevel = (scene) => {
      let endButton = scene.add.sprite(sceneWidth / 2, sceneHeight / 2, 'fail');
      endButton
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function (event) {
          console.log('bomb clicked');
          tiles.forEach((tile) => tile.destroy());
          tiles = [];
          this.scene.lives = 5;
          this.scene.currentLevel = 1;
          startGame();
        });
      this.setIsGamePlaying(false);
    };

    /* function called when game is won, sets the isGameplaying to false to stop tiles from 
    being able to the clicked, when clicked increases the current level by one and re-initializes and restarts the game.
    */
    const winLevel = (scene) => {
      let endButton = scene.add.sprite(sceneWidth / 2, sceneHeight / 2, 'win');
      endButton
        .setInteractive()
        .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, function (event) {
          console.log('end clicked');
          this.scene.upCurrentLevelByOne();
          tiles.forEach((tile) => tile.destroy());
          tiles = [];
          startGame();
        });
      this.setIsGamePlaying(false);
    };

    //function to set surrounding tiles to clickable
    const setSurroundingTilesToClickable = (tileData) => {
      const surroundTileCoordinates = this.surroundingTilesCoordinatesArray(
        tileData,
      );
      tiles.forEach((tile) => {
        const xIndex = tile.getXIndex();
        const yIndex = tile.getYIndex();
        //tests if a tile x,y is in the surroungTileArrayCooirdinats
        const isTileInCoordinatesArray = surroundTileCoordinates.some(
          (coodinates) => {
            return coodinates[0] === xIndex && coodinates[1] === yIndex;
          },
        );
        if (isTileInCoordinatesArray) {
          tile.setTileClickable();
          const initialTiles = [
            [1, 0],
            [0, 1],
            [1, 1],
          ];
          const isInitialTile = initialTiles.some((coordinates) => {
            return (
              tile.xIndex === coordinates[0] && tile.yIndex === coordinates[1]
            );
          });
          if (
            tile.baseImage !== 'bomb' &&
            tile.isClicked === false &&
            tile.getNumber() === 0 &&
            isInitialTile === false
          ) {
            tile.clickTile();
            clickSurroundingTiles(tile.tileData);
          }
        }
      });
    };

    const clickSurroundingTiles = (tileData) => {
      const surroundTileCoordinates = this.surroundingTilesCoordinatesArray(
        tileData,
      );
      tiles.forEach((tile) => {
        const xIndex = tile.getXIndex();
        const yIndex = tile.getYIndex();
        const isTileInCoordinatesArray = surroundTileCoordinates.some(
          (coodinates) => {
            return coodinates[0] === xIndex && coodinates[1] === yIndex;
          },
        );
        if (isTileInCoordinatesArray && tile.baseImage != 'endTile') {
          tile.clickTile();
        }
      });
    };

    let tileObjectData = {
      hidden: 'hiddenTile',
      tileSize: tileSize,
      loseLevel,
      winLevel,
      getIsGamePlaying: this.getIsGamePlaying,
      setTileClickable: this.setTileClickable,
      getLives: this.getLives,
      setLives,
      setSurroundingTilesToClickable,
    };

    // initialize the gameData and populate the gameboard with tiles
    const startGame = () => {
      console.log(`Current Level: ${this.currentLevel}`);
      this.initilizeGameData();

      //set current level text
      level.setText(
        `The Path Finder               Level: ${this.currentLevel}`,
      );
      level.displayOriginX = level.displayWidth;

      //set current lives text
      livesText.setText(this.lives);

      this.setIsGamePlaying(true);

      // add Tiles based on gameData
      for (let Xindex = 0; Xindex < 12; Xindex++) {
        const x = startingX + tileSize * Xindex;
        for (let Yindex = 0; Yindex < 8; Yindex++) {
          const y = startingY + Yindex * tileSize;

          const newTile = new Tile(
            this,
            { ...this.gameData[Xindex][Yindex], ...tileObjectData },
            x,
            y,
            this.gameData,
          );
          //add click function
          newTile
            .setSize(tileSize, tileSize)
            .setInteractive()
            .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, (event) => {
              if (event.button === 2) {
                newTile.toggleFlagTile();
              } else {
                newTile.clickTile();
              }
            });

          tiles.push(newTile);
        }
      }

      //set tiles surrounding start tile to clickable
      setSurroundingTilesToClickable(this.gameData[0][0]);
    };

    startGame();
  }

  update() {}
}
