// script.js - Combined script for landing page and learnmore page

let lenis = null; // Initialize lenis as null

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed"); // General check

    // --- Conditionally Initialize Lenis Smooth Scroll ---
    // ONLY initialize if it's NOT the landing page
    if (!document.body.classList.contains('landing-page-body')) {
        // Check if the Lenis library is loaded
        if (typeof Lenis !== 'undefined') {
            // Assign the instance to the globally scoped variable
            lenis = new Lenis({ lerp: 0.1 });

            // Integrate with GSAP ScrollTrigger if available
            if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
               lenis.on('scroll', ScrollTrigger.update);
               gsap.ticker.add((time) => { lenis.raf(time * 1000); });
               gsap.ticker.lagSmoothing(0);
               console.log("Lenis/GSAP Integrated.");
            } else {
                 // Fallback animation loop if GSAP isn't present
                 lenis.on('scroll', (e) => {}); // Basic scroll event listener
                 function raf(time) {
                     // Check if lenis still exists (might be destroyed)
                     if (lenis) {
                        lenis.raf(time);
                     }
                     requestAnimationFrame(raf);
                 }
                 requestAnimationFrame(raf);
                 console.log("Lenis Initialized (no GSAP).");
            }
        } else {
             // Log error if Lenis library is not found (on non-landing pages)
             console.error("Lenis library not found. Smooth scrolling disabled.");
             lenis = null; // Ensure lenis is null if library not found
        }
    } else {
        console.log("On landing page, Lenis initialization skipped.");
        lenis = null; // Ensure lenis is null on landing page
    }
    // --- End Conditional Lenis Initialization ---

    // ===== Footer Newsletter Form Handling =====
    const footerForm = document.getElementById('footer-newsletter-form');
    const footerEmailInput = document.getElementById('footer-email-input');
    const footerSubscribeButton = document.getElementById('footer-subscribe-button');
    const footerFormMessage = document.getElementById('form-message'); // Reuse existing message element

    if (footerForm && footerEmailInput && footerSubscribeButton && footerFormMessage) {
        footerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const emailValue = footerEmailInput.value.trim();
            if (!emailValue || !/\S+@\S+\.\S+/.test(emailValue)) {
                alert('Please enter a valid email address.');
                footerEmailInput.focus();
                return;
            }

            // Disable button and show temporary message
            footerSubscribeButton.disabled = true;
            footerSubscribeButton.textContent = 'Submitting...';
            footerFormMessage.style.display = 'none'; // Hide previous message

            const endpoint = '/.netlify/functions/subscribe-newsletter'; // New function endpoint

            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: emailValue }), // Only send email
                });

                const result = await response.json(); // Always try to parse JSON

                if (!response.ok) {
                    // Handle server errors from the function
                    throw new Error(result.error || `HTTP error! status: ${response.status}`);
                }

                // Success
                footerEmailInput.value = ''; // Clear input
                footerFormMessage.textContent = result.message || 'Thank you for subscribing!'; // Use message from function if available
                footerFormMessage.style.color = 'var(--color-accent)'; // Apply accent color
                footerFormMessage.style.display = 'block';

            } catch (error) {
                console.error('Footer subscription failed:', error);
                // Display the error message from the function or a generic one
                footerFormMessage.textContent = error.message.includes('HTTP error') ? 'Subscription failed. Please try again.' : error.message;
                footerFormMessage.style.color = '#dc3545'; // Red color for error
                footerFormMessage.style.display = 'block';
            } finally {
                // Re-enable button after a short delay
                setTimeout(() => {
                    footerSubscribeButton.disabled = false;
                    footerSubscribeButton.textContent = 'Subscribe';
                }, 2000); // Re-enable after 2 seconds
            }
        });
    }
    // ===== End Footer Newsletter Form Handling =====

    // ===== Loading Screen Logic (Runs Once Per Session for Landing Page) Start =====
    const loadingScreen = document.getElementById('loading-screen');
    const loadingTextElement = document.getElementById('loading-text');
    const loadingSessionKey = 'hasVisitedLandingPage'; // Use the specific key

    if (document.body.classList.contains('landing-page-body')) { // Check if we are on the landing page
        if (sessionStorage.getItem(loadingSessionKey)) {
            if (loadingScreen) {
                loadingScreen.style.opacity = '0';
                loadingScreen.style.pointerEvents = 'none';
                setTimeout(() => { loadingScreen.style.display = 'none'; }, 0);
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
                const wordsSequence = [ /* ... words sequence ... */
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
                  } catch (error) {
                      console.error("Error loading anim:", error);
                      if (loadingScreen) {
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
             let missing = [];
             if (!loadingScreen) missing.push("#loading-screen");
             if (!loadingTextElement) missing.push("#loading-text");
             if (missing.length > 0 && document.body.classList.contains('landing-page-body')) {
                console.error(`Loading screen HTML elements not found: ${missing.join(', ')}`);
             }
             if (loadingScreen) loadingScreen.style.display = 'none';
        }
    } else {
        if (loadingScreen) {
             loadingScreen.style.display = 'none';
        }
    }
    // ===== Loading Screen Logic End =====


    // ===== Timer Popup Logic Start =====
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
    const popupCloseButton = document.getElementById('popup-close-button'); // Get close button

    // Only proceed if the popup HTML exists on the page
    if (popup && popupStep1 && popupStep2 && popupNameInput && popupEmailInput && popupNextButton && popupSubmitButton && popupSubmitting && popupSuccess && popupError) {

        const TIME_THRESHOLD = 60 * 1000; // 60 seconds
        const STORAGE_KEY_ELAPSED = 'popupTotalElapsedTime';
        const STORAGE_KEY_START = 'popupTimerStartTime';
        const STORAGE_KEY_TRIGGERED = 'popupTriggered';
        const STORAGE_KEY_COMPLETED = 'popupCompleted';
        const STORAGE_KEY_NAME = 'popupCurrentName';

        let timerInterval = null;
        let pageLoadTime = Date.now();

        const checkTimerAndShowPopup = () => {
            let totalElapsed = parseInt(localStorage.getItem(STORAGE_KEY_ELAPSED) || '0', 10);
            let timeSincePageLoad = Date.now() - pageLoadTime;
            let currentTotalTime = totalElapsed + timeSincePageLoad;

            if (currentTotalTime > TIME_THRESHOLD && !localStorage.getItem(STORAGE_KEY_COMPLETED)) {
                if (!popup.classList.contains('popup-visible')) {
                     console.log("Time threshold reached, triggering popup.");
                     localStorage.setItem(STORAGE_KEY_TRIGGERED, 'true');
                     showPopup();
                }
                if (timerInterval) clearInterval(timerInterval);
            }
        };

        // MODIFIED showPopup function
        const showPopup = () => {
            console.log("Showing Popup");
            // 1. Apply CSS classes first to hide overflow
            document.documentElement.classList.add('popup-open');
            document.body.classList.add('popup-open');
            // 2. Then stop Lenis scrolling (if lenis exists and was initialized)
            if (lenis) {
                lenis.stop();
            }
            // 3. Continue with the rest of the popup display logic
            popupStep1.style.display = 'block';
            popupStep2.style.display = 'none';
            popupSubmitting.style.display = 'none';
            popupSuccess.style.display = 'none';
            popupError.style.display = 'none';
            popupNextButton.style.display = 'block';
            popupSubmitButton.style.display = 'none';
            popupNameInput.value = localStorage.getItem(STORAGE_KEY_NAME) || '';

            // Check if NOT on landing page before setting focus
            const isLandingPage = document.body.classList.contains('landing-page-body');

            if (localStorage.getItem(STORAGE_KEY_NAME)) {
                popupStep1.style.display = 'none';
                popupStep2.style.display = 'block';
                popupNextButton.style.display = 'none';
                popupSubmitButton.style.display = 'block';
                // Only focus if not landing page
                if (!isLandingPage) {
                    requestAnimationFrame(() => popupEmailInput.focus());
                }
            } else {
                 // Only focus if not landing page
                 if (!isLandingPage) {
                     requestAnimationFrame(() => popupNameInput.focus());
                 }
            }

            popup.style.display = 'flex';
            setTimeout(() => { popup.classList.add('popup-visible'); }, 10); // Fade in
        };

        // MODIFIED hidePopup function
        const hidePopup = () => {
            // Check if lenis exists AND if we are NOT on the landing page
            if (lenis && !document.body.classList.contains('landing-page-body')) {
                lenis.start(); // Start Lenis scrolling only if not on landing page
            }
            // Always remove classes to allow default overflow
            document.documentElement.classList.remove('popup-open');
            document.body.classList.remove('popup-open');
            // Hide popup element
            popup.classList.remove('popup-visible');
            setTimeout(() => { popup.style.display = 'none'; }, 400); // Wait for fade out
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
                    pageLoadTime = Date.now(); // Reset page load time when saving
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
                        pageLoadTime = Date.now(); // Reset timer on becoming visible
                        if (timerInterval) clearInterval(timerInterval); // Clear just in case
                        if (localStorage.getItem(STORAGE_KEY_TRIGGERED) !== 'true') {
                           timerInterval = setInterval(checkTimerAndShowPopup, 5000);
                        } else {
                             // If already triggered but not completed, show it immediately on visibility change
                             if (!localStorage.getItem(STORAGE_KEY_COMPLETED)) {
                                 if (!popup.classList.contains('popup-visible')) { showPopup(); }
                             }
                        }
                    }
                }
            });

        } else {
             console.log("Popup already completed according to localStorage.");
        }

        // --- Add Enter Key Submission for Popup Inputs ---
        if (popupNameInput && popupNextButton) {
          popupNameInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
              event.preventDefault();
              popupNextButton.click();
            }
          });
        }
        if (popupEmailInput && popupSubmitButton) {
          popupEmailInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.keyCode === 13) {
              event.preventDefault();
              popupSubmitButton.click();
            }
          });
        }
        // --- End Enter Key Submission ---

        // --- Add Popup Close Button Listener ---
        if (popupCloseButton) {
            popupCloseButton.addEventListener('click', () => {
                hidePopup();
                // Optional: Decide if dismissing should also prevent future popups
                // localStorage.setItem(STORAGE_KEY_COMPLETED, 'true'); // Uncomment to prevent future popups on close
            });
        }
        // --- End Popup Close Button Listener ---

        // --- Popup Step Handling ---
        if (popupNextButton) {
            popupNextButton.addEventListener('click', () => {
                const name = popupNameInput.value.trim();
                if (name) {
                    localStorage.setItem(STORAGE_KEY_NAME, name);
                    popupStep1.style.display = 'none'; popupStep2.style.display = 'block';
                    popupNextButton.style.display = 'none'; popupSubmitButton.style.display = 'block';
                     // Only focus if not landing page
                    if (!document.body.classList.contains('landing-page-body')) {
                        popupEmailInput.focus();
                    }
                } else { alert("Please enter your name."); popupNameInput.focus(); }
            });
        }

        // --- Popup Submission Handling ---
        if (popupSubmitButton) {
            popupSubmitButton.addEventListener('click', async () => {
                const name = localStorage.getItem(STORAGE_KEY_NAME);
                const email = popupEmailInput.value.trim();
                if (!email || !/\S+@\S+\.\S+/.test(email)) { alert("Please enter a valid email address."); popupEmailInput.focus(); return; }
                if (!name) { alert("Name is missing."); /* Optionally handle missing name better */ return; }

                console.log("Submitting:", { name, email });
                popupStep1.style.display = 'none'; popupStep2.style.display = 'none';
                popupSubmitting.style.display = 'block'; popupSuccess.style.display = 'none'; popupError.style.display = 'none';

                const endpoint = '/.netlify/functions/submit-popup';

                try {
                    const response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: name, email: email }),
                    });

                    const result = await response.json(); // Try parsing JSON regardless of status

                    if (!response.ok) {
                        console.error(`Function error! Status: ${response.status}`, result);
                        throw new Error(result.error || `HTTP error! status: ${response.status}`);
                    }

                    // Success
                    popupSubmitting.style.display = 'none';
                    popupSuccess.style.display = 'block';
                    const successP = popupSuccess.querySelector('p');
                    if (successP) {
                        successP.style.color = 'var(--color-accent)';
                    }
                    localStorage.setItem(STORAGE_KEY_COMPLETED, 'true');
                    if (timerInterval) clearInterval(timerInterval);
                    setTimeout(hidePopup, 2000);

                } catch (error) {
                    console.error('Submission failed:', error);
                    popupSubmitting.style.display = 'none';
                    popupError.style.display = 'block';
                    const errorP = popupError.querySelector('p');
                    if (errorP) {
                        errorP.textContent = error.message.includes('HTTP error') ? 'Sorry, there was an error. Please try again later.' : error.message; // Show specific error if available
                        errorP.style.color = '#dc3545';
                    }
                    setTimeout(hidePopup, 3000);
                }
            });
        }

    } else {
         if (document.getElementById('timer-popup')) {
            console.error("Timer popup inner elements not found. Popup logic cannot run.");
         }
    }
    // ===== Timer Popup Logic End =====


    // ===== Marquee Banner JS Animation Start =====
    const banner = document.getElementById('announcement-banner');
    const marqueeText = banner ? banner.querySelector('.marquee-text') : null;
    if (banner && marqueeText) { // Only run if banner exists
        // ... (keep existing marquee logic) ...
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
            originalContent = marqueeText.innerHTML; repetitionCount = 1;
            const containerWidth = banner.offsetWidth;
            if (containerWidth <= 0) { return; }
            let currentScrollWidth = marqueeText.scrollWidth;
            while (currentScrollWidth < containerWidth * 2) {
                marqueeText.innerHTML += originalContent; repetitionCount++;
                currentScrollWidth = marqueeText.scrollWidth;
                if (repetitionCount > 10) { break; }
            }
            requestAnimationFrame(() => {
                contentWidth = marqueeText.scrollWidth / repetitionCount;
                if (contentWidth <= 0) { marqueeText.innerHTML = originalContent; return; }
                isSetupComplete = true; position = 0;
                marqueeText.style.transform = `translateX(${position}px)`;
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                animateMarquee();
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
        banner.addEventListener('mouseenter', () => { isPaused = true; });
        banner.addEventListener('mouseleave', () => {
            if (isPaused) { isPaused = false; if (!animationFrameId) { animateMarquee(); } }
        });
        // Use setTimeout to ensure layout is stable before calculating widths
        setTimeout(setupAndStartMarquee, 300);
    }
    // ===== Marquee Banner JS Animation End =====


    // ===== Landing Page Hamburger Menu Toggle Start =====
    const menuToggle = document.querySelector('.landing-menu-toggle');
    if (menuToggle && document.body.classList.contains('landing-page-body')) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            // Add logic to show/hide actual menu if implemented
        });
    }
    // ===== Landing Page Hamburger Menu Toggle End =====


    // ===== Original script.js Logic (Carousel, Sticky Nav, Video Scrub, etc.) Start =====
    // Add checks for element existence before running logic

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
    if (heroCarousel && slides && slides.length > 0 && prevBtn && nextBtn && indicatorContainer) {
        const updateIndicators = (index) => { indicators.forEach((ind, i) => { ind.classList.toggle('active', i === index); ind.setAttribute('aria-current', i === index); }); };
        const showSlide = (index) => { slides.forEach((s, i) => s.classList.toggle('active', i === index)); updateIndicators(index); };
        const changeSlide = (dir) => { if (slides.length <= 1) return; clearInterval(slideInterval); currentSlide = (currentSlide + dir + slides.length) % slides.length; showSlide(currentSlide); startCarousel(); };
        const goToSlide = (index) => { if (index === currentSlide || index < 0 || index >= slides.length) return; clearInterval(slideInterval); currentSlide = index; showSlide(currentSlide); startCarousel(); };
        const startCarousel = () => { clearInterval(slideInterval); if (slides.length > 1) { slideInterval = setInterval(() => changeSlide(1), 4000); } };
        prevBtn.addEventListener('click', () => changeSlide(-1)); nextBtn.addEventListener('click', () => changeSlide(1));
        indicatorContainer.innerHTML = ''; indicators = [];
        slides.forEach((s, i) => { const ind = document.createElement('button'); ind.className = 'carousel-indicator'; ind.dataset.slideTo = i; ind.setAttribute('aria-label', `Go to slide ${i + 1}`); ind.setAttribute('role', 'tab'); ind.addEventListener('click', () => goToSlide(i)); indicatorContainer.appendChild(ind); indicators.push(ind); });
        indicatorContainer.setAttribute('role', 'tablist'); showSlide(currentSlide); startCarousel();
        let touchstartX = 0, touchstartY = 0, touchendX = 0, touchendY = 0; const swipeThreshold = 50;
        heroCarousel.addEventListener('touchstart', (e) => { touchstartX = e.changedTouches[0].screenX; touchstartY = e.changedTouches[0].screenY; clearInterval(slideInterval); }, { passive: true });
        heroCarousel.addEventListener('touchend', (e) => { touchendX = e.changedTouches[0].screenX; touchendY = e.changedTouches[0].screenY; handleSwipe(); startCarousel(); }, { passive: true });
        function handleSwipe() { const dX = touchendX - touchstartX; const dY = touchendY - touchstartY; if (Math.abs(dX) > swipeThreshold && Math.abs(dX) > Math.abs(dY)) { if (dX < 0) changeSlide(1); else changeSlide(-1); } }
    }

    // --- Scroll Logic Handler (Handles Sticky Nav) ---
    const handleScroll = () => {
        // Only run scroll handling if Lenis is active (i.e., not on landing page)
        if (!lenis) return;

        const scrollY = window.scrollY || window.pageYOffset; // Use native scrollY if Lenis not present? Or rely on Lenis event?
                                                            // Let's stick to native scrollY for simplicity here, might need adjustment if Lenis takes over completely

         if (nonStickyNavbar && stickyNavbar && window.innerWidth >= desktopBreakpoint) {
           const nonStickyNavHeight = nonStickyNavbar.offsetHeight;
           const triggerOffset = 35;
           if (nonStickyNavHeight > 0) {
               if (scrollY > nonStickyNavHeight + triggerOffset) { stickyNavbar.classList.add('show'); }
               else { stickyNavbar.classList.remove('show'); }
           } else { stickyNavbar.classList.remove('show'); }
         } else if (stickyNavbar && window.innerWidth < desktopBreakpoint) { stickyNavbar.classList.remove('show'); }
    };
    // Add scroll listener only if not landing page? Or let Lenis handle it?
    // If Lenis is initialized, its 'scroll' event is already updating ScrollTrigger.
    // If Lenis is NOT initialized (landing page), we might need a native listener IF sticky nav was intended there (it isn't).
    // Let's assume sticky nav is only for scrollable pages. If handleScroll was needed on landing, it wouldn't work without Lenis.
    // We'll keep the listener but it might not fire if body overflow is hidden.
    if (stickyNavbar || nonStickyNavbar) {
        handleScroll(); // Initial check
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
     }


    // --- Mobile/Tablet Menu Toggle Logic (for main nav) ---
    const mainMmenuToggles = document.querySelectorAll('#navbar .mobile-menu-toggle, .sticky-navbar .mobile-menu-toggle');
    const mainHamburgerBreakpoint = 1024;
    if (mainMmenuToggles.length > 0) {
        mainMmenuToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                // This toggle logic should work regardless of page type (landing or other)
                // if (window.innerWidth < mainHamburgerBreakpoint) { // This check might be redundant if button is hidden via CSS
                    const targetMenuId = toggle.getAttribute('aria-controls');
                    const targetMenu = document.getElementById(targetMenuId);
                    if (targetMenu) {
                        const isOpen = targetMenu.classList.toggle('is-open');
                        toggle.setAttribute('aria-expanded', isOpen);
                        toggle.innerHTML = isOpen ? '×' : '☰';
                        if (!isOpen) { targetMenu.querySelectorAll('.nav-item.submenu-open').forEach(item => item.classList.remove('submenu-open')); }
                    }
                // }
            });
        });
     }

    // --- Mobile/Tablet Submenu Toggle Logic (for main nav) ---
    const mainSubmenuTriggers = document.querySelectorAll('.sticky-navbar .mobile-nav-menu .nav-item > span');
     if (mainSubmenuTriggers.length > 0) {
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
    // Only run if NOT landing page AND necessary elements/libs exist
    if (!document.body.classList.contains('landing-page-body') && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && scrubVideoElement && scrubSection && scrubContentToPin) {
        gsap.registerPlugin(ScrollTrigger);
        let videoSetupComplete = false;
        scrubVideoElement.onloadedmetadata = function() {
             if (videoSetupComplete || isNaN(scrubVideoElement.duration) || scrubVideoElement.duration <= 0) { return; }
             let startOffset = 0;
             // Recalculate stickyNavbar height here as it might not be ready earlier
             const currentStickyNavbar = document.getElementById('sticky-navbar');
             if (currentStickyNavbar && window.getComputedStyle(currentStickyNavbar).position === 'fixed') {
                 const navHeight = currentStickyNavbar.offsetHeight;
                 const oneRem = parseFloat(getComputedStyle(document.documentElement).fontSize);
                 startOffset = navHeight + oneRem;
             } else {
                 startOffset = 16; // Default offset
             }
             const videoTimeline = gsap.timeline({
                 scrollTrigger: {
                     trigger: scrubSection,
                     start: `top top+=${startOffset}px`,
                     end: () => "+=" + (scrubSection.offsetHeight - scrubContentToPin.offsetHeight),
                     scrub: 1.0,
                     pin: scrubContentToPin,
                     pinSpacing: false,
                     invalidateOnRefresh: true,
                     markers: false
                 },
                 defaults: { ease: "none" }
             });
             videoTimeline.fromTo(scrubVideoElement, { currentTime: 0 }, { currentTime: scrubVideoElement.duration });
             videoSetupComplete = true;
             ScrollTrigger.refresh();
        };
        scrubVideoElement.onerror = function() { console.error("Error loading scrub video."); };
        scrubVideoElement.load();
    }

    // --- Resize Handler for Desktop State Cleanup (for main nav) ---
    let mainResizeTimeout;
    window.addEventListener('resize', () => {
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
            // Refresh ScrollTrigger only if it exists and Lenis is active
            if (lenis && typeof ScrollTrigger !== 'undefined') {
                 ScrollTrigger.refresh();
            }
            // Recalculate sticky nav visibility on resize
            if (stickyNavbar || nonStickyNavbar) { handleScroll(); }
        }, 150);
     }, { passive: true });

    // ===== Original script.js Logic End =====

}); // End DOMContentLoaded
