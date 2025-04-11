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
      loadingTextElement.innerHTML = 'You are a <span id="loading-word">friend</span>';
      const loadingWordSpan = document.getElementById('loading-word'); // Get span after setting innerHTML
  
      if (loadingWordSpan) {
          // Use the latest word sequence
          const wordsSequence = [
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
              console.log("Loading animation complete, screen hidden.");
            } catch (error) {
                console.error("Error during loading animation:", error);
                // Simplified error handling: just hide the screen
                if (loadingScreen) {
                   loadingScreen.style.opacity = '0';
                   loadingScreen.style.pointerEvents = 'none';
                   loadingScreen.style.display = 'none';
                }
            }
          };
          // Start the animation immediately
          animateWords();
      } else {
          console.error("#loading-word span not found after reset!");
          if (loadingScreen) loadingScreen.style.display = 'none'; // Hide if essential part missing
      }
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
  
  }); // End DOMContentLoaded
  