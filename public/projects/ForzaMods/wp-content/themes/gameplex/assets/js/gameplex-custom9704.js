/*
01 -> Navbar toggle
03 -> search toggle
*/

jQuery(function ($) {
  "use strict";

  jQuery(document).ready(function () {


    /**
    * ======================================
    * preloader
    * ======================================
    */
    if ($(".preloader").length > 0) {
      setTimeout(() => {
        document.querySelector(".preloader").style.display = "none";
      }, 1000);
    }

    /**
     * ======================================
     *  scroll to top with progress
     * ======================================
     */
    if ($(".progress-wrap").length > 0) {
      var progressPath = document.querySelector(".progress-wrap path");
      var pathLength = progressPath.getTotalLength();
      progressPath.style.transition = progressPath.style.WebkitTransition =
        "none";
      progressPath.style.strokeDasharray = pathLength + " " + pathLength;
      progressPath.style.strokeDashoffset = pathLength;
      progressPath.getBoundingClientRect();
      progressPath.style.transition = progressPath.style.WebkitTransition =
        "stroke-dashoffset 10ms linear";
      var updateProgress = function () {
        var scroll = $(window).scrollTop();
        var height = $(document).height() - $(window).height();
        var progress = pathLength - (scroll * pathLength) / height;
        progressPath.style.strokeDashoffset = progress;
      };
      updateProgress();
      $(window).scroll(updateProgress);
      var offset = 50;
      var duration = 800;
      $(window).on("scroll", function () {
        if ($(this).scrollTop() > offset) {
          $(".progress-wrap").addClass("active-progress");
        } else {
          $(".progress-wrap").removeClass("active-progress");
        }
      });
      $(".progress-wrap").on("click", function (event) {
        event.preventDefault();
        $("html, body").animate({ scrollTop: 0 }, duration);
        return false;
      });

      var initialScroll = $(window).scrollTop();
      if (initialScroll >= 100) {
        $(".progress-wrap").addClass("active-progress");
      }
    }

    // magnific-popup
    $('.popup-video').magnificPopup({
      type: 'iframe'
    });


    // // scroll top
    // $(window).scroll(function () {
    //   if ($(window).scrollTop() > 500) {
    //     $(".scrollToTop").addClass("topActive");
    //   } else {
    //     $(".scrollToTop").removeClass("topActive");
    //   }
    // });

    // let device_width = window.innerWidth;
    /**
       * ======================================
       * 09. open search box
       * ======================================
       */
    if ($(".search-popup").length > 0) {
      $(".open-search").on("click", function () {
        $("body").addClass("search-active body-active");
      });

      $(".close-search").on("click", function () {
        $("body").removeClass("search-active body-active");
      });
    }




    $(window).on("scroll", function () {
      var scroll = $(window).scrollTop();
      if (scroll < 100) {
        $(".primary-navbar").removeClass("navbar-active");
        $(".navbar_elementor").removeClass("navbar-active");
      } else {
        $(".primary-navbar").addClass("navbar-active");
        $(".navbar_elementor").addClass("navbar-active");
      }
    });

    var initialScroll = $(window).scrollTop();
    if (initialScroll >= 100) {
      $(".primary-navbar").addClass("navbar-active");
      $(".navbar_elementor").addClass("navbar-active");
    }

    // Navbar Active Class
    var curUrl = $(location).attr("href");
    var checkLink = $('.navbar__list a[href="' + curUrl + '"]');
    var targetClass = checkLink.addClass("active");
    targetClass.parents(".navbar__list li").find(" a").first().addClass("active");

    $(window).on("load resize", function () {
      var windowWidth = $(window).width();
      if (windowWidth < 1200) {
        $("li.menu-item-has-children > a").off("click").on("click", function (event) {
          event.preventDefault();
          var parentLi = $(this).parent();
          parentLi.toggleClass("active");
          parentLi.siblings().removeClass("active").find("ul.dropdown-menu").slideUp();
          $(this).next("ul.dropdown-menu").slideToggle();
        });
      } else {
        $("li.menu-item-has-children > a").off("click").parent().removeClass("active");
        $("ul.dropdown-menu").removeAttr("style");
      }
    });


    /**
     * ======================================
     * 10. mobile menu
     * ======================================
     */

    if ($(".mobile-menu").length > 0) {
      var mobileMenuContent = $(".navbar__menu").html();
      $(".mobile-menu__list").append(mobileMenuContent);
    }


    const initializeNavbar = () => {
      const links = document.querySelectorAll('.primary-navbar nav li.dropdown a[href="#"], .sv-navigation--widget  a[href="#"], a[href="#"].sv--close-menu-side-bar ');

      links.forEach(link => {
        link.removeAttribute('href')

      });
    };

    initializeNavbar();

    $('.mobile-menu li.has-dropdown > a').click(function (event) {
      event.preventDefault(); // Prevent the default link behavior

      // Find the corresponding dropdown menu and slide toggle it
      $(this).siblings('ul').slideToggle();
    });


    // Add 'active' class to the first 'a' tag in the parent element
    $('.mobile-menu li.has-dropdown > a').each(function () {
      $(this).parents('.nav__menu-items li').find('a').first().addClass('navbar__item-active');
    });

    // Function to handle dropdown toggle based on window width
    function handleDropdown() {
      var windowWidth = $(window).width();
      if (windowWidth < 1200) {
        $("li.dropdown > a").off("click").on("click", function (event) {
          event.preventDefault();
          var parentLi = $(this).parent();
          parentLi.toggleClass("navbar__item-active");
          parentLi.siblings().removeClass("navbar__item-active").find("ul.nav__dropdown").slideUp();
          $(this).next("ul.nav__dropdown").stop(true, true).slideToggle();
        });
      } else {
        $("li.dropdown > a").off("click").parent().removeClass("navbar__item-active");
        $("ul.nav__dropdown").removeAttr("style");
      }
    }

    // Call the function on window load and resize
    $(window).on("load resize", function () {
      handleDropdown();
    });

    // Initially call the function to set up the initial state
    handleDropdown();




    $(".open-mobile-menu").on("click", function () {
      $(".mobile-menu__backdrop").addClass("mobile-menu__backdrop-active");
      $(".nav-fade").each(function (i) {
        $(this).css("animation-delay", 0.2 * 1 * i + "s");
      });
      $("body").addClass("overflow-hidden");
      $(".mobile-menu").addClass("show-menu");
      $(".mobile-menu__wrapper").removeClass("nav-fade-active");
    });

    $(".close-mobile-menu, .mobile-menu__backdrop, .mobile-menu__list li a").on("click", function () {
      setTimeout(function () {
        $(".mobile-menu").removeClass("show-menu");
      }, 900);
      setTimeout(function () {
        $(".mobile-menu__backdrop").removeClass("mobile-menu__backdrop-active");
      }, 1100);

      $(".mobile-menu__wrapper").addClass("nav-fade-active");

      $("body").removeClass("overflow-hidden");
    });




    $(window).on("resize", function () {
      $("body").removeClass("body-active search-active");

      // mobile menu
      $(".mobile-menu").removeClass("show-menu");
      $(".mobile-menu__backdrop").removeClass("mobile-menu__backdrop-active");
      $(".mobile-menu__wrapper").addClass("nav-fade-active");
      $("body").removeClass("overflow-hidden");
      $(".mobile-menu .navbar__dropdown-label").removeClass(
        "navbar__item-active"
      );
      $(".mobile-menu .navbar__sub-menu").slideUp(300);

      // sidebar cart
      $(".sidebar-cart").removeClass("sidebar-cart-active");
      $(".cart-backdrop").removeClass("cart-backdrop-active");

      // offcanvas info
      $(".offcanvas-info").removeClass("offcanvas-info-active");
      $(".offcanvas-info-backdrop").removeClass(
        "offcanvas-info-backdrop-active"
      );
    });

    // sec-mar remove with elementor
    $(".elementor").parents(".sec-mar").removeClass("sec-mar");

    // menu style for class add
    $(".navbar__menu > ul > li").slice(-3).addClass("last_nav");

  });
});
