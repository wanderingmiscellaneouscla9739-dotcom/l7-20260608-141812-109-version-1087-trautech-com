(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('open');
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
        var active = 0;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === active);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === active);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = parseInt(dot.getAttribute('data-hero-dot'), 10);
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }

        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim().toLowerCase();
        var pageInput = document.querySelector('[data-page-search-input]');
        var searchTitle = document.querySelector('[data-search-title]');
        if (pageInput && query) {
            pageInput.value = params.get('q') || '';
        }
        if (searchTitle && query) {
            searchTitle.textContent = '与“' + (params.get('q') || '') + '”相关的影片';
        }

        function filterCards(term, scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));
            var words = term.split(/\s+/).filter(Boolean);
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matched = words.every(function (word) {
                    return text.indexOf(word) !== -1;
                });
                card.classList.toggle('is-hidden', words.length > 0 && !matched);
            });
        }

        var searchPage = document.querySelector('[data-search-page]');
        if (searchPage && query) {
            filterCards(query, searchPage);
        }

        document.querySelectorAll('[data-filter-form]').forEach(function (form) {
            var input = form.querySelector('[data-filter-input]');
            var list = document.querySelector('[data-filter-list]');
            if (!input || !list) {
                return;
            }
            form.addEventListener('submit', function (event) {
                event.preventDefault();
            });
            input.addEventListener('input', function () {
                filterCards(input.value.trim().toLowerCase(), list);
            });
        });
    });
}());
