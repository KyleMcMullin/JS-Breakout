let MyGame = {
    persistence: (function () {
        let highScores = {};
        let previousScores = localStorage.getItem('MyGame.highScores');

        if (previousScores !== null) {
            highScores = JSON.parse(previousScores);
            setScores();
        }

        function add(key, value) {
            highScores[key] = value;
            localStorage['MyGame.highScores'] = JSON.stringify(highScores);
            setScores();
        }

        function remove(key) {
            delete highScores[key];
            localStorage['MyGame.highScores'] = JSON.stringify(highScores);
            setScores();
        }

        function setScores() {
            let htmlNode = document.getElementById('high-scores-list');

            htmlNode.innerHTML = '';
            for (let key in highScores) {
                let li = document.createElement('li');
                li.innerHTML = highScores[key];
                htmlNode.appendChild(li);
            }
        }

        function report() {
            return highScores;
        }

        function removeAll() {
            highScores = {};
            localStorage['MyGame.highScores'] = JSON.stringify(highScores);
            setScores();
        }

        return {
            add: add,
            remove: remove,
            setScores: setScores,
            removeAll: removeAll,
            report: report
        };
    }()),
    sounds: (function () {
        let sound = new Audio();
        sound.src = 'assets/backgroundMusic.mp3'

        function play() {
            sound.play();
        }

        function pause() {
            sound.pause();
        }

        return {
            play: play,
            pause: pause
        };
    })(),
    screens: {},
    input: {},
    objects: {},
    systems: {},
    render: {},
    graphics: (function () {})()
};