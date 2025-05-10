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
      const typeSpeed = 100; // milliseconds per character

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
            }, 500);
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
      const lsLoadingScreen = document.getElementById('loading-screen');
      const lsLoadingText = document.getElementById('loading-text');
      if (lsLoadingScreen && lsLoadingText) {
        // show the screen
        lsLoadingScreen.style.display = 'flex';
        lsLoadingScreen.style.opacity = '1';
        lsLoadingScreen.classList.remove('hidden');
        // define words sequence
        const humanWords = [
          "dreamer", "leader", "storyteller", "lover", "rebel",
          "collaborator", "daughter", "mentor", "woman", "mother",
          "sister", "creator", "doer", "trend setter", "fashionista",
          "care taker", "visionary", "trailblazer", "healer", "protector",
          "listener", "multitasker", "storyteller", "fighter", "nurturer",
          "strategist", "explorer", "provider", "student", "human"
        ];
        let idx = 0;
        const delay = ms => new Promise(res => setTimeout(res, ms));
        (async function animateHuman() {
          for (; idx < humanWords.length; idx++) {
            lsLoadingText.querySelector('#loading-word').textContent = humanWords[idx];
            await delay(Math.max(600 - idx * 20, 50));
          }
          lsLoadingText.innerHTML = 'You are <span class="accent-word">human</span>';
          await delay(400);
          lsLoadingScreen.classList.add('hidden');
          await delay(600);
          lsLoadingScreen.style.display = 'none';
        })();
      }
    }
    // ===== End Learnsimple “You are human” Animation =====
  
  }); // End DOMContentLoaded