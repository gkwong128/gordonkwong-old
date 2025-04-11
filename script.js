// script.js - Combined script for landing page and learnmore page

let lenis; // Declare lenis in a scope accessible by popup functions

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed"); // General check
   // --- Initialize Lenis Smooth Scroll ---
   if (typeof Lenis !== 'undefined') {
    // Assign the instance to the globally scoped variable
    lenis = new Lenis({ lerp: 0.1 }); // << MODIFIED: Assign to outer scope 'lenis'

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
       lenis.on('scroll', ScrollTrigger.update);
       gsap.ticker.add((time) => { lenis.raf(time * 1000); });
       gsap.ticker.lagSmoothing(0);
       console.log("Lenis/GSAP Integrated.");
    } else {
        // Fallback if GSAP/ScrollTrigger not present
         lenis.on('scroll', (e) => {});
         function raf(time) {
             lenis.raf(time);
             requestAnimationFrame(raf);
         }
         requestAnimationFrame(raf);
         console.log("Lenis Initialized (no GSAP).");
    }
} else {
     console.log("Lenis not found.");
}
    // ===== Loading Screen Logic (Runs Once Per Session for Landing Page) Start =====
    // ... (keep existing loading screen logic) ...
    const loadingScreen = document.getElementById('loading-screen');
    const loadingTextElement = document.getElementById('loading-text');
    const loadingSessionKey = 'hasVisitedLandingPage'; // Use the specific key

    if (document.body.classList.contains('landing-page-body')) { // Check if we are on the landing page
        if (sessionStorage.getItem(loadingSessionKey)) {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.pointerEvents = 'none';
                setTimeout(() => { loadingScreen.style.display = 'none'; }, 0);
                // console.log("Landing page session active, skipping loading screen."); // Less verbose log
            }
        } else if (loadingScreen && loadingTextElement) {
            console.log("First visit to landing page this session, showing loading screen.");
            sessionStorage.setItem(loadingSessionKey, 'true'); // Set the key

            loadingScreen.style.opacity = '1';
            loadingScreen.style.display = 'flex';
            loadingScreen.classList.remove('hidden');
            loadingTextElement.innerHTML = 'You are a <span id="loading-word">friend</span>';
            const loadingWordSpan = document.getElementById('loading-word');

            if (loadingWordSpan) {
                const wordsSequence = [ // Using latest sequence
                    { word: "dreamer", delay: 600 }, { word: "leader", delay: 560 },
                    { word: "storyteller", delay: 520 }, { word: "lover", delay: 470 },
                    { word: "rebel", delay: 420 }, { word: "collaborator", delay: 360 },
                    { word: "daughter", delay: 300 }, { word: "mentor", delay: 250 },
                    { word: "woman", delay: 210 }, { word: "mother", delay: 180 },
                    { word: "sister", delay: 150 }, { word: "creator", delay: 130 },
                    { word: "doer", delay: 110 }, { word: "trend setter", delay: 95 },
                    { word: "fashionista", delay: 80 }, { word: "care taker", delay: 70 },
                    { word: "visionary", delay: 60 }, { word: "trailblazer", delay: 55 },
                    { word: "healer", delay: 50 }, { word: "protector", delay: 50 },
                    { word: "listener", delay: 50 }, { word: "multitasker", delay: 50 },
                    { word: "storyteller", delay: 50 }, { word: "fighter", delay: 50 },
                    { word: "nurturer", delay: 50 }, { word: "strategist", delay: 50 },
                    { word: "explorer", delay: 50 }, { word: "provider", delay: 50 },
                    { word: "student", delay: 50 }, { word: "human", delay: 50 },
                ];
                const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
                const animateWords = async () => {
                  try {
                    for (const item of wordsSequence) {
                      const effectiveDelay = Math.max(item.delay, 0);
                      await delay(effectiveDelay);
                      const currentWordSpan = document.getElementById('loading-word');
                      if (!currentWordSpan) return;
                      currentWordSpan.textContent = item.word;
                    }
                    if (loadingTextElement) {
                        loadingTextElement.innerHTML = 'You are <span class="accent-word">human</span>';
                    }
                    await delay(400);
                    if (loadingScreen) loadingScreen.classList.add('hidden');
                    await delay(600);
                    if (loadingScreen) loadingScreen.style.display = 'none';
                    // console.log("Loading animation complete."); // Less verbose log
                  } catch (error) {
                      console.error("Error loading anim:", error);
                      if (loadingScreen) { /* Hide screen on error */
                          loadingScreen.style.opacity = '0';
                          loadingScreen.style.pointerEvents = 'none';
                          loadingScreen.style.display = 'none';
                      }
                  }
                };
                animateWords();
            } else {
                 console.error("#loading-word span not found after reset!");
                 if (loadingScreen) loadingScreen.style.display = 'none';
            }
        } else {
             // Handle missing loading screen elements only if on landing page
             let missing = [];
             if (!loadingScreen) missing.push("#loading-screen");
             if (!loadingTextElement) missing.push("#loading-text");
             // Only log error if elements are actually expected on landing page
             if (missing.length > 0 && document.body.classList.contains('landing-page-body')) {
                console.error(`Loading screen HTML elements not found: ${missing.join(', ')}`);
             }
             if (loadingScreen) loadingScreen.style.display = 'none'; // Ensure hidden if logic fails
        }
    } else {
        // If not on landing page, ensure loading screen is hidden if it somehow exists in HTML
        if (loadingScreen) {
             loadingScreen.style.display = 'none';
        }
    }
    // ===== Loading Screen Logic End =====


    // ===== Timer Popup Logic Start =====
    // This logic runs on ALL pages where this script is included
    const popup = document.getElementById('timer-popup');
    const popupStep1 = document.getElementById('popup-step-1');
    const popupStep2 = document.getElementById('popup-step-2');
    const popupNameInput = document.getElementById('popup-name');
    const popupEmailInput = document.getElementById('popup-email');
    const popupNextButton = document.getElementById('popup-next-step');
    const popupSubmitButton = document.getElementById('popup-submit');
    const popupSubmitting = document.getElementById('popup-submitting');
    const popupSuccess = document.getElementById('popup-success');
    const popupError = document.getElementById('popup-error');

    // Only proceed if the popup HTML exists on the page
    if (popup && popupStep1 && popupStep2 && popupNameInput && popupEmailInput && popupNextButton && popupSubmitButton && popupSubmitting && popupSuccess && popupError) {

        const TIME_THRESHOLD = 60 * 1000; // 60 seconds
        const STORAGE_KEY_ELAPSED = 'popupTotalElapsedTime';
        const STORAGE_KEY_START = 'popupTimerStartTime'; // Tracks session start
        const STORAGE_KEY_TRIGGERED = 'popupTriggered';
        const STORAGE_KEY_COMPLETED = 'popupCompleted';
        const STORAGE_KEY_NAME = 'popupCurrentName';

        let timerInterval = null;
        let pageLoadTime = Date.now(); // Time when this specific page loaded

        const checkTimerAndShowPopup = () => {
            let totalElapsed = parseInt(localStorage.getItem(STORAGE_KEY_ELAPSED) || '0', 10);
            let timeSincePageLoad = Date.now() - pageLoadTime;
            let currentTotalTime = totalElapsed + timeSincePageLoad;

            // console.log(`Popup Check: Total Elapsed = ${currentTotalTime / 1000}s`); // Debug log

            if (currentTotalTime > TIME_THRESHOLD && !localStorage.getItem(STORAGE_KEY_COMPLETED)) {
                if (!popup.classList.contains('popup-visible')) {
                     console.log("Time threshold reached, triggering popup.");
                     localStorage.setItem(STORAGE_KEY_TRIGGERED, 'true');
                     showPopup();
                }
                if (timerInterval) clearInterval(timerInterval);
            }
        };

     // MODIFIED showPopup function - Try applying classes BEFORE stopping Lenis
    const showPopup = () => {
        console.log("Showing Popup"); // Keep log for checking execution

        // 1. Apply CSS classes first to hide overflow
        document.documentElement.classList.add('popup-open');
        document.body.classList.add('popup-open');

        // 2. Then stop Lenis scrolling
        if (typeof lenis !== 'undefined' && lenis !== null) {
            lenis.stop();
        }

        // 3. Continue with the rest of the popup display logic
        popupStep1.style.display = 'block';
        popupStep2.style.display = 'none';
        // ... (rest of your existing style changes for popup steps) ...
        popupSubmitting.style.display = 'none';
        popupSuccess.style.display = 'none';
        popupError.style.display = 'none';
        popupNextButton.style.display = 'block';
        popupSubmitButton.style.display = 'none';
        popupNameInput.value = localStorage.getItem(STORAGE_KEY_NAME) || '';

        if (localStorage.getItem(STORAGE_KEY_NAME)) {
            popupStep1.style.display = 'none';
            popupStep2.style.display = 'block';
            popupNextButton.style.display = 'none';
            popupSubmitButton.style.display = 'block';
            // Maybe add focus logic here after popup is potentially stable
            // requestAnimationFrame(() => popupEmailInput.focus());
        } else {
             // Maybe add focus logic here after popup is potentially stable
             // requestAnimationFrame(() => popupNameInput.focus());
        }

        popup.style.display = 'flex';
        setTimeout(() => { popup.classList.add('popup-visible'); }, 10); // Fade in
    };

    // Ensure hidePopup still starts Lenis BEFORE removing classes
    const hidePopup = () => {
        if (typeof lenis !== 'undefined' && lenis !== null) {
            lenis.start(); // Start Lenis first
        }
        document.documentElement.classList.remove('popup-open');
        document.body.classList.remove('popup-open'); // Then allow overflow
        popup.classList.remove('popup-visible');
        setTimeout(() => { popup.style.display = 'none'; }, 400);
    };

        // --- Timer Initialization ---
        if (!localStorage.getItem(STORAGE_KEY_COMPLETED)) {
            if (!localStorage.getItem(STORAGE_KEY_START)) {
                localStorage.setItem(STORAGE_KEY_START, Date.now().toString());
                localStorage.setItem(STORAGE_KEY_ELAPSED, '0');
                console.log("Popup timer started (new session).");
            }

            if (localStorage.getItem(STORAGE_KEY_TRIGGERED) === 'true') {
                 console.log("Popup was previously triggered, showing now.");
                 showPopup();
            } else {
                timerInterval = setInterval(checkTimerAndShowPopup, 5000);
                 console.log("Popup timer interval started.");
            }

            const saveElapsedTime = () => {
                if (!localStorage.getItem(STORAGE_KEY_COMPLETED)) {
                    let totalElapsed = parseInt(localStorage.getItem(STORAGE_KEY_ELAPSED) || '0', 10);
                    let timeSincePageLoad = Date.now() - pageLoadTime;
                    localStorage.setItem(STORAGE_KEY_ELAPSED, (totalElapsed + timeSincePageLoad).toString());
                    // console.log("Saved elapsed time."); // Less verbose
                    pageLoadTime = Date.now();
                }
            };

            window.addEventListener('beforeunload', saveElapsedTime);
            document.addEventListener('visibilitychange', () => {
                if (!localStorage.getItem(STORAGE_KEY_COMPLETED)) {
                    if (document.hidden) {
                        saveElapsedTime();
                        if (timerInterval) clearInterval(timerInterval);
                        console.log("Tab hidden, timer paused.");
                    } else {
                        pageLoadTime = Date.now();
                        if (timerInterval) clearInterval(timerInterval);
                        if (localStorage.getItem(STORAGE_KEY_TRIGGERED) !== 'true') {
                           timerInterval = setInterval(checkTimerAndShowPopup, 5000);
                           // console.log("Tab visible, timer resumed."); // Less verbose
                        } else {
                            // console.log("Tab visible, but popup already triggered."); // Less verbose
                             if (localStorage.getItem(STORAGE_KEY_TRIGGERED) === 'true' && !localStorage.getItem(STORAGE_KEY_COMPLETED)) {
                                 if (!popup.classList.contains('popup-visible')) { showPopup(); }
                             }
                        }
                    }
                }
            });

        } else {
            // console.log("Popup already completed, timer not started."); // Less verbose
        }
        
// --- Add Enter Key Submission for Popup Inputs ---
if (popupNameInput) {
    popupNameInput.addEventListener('keydown', function(event) {
      // Check if the key pressed was 'Enter'
      if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevent default Enter behavior (like adding a newline)
        popupNextButton.click(); // Trigger the 'Continue' button click
      }
    });
  }

  if (popupEmailInput) {
    popupEmailInput.addEventListener('keydown', function(event) {
      // Check if the key pressed was 'Enter'
      if (event.key === 'Enter' || event.keyCode === 13) {
        event.preventDefault(); // Prevent default Enter behavior
        popupSubmitButton.click(); // Trigger the 'Submit & Get Coupon' button click
      }
    });
  }
  // --- End Enter Key Submission ---

        // --- Popup Step Handling ---
        popupNextButton.addEventListener('click', () => {
            const name = popupNameInput.value.trim();
            if (name) {
                localStorage.setItem(STORAGE_KEY_NAME, name);
                popupStep1.style.display = 'none'; popupStep2.style.display = 'block';
                popupNextButton.style.display = 'none'; popupSubmitButton.style.display = 'block';
                popupEmailInput.focus();
            } else { alert("Please enter your name."); popupNameInput.focus(); }
        });

       // --- Popup Submission Handling ---
       popupSubmitButton.addEventListener('click', async () => {
        const name = localStorage.getItem(STORAGE_KEY_NAME);
        const email = popupEmailInput.value.trim();
        if (!email || !/\S+@\S+\.\S+/.test(email)) { alert("Please enter a valid email address."); popupEmailInput.focus(); return; }
        if (!name) { alert("Name is missing."); return; } // Ensure name is present

        console.log("Submitting:", { name, email });
        popupStep1.style.display = 'none'; popupStep2.style.display = 'none';
        popupSubmitting.style.display = 'block'; popupSuccess.style.display = 'none'; popupError.style.display = 'none';

        const endpoint = '/.netlify/functions/submit-popup'; // Your Netlify function path

        // VVVVV THIS IS THE CORRECT BLOCK VVVVVV
        try {
            // ACTUAL FETCH CALL - Make sure simulation lines are removed
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: name, email: email }), // Send name and email
            });

            if (!response.ok) {
                // Handle server errors (e.g., function returned an error)
                const errorBody = await response.text(); // Get error details from function
                console.error(`Function error! Status: ${response.status}`, errorBody);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Optional: Process success response from function if needed
            // const result = await response.json();
            // console.log('Server response:', result);

            // Show success message on frontend
            popupSubmitting.style.display = 'none'; popupSuccess.style.display = 'block';
            localStorage.setItem(STORAGE_KEY_COMPLETED, 'true'); // Mark popup as completed
            if (timerInterval) clearInterval(timerInterval); // Stop timer if running
            setTimeout(hidePopup, 2000); // Hide popup after success

        } catch (error) {
            // Handle fetch errors (network issue) or errors thrown above
            console.error('Submission failed:', error);
            popupSubmitting.style.display = 'none'; popupError.style.display = 'block'; // Show error message
            // Optionally, keep the popup open longer on error or re-enable submission
            setTimeout(hidePopup, 3000);
        }
        // ^^^^^ THIS IS THE CORRECT BLOCK ^^^^^^
    }); // - referring to website/script.js

    } else {
         // Only log error if the popup HTML is expected but not found
         if (document.getElementById('timer-popup')) { // Check if the main div exists
            console.error("Timer popup inner elements not found. Popup logic cannot run.");
         } else {
            // console.log("Timer popup HTML not found on this page."); // Normal if not included everywhere
         }
    }
    // ===== Timer Popup Logic End =====


    // ===== Marquee Banner JS Animation Start =====
    // ... (keep existing marquee logic) ...
    const banner = document.getElementById('announcement-banner');
    const marqueeText = banner ? banner.querySelector('.marquee-text') : null;

    if (banner && marqueeText) { // Only run if banner exists on the current page
        console.log("Initializing JS Marquee Banner"); // DEBUG LOG
        let animationFrameId = null;
        let position = 0;
        let speed = 0.5;
        let contentWidth = 0;
        let isPaused = false;
        let originalContent = '';
        let isSetupComplete = false;
        let repetitionCount = 1;

        const setupAndStartMarquee = () => {
            if (isSetupComplete) { if (!animationFrameId && !isPaused) animateMarquee(); return; }
            console.log("Running Marquee Setup..."); // DEBUG LOG
            originalContent = marqueeText.innerHTML; repetitionCount = 1;
            const containerWidth = banner.offsetWidth;
            if (containerWidth <= 0) { console.error("Marquee container width invalid."); return; }
            let currentScrollWidth = marqueeText.scrollWidth;
            while (currentScrollWidth < containerWidth * 2) {
                marqueeText.innerHTML += originalContent; repetitionCount++;
                currentScrollWidth = marqueeText.scrollWidth;
                if (repetitionCount > 10) { console.warn("Marquee duplication limit."); break; }
            }
            console.log(`Marquee duplicated content ${repetitionCount} times.`); // DEBUG LOG
            requestAnimationFrame(() => {
                contentWidth = marqueeText.scrollWidth / repetitionCount;
                if (contentWidth <= 0) { console.error("Marquee contentWidth invalid after duplication."); marqueeText.innerHTML = originalContent; return; }
                isSetupComplete = true; position = 0;
                marqueeText.style.transform = `translateX(${position}px)`;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animateMarquee(); // Start the animation loop
                console.log("Marquee animation started. Width:", contentWidth); // DEBUG LOG
            });
        };
        const animateMarquee = () => {
            if (!isSetupComplete || contentWidth <= 0) return;
            if (isPaused) { animationFrameId = null; return; }
            position -= speed;
            if (position <= -contentWidth) { position += contentWidth; }
            marqueeText.style.transform = `translateX(${position}px)`;
            animationFrameId = requestAnimationFrame(animateMarquee);
        };
        banner.addEventListener('mouseenter', () => { isPaused = true; /* console.log("Marquee paused"); */ }); // Less verbose
        banner.addEventListener('mouseleave', () => {
            if (isPaused) { isPaused = false; if (!animationFrameId) { animateMarquee(); /* console.log("Marquee resumed"); */ } } // Less verbose
        });
        setTimeout(setupAndStartMarquee, 300);
    } else {
        // console.log("Marquee banner elements not found on this page."); // Normal if banner not present
    }
    // ===== Marquee Banner JS Animation End =====


    // ===== Landing Page Hamburger Menu Toggle Start =====
    // ... (keep existing landing page menu toggle logic) ...
     const menuToggle = document.querySelector('.landing-menu-toggle');
    if (menuToggle && document.body.classList.contains('landing-page-body')) { // Check if on landing page
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            // console.log("Landing menu toggled. Expanded:", !isExpanded); // Less verbose
            // Add logic to show/hide actual menu
        });
    }
    // ===== Landing Page Hamburger Menu Toggle End =====


    // ===== Original script.js Logic (Carousel, Sticky Nav, Video Scrub, etc.) Start =====
    // ... (keep most existing logic here) ...

    // --- Variable Setup ---
    const stickyNavbar = document.getElementById('sticky-navbar');
    const nonStickyNavbar = document.getElementById('navbar');
    const heroCarousel = document.querySelector('.hero-carousel');
    const slides = heroCarousel ? heroCarousel.querySelectorAll('.hero-carousel > a') : null;
    const prevBtn = heroCarousel ? document.querySelector('.carousel-button.prev') : null;
    const nextBtn = heroCarousel ? document.querySelector('.carousel-button.next') : null;
    const indicatorContainer = document.querySelector('.carousel-indicators');
    let indicators = []; let currentSlide = 0; let slideInterval;
    const desktopBreakpoint = 1024;

 


    // --- Carousel Logic ---
    if (slides && slides.length > 0 && prevBtn && nextBtn && indicatorContainer) {
        // ... (keep existing carousel logic) ...
         const updateIndicators = (index) => { indicators.forEach((ind, i) => { ind.classList.toggle('active', i === index); ind.setAttribute('aria-current', i === index); }); };
        const showSlide = (index) => { slides.forEach((s, i) => s.classList.toggle('active', i === index)); updateIndicators(index); };
        const changeSlide = (dir) => { if (slides.length <= 1) return; clearInterval(slideInterval); currentSlide = (currentSlide + dir + slides.length) % slides.length; showSlide(currentSlide); startCarousel(); };
        const goToSlide = (index) => { if (index === currentSlide || index < 0 || index >= slides.length) return; clearInterval(slideInterval); currentSlide = index; showSlide(currentSlide); startCarousel(); };
        const startCarousel = () => { clearInterval(slideInterval); if (slides.length > 1) { slideInterval = setInterval(() => changeSlide(1), 4000); } };
        prevBtn.addEventListener('click', () => changeSlide(-1)); nextBtn.addEventListener('click', () => changeSlide(1));
        indicatorContainer.innerHTML = ''; indicators = [];
        slides.forEach((s, i) => { const ind = document.createElement('button'); ind.className = 'carousel-indicator'; ind.dataset.slideTo = i; ind.setAttribute('aria-label', `Go to slide ${i + 1}`); ind.setAttribute('role', 'tab'); ind.addEventListener('click', () => goToSlide(i)); indicatorContainer.appendChild(ind); indicators.push(ind); });
        indicatorContainer.setAttribute('role', 'tablist'); showSlide(currentSlide); startCarousel(); // console.log("Carousel initialized.");
        let touchstartX = 0, touchstartY = 0, touchendX = 0, touchendY = 0; const swipeThreshold = 50;
        heroCarousel.addEventListener('touchstart', (e) => { touchstartX = e.changedTouches[0].screenX; touchstartY = e.changedTouches[0].screenY; clearInterval(slideInterval); }, { passive: true });
        heroCarousel.addEventListener('touchend', (e) => { touchendX = e.changedTouches[0].screenX; touchendY = e.changedTouches[0].screenY; handleSwipe(); startCarousel(); }, { passive: true });
        function handleSwipe() { const dX = touchendX - touchstartX; const dY = touchendY - touchstartY; if (Math.abs(dX) > swipeThreshold && Math.abs(dX) > Math.abs(dY)) { if (dX < 0) changeSlide(1); else changeSlide(-1); } }
    } else { /* if (document.querySelector('.hero-carousel')) console.error("Carousel setup failed."); */ }

    // --- Scroll Logic Handler (Handles Sticky Nav) ---
    const handleScroll = () => {
        // ... (keep existing sticky nav logic) ...
         const scrollY = window.scrollY || window.pageYOffset;
         if (nonStickyNavbar && stickyNavbar && window.innerWidth >= desktopBreakpoint) {
           const nonStickyNavHeight = nonStickyNavbar.offsetHeight;
           const triggerOffset = 35;
           if (nonStickyNavHeight > 0) {
               if (scrollY > nonStickyNavHeight + triggerOffset) { stickyNavbar.classList.add('show'); }
               else { stickyNavbar.classList.remove('show'); }
           } else { stickyNavbar.classList.remove('show'); }
         } else if (stickyNavbar && window.innerWidth < desktopBreakpoint) { stickyNavbar.classList.remove('show'); }
    };
    if (stickyNavbar || nonStickyNavbar) { handleScroll(); window.addEventListener('scroll', handleScroll, { passive: true }); window.addEventListener('resize', handleScroll, { passive: true }); }

    // --- Mobile/Tablet Menu Toggle Logic (for main nav) ---
    const mainMmenuToggles = document.querySelectorAll('#navbar .mobile-menu-toggle, .sticky-navbar .mobile-menu-toggle');
    const mainHamburgerBreakpoint = 1024;
    if (mainMmenuToggles.length > 0) {
        // ... (keep existing mobile menu logic) ...
         mainMmenuToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                if (window.innerWidth < mainHamburgerBreakpoint) {
                    const targetMenuId = toggle.getAttribute('aria-controls');
                    const targetMenu = document.getElementById(targetMenuId);
                    if (targetMenu) {
                        const isOpen = targetMenu.classList.toggle('is-open');
                        toggle.setAttribute('aria-expanded', isOpen);
                        toggle.innerHTML = isOpen ? '×' : '☰';
                        if (!isOpen) { targetMenu.querySelectorAll('.nav-item.submenu-open').forEach(item => item.classList.remove('submenu-open')); }
                    }
                }
            });
        });
     }

    // --- Mobile/Tablet Submenu Toggle Logic (for main nav) ---
    const mainSubmenuTriggers = document.querySelectorAll('.sticky-navbar .mobile-nav-menu .nav-item > span');
     if (mainSubmenuTriggers.length > 0) {
        // ... (keep existing submenu logic) ...
         mainSubmenuTriggers.forEach(trigger => {
            const parentItem = trigger.closest('.nav-item');
            const submenu = parentItem.querySelector('.mega-menu');
            if (submenu) {
                trigger.addEventListener('click', (event) => {
                    if (window.innerWidth < mainHamburgerBreakpoint) {
                        event.preventDefault();
                        const currentMenu = trigger.closest('.mobile-nav-menu');
                        if (currentMenu) { currentMenu.querySelectorAll('.nav-item.submenu-open').forEach(openItem => { if (openItem !== parentItem) { openItem.classList.remove('submenu-open'); } }); }
                        parentItem.classList.toggle('submenu-open');
                    }
                });
            }
        });
     }

    // --- Video Scrubbing Animation ---
    const scrubVideoElement = document.getElementById("heel-scrub-video");
    const scrubSection = document.querySelector(".video-scrub-section");
    const scrubContentToPin = scrubSection ? scrubSection.querySelector(".video-content-wrapper") : null;
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && scrubVideoElement && scrubSection && scrubContentToPin) {
        // ... (keep existing video scrub logic) ...
         gsap.registerPlugin(ScrollTrigger);
        let videoSetupComplete = false;
        scrubVideoElement.onloadedmetadata = function() {
             if (videoSetupComplete || isNaN(scrubVideoElement.duration) || scrubVideoElement.duration <= 0) { /* ... error check ... */ return; }
             // console.log("Scrub video metadata loaded."); // Less verbose
             let startOffset = 0;
             if (stickyNavbar) { const navHeight = stickyNavbar.offsetHeight; const oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize); startOffset = navHeight + oneRem; } else { startOffset = 16; }
             const videoTimeline = gsap.timeline({ scrollTrigger: { trigger: scrubSection, start: `top top+=${startOffset}px`, end: () => "+=" + (scrubSection.offsetHeight - scrubContentToPin.offsetHeight), scrub: 1.0, pin: scrubContentToPin, pinSpacing: false, invalidateOnRefresh: true, markers: false }, defaults: { ease: "none" } });
             videoTimeline.fromTo(scrubVideoElement, { currentTime: 0 }, { currentTime: scrubVideoElement.duration });
             videoSetupComplete = true; // console.log("GSAP video scrub setup complete.");
             ScrollTrigger.refresh();
        };
        scrubVideoElement.onerror = function() { console.error("Error loading scrub video."); };
    } else { /* if (document.querySelector(".video-scrub-section")) console.log("Video scrub elements/libs missing."); */ }

    // --- Resize Handler for Desktop State Cleanup (for main nav) ---
    let mainResizeTimeout;
    window.addEventListener('resize', () => {
        // ... (keep existing resize logic) ...
         clearTimeout(mainResizeTimeout);
        mainResizeTimeout = setTimeout(() => {
            if (window.innerWidth >= mainHamburgerBreakpoint) {
                document.querySelectorAll('.sticky-navbar .mobile-nav-menu.is-open').forEach(openMenu => {
                    openMenu.classList.remove('is-open');
                    const toggle = openMenu.closest('nav')?.querySelector('.mobile-menu-toggle');
                    if(toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.innerHTML = '☰'; }
                    openMenu.querySelectorAll('.nav-item.submenu-open').forEach(item => item.classList.remove('submenu-open'));
                });
            }
            if (typeof ScrollTrigger !== 'undefined') { ScrollTrigger.refresh(); }
            if (stickyNavbar || nonStickyNavbar) { handleScroll(); }
        }, 150);
     }, { passive: true });

    // ===== Original script.js Logic End =====

}); // End DOMContentLoaded