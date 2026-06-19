(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var opened = mobileNav.classList.toggle('open');
            menuButton.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
        var prev = hero.querySelector('.hero-prev');
        var next = hero.querySelector('.hero-next');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function restartTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            startTimer();
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-slide')) || 0);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restartTimer();
            });
        }

        startTimer();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');

    if (filterPanel) {
        var searchInput = filterPanel.querySelector('[data-filter-search]');
        var regionSelect = filterPanel.querySelector('[data-filter-region]');
        var typeSelect = filterPanel.querySelector('[data-filter-type]');
        var yearSelect = filterPanel.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.filter-results .movie-card'));

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var year = normalize(yearSelect && yearSelect.value);

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-category')
                ].join(' '));
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchRegion = !region || normalize(card.getAttribute('data-region')) === region;
                var matchType = !type || normalize(card.getAttribute('data-type')) === type;
                var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
                card.classList.toggle('hidden-card', !(matchKeyword && matchRegion && matchType && matchYear));
            });
        }

        [searchInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }

    var searchInput = document.querySelector('[data-global-search]');
    var results = document.querySelector('[data-search-results]');

    if (searchInput && results && window.searchMovies) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        searchInput.value = initialQuery;

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        }

        function renderCard(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return '' +
                '<article class="movie-card">' +
                    '<a class="movie-cover" href="./' + movie.filename + '" aria-label="' + escapeHtml(movie.title) + '">' +
                        '<img loading="lazy" src="./' + movie.coverNum + '.jpg" alt="' + escapeHtml(movie.title) + '">' +
                        '<span class="movie-duration">' + escapeHtml(movie.duration) + '</span>' +
                        '<span class="movie-category">' + escapeHtml(movie.category) + '</span>' +
                        '<span class="movie-play">▶</span>' +
                    '</a>' +
                    '<div class="movie-info">' +
                        '<h3><a href="./' + movie.filename + '">' + escapeHtml(movie.title) + '</a></h3>' +
                        '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                        '<div class="movie-meta">' +
                            '<span>★ ' + escapeHtml(movie.rating) + '</span>' +
                            '<span>' + escapeHtml(movie.year) + '</span>' +
                            '<span>' + escapeHtml(movie.region) + '</span>' +
                        '</div>' +
                        '<div class="movie-tags">' + tags + '</div>' +
                    '</div>' +
                '</article>';
        }

        function renderSearch() {
            var keyword = searchInput.value.trim().toLowerCase();
            var matches = window.searchMovies.filter(function (movie) {
                if (!keyword) {
                    return true;
                }

                return [movie.title, movie.oneLine, movie.summary, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(' ')]
                    .join(' ')
                    .toLowerCase()
                    .indexOf(keyword) !== -1;
            }).slice(0, 80);

            results.innerHTML = matches.map(renderCard).join('');
        }

        searchInput.addEventListener('input', renderSearch);
        renderSearch();
    }
})();
