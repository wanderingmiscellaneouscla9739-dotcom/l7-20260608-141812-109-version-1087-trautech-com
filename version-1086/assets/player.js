(function () {
    function bindPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('.player-start');
        var stream = shell.getAttribute('data-stream');
        var loaded = false;
        var hlsInstance = null;

        function loadStream() {
            if (!video || !stream) {
                return;
            }
            if (!loaded) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                    loaded = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    loaded = true;
                } else {
                    video.src = stream;
                    loaded = true;
                }
            }
            shell.classList.add('is-playing');
            video.controls = true;
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', loadStream);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    loadStream();
                }
            });
            video.addEventListener('ended', function () {
                shell.classList.remove('is-playing');
            });
            video.addEventListener('error', function () {
                if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
                loaded = false;
            });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            document.querySelectorAll('.player-shell').forEach(bindPlayer);
        });
    } else {
        document.querySelectorAll('.player-shell').forEach(bindPlayer);
    }
}());
