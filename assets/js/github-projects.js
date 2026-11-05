/*
 * Projects section powered by the free GitHub REST API.
 * Pulls the latest public commits of a user (commit search API) and
 * renders them as project cards. Falls back to the latest pushed
 * repositories when commits cannot be fetched.
 */
(function () {
    "use strict";

    var USERNAME = "forzayt";
    var REPOS_URL = "https://github.com/forzayt?tab=repositories";
    var LIMIT = 8;
    var CACHE_KEY = "forzayt_github_projects_fallback";
    var SEARCH_URL = "https://api.github.com/search/commits?q=author:" + USERNAME +
        "&sort=committer-date&order=desc&per_page=" + LIMIT;
    var REPOS_API_URL = "https://api.github.com/users/" + USERNAME +
        "/repos?per_page=100&sort=pushed&direction=desc";

    // Varied image ratios give the masonry wall its Pinterest-style rhythm.
    var IMAGE_SIZES = [
        { w: 900, h: 1200 },
        { w: 900, h: 900 },
        { w: 900, h: 1125 },
        { w: 900, h: 675 },
        { w: 900, h: 1350 },
        { w: 900, h: 720 }
    ];

    var grid = document.getElementById("github-projects");
    if (!grid) {
        return;
    }

    /* ------------------------------ helpers ------------------------------ */

    function firstLine(text) {
        return String(text || "").split("\n")[0].trim();
    }

    function truncate(text, max) {
        return text.length > max ? text.slice(0, max - 1).trim() + "\u2026" : text;
    }

    function shortSha(sha) {
        return String(sha || "").slice(0, 7);
    }

    function formatDate(value) {
        var date = new Date(value);
        if (isNaN(date.getTime())) {
            return "";
        }
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    }

    function repoSegments(fullName) {
        return String(fullName || "").split("/");
    }

    function imageUrl(fullName, sha, size) {
        // picsum.photos rejects seeds containing slashes, so slugify the repo name.
        var slug = String(fullName || "project").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        var seed = encodeURIComponent(sha ? slug + "-" + shortSha(sha) : slug);
        return "https://picsum.photos/seed/" + seed + "/" + size.w + "/" + size.h;
    }

    function fallbackImageUrl(fullName, size) {
        var label = encodeURIComponent(repoSegments(fullName).pop() || "project");
        return "https://placehold.co/" + size.w + "x" + size.h + "/e9e9e9/555555?text=" + label;
    }

    function readFallbackCache() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            if (!raw) {
                return null;
            }
            var cached = JSON.parse(raw);
            if (!cached || !Array.isArray(cached.items) || !cached.items.length) {
                return null;
            }
            return cached.items;
        } catch (error) {
            return null;
        }
    }

    function writeFallbackCache(items) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                time: Date.now(),
                items: items
            }));
        } catch (error) {
            /* storage can be unavailable (private mode / quota) */
        }
    }

    function fetchJson(url) {
        return fetch(url, {
            cache: "no-store",
            headers: {
                Accept: "application/vnd.github+json"
            }
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("GitHub request failed: " + response.status);
            }
            return response.json();
        });
    }

    /* ------------------------------- data -------------------------------- */

    function commitsFromSearch(items, languages) {
        return (items || []).map(function (item) {
            var repository = item.repository || {};
            var commit = item.commit || {};
            var dates = commit.committer || commit.author || {};

            return {
                repo: repository.full_name || repository.name || USERNAME,
                url: repository.html_url || REPOS_URL,
                commitUrl: item.html_url,
                message: commit.message,
                sha: item.sha,
                date: dates.date,
                language: languages[repository.full_name]
            };
        });
    }

    function projectsFromRepos(repos) {
        return (repos || []).map(function (repo) {
            return {
                repo: repo.full_name || repo.name,
                url: repo.html_url || REPOS_URL,
                commitUrl: repo.html_url,
                message: repo.description || repo.name,
                sha: "",
                date: repo.pushed_at,
                language: repo.language
            };
        });
    }

    function buildProjects(commits, repos, languages) {
        var projects = commitsFromSearch(commits, languages);

        if (!projects.length) {
            projects = projectsFromRepos(repos);
        }

        var seen = {};

        return projects.filter(function (project) {
            var key = project.sha || project.repo;
            if (!project.repo || seen[key]) {
                return false;
            }
            seen[key] = true;
            return true;
        }).slice(0, LIMIT);
    }

    /* ------------------------------ render ------------------------------- */

    function createCard(project, index) {
        var repoUrl = project.url || REPOS_URL;
        var size = IMAGE_SIZES[index % IMAGE_SIZES.length];

        var pin = document.createElement("article");
        pin.className = "pin";

        var media = document.createElement("div");
        media.className = "pin-media";

        var image = document.createElement("img");
        image.src = imageUrl(project.repo, project.sha, size);
        image.alt = "Preview of " + project.repo;
        image.loading = "lazy";
        image.decoding = "async";
        image.width = size.w;
        image.height = size.h;
        image.addEventListener("error", function handleError() {
            image.removeEventListener("error", handleError);
            image.src = fallbackImageUrl(project.repo, size);
        });

        var chip = document.createElement("span");
        chip.className = "pin-chip";

        var dot = document.createElement("span");
        dot.className = "pin-dot";

        chip.appendChild(dot);
        chip.appendChild(document.createTextNode(
            project.language || (project.sha ? "Commit" : "Project")
        ));

        var arrow = document.createElement("span");
        arrow.className = "pin-arrow";
        arrow.setAttribute("aria-hidden", "true");

        var arrowIcon = document.createElement("i");
        arrowIcon.className = "fa-solid fa-arrow-up-right-from-square";
        arrow.appendChild(arrowIcon);

        var overlay = document.createElement("div");
        overlay.className = "pin-overlay";

        var title = document.createElement("h6");
        title.className = "pin-title";
        title.textContent = repoSegments(project.repo).pop() || "Untitled project";

        var meta = document.createElement("p");
        meta.className = "pin-meta";
        var message = truncate(firstLine(project.message) || "No commit message", 80);
        var date = formatDate(project.date);
        meta.textContent = date ? message + " \u00b7 " + date : message;

        overlay.appendChild(title);
        overlay.appendChild(meta);

        var link = document.createElement("a");
        link.className = "pin-link";
        link.href = repoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", "Open " + project.repo + " on GitHub");

        media.appendChild(image);
        media.appendChild(chip);
        media.appendChild(arrow);
        media.appendChild(overlay);
        media.appendChild(link);

        pin.appendChild(media);
        return pin;
    }

    function render(projects) {
        grid.textContent = "";

        if (!projects.length) {
            renderMessage("No projects to show right now.", "Browse my repositories on GitHub");
            return;
        }

        var masonry = document.createElement("div");
        masonry.className = "projects-masonry";

        projects.forEach(function (project, index) {
            masonry.appendChild(createCard(project, index));
        });

        grid.appendChild(masonry);
    }

    function createStatusRow() {
        var row = document.createElement("div");
        row.className = "row";

        var column = document.createElement("div");
        column.className = "col-12";

        var status = document.createElement("div");
        status.className = "projects-status";

        column.appendChild(status);
        row.appendChild(column);

        return { row: row, status: status };
    }

    function renderMessage(message, linkLabel) {
        grid.textContent = "";

        var parts = createStatusRow();
        var text = document.createElement("p");
        text.textContent = message;
        parts.status.appendChild(text);

        if (linkLabel) {
            var link = document.createElement("a");
            link.href = REPOS_URL;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            link.textContent = linkLabel;
            text.appendChild(document.createTextNode(" "));
            text.appendChild(link);
        }

        grid.appendChild(parts.row);
    }

    function renderLoading() {
        grid.textContent = "";

        var parts = createStatusRow();

        var loader = document.createElement("span");
        loader.className = "projects-loader";

        var text = document.createElement("p");
        text.textContent = "Loading latest commits...";

        parts.status.appendChild(loader);
        parts.status.appendChild(text);
        grid.appendChild(parts.row);
    }

    /* -------------------------------- load ------------------------------- */

    function loadFromGitHub() {
        return Promise.allSettled([
            fetchJson(SEARCH_URL),
            fetchJson(REPOS_API_URL)
        ]).then(function (results) {
            var searchUnavailable = results[0].status !== "fulfilled";
            var commits = results[0].status === "fulfilled" && results[0].value ?
                results[0].value.items : [];
            var repos = results[1].status === "fulfilled" && Array.isArray(results[1].value) ?
                results[1].value : [];

            commits = Array.isArray(commits) ? commits : [];

            if (!commits.length && !repos.length) {
                throw new Error("GitHub data unavailable");
            }

            var languages = {};
            repos.forEach(function (repo) {
                if (repo && repo.full_name) {
                    languages[repo.full_name] = repo.language;
                }
            });

            return {
                projects: buildProjects(commits, repos, languages),
                searchUnavailable: searchUnavailable
            };
        });
    }

    function init() {
        var cached = readFallbackCache();

        renderLoading();

        loadFromGitHub().then(function (result) {
            // If commit search is rate limited, prefer the last successful snapshot.
            if (result.searchUnavailable && cached) {
                render(cached);
                return;
            }

            if (!result.searchUnavailable) {
                writeFallbackCache(result.projects);
            }

            render(result.projects);
        }).catch(function () {
            if (cached) {
                render(cached);
            } else {
                renderMessage("Could not load commits from GitHub.", "See all my projects on GitHub");
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
