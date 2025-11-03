$(document).ready(function() {
    var swiper = new Swiper(".swiper-container-h", {
            // direction: "horizontal",
            effect: "slide",
            autoplay: {
            delay: 10000, 
            disableOnInteraction: false
        },
            parallax: true,
            speed: 1600,
            rtl: true,
            loop: true,
            loopFillGroupWithBlank: !0,
  
            mousewheel: {
              eventsTarged: ".swiper-slide",
              sensitivity: 1
            },
            keyboard: {
              enabled: true,
              onlyInViewport: true
            },
            scrollbar: {
              el: ".swiper-scrollbar",
              hide: false,
              draggable: true
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
                type: "progressbar"
              }
          });
        var swiper = new Swiper(".swiper-container-h1", {
            // direction: "horizontal",
            effect: "slide",
            autoplay: false,
            parallax: true,
            speed: 1600,
            rtl: true,
            loop: true,
            loopFillGroupWithBlank: !0,
            keyboard: {
              enabled: true,
              onlyInViewport: true
            },
            scrollbar: {
              el: ".swiper-scrollbar",
              hide: false,
              draggable: true
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            pagination: {
                el: ".swiper-pagination",
                type: "bullets",
                clickable:"true"
              }
          });
});



  // Simple site loader hide: fade out the loader once the window finishes loading
  window.addEventListener('load', function() {
    const loader = document.getElementById('site-loader');
    if (!loader) return;
    // add hidden class to allow CSS transition (fade out)
    loader.classList.add('hidden');
    // remove from DOM after transition to avoid covering interactions
    setTimeout(() => {
      if (loader && loader.parentNode) loader.parentNode.removeChild(loader);
    }, 450);
  }, { passive: true });

  (function(){
      document.addEventListener('DOMContentLoaded', function(){
        var toggles = document.querySelectorAll('[data-password-toggle]');
        toggles.forEach(function(btn){
          btn.addEventListener('click', function(){
            var id = this.getAttribute('data-password-toggle');
            var input = document.getElementById(id);
            if(!input) return;
            if(input.type === 'password'){
              input.type = 'text';
              this.textContent = 'Hide';
              this.setAttribute('aria-pressed', 'true');
            } else {
              input.type = 'password';
              this.textContent = 'Show';
              this.setAttribute('aria-pressed', 'false');
            }
          });
        });
      });
    })();