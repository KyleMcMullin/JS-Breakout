MyGame.screens['pause-menu'] = (function(game) {
    'use strict';
    
    function initialize() {
        document.getElementById('pause-main-menu').addEventListener(
            'click',
            function() { game.showScreen('main-menu'); });
    }
    
    function run() {
        //
        // I know this is empty, there isn't anything to do.
    }
    
    return {
        initialize : initialize,
        run : run
    };
}(MyGame.game));