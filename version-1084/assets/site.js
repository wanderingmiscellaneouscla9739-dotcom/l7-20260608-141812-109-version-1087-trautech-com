(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function setupMenu() {
        var button = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-nav");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-prev");
        var next = slider.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                restart();
            });
        });
        restart();
    }

    function setupFilters() {
        var bars = Array.prototype.slice.call(document.querySelectorAll("[data-filter-bar]"));
        bars.forEach(function (bar) {
            var input = bar.querySelector(".filter-input");
            var category = bar.querySelector(".filter-category");
            var year = bar.querySelector(".filter-year");
            var list = document.querySelector("[data-filter-list]");
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q") || "";
            if (q && input) {
                input.value = q;
            }

            function apply() {
                var keyword = input ? input.value.trim().toLowerCase() : "";
                var categoryValue = category ? category.value : "";
                var yearValue = year ? year.value : "";
                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var okKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var okCategory = !categoryValue || card.getAttribute("data-category") === categoryValue;
                    var okYear = !yearValue || card.getAttribute("data-year") === yearValue;
                    card.classList.toggle("is-hidden-card", !(okKeyword && okCategory && okYear));
                });
            }

            [input, category, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        });
    }

    window.setupMoviePlayer = function (source, videoId, overlayId) {
        ready(function () {
            var video = document.getElementById(videoId || "moviePlayer");
            var overlay = document.getElementById(overlayId || "playOverlay");
            if (!video || !source) {
                return;
            }
            var loaded = false;

            function load() {
                if (loaded) {
                    return;
                }
                loaded = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            function play() {
                load();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var attempt = video.play();
                if (attempt && typeof attempt.catch === "function") {
                    attempt.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("loadedmetadata", function () {
                video.controls = true;
            });
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
    });
})();
