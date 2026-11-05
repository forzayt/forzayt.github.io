/*
 * Tech News section powered by free, key-less APIs.
 *
 * Primary feed : The Verge RSS, read through rss2json.com (free, no API key).
 * Fallbacks    : TechCrunch RSS through the same service, then Hacker News
 *                (Algolia HN API), which needs no key and allows CORS.
 *
 * Latest items are cached in localStorage for a few minutes so the section is
 * instant on repeat visits and the free API is not hammered.
 */
(function () {
    "use strict";

    var FEEDS = [
        {
            url: "https://www.theverge.com/rss/index.xml",
            name: "The Verge",
            home: "https://www.theverge.com/tech"
        },
        {
            url: "https://techcrunch.com/feed/",
            name: "TechCrunch",
            home: "https://techcrunch.com/category/technology/"
        }
    ];
    var HN_URL = "https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=10";
    var PROXY_URL = "https://api.rss2json.com/v1/api.json?rss_url=";
    var CACHE_KEY = "forzayt_tech_news_v1";
    var CACHE_TTL = 10 * 60 * 1000;
    var REQUEST_TIMEOUT = 12000;
    var LIMIT = 5;

    var grid = document.getElementById("news-grid");
    if (!grid) {
        return;
    }

    /* ------------------------------ helpers ------------------------------ */

    function truncate(text, max) {
        return text.length > max ? text.slice(0, max - 1).trim() + "\u2026" : text;
    }

    function cleanText(value) {
        if (!value) {
            return "";
        }
        try {
            var doc = new DOMParser().parseFromString(String(value), "text/html");
            return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
        } catch (error) {
            return String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
        }
    }

    function safeUrl(value, base) {
        if (!value) {
            return "";
        }
        try {
            var url = new URL(String(value).trim(), base);
            return (url.protocol === "http:" || url.protocol === "https:") ? url.href : "";
        } catch (error) {
            return "";
        }
    }

    function hostOf(value) {
        try {
            return new URL(value).hostname.replace(/^www\./i, "");
        } catch (error) {
            return "";
        }
    }

    function parseDate(value) {
        if (!value) {
            return "";
        }
        var text = String(value).trim();

        // RSS dates without a zone (e.g. "2026-11-05 05:00:00") are GMT.
        if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(text)) {
            text = text.replace(" ", "T");
            if (!/:\d{2}$/.test(text)) {
                text += ":00";
            }
            text += "Z";
        }

        var date = new Date(text);
        return isNaN(date.getTime()) ? "" : date.toISOString();
    }

    function timeAgo(value) {
        if (!value) {
            return "";
        }
        var date = new Date(value);
        if (isNaN(date.getTime())) {
            return "";
        }

        var seconds = Math.max(0, Math.round((Date.now() - date.getTime()) / 1000));
        if (seconds < 60) {
            return "just now";
        }

        var minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return minutes + (minutes === 1 ? " min ago" : " mins ago");
        }

        var hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return hours + (hours === 1 ? " hour ago" : " hours ago");
        }

        var days = Math.floor(hours / 24);
        if (days < 7) {
            return days + (days === 1 ? " day ago" : " days ago");
        }

        var weeks = Math.floor(days / 7);
        if (days < 30) {
            return weeks + (weeks === 1 ? " week ago" : " weeks ago");
        }

        var months = Math.floor(days / 30);
        if (months < 12) {
            return months + (months === 1 ? " month ago" : " months ago");
        }

        var years = Math.floor(days / 365);
        return years + (years === 1 ? " year ago" : " years ago");
    }

    function firstImage(html, base) {
        if (!html) {
            return "";
        }
        try {
            var doc = new DOMParser().parseFromString(String(html), "text/html");
            var images = doc.querySelectorAll("img");
            for (var i = 0; i < images.length; i += 1) {
                var src = images[i].getAttribute("src") ||
                    images[i].getAttribute("data-src") ||
                    images[i].getAttribute("data-original");
                var url = safeUrl(src, base);
                if (url) {
                    return url;
                }
            }
        } catch (error) {
            /* ignore malformed markup */
        }
        return "";
    }

    function imageOf(item, feed) {
        var candidates = [
            item.thumbnail,
            item.enclosure && item.enclosure[0] &&
                (item.enclosure[0].link || item.enclosure[0].url)
        ];

        for (var i = 0; i < candidates.length; i += 1) {
            var url = safeUrl(candidates[i], feed.home);
            if (url) {
                return url;
            }
        }

        return firstImage(item.content, feed.home) ||
            firstImage(item.description, feed.home);
    }

    function escapeXml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;");
    }

    function svgData(svg) {
        return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
    }

    function hueFrom(text) {
        var hash = 0;
        for (var i = 0; i < text.length; i += 1) {
            hash = (hash * 31 + text.charCodeAt(i)) % 360;
        }
        return Math.abs(hash);
    }

    function coverFor(item) {
        var source = truncate(item.source || "Tech News", 18);
        var hue = hueFrom((item.title || "") + (item.source || ""));

        return svgData(
            '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">' +
                '<defs>' +
                    '<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
                        '<stop offset="0" stop-color="hsl(' + hue + ', 55%, 30%)"/>' +
                        '<stop offset="1" stop-color="hsl(' + ((hue + 42) % 360) + ', 62%, 12%)"/>' +
                    '</linearGradient>' +
                '</defs>' +
                '<rect width="900" height="600" fill="url(#g)"/>' +
                '<circle cx="760" cy="120" r="210" fill="#ffffff" opacity="0.06"/>' +
                '<circle cx="150" cy="520" r="260" fill="#ffffff" opacity="0.05"/>' +
                '<text x="60" y="300" fill="#ffffff" font-family="Inter, Arial, sans-serif" font-size="58" font-weight="700">' +
                    escapeXml(source) +
                '</text>' +
                '<text x="62" y="352" fill="#ffffff" opacity="0.72" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="500" letter-spacing="5">LATEST TECH NEWS</text>' +
            '</svg>'
        );
    }

    function initialsFor(value) {
        var text = String(value || "").replace(/^the\s+/i, "").replace(/\s+/g, " ").trim();
        return (text.slice(0, 2) || "TN").toUpperCase();
    }

    function letterAvatar(value) {
        var letter = initialsFor(value).slice(0, 1);

        return svgData(
            '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80">' +
                '<rect width="80" height="80" rx="40" fill="#ecebe6"/>' +
                '<text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" ' +
                    'font-family="Inter, Arial, sans-serif" font-size="30" font-weight="600" fill="#333333">' +
                    escapeXml(letter) +
                '</text>' +
            '</svg>'
        );
    }

    function faviconFor(item) {
        var host = hostOf(item.url);
        if (!host) {
            return "";
        }
        return "https://www.google.com/s2/favicons?sz=128&domain=" + encodeURIComponent(host);
    }

    /* ------------------------------- data -------------------------------- */

    function normalizeFeedItems(data, feed) {
        var raw = data && Array.isArray(data.items) ? data.items : [];

        return raw.map(function (item) {
            var title = cleanText(item.title);
            var url = safeUrl(item.link, feed.home);

            if (!title || !url) {
                return null;
            }

            return {
                title: title,
                url: url,
                source: feed.name,
                author: cleanText(item.author) || feed.name,
                date: parseDate(item.pubDate),
                image: imageOf(item, feed),
                summary: truncate(cleanText(item.description || item.content), 220)
            };
        }).filter(Boolean).sort(function (a, b) {
            return (b.date || "").localeCompare(a.date || "");
        }).slice(0, LIMIT);
    }

    function normalizeHackerNews(data) {
        var hits = data && Array.isArray(data.hits) ? data.hits : [];

        return hits.map(function (hit) {
            var fallback = "https://news.ycombinator.com/item?id=" + (hit.objectID || "");
            var url = safeUrl(hit.url, fallback) || fallback;
            var title = cleanText(hit.title);

            if (!title) {
                return null;
            }

            return {
                title: title,
                url: url,
                source: hostOf(url) || "Hacker News",
                author: cleanText(hit.author) || "Hacker News",
                date: parseDate(hit.created_at),
                image: "",
                summary: truncate(cleanText(hit.story_text || ""), 220) ||
                    "Trending on Hacker News."
            };
        }).filter(Boolean).slice(0, LIMIT);
    }

    /* ------------------------------- cache ------------------------------- */

    function isHttpUrl(value) {
        try {
            var url = new URL(value);
            return url.protocol === "http:" || url.protocol === "https:";
        } catch (error) {
            return false;
        }
    }

    function readCache(maxAge) {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            if (!raw) {
                return null;
            }

            var cached = JSON.parse(raw);
            if (!cached || !Array.isArray(cached.items) || !cached.items.length) {
                return null;
            }

            if (maxAge && (!cached.time || Date.now() - cached.time > maxAge)) {
                return null;
            }

            var items = cached.items.filter(function (item) {
                return item && typeof item.title === "string" && item.title &&
                    typeof item.url === "string" && isHttpUrl(item.url);
            }).slice(0, LIMIT);

            return items.length ? items : null;
        } catch (error) {
            return null;
        }
    }

    function writeCache(items) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                time: Date.now(),
                items: items
            }));
        } catch (error) {
            /* storage can be unavailable (private mode / quota) */
        }
    }

    /* -------------------------------- load ------------------------------- */

    function fetchJson(url) {
        var controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        var timer = null;

        if (controller) {
            timer = setTimeout(function () {
                controller.abort();
            }, REQUEST_TIMEOUT);
        }

        return fetch(url, {
            cache: "no-store",
            signal: controller ? controller.signal : undefined,
            headers: {
                Accept: "application/json"
            }
        }).then(function (response) {
            if (timer) {
                clearTimeout(timer);
            }
            if (!response.ok) {
                throw new Error("Request failed: " + response.status);
            }
            return response.json();
        }, function (error) {
            if (timer) {
                clearTimeout(timer);
            }
            throw error;
        });
    }

    function loadFeed(feed) {
        return fetchJson(PROXY_URL + encodeURIComponent(feed.url)).then(function (data) {
            if (!data || data.status !== "ok") {
                throw new Error("Feed unavailable");
            }

            var items = normalizeFeedItems(data, feed);
            if (!items.length) {
                throw new Error("Feed contained no usable items");
            }
            return items;
        });
    }

    function loadHackerNews() {
        return fetchJson(HN_URL).then(function (data) {
            var items = normalizeHackerNews(data);
            if (!items.length) {
                throw new Error("Hacker News returned no usable items");
            }
            return items;
        });
    }

    function loadNews() {
        var index = 0;

        function next() {
            if (index >= FEEDS.length) {
                return loadHackerNews();
            }

            var feed = FEEDS[index];
            index += 1;

            return loadFeed(feed).catch(next);
        }

        return next();
    }

    /* ------------------------------- render ------------------------------ */

    function createClock(date, extraClass) {
        var span = document.createElement("span");
        span.className = extraClass || "sub-color";

        var icon = document.createElement("i");
        icon.className = "fa-regular fa-clock mr-15 opacity-7";

        span.appendChild(icon);
        span.appendChild(document.createTextNode(timeAgo(date)));
        return span;
    }

    function createInfo(item) {
        var info = document.createElement("div");
        info.className = "info d-flex align-items-center";

        var authorGroup = document.createElement("div");
        authorGroup.className = "d-flex align-items-center";

        var avatarWrap = document.createElement("div");
        avatarWrap.className = "author-img fit-img";

        var avatar = document.createElement("img");
        avatar.src = faviconFor(item) || letterAvatar(item.source);
        avatar.alt = "";
        avatar.width = 40;
        avatar.height = 40;
        avatar.loading = "lazy";
        avatar.decoding = "async";
        avatar.addEventListener("error", function handleError() {
            avatar.removeEventListener("error", handleError);
            avatar.src = letterAvatar(item.source);
        });

        avatarWrap.appendChild(avatar);

        var authorInfo = document.createElement("div");
        authorInfo.className = "author-info ml-10";

        var author = document.createElement("span");
        author.textContent = item.author;

        var source = document.createElement("span");
        source.className = "sub-color";
        source.textContent = item.source;

        authorInfo.appendChild(author);
        authorInfo.appendChild(source);

        authorGroup.appendChild(avatarWrap);
        authorGroup.appendChild(authorInfo);

        var dateWrap = document.createElement("div");
        dateWrap.className = "date ml-auto";
        dateWrap.appendChild(createClock(item.date));

        info.appendChild(authorGroup);
        info.appendChild(dateWrap);
        return info;
    }

    function createFeatured(item) {
        var column = document.createElement("div");
        column.className = "col-lg-6";

        var card = document.createElement("article");
        card.className = "mitem md-mb50";
        card.appendChild(createInfo(item));

        var imageWrap = document.createElement("div");
        imageWrap.className = "img fit-img mt-30";

        var image = document.createElement("img");
        image.src = item.image || coverFor(item);
        image.alt = item.title;
        image.width = 900;
        image.height = 600;
        image.loading = "eager";
        image.decoding = "async";
        image.addEventListener("error", function handleError() {
            image.removeEventListener("error", handleError);
            image.src = coverFor(item);
        });

        imageWrap.appendChild(image);

        var cont = document.createElement("div");
        cont.className = "cont mt-30";

        var title = document.createElement("h5");
        var link = document.createElement("a");
        link.href = item.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = item.title;

        title.appendChild(link);
        cont.appendChild(title);

        card.appendChild(imageWrap);
        card.appendChild(cont);
        column.appendChild(card);
        return column;
    }

    function createList(items) {
        var column = document.createElement("div");
        column.className = "col-lg-6";

        items.forEach(function (item, index) {
            var isLast = index === items.length - 1;

            var article = document.createElement("article");
            article.className = "item pb-20 bord-thin-bottom" +
                (isLast ? "" : " mb-20");

            var date = createClock(item.date, "date sub-color");

            var title = document.createElement("h6");
            title.className = "sub-head";

            var link = document.createElement("a");
            link.href = item.url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = item.title;

            title.appendChild(link);
            article.appendChild(date);
            article.appendChild(title);
            column.appendChild(article);
        });

        return column;
    }

    function render(items) {
        var usable = (items || []).filter(function (item) {
            return item && item.title && isHttpUrl(item.url);
        }).slice(0, LIMIT);

        grid.textContent = "";

        if (!usable.length) {
            renderMessage("No fresh tech stories available right now.", "Read the latest tech news on The Verge", FEEDS[0].home);
            return;
        }

        grid.appendChild(createFeatured(usable[0]));

        var rest = usable.slice(1);
        if (rest.length) {
            grid.appendChild(createList(rest));
        }
    }

    function renderLoading() {
        grid.textContent = "";

        var column = document.createElement("div");
        column.className = "col-12";

        var status = document.createElement("div");
        status.className = "projects-status";

        var loader = document.createElement("span");
        loader.className = "projects-loader";
        loader.setAttribute("aria-hidden", "true");

        var text = document.createElement("p");
        text.textContent = "Loading the latest tech news\u2026";

        status.appendChild(loader);
        status.appendChild(text);
        column.appendChild(status);
        grid.appendChild(column);
    }

    function renderMessage(message, linkLabel, linkUrl) {
        grid.textContent = "";

        var column = document.createElement("div");
        column.className = "col-12";

        var status = document.createElement("div");
        status.className = "projects-status";

        var text = document.createElement("p");
        text.textContent = message;

        if (linkLabel && linkUrl) {
            var link = document.createElement("a");
            link.href = linkUrl;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = linkLabel;

            text.appendChild(document.createTextNode(" "));
            text.appendChild(link);
        }

        status.appendChild(text);
        column.appendChild(status);
        grid.appendChild(column);
    }

    /* -------------------------------- init ------------------------------- */

    function init() {
        var fresh = readCache(CACHE_TTL);
        var stale = fresh || readCache(0);

        if (stale) {
            render(stale);
        } else {
            renderLoading();
        }

        if (fresh) {
            return;
        }

        loadNews().then(function (items) {
            writeCache(items);
            render(items);
        }).catch(function () {
            if (!stale) {
                renderMessage("Could not load the latest tech news right now.", "Read the latest tech news on The Verge", FEEDS[0].home);
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
