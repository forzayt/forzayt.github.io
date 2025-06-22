/*
01 -> lenis smooth scroll
02 -> cursor effect
03 -> title animation
04 -> content animation
05 -> card tilt animation
06 -> Images parallax
07 -> footer banner animation
08 -> sword animation
09 -> diamond animation
10 -> game console animation
*/

jQuery(function ($) {
  "use strict";

  jQuery(document).ready(function () {

    // // 01 -> lenis smooth scroll
    // const lenis = new Lenis();
    // lenis.on("scroll", ScrollTrigger.update);
    // gsap.ticker.add((time) => {
    //   // lenis.raf(time * 400)
    //   lenis.raf(time * 400);
    // });
    // gsap.ticker.lagSmoothing(0);

    // 02 -> cursor effect


    /**
 * ======================================
 * 23.  cmn banner image animation
 * ======================================
 */
    if (jQuery(".cmn-banner").length > 0) {
      let device_width = window.innerWidth;
      if (device_width >= 768) {
        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".cmn-banner",
            start: "top top",
            end: "+=20%",
            scrub: 1,
            pin: false,
          },
        });
        tl.to(".cmn-banner .thumb-left img", {
          y: "190px",
          duration: 2,
        });
      }
    }

    // if (document.querySelector(".cursor")) {
    //   const cursor = document.querySelector(".cursor");
    //   const cursorScale = document.querySelectorAll(".cursor-scale");
    //   let mouseX = 0;
    //   let mouseY = 0;
    //   let cursorX = 0;
    //   let cursorY = 0;

    //   // Smoothness factor
    //   const smoothFactor = 0.1;

    //   // Mousemove event to track cursor position
    //   window.addEventListener("mousemove", (e) => {
    //     mouseX = e.clientX;
    //     mouseY = e.clientY;
    //   });

    //   // Animation loop for smooth cursor movement
    //   gsap.ticker.add(() => {
    //     cursorX += (mouseX - cursorX) * smoothFactor;
    //     cursorY += (mouseY - cursorY) * smoothFactor;

    //     gsap.set(cursor, {
    //       css: {
    //         left: cursorX,
    //         top: cursorY,
    //       },
    //     });
    //   });

    //   // Handle cursor scaling on hover
    //   cursorScale.forEach((el) => {
    //     el.addEventListener("mousemove", () => {
    //       if (el.classList.contains("growUp")) {
    //         cursor.classList.add("big-cursor");
    //       } else if (el.classList.contains("growDown")) {
    //         cursor.classList.add("small-cursor");
    //       } else if (el.classList.contains("growDown2")) {
    //         cursor.classList.add("small-cursor2");
    //       }
    //     });

    //     el.addEventListener("mouseleave", () => {
    //       cursor.className = "cursor"; // Reset to default class
    //     });

    //   });
    // }

    if (document.querySelector(".cursor")) {
      const cursor = document.querySelector(".cursor");
      const cursorScale = document.querySelectorAll(".cursor-scale");
      let mouseX = 0;
      let mouseY = 0;
      let cursorX = 0;
      let cursorY = 0;

      // Smoothness factor
      const smoothFactor = 0.1;

      // Mousemove event to track cursor position
      window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      });

      // Animation loop for smooth cursor movement
      gsap.ticker.add(() => {
        cursorX += (mouseX - cursorX) * smoothFactor;
        cursorY += (mouseY - cursorY) * smoothFactor;

        gsap.set(cursor, {
          css: {
            left: cursorX,
            top: cursorY,
          },
        });
      });

      // Handle cursor scaling on hover
      cursorScale.forEach((el) => {
        el.addEventListener("mousemove", () => {
          if (el.classList.contains("growUp")) {
            cursor.classList.add("big-cursor");
          } else if (el.classList.contains("growDown")) {
            cursor.classList.add("small-cursor");
          } else if (el.classList.contains("growDown2")) {
            cursor.classList.add("small-cursor2");
          }
        });

        el.addEventListener("mouseleave", () => {
          cursor.className = "cursor"; // Reset to default class
        });
      });

      // Handle cursor-hover class on <button> and <a> hover
      const interactiveElements = document.querySelectorAll("button, a");

      interactiveElements.forEach((el) => {
        el.addEventListener("mouseenter", () => {
          console.log('Adding cursor-hover to cursor'); // Debug log
          cursor.classList.add("cursor-hover");
        });

        el.addEventListener("mouseleave", () => {
          console.log('Removing cursor-hover from cursor'); // Debug log
          cursor.classList.remove("cursor-hover");
        });
      });
    }



    //03 -> title animation
    if ($(".title-anim").length > 0) {
      let char_come = gsap.utils.toArray(".title-anim");
      char_come.forEach((char_come) => {
        let split_char = new SplitText(char_come, {
          type: "chars, words",
          lineThreshold: 0.5,
        });
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: char_come,
            start: "top 90%",
            end: "bottom 60%",
            scrub: false,
            markers: false,
            toggleActions: "play none none none",
          },
        });
        tl2.from(split_char.chars, {
          duration: 0.8,
          x: 70,
          autoAlpha: 0,
          stagger: 0.03,
        });
      });
    }

    //04 -> content animation
    if ($(".content-anim").length > 0) {
      let char_come = gsap.utils.toArray(".content-anim");
      char_come.forEach((char_come) => {
        let split_char = new SplitText(char_come, {
          type: "chars, words",
          lineThreshold: 0.5,
        });
        const tl2 = gsap.timeline({
          scrollTrigger: {
            trigger: char_come,
            start: "top 90%",
            end: "bottom 60%",
            scrub: false,
            markers: false,
            toggleActions: "play none none none",
          },
        });
        tl2.from(split_char.chars, {
          duration: 0.4,
          x: 70,
          autoAlpha: 0,
          stagger: 0.03,
        });
      });
    }
    // 05 -> card tilt animation
    let cardtilt = document.querySelectorAll(".card-tilt");

    if (cardtilt) {
      VanillaTilt.init(document.querySelectorAll(".card-tilt"), {
        max: 5,
        speed: 3000,
      });
    }

    let cardtilt2 = document.querySelectorAll(".card-tilt2");

    if (cardtilt2) {
      VanillaTilt.init(document.querySelectorAll(".card-tilt2"), {
        max: 30,
        speed: 300,
        glare: true,
        "max-glare": 0.5,
        "glare-prerender": false,
        axis: "x",
        scale: 2.1,
        startY: 0,
      });
    }

    // 06 -> Images parallax
    gsap.utils.toArray(".parallax-container").forEach((container) => {
      const img = container.querySelector(".parallax-img");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          scrub: true,
          pin: false,
        },
      });

      tl.fromTo(
        img,
        {
          yPercent: -40,
          ease: "none",
        },
        {
          yPercent: 40,
          ease: "none",
        }
      );
    });
    // 07 -> footer banner animation
    if ($(".footer-banner-img").length > 0) {
      let footerController = new ScrollMagic.Controller();
      let footerScene = new ScrollMagic.Scene({
        triggerElement: "#cta",
      })
        .setTween(".footer-banner-img", {
          right: "0%",
          left: "unset",
          bottom: "0%",
          opacity: 1,
          scale: 1,
        })
        .addTo(footerController);
    }

    // 08 -> sword animation
    if ($(".sword-area").length > 0) {
      let swordController = new ScrollMagic.Controller();
      let swordScene = new ScrollMagic.Scene({
        triggerElement: "#swiper-3d",
        duration: 1000,
      })
        .setTween(".sword-area", {
          right: "unset",
          left: "0%",
          bottom: "0%",
          opacity: 1,
          scale: 1,
        })
        .addTo(swordController);

      let swordScene2 = new ScrollMagic.Scene({
        triggerElement: "#top-player",
        duration: 100,
      })
        .setTween(".sword-area", {
          rotate: "180deg",
        })
        .addTo(swordController);
    }
    // 09 -> diamond animation
    if ($(".diamond-area").length > 0) {
      let diamondController = new ScrollMagic.Controller();
      let diamondScene = new ScrollMagic.Scene({
        triggerElement: "#tournament-hero",
        duration: 1000,
      })
        .setTween(".diamond-area", {
          top: "80%",
          opacity: 1,
        })
        .addTo(diamondController);
    }

    // 10 -> game console animation
    if ($(".game-console-area").length > 0) {
      let gameController = new ScrollMagic.Controller();
      let gameScene = new ScrollMagic.Scene({
        triggerElement: "#tournament-hero",
        duration: 1000,
      })
        .setTween(".game-console-area", {
          top: "80%",
          left: "unset",
          right: "0%",
          opacity: 1,
        })
        .addTo(gameController);
    }

    /**
     * ======================================
     * 12.  category masonry
     * ======================================
     */
    function masonryCategory() {
      if ($(".category-masonry").length) {
        var $grid = $(".category-masonry").isotope({
          layoutMode: "fitRows",
          itemSelector: ".category-item",
        });

        var filterFns = {
          all: function () {
            return true;
          },
        };

        $(".category-filter").on("click", "button", function () {
          var filterValue = $(this).attr("data-filter");
          filterValue = filterFns[filterValue] || filterValue;
          $grid.isotope({
            filter: filterValue
          });
        });

        $(".category-filter").each(function (i, buttonGroup) {
          var $buttonGroup = $(buttonGroup);
          $buttonGroup.on("click", "button", function () {
            $buttonGroup.find(".active").removeClass("active");
            $(this).addClass("active");
          });
        });

        $grid.isotope({
          transitionDuration: "1200ms",
        });
      }
    }

    masonryCategory();

  });
});
