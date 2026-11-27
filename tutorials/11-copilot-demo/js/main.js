const postList = document.querySelector(".post-list");
const composer = document.querySelector("#composer");
const postInput = document.querySelector("#post-text");
const composerStatus = document.querySelector("#composer-status");
const submitButton = composer.querySelector(".compose-submit");
let commonWords;

async function loadCommonWords() {
    try {
        const response = await fetch("./4000-most-common-english-words-csv.csv");
        if (!response.ok) throw new Error("Vocabulary list unavailable");
        const rows = await response.text();
        // The first row contains the source URL, so only load the vocabulary rows.
        commonWords = new Set(rows.split(/\r?\n/).slice(1).map((word) => word.trim().toLowerCase()).filter(Boolean));
        postInput.disabled = false;
        submitButton.disabled = false;
    } catch {
        composerStatus.textContent = "Publishing is unavailable until the vocabulary list can be loaded.";
    }
}

loadCommonWords();

function updateLike(button) {
    const liked = button.getAttribute("aria-pressed") === "true";
    const count = Number(button.dataset.count) + (liked ? -1 : 1);
    button.dataset.count = String(count);
    button.setAttribute("aria-pressed", String(!liked));
    button.querySelector(".action-count").textContent = String(count);
}

// Delegate clicks so controls on newly composed posts work too.
postList.addEventListener("click", (event) => {
    const likeButton = event.target.closest(".like-button");
    const bookmarkButton = event.target.closest(".bookmark-button");
    const shareButton = event.target.closest(".share-button");

    if (likeButton) updateLike(likeButton);
    if (bookmarkButton) {
        bookmarkButton.setAttribute("aria-pressed", String(bookmarkButton.getAttribute("aria-pressed") !== "true"));
    }
    if (shareButton && navigator.share) {
        navigator.share({ title: "Afterhours", text: "A post from the Afterhours community", url: window.location.href }).catch(() => {});
    }
});

document.querySelectorAll(".feed-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".feed-tab").forEach((item) => {
            const selected = item === tab;
            item.classList.toggle("selected", selected);
            item.setAttribute("aria-selected", String(selected));
        });
        postList.querySelectorAll(".post[data-following]").forEach((post) => {
            post.hidden = tab.dataset.filter === "following" && post.dataset.following !== "true";
        });
    });
});

document.querySelectorAll(".follow-button").forEach((button) => {
    button.addEventListener("click", () => {
        const following = button.getAttribute("aria-pressed") === "true";
        button.setAttribute("aria-pressed", String(!following));
        button.textContent = following ? "Follow" : "Following";
    });
});

document.querySelectorAll(".mobile-compose").forEach((button) => {
    button.addEventListener("click", () => {
        postInput.focus();
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
});

document.querySelector(".search-toggle").addEventListener("click", () => {
    document.querySelector("#site-search").focus();
});

document.querySelector("#search-form").addEventListener("submit", (event) => event.preventDefault());

document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
        event.preventDefault();
        document.querySelector("#site-search").focus();
    }
});

composer.addEventListener("submit", (event) => {
    event.preventDefault();
    const content = postInput.value.trim();
    if (!content || !commonWords) return;
    // Match complete letter-only words, not substrings inside longer words.
    const listedWords = (content.match(/[a-z]+/gi) || []).filter((word) => commonWords.has(word.toLowerCase()));
    if (listedWords.length) {
        composerStatus.textContent = `Please revise these listed words: ${[...new Set(listedWords)].join(", ")}`;
        return;
    }
    composerStatus.textContent = "";

    const post = document.createElement("article");
    post.className = "post";
    post.dataset.following = "true";

    const header = document.createElement("div");
    header.className = "post-topline";
    const avatar = document.createElement("img");
    avatar.className = "avatar";
    avatar.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=96&h=96&q=80";
    avatar.alt = "";
    const author = document.createElement("div");
    author.className = "author-line";
    author.innerHTML = "<strong>Jamie Rivera</strong><span>@jamierivera</span><span class=\"post-dot\">·</span><time>now</time>";
    header.append(avatar, author);

    const copy = document.createElement("p");
    copy.className = "post-copy";
    // Treat submitted content as text rather than interpreting it as HTML.
    copy.textContent = content;

    const actions = document.createElement("div");
    actions.className = "post-actions";
    actions.innerHTML = '<button class="action-button like-button" type="button" aria-label="Like your post" aria-pressed="false" data-count="0"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.7c0 5.2-8.8 10-8.8 10s-8.8-4.8-8.8-10a4.7 4.7 0 0 1 8.8-2.2 4.7 4.7 0 0 1 8.8 2.2Z"/></svg><span class="action-count">0</span></button><button class="action-button" type="button" aria-label="View replies"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.5-3A7.5 7.5 0 1 1 20 11.5Z"/></svg><span>0</span></button><button class="action-button bookmark-button" type="button" aria-label="Save post" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v17l-6-4-6 4z"/></svg></button>';

    post.append(header, copy, actions);
    postList.prepend(post);
    postInput.value = "";
    postInput.blur();
});