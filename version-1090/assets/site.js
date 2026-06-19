(function () {
    var button = document.querySelector('[data-menu-button]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (button && panel) {
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;
        var show = function (next) {
            if (!slides.length) return;
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                if (timer) window.clearInterval(timer);
                timer = window.setInterval(function () { show(index + 1); }, 5200);
            });
        });
        timer = window.setInterval(function () { show(index + 1); }, 5200);
    }

    var scopes = document.querySelectorAll('[data-filter-scope]');
    scopes.forEach(function (scope) {
        var input = scope.querySelector('[data-local-search]');
        var year = scope.querySelector('[data-year-filter]');
        var reset = scope.querySelector('[data-reset-filter]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('.searchable-card'));
        var apply = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var cardYear = card.getAttribute('data-year') || '';
                var visible = true;
                if (keyword && text.indexOf(keyword) === -1) visible = false;
                if (yearValue && cardYear.indexOf(yearValue) === -1) visible = false;
                card.classList.toggle('is-hidden', !visible);
            });
        };
        if (input) input.addEventListener('input', apply);
        if (year) year.addEventListener('change', apply);
        if (reset) {
            reset.addEventListener('click', function () {
                if (input) input.value = '';
                if (year) year.value = '';
                apply();
            });
        }
        apply();
    });
})();

function applyQuerySearch() {
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var input = document.querySelector('[data-local-search]');
    if (input && query) {
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function initMoviePlayer(videoId, coverId, source) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    if (!video || !source) return;
    var attached = false;
    var hls = null;
    var attach = function () {
        if (attached) return;
        attached = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }
    };
    var start = function () {
        attach();
        if (cover) cover.hidden = true;
        var playing = video.play();
        if (playing && typeof playing.catch === 'function') {
            playing.catch(function () {
                if (cover) cover.hidden = false;
            });
        }
    };
    if (cover) cover.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });
    video.addEventListener('play', function () {
        if (cover) cover.hidden = true;
    });
    video.addEventListener('ended', function () {
        if (cover) cover.hidden = false;
    });
    window.addEventListener('pagehide', function () {
        if (hls && hls.destroy) hls.destroy();
    });
}
