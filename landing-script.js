// landing-script.js - For the video landing page (index.html)

document.addEventListener('DOMContentLoaded', () => {

    // ===== Loading Screen Logic (RUNS ONCE PER SESSION for index.html) Start =====
    const loadingScreen = document.getElementById('loading-screen');
    const loadingTextElement = document.getElementById('loading-text'); // Get parent container
    const sessionKey = 'hasVisitedLandingPage'; // Specific key for landing page visit
  
    // Check if the landing page loading screen has already been shown this session
    if (sessionStorage.getItem(sessionKey)) {
      // Already visited this session, hide loader immediately without animation
      if (loadingScreen) {
        loadingScreen.style.opacity = '0'; // Start hidden
        loadingScreen.style.pointerEvents = 'none';
        // Use setTimeout to ensure it's removed after potential initial render flash
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 0);
        console.log("Landing page session active, skipping loading screen animation.");
      }
    } else if (loadingScreen && loadingTextElement) {
      // First visit to landing page this session, show animation
      console.log("First visit to landing page this session, showing loading screen animation.");
  
      // Mark landing page as visited for this session *immediately*
      sessionStorage.setItem(sessionKey, 'true');
  
      // --- Reset state for the animation ---
      loadingScreen.style.opacity = '1';
      loadingScreen.style.display = 'flex';
      loadingScreen.classList.remove('hidden');
      // Typing animation for three lines with colored "you"
      const lines = [
        'unlimited heights',
        'unlimited transformation',
        'unlimited you'
      ];
      // Clear and prepare text container
      loadingTextElement.innerHTML = '<span id="typed"></span>';
      const typed = document.getElementById('typed');
      let lineIndex = 0, charIndex = 0;
      const typeSpeed = 30; // even faster typing speed

      const typeLine = () => {
        const line = lines[lineIndex];
        if (charIndex < line.length) {
          typed.innerHTML += line.charAt(charIndex);
          charIndex++;
          setTimeout(typeLine, typeSpeed);
        } else {
          lineIndex++;
          charIndex = 0;
          if (lineIndex < lines.length) {
            typed.innerHTML += '<br>';
            setTimeout(typeLine, typeSpeed);
          } else {
            // Color the final word "you"
            typed.innerHTML = typed.innerHTML.replace(/you$/, '<span class="accent-word">you</span>');
            // Fade out after typing completes
            setTimeout(() => {
              if (loadingScreen) loadingScreen.classList.add('hidden');
              setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
              }, 600);
            }, 1500);
          }
        }
      };

      // Start typing animation
      typeLine();
    } else {
        // Handle missing loading screen elements on landing page
        let missing = [];
        if (!loadingScreen) missing.push("#loading-screen");
        if (!loadingTextElement) missing.push("#loading-text");
        console.error(`Loading screen HTML elements not found: ${missing.join(', ')}`);
        // Ensure screen doesn't block if missing
        if (loadingScreen) loadingScreen.style.display = 'none';
    }
    // ===== Loading Screen Logic End =====
  
  
    // ===== Marquee Banner JS Animation REMOVED =====
  
  
    // ===== Landing Page Hamburger Menu Toggle Start =====
    const menuToggle = document.querySelector('.landing-menu-toggle');
    // const landingNav = document.getElementById('landing-navigation'); // Get nav if it exists
  
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            // Add logic to show/hide your actual navigation menu here
            // e.g., document.body.classList.toggle('landing-nav-open');
            // if (landingNav) landingNav.classList.toggle('is-open');
            console.log("Landing menu toggled. Expanded:", !isExpanded);
            // You'll need to add the actual menu HTML and CSS separately
        });
    }
    // ===== Landing Page Hamburger Menu Toggle End =====

    // ===== Learnsimple Page “You are human” Animation =====
    if (window.location.pathname.endsWith('learnsimple.html')) {
      const loadingText = document.getElementById('loading-text');
      if (loadingText) {
        // Ensure text is white
        loadingText.style.color = '#fff';

        // Original-timing sequence with delays
        const wordsSequence = [
          { word: "a dreamer", delay: 600 }, { word: "a leader", delay: 560 },
          { word: "a storyteller", delay: 520 }, { word: "a lover", delay: 470 },
          { word: "a rebel", delay: 420 }, { word: "a collaborator", delay: 360 },
          { word: "a daughter", delay: 300 }, { word: "a mentor", delay: 250 },
          { word: "a woman", delay: 210 }, { word: "a mother", delay: 180 },
          { word: "a sister", delay: 150 }, { word: "a creator", delay: 130 },
          { word: "a doer", delay: 110 }, { word: "a trend setter", delay: 95 },
          { word: "a fashionista", delay: 80 }, { word: "a care taker", delay: 70 },
          { word: "a visionary", delay: 60 }, { word: "a trailblazer", delay: 55 },
          { word: "a healer", delay: 50 }, { word: "a protector", delay: 50 },
          { word: "a listener", delay: 50 }, { word: "a multitasker", delay: 50 },
          { word: "a fighter", delay: 50 }, { word: "a nurturer", delay: 50 },
          { word: "a strategist", delay: 50 }, { word: "a explorer", delay: 50 },
          { word: "a provider", delay: 50 }, { word: "a student", delay: 50 },
          { word: "human", delay: 50 }
        ];
        const delay = ms => new Promise(res => setTimeout(res, ms));

        // Looping async animation with original timings
        (async function loopHuman() {
          for (const item of wordsSequence) {
            loadingText.textContent = 'You are ' + item.word;
            await delay(item.delay);
          }
          // Final colored "human"
          loadingText.innerHTML = 'You are <span style="color:#fff">human</span>';
          await delay(1000);
          // Repeat
          loopHuman();
        })();
      }
    }
    // ===== End Learnsimple “You are human” Animation =====
  
  }); // End DOMContentLoaded