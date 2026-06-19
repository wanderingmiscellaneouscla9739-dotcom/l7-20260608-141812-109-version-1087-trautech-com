(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-button]');
        var hlsInstance = null;

        if (!video) {
            return;
        }

        function bindSource() {
            if (video.dataset.bound === 'true') {
                return;
            }

            var source = video.getAttribute('data-src');
            var HlsLibrary = window.Hls;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (HlsLibrary && HlsLibrary.isSupported()) {
                hlsInstance = new HlsLibrary({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            video.dataset.bound = 'true';
        }

        function playVideo() {
            bindSource();
            box.classList.add('is-playing');
            var result = video.play();
            if (result && result.catch) {
                result.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            box.classList.add('is-playing');
        });

        video.addEventListener('ended', function () {
            box.classList.remove('is-playing');
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance && hlsInstance.destroy) {
                hlsInstance.destroy();
            }
        });
    });
})();
