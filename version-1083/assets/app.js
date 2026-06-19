(function () {
    "use strict";

    function all(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function one(selector, root) {
        return (root || document).querySelector(selector);
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function cardMatches(card, query, filters) {
        var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-keywords")
        ].join(" "));
        var passQuery = !query || haystack.indexOf(query) !== -1;
        var passYear = !filters.year || card.getAttribute("data-year") === filters.year;
        var passType = !filters.type || card.getAttribute("data-type") === filters.type;
        var passRegion = !filters.region || normalize(card.getAttribute("data-region")).indexOf(normalize(filters.region)) !== -1;
        return passQuery && passYear && passType && passRegion;
    }

    function applyFilters() {
        var cards = all(".movie-card");
        if (!cards.length) {
            return;
        }
        var input = one("[data-filter-input]");
        var year = one("[data-filter-year]");
        var type = one("[data-filter-type]");
        var region = one("[data-filter-region]");
        var query = normalize(input ? input.value : "");
        var filters = {
            year: year ? year.value : "",
            type: type ? type.value : "",
            region: region ? region.value : ""
        };
        var visible = 0;
        cards.forEach(function (card) {
            var matched = cardMatches(card, query, filters);
            card.style.display = matched ? "" : "none";
            if (matched) {
                visible += 1;
            }
        });
        all("[data-empty-state]").forEach(function (item) {
            item.classList.toggle("show", visible === 0);
        });
    }

    function initMobileMenu() {
        var button = one(".menu-toggle");
        var panel = one(".mobile-panel");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            var open = panel.classList.toggle("open");
            panel.setAttribute("aria-hidden", open ? "false" : "true");
            button.setAttribute("aria-expanded", open ? "true" : "false");
        });
    }

    function initHero() {
        var stage = one("[data-hero]");
        if (!stage) {
            return;
        }
        var slides = all(".hero-slide", stage);
        var dots = all(".hero-dot", stage);
        var prev = one("[data-hero-prev]", stage);
        var next = one("[data-hero-next]", stage);
        var index = 0;
        var timer = null;

        function show(target) {
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("active", current === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, current) {
            dot.addEventListener("click", function () {
                show(current);
                start();
            });
        });
        stage.addEventListener("mouseenter", stop);
        stage.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get("q") || "";
        var input = one("[data-filter-input]");
        if (input && q) {
            input.value = q;
        }
        all("[data-filter-input], [data-filter-year], [data-filter-type], [data-filter-region]").forEach(function (control) {
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });
        all("[data-filter-reset]").forEach(function (button) {
            button.addEventListener("click", function () {
                all("[data-filter-input], [data-filter-year], [data-filter-type], [data-filter-region]").forEach(function (control) {
                    control.value = "";
                });
                applyFilters();
            });
        });
        applyFilters();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = one("#moviePlayer");
        var cover = one("#playerOverlay");
        var message = one("#playerMessage");
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function setMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text || "";
            message.classList.toggle("show", Boolean(text));
        }

        function prepare() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            setMessage("播放遇到网络问题，请稍后再试");
                        }
                    }
                });
            } else {
                video.src = streamUrl;
            }
        }

        function begin() {
            prepare();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    if (cover) {
                        cover.classList.remove("is-hidden");
                    }
                    setMessage("点击播放按钮开始观看");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", begin);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
            setMessage("");
        });
        video.addEventListener("error", function () {
            setMessage("播放遇到网络问题，请稍后再试");
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHero();
        initFilters();
    });
})();
