(function () {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function cardMatches(card, query, type, year, genre) {
    var haystack = normalize([
      card.getAttribute("data-title"),
      card.getAttribute("data-year"),
      card.getAttribute("data-type"),
      card.getAttribute("data-genre"),
      card.getAttribute("data-tags")
    ].join(" "));
    var typeValue = card.getAttribute("data-type") || "";
    var yearValue = card.getAttribute("data-year") || "";
    var genreValue = card.getAttribute("data-genre") || "";

    if (query && haystack.indexOf(query) === -1) {
      return false;
    }

    if (type && typeValue !== type) {
      return false;
    }

    if (year && yearValue !== year) {
      return false;
    }

    if (genre && genreValue.indexOf(genre) === -1) {
      return false;
    }

    return true;
  }

  document.querySelectorAll("[data-filter-root]").forEach(function (root) {
    var input = root.querySelector("[data-filter-search]");
    var type = root.querySelector("[data-filter-type]");
    var year = root.querySelector("[data-filter-year]");
    var genre = root.querySelector("[data-filter-genre]");
    var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card"));
    var empty = root.querySelector("[data-filter-empty]");

    function applyFilter() {
      var query = normalize(input && input.value);
      var typeValue = type ? type.value : "";
      var yearValue = year ? year.value : "";
      var genreValue = genre ? genre.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var matched = cardMatches(card, query, typeValue, yearValue, genreValue);
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [input, type, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderSearchCard(item) {
    return [
      '<article class="movie-card card">',
      '<a class="movie-card-link" href="' + escapeHtml(item.url) + '">',
      '<div class="poster-frame">',
      '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-badge type-badge">' + escapeHtml(item.type) + '</span>',
      '<span class="poster-badge category-badge">' + escapeHtml(item.category) + '</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(item.title) + '</h3>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="movie-meta-row"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join("");
  }

  var searchResults = document.querySelector("[data-search-results]");
  if (searchResults && Array.isArray(globalThis.movieSearchIndex)) {
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var searchInput = document.querySelector("[data-search-input]");
    var status = document.querySelector("[data-search-status]");

    if (searchInput && params.get("q")) {
      searchInput.value = params.get("q");
    }

    if (query) {
      var results = globalThis.movieSearchIndex.filter(function (item) {
        var haystack = normalize([
          item.title,
          item.year,
          item.region,
          item.type,
          item.genre,
          item.tags,
          item.oneLine
        ].join(" "));
        return haystack.indexOf(query) !== -1;
      });

      if (results.length) {
        searchResults.innerHTML = results.slice(0, 240).map(renderSearchCard).join("");
        if (status) {
          status.textContent = "以下为匹配内容";
        }
      } else if (status) {
        status.textContent = "暂无匹配内容";
      }
    }
  }
})();
