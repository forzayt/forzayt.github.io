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
    var LIMIT = 6;
    var CACHE_KEY = "forzayt_github_projects_v2";
    var CACHE_TTL = 10 * 60 * 1000; // 10 minutes
    var SEARCH_URL = "https://api.github.com/search/commits?q=author:" + USERNAME +
        "&sort=committer-date&order=desc&per_page=" + LIMIT;
    var REPOS_API_URL = "https://api.github.com/users/" + USERNAME +
        "/repos?per_page=100&sort=pushed&direction=desc";

    // Same staggered arrangement as the original hardcoded projects section:
    // wide left -> small left + medium right -> small center -> wide right -> medium left.
    var LAYOUT = [
        [{ col: "col-lg-8" }],
        [{ col: "col-lg-3", square: true }, { col: "col-lg-6 offset-lg-3" }],
        [{ col: "col-lg-3 offset-lg-4", square: true }],
        [{ col: "col-lg-8 offset-lg-4" }],
        [{ col: "col-lg-6" }, { col: "col-lg-3 offset-lg-3", square: true }]
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

    function imageUrl(fullName, sha) {
        // picsum.photos rejects seeds containing slashes, so slugify the repo name.
        var slug = String(fullName || "project").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
        var seed = encodeURIComponent(sha ? slug + "-" + shortSha(sha) : slug);
        return "https://picsum.photos/seed/" + seed + "/800/600";
    }

    function fallbackImageUrl(fullName) {
        var label = encodeURIComponent(repoSegments(fullName).pop() || "project");
        return "https://placehold.co/800x600/e9e9e9/555555?text=" + label;
    }

    function readCache() {
        try {
            var raw = sessionStorage.getItem(CACHE_KEY);
            if (!raw) {
                return null;
            }
            var cached = JSON.parse(raw);
            if (!cached || !cached.time || Date.now() - cached.time > CACHE_TTL) {
                return null;
            }
            return cached.items;
        } catch (error) {
            return null;
        }
    }

    function writeCache(items) {
        try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                time: Date.now(),
                items: items
            }));
        } catch (error) {
            /* storage can be unavailable (private mode / quota) */
        }
    }

    function fetchJson(url) {
        return fetch(url, {
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

    function createTag(label) {
        var link = document.createElement("a");
        link.href = REPOS_URL;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        return link;
    }

    function createCard(project, slot) {
        var column = document.createElement("div");
        column.className = slot.col;

        var item = document.createElement("article");
        item.className = "item mb-60";

        var imageWrap = document.createElement("div");
        imageWrap.className = slot.square ? "img square fit-img" : "img";

        var image = document.createElement("img");
        image.src = imageUrl(project.repo, project.sha);
        image.alt = "Preview of " + project.repo;
        image.loading = "lazy";
        image.width = 800;
        image.height = 600;
        image.addEventListener("error", function handleError() {
            image.removeEventListener("error", handleError);
            image.src = fallbackImageUrl(project.repo);
        });

        var tags = document.createElement("div");
        tags.className = "tags";
        var language = project.language || (project.sha ? "Commit" : "Repository");
        tags.appendChild(createTag(language));
        if (project.sha) {
            tags.appendChild(createTag(shortSha(project.sha)));
        }

        var plink = document.createElement("a");
        plink.className = "plink";
        plink.href = REPOS_URL;
        plink.target = "_blank";
        plink.rel = "noopener noreferrer";
        plink.setAttribute("aria-label", "View all projects on GitHub");

        imageWrap.appendChild(image);
        imageWrap.appendChild(tags);
        imageWrap.appendChild(plink);

        var title = document.createElement("h6");
        title.textContent = truncate(firstLine(project.message) || "Untitled project", 80);

        var meta = document.createElement("span");
        meta.className = "project-repo";
        var repoName = repoSegments(project.repo).pop();
        var date = formatDate(project.date);
        meta.textContent = date ? repoName + " \u00b7 " + date : repoName;

        item.appendChild(imageWrap);
        item.appendChild(title);
        item.appendChild(meta);
        column.appendChild(item);

        return column;
    }

    function render(projects) {
        grid.textContent = "";

        if (!projects.length) {
            renderMessage("No projects to show right now.", "Browse my repositories on GitHub");
            return;
        }

        var index = 0;

        LAYOUT.forEach(function (group) {
            var row = document.createElement("div");
            row.className = "row";
            var added = 0;

            group.forEach(function (slot) {
                var project = projects[index];
                if (!project) {
                    return;
                }
                row.appendChild(createCard(project, slot));
                index += 1;
                added += 1;
            });

            if (added) {
                grid.appendChild(row);
            }
        });
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

            return buildProjects(commits, repos, languages);
        });
    }

    function init() {
        var cached = readCache();

        if (cached && cached.length) {
            render(cached);
            return;
        }

        renderLoading();

        loadFromGitHub().then(function (projects) {
            writeCache(projects);
            render(projects);
        }).catch(function () {
            renderMessage("Could not load commits from GitHub.", "See all my projects on GitHub");
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
