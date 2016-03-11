square.g = {
    config: {
        screenWidth: verge.viewportW(),
        screenHeight: verge.viewportH(),
        columns: 25,
        rows: 25
    },

    gameStates: {
        game: 'main'
    },

    gameState: function (game) {
        this['boardTop'] = 0;
        this['boardLeft'] = 0;
        this['board'] = undefined;
    },
    
    game: undefined,

    sprites:  {
        tiles: {
            resource: 'assets/images/grid-tiles.png',
            id: 'tiles',
            tileWidth: 32,
            tileHeight: 32,
            frames: 140
        }
    }
};

square.g.game = (function () {
    var g = square.g,
        config = g.config,
        rows = config.rows,
        columns = config.columns,
        screenH = config.screenHeight,
        screenW = config.screenWidth,
        tiles = g.sprites.tiles,
        tileH = tiles.tileHeight,
        tileW = tiles.tileWidth,
        game = new Phaser.Game(screenW, screenH, Phaser.CANVAS, 'gridGame');

    g.gameState.prototype = {
        initGrid: function (level) {
            var build = function (xhr) {
                var data = xhr ? JSON.parse(xhr.responseText) : {columns: columns, rows: rows, map: undefined},
                    colCount = data.columns,
                    rowCount = data.rows,
                    grid = this.grid = new square.Grid(colCount, rowCount, data.map);
                
                grid.mapNeighborhood();
                this.boardTop = Math.round( (screenH - (tileH * rowCount)) * 0.5 );
                this.boardLeft = Math.round( (screenW - (tileW * colCount)) * 0.5 );
                grid.moveTo(this.boardLeft, this.boardTop);
            }.bind(this);
            
            if (level) {
                square.request('./game/levels/' + level + '.json').then(build);
            } else {
                build();
            }
            
        },

        preload: function () {
            this.load.spritesheet(tiles.id, tiles.resource, tileW, tileH, tiles.frames);
            this.load.spritesheet('startBtn', 'assets/images/start-button.png', 128, 128, 3);
        },

        create: function () {
            this.state = 0; // 0 == stopped, 1 == running
            game.add.button(game.world.centerX - 600, game.world.centerY + 250, 'startBtn', function () {
                // button callback
                this.state = this.state === 0 ? 1 : 0;
            }, this, 1, 0, 2);

            this.initGrid();
        },

        update: function () {
            ++this.timer;
            if (this.timer > 3600) {
                this.timer = 1;
            }
            // call function to evolve grid
            if (this.state === 1 && this.timer % 15 === 0) {
                this.grid.update();
            }
        },
        
        timer: 0
    };
    
    game.state.add(g.gameStates.game, g.gameState);

    return game;
}());

square.g.game.state.start(square.g.gameStates.game);
