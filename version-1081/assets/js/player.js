(function () {
  function setupMoviePlayer(videoUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var playButtons = document.querySelectorAll("[data-player-play]");
    var muteButton = document.querySelector("[data-player-mute]");
    var fullButton = document.querySelector("[data-player-full]");
    var attached = false;
    var hls = null;

    if (!video || !videoUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(videoUrl);
        hls.attachMedia(video);
      } else {
        video.src = videoUrl;
      }
    }

    function startPlayback() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }

    function togglePlayback() {
      if (video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    playButtons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        togglePlayback();
      });
    });

    video.addEventListener("click", togglePlayback);
    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    if (muteButton) {
      muteButton.addEventListener("click", function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? "取消静音" : "静音";
      });
    }

    if (fullButton) {
      fullButton.addEventListener("click", function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
