(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenus() {
        var button = document.getElementById("menuButton");
        var menu = document.getElementById("mobileMenu");
        if (!button || !menu) {
            return;
        }
        button.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupSearchForms() {
        var forms = document.querySelectorAll(".site-search-form");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var value = input ? input.value.trim() : "";
                var target = "./search.html";
                if (value) {
                    target += "?q=" + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        var prev = document.querySelector(".hero-prev");
        var next = document.querySelector(".hero-next");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                show(index + 1);
            }, 5000);
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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-search]"));
        if (!cards.length) {
            return;
        }
        var keyword = document.getElementById("movieFilterInput");
        var year = document.getElementById("yearFilter");
        var type = document.getElementById("typeFilter");
        var empty = document.getElementById("filterEmpty");
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (keyword && initial) {
            keyword.value = initial;
        }

        function apply() {
            var q = keyword ? keyword.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            var t = type ? type.value : "";
            var visible = 0;
            cards.forEach(function (card) {
                var matchText = !q || (card.getAttribute("data-search") || "").toLowerCase().indexOf(q) !== -1;
                var matchYear = !y || card.getAttribute("data-year") === y;
                var matchType = !t || card.getAttribute("data-type") === t;
                var show = matchText && matchYear && matchType;
                card.style.display = show ? "" : "none";
                if (show) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", visible === 0);
            }
        }

        [keyword, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    window.initMoviePlayer = function (url) {
        var video = document.getElementById("moviePlayer");
        var overlay = document.getElementById("playOverlay");
        var message = document.getElementById("playerMessage");
        if (!video || !url) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.classList.add("is-visible");
        }

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        showMessage("加载失败，请稍后再试");
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
            } else {
                showMessage("当前环境暂时无法播放");
            }
        }

        function play() {
            attach();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (overlay) {
                        overlay.classList.remove("is-hidden");
                    }
                });
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
        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };

    ready(function () {
        setupMenus();
        setupSearchForms();
        setupHero();
        setupFilters();
    });
})();
