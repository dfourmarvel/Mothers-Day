const typingText = document.getElementById("typingText");
const typingAnnouncement = document.getElementById("typingAnnouncement");
const typingDots = Array.from(document.querySelectorAll(".typing-dot"));
const revealElements = Array.from(document.querySelectorAll(".reveal"));
const galleryTriggers = Array.from(document.querySelectorAll(".gallery-trigger"));
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
let typingLoopsCompleted = 0;
let musicAvailable = true;
let hasBoundAutoplayRetry = false;
let autoplayRetryHandler = null;
let lastFocusedTrigger = null;
const typingProgress = document.querySelector(".typing-progress");

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

function finishTypingLoop() {
  const finalPhrase = typingPhrases[typingPhrases.length - 1];
  if (!typingText) return;

  typingText.textContent = finalPhrase;
  updateTypingProgress(typingPhrases.length - 1);
  setTextContent(typingAnnouncement, `Today is for the woman who ${finalPhrase}`);
  typingProgress?.setAttribute("hidden", "true");
}

function runTypingEffect() {
  if (!typingText || !typingPhrases.length) return;

  if (typingLoopsCompleted >= 2) {
    finishTypingLoop();
    return;
  }

  const currentPhrase = typingPhrases[phraseIndex];
  typingText.textContent = currentPhrase.slice(0, characterIndex);

  if (!isDeleting && characterIndex < currentPhrase.length) {
    characterIndex += 1;
    window.setTimeout(runTypingEffect, 72);
    return;
  }

  if (!isDeleting && characterIndex === currentPhrase.length) {
    setTextContent(typingAnnouncement, `Today is for the woman who ${currentPhrase}`);
    updateTypingProgress(phraseIndex);
    isDeleting = true;
    window.setTimeout(runTypingEffect, 1600);
    return;
  }

  if (isDeleting && characterIndex > 0) {
    characterIndex -= 1;
    window.setTimeout(runTypingEffect, 34);
    return;
  }

  isDeleting = false;
  if (phraseIndex === typingPhrases.length - 1) {
    typingLoopsCompleted += 1;
  }
  phraseIndex = (phraseIndex + 1) % typingPhrases.length;
  window.setTimeout(runTypingEffect, 180);
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
      threshold: 0.18,
      rootMargin: "0px 0px -32px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function openLightbox(image, trigger = null) {
  if (
    !image ||
    image.dataset.imageError === "true" ||
    !lightbox ||
    !lightboxImage ||
    !lightboxCaption
  ) {
    return;
  }

  lastFocusedTrigger = trigger;
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.dataset.caption || image.alt;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-hidden", "false");
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;

  lightbox.hidden = true;
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
  lightboxImage.alt = "";
  document.body.style.overflow = "";
  lastFocusedTrigger?.focus();
}

function getImageContainer(image) {
  return image?.closest(".gallery-item, .hero-photo-frame, .letter-photo-stack, .timeline-photo-frame") ?? null;
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
    image.addEventListener("error", () => {
      image.dataset.imageError = "true";
      image.classList.add("image-fallback");
      setImageReadyState(image, true);
    });
  });
}

function trapLightboxFocus(event) {
  if (lightbox?.hidden || event.key !== "Tab" || !lightboxClose) return;

  event.preventDefault();
  lightboxClose.focus();
}

function setupGallery() {
  if (!galleryTriggers.length || !lightbox || !lightboxClose) return;

  galleryTriggers.forEach((trigger) => {
    const image = trigger.querySelector("img");
    if (!image) return;

    trigger.addEventListener("click", () => openLightbox(image, trigger));
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

  document.addEventListener("keydown", trapLightboxFocus);
}

function setupSurprise() {
  if (!surpriseButton || !surpriseMessage) return;

  surpriseButton.addEventListener("click", () => {
    const isHidden = surpriseMessage.hidden;
    surpriseMessage.hidden = !isHidden;
    surpriseButton.setAttribute("aria-expanded", String(isHidden));
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

function syncMusicToggle(isPlaying) {
  if (!musicToggle) return;

  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  setTextContent(getMusicLabel(), isPlaying ? "Music playing" : "Tap to play music");
}

function bindAutoplayRetry() {
  if (hasBoundAutoplayRetry || !backgroundMusic || !musicAvailable) return;

  hasBoundAutoplayRetry = true;

  autoplayRetryHandler = async () => {
    const started = await playBackgroundMusic();

    if (started) {
      unbindAutoplayRetry();
    }
  };

  document.addEventListener("click", autoplayRetryHandler, { passive: true });
  document.addEventListener("touchstart", autoplayRetryHandler, { passive: true });
  document.addEventListener("keydown", autoplayRetryHandler);
}

function unbindAutoplayRetry() {
  if (!autoplayRetryHandler) return;

  document.removeEventListener("click", autoplayRetryHandler);
  document.removeEventListener("touchstart", autoplayRetryHandler);
  document.removeEventListener("keydown", autoplayRetryHandler);
  autoplayRetryHandler = null;
  hasBoundAutoplayRetry = false;
}

async function playBackgroundMusic() {
  if (!backgroundMusic || !musicAvailable) return false;

  try {
    await backgroundMusic.play();
    syncMusicToggle(true);
    return true;
  } catch (error) {
    console.warn("Background music autoplay was blocked until user interaction.", error);
    bindAutoplayRetry();
    musicToggle?.classList.remove("is-playing");
    musicToggle?.setAttribute("aria-pressed", "false");
    setTextContent(getMusicLabel(), "Tap to play music");
    return false;
  }
}

function toggleMusic() {
  if (!backgroundMusic || !musicToggle || !musicAvailable) return;

  if (backgroundMusic.paused) {
    playBackgroundMusic();
    return;
  }

  unbindAutoplayRetry();
  syncMusicToggle(false);
  backgroundMusic.pause();
}

function setupMusicToggle() {
  if (!backgroundMusic || !musicToggle) return;

  musicToggle.addEventListener("click", toggleMusic);

  backgroundMusic.addEventListener("pause", () => {
    if (!musicAvailable) return;
    syncMusicToggle(false);
  });

  backgroundMusic.addEventListener("play", () => {
    if (!musicAvailable) return;
    syncMusicToggle(true);
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

  playBackgroundMusic();
}

runTypingEffect();
setupRevealAnimations();
setupImageLoadingStates();
setupImageFallbacks();
setupGallery();
setupSurprise();
setupMusicToggle();
