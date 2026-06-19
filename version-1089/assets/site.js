(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function setupMobileMenu() {
    var button = $("[data-mobile-menu-button]");
    var nav = $("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      button.textContent = nav.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = $("[data-hero]");
    if (!root) {
      return;
    }
    var slides = $all("[data-hero-slide]", root);
    var dots = $all("[data-hero-dot]", root);
    var prev = $("[data-hero-prev]", root);
    var next = $("[data-hero-next]", root);
    var index = 0;
    var timer = null;

    function activate(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function move(step) {
      activate(index + step);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        move(1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        restart();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        move(1);
        restart();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        activate(dotIndex);
        restart();
      });
    });
    activate(0);
    restart();
  }

  function setupLocalFilter() {
    $all("[data-local-filter]").forEach(function (input) {
      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var cardSelector = input.getAttribute("data-local-filter");
        var list = $("[data-filter-list]");
        if (!list) {
          return;
        }
        $all("." + cardSelector, list).forEach(function (card) {
          var haystack = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          card.classList.toggle("is-filtered-out", keyword && haystack.indexOf(keyword) === -1);
        });
      });
    });
  }

  function setupSearchPage() {
    var results = $("[data-search-results]");
    var status = $("[data-search-status]");
    var input = $("[data-search-page-input]");
    if (!results || !status || !input || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var keyword = (params.get("q") || "").trim();
    input.value = keyword;

    function render(query) {
      var normalized = query.trim().toLowerCase();
      results.innerHTML = "";
      if (!normalized) {
        status.textContent = "请输入关键词，开始查找感兴趣的内容。";
        return;
      }
      var matches = window.SEARCH_INDEX.filter(function (item) {
        var haystack = [item.title, item.region, item.type, item.year, item.genre, item.tags].join(" ").toLowerCase();
        return haystack.indexOf(normalized) !== -1;
      }).slice(0, 240);
      if (!matches.length) {
        status.textContent = "未找到相关内容，请尝试其他关键词。";
        return;
      }
      status.textContent = "已找到相关内容，可点击进入详情页。";
      results.innerHTML = matches.map(function (item) {
        return [
          '<article class="movie-card movie-card--search">',
          '<a class="movie-card__link" href="./' + escapeHTML(item.file) + '" aria-label="' + escapeHTML(item.title) + '">',
          '<div class="movie-card__poster">',
          '<img src="' + escapeHTML(item.cover) + '" alt="' + escapeHTML(item.title) + '" loading="lazy">',
          '<span class="poster-badge poster-badge--type">' + escapeHTML(item.type) + '</span>',
          '<span class="poster-play" aria-hidden="true">▶</span>',
          '</div>',
          '<div class="movie-card__body">',
          '<h3>' + escapeHTML(item.title) + '</h3>',
          '<p>' + escapeHTML(item.oneLine) + '</p>',
          '<div class="movie-card__meta">',
          '<span>' + escapeHTML(item.genre) + '</span>',
          '<span>' + escapeHTML(item.region) + ' · ' + escapeHTML(item.year) + '</span>',
          '</div>',
          '</div>',
          '</a>',
          '</article>'
        ].join("");
      }).join("");
    }

    render(keyword);
    input.addEventListener("input", function () {
      render(input.value);
    });
  }

  function updateSearchForms() {
    $all("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
        }
      });
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    var player = $("[data-movie-player]");
    if (!player) {
      return;
    }
    var video = $("[data-player-video]", player);
    var overlay = $("[data-player-overlay]", player);
    var playButton = $("[data-player-button]", player);
    var muteButton = $("[data-player-mute]", player);
    var fullscreenButton = $("[data-player-fullscreen]", player);
    var state = $("[data-player-state]", player);
    var message = $("[data-player-message]", player);
    var hls = null;
    var prepared = false;

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function hideMessage() {
      if (message) {
        message.textContent = "";
        message.classList.remove("is-visible");
      }
    }

    function prepare() {
      if (prepared || !video || !sourceUrl) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              showMessage("视频暂时无法播放，请稍后再试。");
            }
          }
        });
      } else {
        showMessage("视频暂时无法播放，请稍后再试。");
      }
    }

    function setPlaying(isPlaying) {
      if (state) {
        state.textContent = isPlaying ? "Ⅱ" : "▶";
      }
      if (playButton) {
        playButton.setAttribute("aria-label", isPlaying ? "暂停" : "播放");
      }
    }

    function startPlayback() {
      prepare();
      hideMessage();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (!video) {
        return;
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showMessage("请再次点击播放按钮开始播放。");
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    function togglePlayback() {
      if (!video || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }
    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.preventDefault();
        togglePlayback();
      });
    }
    if (video) {
      video.addEventListener("click", togglePlayback);
      video.addEventListener("play", function () {
        setPlaying(true);
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("pause", function () {
        setPlaying(false);
      });
      video.addEventListener("error", function () {
        showMessage("视频暂时无法播放，请稍后再试。");
      });
    }
    if (muteButton && video) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "☈" : "☊";
      });
    }
    if (fullscreenButton && player) {
      fullscreenButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    prepare();
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMobileMenu();
    setupHero();
    setupLocalFilter();
    setupSearchPage();
    updateSearchForms();
  });
})();
