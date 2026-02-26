(function() {
    var track = document.getElementById('carousel-track');
    if (!track) return;
    var leftBtn = document.querySelector('.carousel-arrow-left');
    var rightBtn = document.querySelector('.carousel-arrow-right');
    var scrollAmount = function() {
        var card = track.querySelector('.carousel-card');
        return card ? card.offsetWidth + 10 : 230;
    };
    var autoInterval;

    function scrollRight() {
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
            track.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: scrollAmount(), behavior: 'smooth' });
        }
    }

    function scrollLeft() {
        if (track.scrollLeft <= 10) {
            track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
        } else {
            track.scrollBy({ left: -scrollAmount(), behavior: 'smooth' });
        }
    }

    rightBtn.addEventListener('click', function() {
        if (currentAppId) { navigateApp(1); } else { scrollRight(); }
    });
    leftBtn.addEventListener('click', function() {
        if (currentAppId) { navigateApp(-1); } else { scrollLeft(); }
    });

    function startAuto() {
        if (autoInterval || currentAppId || isSearchActive) return;
        autoInterval = setInterval(scrollRight, 3000);
    }

    function stopAuto() {
        clearInterval(autoInterval);
        autoInterval = null;
    }

    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', startAuto);
    track.addEventListener('touchstart', stopAuto);
    track.addEventListener('touchend', function() { setTimeout(startAuto, 3000); });

    startAuto();

    /* --- Fetch app data and build carousel cards with icons --- */
    var xdcgetBase = 'https://apps.testrun.org';
    var appMap = {};

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function extractAuthor(url) {
        var m = /(github\.com|codeberg\.org)\/([\w\-_]+)/.exec(url || '');
        return m && m.length === 3 ? m[2] : '';
    }

    fetch(xdcgetBase + '/xdcget-lock.json')
        .then(function(r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .catch(function() {
            // fallback: show placeholder count, no cards
            var searchEl = document.getElementById('carousel-search-input');
            if (searchEl) searchEl.placeholder = '\uD83D\uDD0D Search 120+ community apps...';
            return null;
        })
        .then(function(apps) {
            if (!apps) return;
            // shuffle so different authors appear next to each other
            apps.forEach(function(app) { app._author = extractAuthor(app.source_code_url); });
            var byAuthor = {};
            apps.forEach(function(app) {
                var a = app._author || '__none__';
                if (!byAuthor[a]) byAuthor[a] = [];
                byAuthor[a].push(app);
            });
            var buckets = Object.keys(byAuthor).sort(function() { return Math.random() - 0.5; });
            var shuffled = [], idx = 0;
            while (buckets.length > 0) {
                var b = buckets[idx % buckets.length];
                shuffled.push(byAuthor[b].shift());
                if (byAuthor[b].length === 0) buckets.splice(idx % buckets.length, 1);
                else idx++;
            }

            var html = '';
            shuffled.forEach(function(app) {
                appMap[app.app_id] = app;
                var subtitle = (app.description || '').split('\n')[0];
                var author = app._author;
                var searchText = (app.name + ' ' + (app.description || '') + ' ' + author).toLowerCase();
                html += '<button class="carousel-card" data-app-id="' + app.app_id + '" data-search="' + escapeHtml(searchText) + '" aria-label="' + escapeHtml(app.name) + '">'
                    + '<img src="' + xdcgetBase + '/' + app.icon_relname + '" alt="' + escapeHtml(app.name) + ' icon" loading="lazy" />'
                    + '<span class="carousel-card-name">' + escapeHtml(app.name) + '</span>'
                    + '<span class="carousel-card-desc">' + escapeHtml(subtitle) + '</span>'
                    + (author ? '<span class="carousel-card-author">' + escapeHtml(author) + '</span>' : '')
                    + '</button>';
            });
            html += '<div class="carousel-unmatched" id="carousel-unmatched"></div>';
            track.innerHTML = html;

            // update search placeholder with app count
            var searchEl = document.getElementById('carousel-search-input');
            if (searchEl) searchEl.placeholder = '\uD83D\uDD0D Search ' + shuffled.length + ' community apps...';

            // check URL hash to auto-open an app
            var hash = location.hash.replace('#', '');
            if (hash && appMap[hash]) {
                setTimeout(function() {
                    showDialog(hash);
                    var dlg = document.getElementById('app-dialog-inline');
                    if (dlg) dlg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });

    /* --- Search filtering --- */
    var searchInput = document.getElementById('carousel-search-input');
    var searchClear = document.getElementById('carousel-search-clear');
    var isSearchActive = false;

    searchInput.addEventListener('input', function() {
        searchClear.style.display = searchInput.value ? '' : 'none';
        var term = searchInput.value.trim().toLowerCase();
        var cards = track.querySelectorAll('.carousel-card');
        var unmatchedEl = document.getElementById('carousel-unmatched');
        if (term) {
            var words = term.split(/\s+/).filter(function(w) { return w.length > 0; });
            // close any open dialog and stop auto-scroll
            if (currentAppId) hideDialog();
            stopAuto();
            isSearchActive = true;
            var hidden = 0;
            cards.forEach(function(card) {
                var text = card.getAttribute('data-search') || '';
                var match = words.every(function(w) { return text.indexOf(w) >= 0; });
                card.style.display = match ? '' : 'none';
                if (!match) hidden++;
            });
            if (hidden > 0) {
                unmatchedEl.textContent = hidden + ' app' + (hidden === 1 ? '' : 's') + ' not matched';
                unmatchedEl.style.display = 'flex';
            } else {
                unmatchedEl.style.display = 'none';
            }
        } else {
            isSearchActive = false;
            cards.forEach(function(card) { card.style.display = ''; });
            unmatchedEl.style.display = 'none';
            startAuto();
        }
    });

    searchClear.addEventListener('click', function() {
        searchInput.value = '';
        searchClear.style.display = 'none';
        searchInput.dispatchEvent(new Event('input'));
        searchInput.focus();
    });

    /* --- Inline app detail popup --- */
    var inlineDialog = document.getElementById('app-dialog-inline');
    var lastFocusedEl = null;
    var currentAppId = null;

    function formatSize(bytes) {
        if (bytes > 1000000) return (bytes / 1000000).toFixed(1) + ' MB';
        return (bytes / 1000).toFixed(1) + ' KB';
    }

    function showDialog(appId) {
        var app = appMap[appId];
        if (!app) return;
        var parts = app.description.split('\n');
        var subtitle = parts[0] || '';
        var desc = parts.slice(1).join(' ');
        var name = app.name;
        var sourceUrl = app.source_code_url || '';

        document.getElementById('app-dialog-icon').src = xdcgetBase + '/' + app.icon_relname;
        document.getElementById('app-dialog-icon').alt = 'Icon for ' + name;
        document.getElementById('app-dialog-title').textContent = name;
        document.getElementById('app-dialog-subtitle').textContent = subtitle;
        document.getElementById('app-dialog-author').textContent = extractAuthor(sourceUrl);
        document.getElementById('app-dialog-description').textContent = desc;
        var dlBtn = document.getElementById('app-dialog-download');
        dlBtn.href = xdcgetBase + '/' + app.cache_relname;
        dlBtn.textContent = 'Download';
        var publishedDate = new Date(app.date).toLocaleDateString();
        dlBtn.title = formatSize(app.size) + ' \u00B7 Published ' + publishedDate;

        var srcLink = document.getElementById('app-dialog-source');
        if (sourceUrl) {
            srcLink.href = sourceUrl;
            srcLink.style.display = 'inline-block';
        } else {
            srcLink.style.display = 'none';
        }

        // dynamic steps referencing this specific app (no links on the left side)
        var stepsHtml =
            '<div class="app-dialog-step"><span class="step-number" aria-hidden="true">1</span>'
            + '<span>Hit <strong>Download</strong> to get the file</span></div>'
            + '<div class="app-dialog-step"><span class="step-number" aria-hidden="true">2</span>'
            + '<span>Share file into a chat</span></div>'
            + '<div class="app-dialog-step"><span class="step-number" aria-hidden="true">3</span>'
            + '<span>Everyone just taps "start"</span></div>'
            + '<p class="app-dialog-tip">Tip: you can also attach an app when composing a message in a chat.</p>'
            ;
        document.getElementById('app-dialog-steps').innerHTML = stepsHtml;

        // highlight active card in carousel
        track.querySelectorAll('.carousel-card-active').forEach(function(el) {
            el.classList.remove('carousel-card-active');
        });
        var activeCard = track.querySelector('[data-app-id="' + appId + '"]');
        if (activeCard) activeCard.classList.add('carousel-card-active');

        currentAppId = appId;
        inlineDialog.style.display = 'block';
        stopAuto();
        document.getElementById('app-dialog-close').focus();
        inlineDialog.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        history.replaceState(null, '', '#' + appId);
    }

    function hideDialog() {
        inlineDialog.style.display = 'none';
        // Snap carousel to last selected card so auto-scroll continues from there
        if (currentAppId) {
            var lastCard = track.querySelector('[data-app-id="' + currentAppId + '"]');
            if (lastCard) {
                track.scrollTo({ left: lastCard.offsetLeft, behavior: 'instant' });
            }
        }
        track.querySelectorAll('.carousel-card-active').forEach(function(el) {
            el.classList.remove('carousel-card-active');
        });
        currentAppId = null;
        if (!isSearchActive) startAuto();
        if (lastFocusedEl && document.activeElement !== searchInput) { lastFocusedEl.focus(); lastFocusedEl = null; }
        history.replaceState(null, '', location.pathname + location.search);
    }

    document.getElementById('app-dialog-close').addEventListener('click', hideDialog);

    // Intercept clicks on carousel cards to show popup instead of navigating
    track.addEventListener('click', function(e) {
        var card = e.target.closest('.carousel-card');
        if (!card) return;
        e.preventDefault();
        lastFocusedEl = card;
        var appId = card.getAttribute('data-app-id') || '';
        if (appId) showDialog(appId);
    });

    /* --- Swipe gesture on app dialog for touch navigation --- */
    var swipeStartX = 0;
    inlineDialog.addEventListener('touchstart', function(e) {
        swipeStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    inlineDialog.addEventListener('touchend', function(e) {
        if (!currentAppId) return;
        var dx = e.changedTouches[0].screenX - swipeStartX;
        if (Math.abs(dx) > 50) {
            navigateApp(dx < 0 ? 1 : -1);
        }
    }, { passive: true });

    /* --- Messenger popup --- */
    var messengerData = {
        deltachat: {
            name: 'Delta Chat',
            img: 'assets/messengers/delta-chat.png',
            desc: 'A full featured messenger using the chatmail infrastructure with strong encryption and privacy.',
            platforms: 'Android, iOS, Windows, macOS, Linux',
            url: 'https://delta.chat'
        },
        arcanechat: {
            name: 'Arcanechat',
            img: 'assets/messengers/arcanechat.png',
            desc: 'A chatmail client for Android with a focus on family and friends.',
            platforms: 'Android',
            url: 'https://arcanechat.me'
        },
        deltatouch: {
            name: 'Delta Touch',
            img: 'assets/messengers/deltatouch.png',
            desc: 'A full-featured chatmail client for Ubuntu Touch, a Debian based mobile platform.',
            platforms: 'Ubuntu Touch',
            url: 'https://open-store.io/app/deltatouch.lotharketterer'
        },
        cheogram: {
            name: 'Cheogram',
            img: 'assets/messengers/cheogram-white.svg',
            imgBg: '#7401CF',
            desc: 'An XMPP/Jabber client with gateway features for contacting other networks, including SMS-enabled phone numbers.',
            platforms: 'Android',
            url: 'https://cheogram.com'
        },
        w2g: {
            name: 'Watch2Gether',
            img: 'assets/messengers/w2g.png',
            desc: 'A collaborative platform for watching videos, listening to music, and browsing content together in private rooms. Experimentally supports webxdc mini apps.',
            platforms: 'Web',
            url: 'https://w2g.tv'
        },
        vector: {
            name: 'Vector',
            img: 'assets/messengers/vector.png',
            desc: 'A decentralized, privacy-focused encrypted messenger with zero metadata leakage. Features Nexus, an integrated in-app webxdc app store.',
            platforms: 'Windows, macOS, Linux, Android',
            url: 'https://vectorapp.io'
        }
    };

    var messengerPopup = document.getElementById('messenger-popup');
    document.querySelectorAll('.messenger-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var key = btn.getAttribute('data-messenger');
            showMessenger(key);
        });
    });

    function showMessenger(key) {
            var m = messengerData[key];
            if (!m) return;
            var imgEl = document.getElementById('messenger-popup-img');
            if (m.img) {
                imgEl.src = m.img;
                imgEl.alt = m.name + ' logo';
                imgEl.style.display = '';
                imgEl.style.backgroundColor = m.imgBg || '#f5f5f5';
            } else {
                imgEl.style.display = 'none';
            }
            document.getElementById('messenger-popup-name').textContent = m.name;
            document.getElementById('messenger-popup-desc').textContent = m.desc;
            document.getElementById('messenger-popup-platforms').textContent = 'Platforms: ' + m.platforms;
            document.getElementById('messenger-popup-link').href = m.url;
            messengerPopup.style.display = 'flex';
            document.getElementById('messenger-popup-close').focus();
            history.replaceState(null, '', '#messenger-' + key);
    }

    function hideMessenger() {
        messengerPopup.style.display = 'none';
        history.replaceState(null, '', location.pathname + location.search);
    }

    document.getElementById('messenger-popup-close').addEventListener('click', function() {
        hideMessenger();
    });

    messengerPopup.addEventListener('click', function(e) {
        if (e.target === messengerPopup) hideMessenger();
    });

    // check URL hash to auto-open a messenger popup
    var messengerHash = location.hash.replace('#messenger-', '');
    if (location.hash.indexOf('#messenger-') === 0 && messengerData[messengerHash]) {
        showMessenger(messengerHash);
        setTimeout(function() {
            messengerPopup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
    }

    // Shared function for navigating to the next/previous app in the carousel
    function navigateApp(dir) {
        if (!currentAppId) return;
        var allCards = track.querySelectorAll('.carousel-card');
        var visibleCards = [];
        allCards.forEach(function(c) { if (c.style.display !== 'none') visibleCards.push(c); });
        if (!visibleCards.length) return;
        var currentIdx = -1;
        for (var i = 0; i < visibleCards.length; i++) {
            if (visibleCards[i].getAttribute('data-app-id') === currentAppId) { currentIdx = i; break; }
        }
        if (currentIdx < 0) return;
        var nextIdx = dir > 0
            ? (currentIdx + 1) % visibleCards.length
            : (currentIdx - 1 + visibleCards.length) % visibleCards.length;
        var nextCard = visibleCards[nextIdx];
        var nextId = nextCard.getAttribute('data-app-id');
        lastFocusedEl = nextCard;
        track.scrollTo({ left: nextCard.offsetLeft - track.clientWidth / 2 + nextCard.offsetWidth / 2, behavior: 'instant' });
        showDialog(nextId);
    }

    // Escape key closes any open dialog; Arrow keys navigate between apps
    document.addEventListener('keydown', function(e) {
        var inSearch = document.activeElement === searchInput;
        if (e.key === 'Escape' && !inSearch) {
            if (messengerPopup.style.display !== 'none') hideMessenger();
            if (inlineDialog.style.display !== 'none') hideDialog();
        }
        if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && currentAppId && !inSearch) {
            navigateApp(e.key === 'ArrowRight' ? 1 : -1);
            e.preventDefault();
        }
    });
})();

/* swap "web" and "xdc" colors every 5 seconds */
(function() {
    var webEl = document.getElementById('webxdc-web');
    var xdcEl = document.getElementById('webxdc-xdc');
    if (!webEl || !xdcEl) return;
    var glow = 'color:#78babf;text-shadow:0 0 6px rgba(120,186,191,.7),0 0 18px rgba(120,186,191,.5),0 0 32px rgba(120,186,191,.35)';
    var dark = 'color:#405964;text-shadow:none';
    var state = 0;
    setInterval(function() {
        state = 1 - state;
        webEl.style.cssText = state ? dark : glow;
        xdcEl.style.cssText = state ? glow : dark;
    }, 5000);
})();
