(() => {
  // src/services/create-element/create-element.ts
  var classNamePrefix = "plex-enhancements-";
  var crEl = (tagName, className, text, onClick) => {
    const element = document.createElement(tagName);
    if (className) {
      element.className = `${classNamePrefix}${className}`;
    }
    if (text) {
      element.textContent = text;
      if (tagName === "a") {
        element.title = text;
      }
    }
    if (onClick) {
      element.addEventListener("click", onClick);
    }
    return element;
  };
  var crA = (className, text, href) => {
    const link = crEl("a", className, text);
    link.href = href;
    link.target = "_blank";
    return link;
  };
  var $ = (selector) => document.querySelector(selector);
  var $testId = (testId) => $(`[data-testid="${testId}"]`);

  // src/services/add-trailer/add-trailer.ts
  var rootUrl = "https://www.themoviedb.org/video/play?key=";
  var addTrailer = (buttonTitle = "", trailerKey, posterContainer) => {
    const { innerWidth: width, innerHeight } = window;
    const height = innerHeight - 250;
    const container = crEl("div", "trailer-iframe-container");
    const playButton = crEl("button", "play-trailer-button", buttonTitle, () => {
      const iframe = crEl("iframe", "trailer-iframe");
      iframe.src = `${rootUrl}${trailerKey}&width=${width}&height=${height}`;
      container.appendChild(iframe);
      document.body.appendChild(container);
      playButton.style.display = "none";
      iframe.style.display = "block";
      closeButton.style.display = "block";
    });
    const closeButton = crEl("button", "close-trailer-button", "Close", () => {
      container?.parentElement?.removeChild(container);
      closeButton.style.display = "none";
      playButton.style.display = "block";
    });
    posterContainer?.appendChild(playButton);
    document.body.appendChild(closeButton);
  };

  // src/services/insert-link-to-css-if-not-exists/insert-link-to-css-if-not-exists.ts
  var insertLinkToCssIfNotExists = () => {
    if ($(".plex-enhancements-styles")) {
      return;
    }
    const link = crEl("link", "styles");
    link.rel = "stylesheet";
    link.href = browser.runtime.getURL("static/plex-enhancements.css");
    document.head.appendChild(link);
  };

  // src/services/is-details/is-details.ts
  var isDetails = () => ["metadata-title", "metadata-line1", "metadata-poster"].every(
    (testId) => !!document.querySelector(`[data-testid="${testId}"]`)
  );

  // src/services/is-series/is-series.ts
  var isSeries = () => [
    '[data-testid="metadata-title"]',
    '[data-testid="metadata-line1"]',
    '[data-testid="metadata-poster"]',
    '[data-testid="hubTitle"][title="Seasons"]'
  ].every((testId) => !!document.querySelector(testId));

  // src/services/add-missing-key-notice/add-missing-key-notice.tsx
  var addMissingKeyNotice = () => {
    if ($(".plex-enhancements-missing-key-notice")) {
      return;
    }
    const notice = crEl("div", "missing-key-notice");
    const buttonContainer = crEl("div");
    const text = crEl(
      "p",
      null,
      "Missing TMDB API key. Please add it in the extension options."
    );
    const dismissButton = crEl(
      "button",
      "missing-key-notice-dismiss-button",
      "Dismiss",
      () => notice.parentElement?.removeChild(notice)
    );
    const optionsButton = crEl(
      "button",
      "missing-key-notice-options-button",
      "Show Options",
      () => browser.runtime.sendMessage({ action: "openOptionsPage" })
    );
    buttonContainer.appendChild(dismissButton);
    buttonContainer.appendChild(optionsButton);
    notice.appendChild(text);
    notice.appendChild(buttonContainer);
    document.body.appendChild(notice);
  };

  // src/services/tmdb/tmdb.ts
  var tmdb = {
    async getOptions() {
      const { tmdbReadAccessToken } = await browser.storage.sync.get(
        "tmdbReadAccessToken"
      );
      if (!tmdbReadAccessToken) {
        addMissingKeyNotice();
        return null;
      }
      return {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${tmdbReadAccessToken}`
        }
      };
    },
    async request(url) {
      const options = await tmdb.getOptions();
      if (!options) {
        return null;
      }
      const result = await fetch(url, options);
      return result.json();
    },
    async getCache(cacheKey) {
      const data = await browser.storage.local.get(cacheKey);
      return data[cacheKey];
    },
    async setCache(cacheKey, data) {
      return browser.storage.local.set({ [cacheKey]: data });
    },
    async getVideos(type, itemId) {
      const cacheKey = `${type}-${itemId}-videos`;
      const cache = await tmdb.getCache(cacheKey);
      if (cache) {
        return cache;
      }
      const url = `https://api.themoviedb.org/3/${type}/${itemId}/videos`;
      const data = await tmdb.request(url);
      if (data !== null) {
        tmdb.setCache(cacheKey, data);
      }
      return data;
    },
    async getExternalIds(type, itemId) {
      const cacheKey = `${type}-${itemId}-externalIds`;
      const cache = await tmdb.getCache(cacheKey);
      if (cache) {
        return cache;
      }
      const url = `https://api.themoviedb.org/3/${type}/${itemId}/external_ids`;
      const data = await tmdb.request(url);
      if (data !== null) {
        tmdb.setCache(cacheKey, data);
      }
      return data;
    },
    async searchByTitleAndYear(type, title, year) {
      const safeTitle = title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s/g, "-");
      const cacheKey = `${type}-${safeTitle}-${year}-itemId`;
      const cache = await tmdb.getCache(cacheKey);
      if (cache) {
        return cache;
      }
      const encodedTitle = encodeURIComponent(title);
      const url = `https://api.themoviedb.org/3/search/${type}?query=${encodedTitle}&year=${year}`;
      const data = await tmdb.request(url);
      if (data !== null) {
        const id = data.results?.[0]?.id;
        if (id) {
          await tmdb.setCache(cacheKey, id);
        }
        return id;
      }
      return null;
    }
  };

  // src/index.ts
  var state = {
    dataAddedToPage: false
  };
  var addDataToPage = async () => {
    const type = isSeries() ? "tv" : "movie";
    const ratingsContainer = $testId("metadata-ratings")?.parentElement;
    const posterElement = $testId("metadata-poster");
    const titleElement = $testId("metadata-title");
    const yearElement = $testId("metadata-line1");
    const year = yearElement?.textContent?.split(/\s/)[0] ?? "";
    const title = titleElement?.textContent ?? "";
    const itemId = await tmdb.searchByTitleAndYear(type, title, year);
    if (!itemId) {
      return;
    }
    if (type === "movie") {
      ratingsContainer?.appendChild(
        crA(
          "letterboxd-link",
          "View on Letterboxd",
          `https://letterboxd.com/tmdb/${itemId}/`
        )
      );
    }
    ratingsContainer?.appendChild(
      crA(
        "tmdb-link",
        "View on TMDB",
        `https://www.themoviedb.org/${type}/${itemId}/`
      )
    );
    const { imdb_id } = await tmdb.getExternalIds(type, itemId);
    if (imdb_id) {
      ratingsContainer?.appendChild(
        crA("imdb-link", "View on IMDB", `https://www.imdb.com/title/${imdb_id}`)
      );
    }
    const videos = await tmdb.getVideos(type, itemId);
    const trailer = videos.results.find((video) => video.type === "Trailer");
    const teaser = videos.results.find((video) => video.type === "Teaser");
    if (posterElement) {
      if (trailer) {
        addTrailer("Play trailer", trailer.key, posterElement);
      } else if (teaser) {
        addTrailer("Play teaser", teaser.key, posterElement);
      }
    }
    return;
  };
  var pageMutationsObserver = new MutationObserver(async (mutations) => {
    if (location.href.includes("/details")) {
      if (isDetails() && !state.dataAddedToPage) {
        addDataToPage();
        state.dataAddedToPage = true;
      }
    }
  });
  pageMutationsObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
  window.addEventListener("hashchange", () => {
    state.dataAddedToPage = false;
    const iframeContainer = $(".plex-enhancements-trailer-iframe-container");
    iframeContainer?.parentElement?.removeChild(iframeContainer);
    const closeButton = $(".plex-enhancements-close-trailer-button");
    closeButton?.parentElement?.removeChild(closeButton);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const iframeContainer = $(".plex-enhancements-trailer-iframe-container");
      iframeContainer?.parentElement?.removeChild(iframeContainer);
      const closeButton = $(".plex-enhancements-close-trailer-button");
      const playButton = $(".plex-enhancements-play-trailer-button");
      if (closeButton) {
        closeButton.style.display = "none";
      }
      if (playButton) {
        playButton.style.display = "block";
      }
    }
  });
  insertLinkToCssIfNotExists();
})();
//# sourceMappingURL=plex-enhancements.js.map
