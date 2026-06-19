(function () {
    var stages = Array.prototype.slice.call(document.querySelectorAll('.player-stage'));

    stages.forEach(function (stage) {
        var video = stage.querySelector('.player-video');
        var button = stage.querySelector('.play-layer');
        var stream = stage.getAttribute('data-play');
        var hlsInstance = null;
        var loaded = false;

        function loadStream() {
            if (!video || !stream || loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            }
        }

        function playVideo() {
            loadStream();
            stage.classList.add('playing');
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    stage.classList.remove('playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                    stage.classList.remove('playing');
                }
            });

            video.addEventListener('play', function () {
                stage.classList.add('playing');
            });

            video.addEventListener('pause', function () {
                stage.classList.remove('playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
