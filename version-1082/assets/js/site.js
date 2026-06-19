(function () {
    var toggle = document.querySelector('[data-nav-toggle]');
    if (toggle) {
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }
})();

(function () {
    var focus = document.querySelector('[data-focus]');
    if (!focus) {
        return;
    }

    var slides = Array.prototype.slice.call(focus.querySelectorAll('[data-focus-slide]'));
    var dots = Array.prototype.slice.call(focus.querySelectorAll('[data-focus-dot]'));
    var bg = focus.querySelector('[data-focus-bg]');
    var active = 0;

    function show(index) {
        if (!slides.length) {
            return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, pos) {
            slide.classList.toggle('is-active', pos === active);
        });
        dots.forEach(function (dot, pos) {
            dot.classList.toggle('is-active', pos === active);
        });
        if (bg && slides[active].dataset.background) {
            bg.style.backgroundImage = slides[active].dataset.background;
        }
    }

    dots.forEach(function (dot, pos) {
        dot.addEventListener('click', function () {
            show(pos);
        });
    });

    window.setInterval(function () {
        show(active + 1);
    }, 5000);
})();

(function () {
    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-filter-form]'));

    forms.forEach(function (form) {
        var target = document.querySelector(form.dataset.target);
        if (!target) {
            return;
        }

        var cards = Array.prototype.slice.call(target.querySelectorAll('[data-card]'));
        var empty = target.querySelector('[data-empty-state]');

        function applyFilter() {
            var data = new FormData(form);
            var query = String(data.get('q') || '').trim().toLowerCase();
            var year = String(data.get('year') || '').trim();
            var type = String(data.get('type') || '').trim();
            var visible = 0;

            cards.forEach(function (card) {
                var keywords = String(card.dataset.keywords || '').toLowerCase();
                var title = String(card.dataset.title || '').toLowerCase();
                var cardYear = String(card.dataset.year || '');
                var cardType = String(card.dataset.type || '');
                var matchesQuery = !query || keywords.indexOf(query) >= 0 || title.indexOf(query) >= 0;
                var matchesYear = !year || cardYear === year;
                var matchesType = !type || cardType === type;
                var ok = matchesQuery && matchesYear && matchesType;
                card.hidden = !ok;
                if (ok) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        form.addEventListener('input', applyFilter);
        form.addEventListener('change', applyFilter);
    });
})();
