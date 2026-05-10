const typingText = document.getElementById("typingText");
const typingAnnouncement = document.getElementById("typingAnnouncement");
const typingDots = Array.from(document.querySelectorAll(".typing-dot"));
const revealElements = Array.from(document.querySelectorAll(".reveal"));
const galleryTriggers = Array.from(document.querySelectorAll(".gallery-trigger"));
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const openingSurprise = document.getElementById("openingSurprise");
const surpriseButton = document.getElementById("surpriseButton");
const partyPoppers = document.getElementById("partyPoppers");
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
const touchDevice = window.matchMedia("(pointer: coarse)").matches;

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
  lightboxImage.src = image.currentSrc || image.src;
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

  // Keep focus in modal while there is a single focus target.
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
  if (!openingSurprise || !surpriseButton) return;

  surpriseButton.addEventListener("click", async () => {
    launchPartyPoppers();
    await playBackgroundMusic();
    openingSurprise.classList.add("is-leaving");
    document.body.classList.remove("intro-active");

    window.setTimeout(() => {
      openingSurprise.hidden = true;
      openingSurprise.setAttribute("aria-hidden", "true");
      musicToggle?.focus();
    }, 700);
  });
}

function launchPartyPoppers() {
  if (!partyPoppers) return;

  partyPoppers.innerHTML = "";

  const colors = ["#d8a24b", "#ec8b4f", "#f4c95d", "#ffffff", "#b77c23"];
  const shapes = [
    { width: "0.65rem", height: "1.2rem", radius: "999px" },
    { width: "0.9rem", height: "0.9rem", radius: "50%" },
    { width: "1rem", height: "0.5rem", radius: "999px" },
    { width: "0.45rem", height: "1.35rem", radius: "999px" }
  ];
  const cannons = [
    {
      count: 42,
      originX: "12%",
      originY: "78%",
      angleStart: -1.25,
      angleSpread: 1.05,
      minDistance: 260,
      distanceRange: 560,
      liftBase: 220,
      liftRange: 340,
      driftRange: 120
    },
    {
      count: 42,
      originX: "88%",
      originY: "78%",
      angleStart: -2.95,
      angleSpread: 1.05,
      minDistance: 260,
      distanceRange: 560,
      liftBase: 220,
      liftRange: 340,
      driftRange: 120
    },
    {
      count: 34,
      originX: "50%",
      originY: "62%",
      angleStart: -2.2,
      angleSpread: 4.4,
      minDistance: 200,
      distanceRange: 420,
      liftBase: 190,
      liftRange: 260,
      driftRange: 200
    }
  ];

  let pieceIndex = 0;

  cannons.forEach((cannon) => {
    for (let index = 0; index < cannon.count; index += 1) {
      const piece = document.createElement("span");
      const angle = cannon.angleStart + (index / Math.max(1, cannon.count - 1)) * cannon.angleSpread;
      const distance = cannon.minDistance + Math.random() * cannon.distanceRange;
      const drift = (Math.random() - 0.5) * cannon.driftRange;
      const verticalLift = cannon.liftBase + Math.random() * cannon.liftRange;
      const rotation = Math.round(Math.random() * 360);
      const shape = shapes[pieceIndex % shapes.length];
      const wave = (Math.random() - 0.5) * 220;

      piece.className = "party-popper-piece";
      piece.style.setProperty("--piece-origin-x", cannon.originX);
      piece.style.setProperty("--piece-origin-y", cannon.originY);
      piece.style.setProperty("--piece-color", colors[pieceIndex % colors.length]);
      piece.style.setProperty("--piece-width", shape.width);
      piece.style.setProperty("--piece-height", shape.height);
      piece.style.setProperty("--piece-radius", shape.radius);
      piece.style.setProperty("--piece-x", `${Math.cos(angle) * distance + drift + wave}px`);
      piece.style.setProperty("--piece-y", `${Math.sin(angle) * distance - verticalLift}px`);
      piece.style.setProperty("--piece-rotate", `${rotation}deg`);
      piece.style.animationDelay = `${Math.random() * 240}ms`;
      partyPoppers.appendChild(piece);
      pieceIndex += 1;
    }
  });

  partyPoppers.classList.remove("is-bursting");
  void partyPoppers.offsetWidth;
  partyPoppers.classList.add("is-bursting");

  window.setTimeout(() => {
    partyPoppers.classList.remove("is-bursting");
    partyPoppers.innerHTML = "";
  }, 1750);
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
  if (touchDevice) {
    document.addEventListener("touchstart", autoplayRetryHandler, { passive: true });
  }
  document.addEventListener("keydown", autoplayRetryHandler);
}

function unbindAutoplayRetry() {
  if (!autoplayRetryHandler) return;

  document.removeEventListener("click", autoplayRetryHandler);
  if (touchDevice) {
    document.removeEventListener("touchstart", autoplayRetryHandler);
  }
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
}

runTypingEffect();
setupRevealAnimations();
setupImageLoadingStates();
setupImageFallbacks();
setupGallery();
setupSurprise();
setupMusicToggle();
