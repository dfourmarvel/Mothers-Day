const typingText = document.getElementById("typingText");
const typingAnnouncement = document.getElementById("typingAnnouncement");
const typingDots = Array.from(document.querySelectorAll(".typing-dot"));
const revealElements = Array.from(document.querySelectorAll(".reveal"));
const galleryImages = Array.from(document.querySelectorAll(".gallery-item img"));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const surpriseButton = document.getElementById("surpriseButton");
const surpriseMessage = document.getElementById("surpriseMessage");
const musicToggle = document.getElementById("musicToggle");
const backgroundMusic = document.getElementById("backgroundMusic");
const siteImages = Array.from(document.querySelectorAll("img"));
const contentImages = Array.from(document.querySelectorAll(".managed-image"));

const typingPhrases = [
  "loves with her whole heart.",
  "makes every place feel like home.",
  "turns care into a daily art.",
  "deserves flowers, laughter, and everything beautiful."
];

let phraseIndex = 0;
let characterIndex = 0;
let isDeleting = false;
let musicAvailable = true;

function getMusicLabel() {
  return musicToggle?.querySelector(".music-label") ?? null;
}

function setTextContent(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function updateTypingProgress(activeIndex) {
  if (!typingDots.length) return;

  typingDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
}

function runTypingEffect() {
  if (!typingText || !typingPhrases.length) return;

  const currentPhrase = typingPhrases[phraseIndex];
  typingText.textContent = currentPhrase.slice(0, characterIndex);

  if (!isDeleting && characterIndex < currentPhrase.length) {
    characterIndex += 1;
    window.setTimeout(runTypingEffect, 75);
    return;
  }

  if (!isDeleting && characterIndex === currentPhrase.length) {
    setTextContent(
      typingAnnouncement,
      `Today is for the woman who ${currentPhrase}`
    );
    updateTypingProgress(phraseIndex);
    isDeleting = true;
    window.setTimeout(runTypingEffect, 1800);
    return;
  }

  if (isDeleting && characterIndex > 0) {
    characterIndex -= 1;
    window.setTimeout(runTypingEffect, 38);
    return;
  }

  isDeleting = false;
  phraseIndex = (phraseIndex + 1) % typingPhrases.length;
  window.setTimeout(runTypingEffect, 220);
}

function setupRevealAnimations() {
  if (!revealElements.length) return;

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function openLightbox(image) {
  if (
    !image ||
    image.dataset.imageError === "true" ||
    !lightbox ||
    !lightboxImage ||
    !lightboxCaption
  ) {
    return;
  }

  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.dataset.caption || image.alt;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;

  lightbox.hidden = true;
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.style.overflow = "";
}

function createFallbackImage(label) {
  const safeLabel = label
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f6d7a8" />
          <stop offset="100%" stop-color="#e48a56" />
        </linearGradient>
      </defs>
      <rect width="800" height="1000" fill="url(#g)" />
      <circle cx="400" cy="340" r="120" fill="rgba(255,255,255,0.26)" />
      <path d="M220 820c36-168 128-252 180-252s144 84 180 252" fill="rgba(255,255,255,0.22)" />
      <text x="400" y="920" text-anchor="middle" fill="#fff8ef" font-family="Arial, sans-serif" font-size="48">
        ${safeLabel}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}`;
}

function getImageContainer(image) {
  return image?.closest(".gallery-item, .hero-photo-frame, .letter-photo-stack") ?? null;
}

function setImageReadyState(image, isLoaded) {
  if (!image) return;

  const container = getImageContainer(image);
  image.classList.toggle("is-loaded", isLoaded);
  image.classList.toggle("is-loading", !isLoaded);

  if (container) {
    container.classList.toggle("is-loading", !isLoaded);
  }
}

function setupImageLoadingStates() {
  if (!contentImages.length) return;

  contentImages.forEach((image) => {
    setImageReadyState(image, image.complete && image.naturalWidth > 0);
    image.addEventListener("load", () => setImageReadyState(image, true));
  });
}

function setupImageFallbacks() {
  if (!siteImages.length) return;

  siteImages.forEach((image) => {
    image.onerror = () => {
      if (image.dataset.imageError === "true") return;

      image.dataset.imageError = "true";
      image.classList.add("image-fallback");
      image.onerror = null;

      const fallbackLabel = image.dataset.fallbackLabel || image.alt || "Mama Joe";
      image.src = createFallbackImage(fallbackLabel);
      image.alt = `${fallbackLabel} fallback image`;
      setImageReadyState(image, true);

      if (image.dataset.caption) {
        image.dataset.caption = `${image.dataset.caption} (Fallback preview shown)`;
      }
    };
  });
}

function setupGallery() {
  if (!galleryImages.length || !lightbox || !lightboxClose) return;

  galleryImages.forEach((image) => {
    image.addEventListener("click", () => openLightbox(image));
  });

  lightboxClose.addEventListener("click", closeLightbox);

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function setupSurprise() {
  if (!surpriseButton || !surpriseMessage) return;

  surpriseButton.addEventListener("click", () => {
    const isHidden = surpriseMessage.hidden;
    surpriseMessage.hidden = !isHidden ? true : false;
    surpriseButton.textContent = isHidden
      ? "Hide the surprise"
      : "Click for a surprise \uD83C\uDF81";

    if (isHidden) {
      surpriseMessage.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });
}

function setMusicUnavailable() {
  if (!musicToggle) return;

  musicAvailable = false;
  musicToggle.classList.remove("is-playing");
  musicToggle.disabled = true;
  musicToggle.setAttribute("aria-disabled", "true");
  musicToggle.setAttribute("title", "No audio file found");
  setTextContent(getMusicLabel(), "No audio file");
}

async function toggleMusic() {
  if (!backgroundMusic || !musicToggle || !musicAvailable) return;

  if (backgroundMusic.paused) {
    try {
      await backgroundMusic.play();
      musicToggle.classList.add("is-playing");
      musicToggle.setAttribute("aria-pressed", "true");
      setTextContent(getMusicLabel(), "Pause music");
    } catch (error) {
      setMusicUnavailable();
      console.warn("Background music could not play yet.", error);
    }
    return;
  }

  backgroundMusic.pause();
  musicToggle.classList.remove("is-playing");
  musicToggle.setAttribute("aria-pressed", "false");
  setTextContent(getMusicLabel(), "Play music");
}

function setupMusicToggle() {
  if (!backgroundMusic || !musicToggle) return;

  musicToggle.addEventListener("click", toggleMusic);

  backgroundMusic.addEventListener("pause", () => {
    if (!musicAvailable) return;
    musicToggle.classList.remove("is-playing");
    musicToggle.setAttribute("aria-pressed", "false");
    setTextContent(getMusicLabel(), "Play music");
  });

  backgroundMusic.addEventListener("error", setMusicUnavailable);

  const source = backgroundMusic.querySelector("source");
  if (!source || !source.getAttribute("src")) {
    setMusicUnavailable();
    return;
  }

  backgroundMusic.load();

  window.setTimeout(() => {
    if (backgroundMusic.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      setMusicUnavailable();
    }
  }, 1200);
}

runTypingEffect();
setupRevealAnimations();
setupImageLoadingStates();
setupImageFallbacks();
setupGallery();
setupSurprise();
setupMusicToggle();
