/**
 * headerFixed
 * preventDefault
 * switchMode
 * spliting
 * handleFooter
 * popupAuto
 * handleSidebar
 * goTop
 * hoverMenuOverlay
 * handleVideo
 * oneNavOnePage
 **/

(function ($) {
    ("use strict");

    /* headerFixed
  -------------------------------------------------------------------------*/
    const headerFixed = () => {
        const header = document.querySelector(".header-fixed");
        if (!header) return;
        let isFixed = false;
        const scrollThreshold = 350;
        const handleScroll = () => {
            const shouldBeFixed = window.scrollY >= scrollThreshold;
            if (shouldBeFixed !== isFixed) {
                header.classList.toggle("is-fixed", shouldBeFixed);
                isFixed = shouldBeFixed;
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
    };

    /* preventDefault
  -------------------------------------------------------------------------*/
    const preventDefault = () => {
        $(".link-no-action").on("click", function (e) {
            e.preventDefault();
        });
    };

    /* switchMode
  -------------------------------------------------------------------------*/
    const switchMode = () => {
        const $toggles = $(".toggle-switch-mode");
        const $body = $("body");
        const $logoHeader = $(".main-logo");
        const $logoMobile = $("#logo_header_mobile");
        const tflight = $logoHeader.data("light");
        const tfdark = $logoHeader.data("dark");

        if (!$toggles.length) return;

        const applyLogo = (isDark) => {
            const src = isDark ? tfdark : tflight;
            $logoHeader.attr("src", src);
            $logoMobile.attr("src", src);
        };

        const updateToggles = (isDark) => {
            $toggles.each(function () {
                $(this).toggleClass("active", isDark);
            });
        };

        const savedMode = localStorage.getItem("darkMode");
        const isDarkInitially = savedMode === "enabled";

        $body.toggleClass("dark-mode", isDarkInitially);
        updateToggles(isDarkInitially);
        applyLogo(isDarkInitially);

        $toggles.on("click", function () {
            const isDark = !$body.hasClass("dark-mode");

            $body.toggleClass("dark-mode", isDark);
            updateToggles(isDark);
            applyLogo(isDark);
            localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
        });
    };

    /* spliting
  -------------------------------------------------------------------------*/
    const spliting = () => {
        if ($(".splitting").length) {
            Splitting();
        }
    };

    /* footer accordion
  -------------------------------------------------------------------------*/
    var handleFooter = function () {
        var footerAccordion = function () {
            var args = { duration: 250 };
            $(".footer-heading-mobile").on("click", function () {
                $(this).parent(".footer-col-block").toggleClass("open");
                if (!$(this).parent(".footer-col-block").is(".open")) {
                    $(this).next().slideUp(args);
                } else {
                    $(this).next().slideDown(args);
                }
            });
        };
        function handleAccordion() {
            if (matchMedia("only screen and (max-width: 767px)").matches) {
                if (
                    !$(".footer-heading-mobile").data("accordion-initialized")
                ) {
                    footerAccordion();
                    $(".footer-heading-mobile").data(
                        "accordion-initialized",
                        true
                    );
                }
            } else {
                $(".footer-heading-mobile").off("click");
                $(".footer-heading-mobile")
                    .parent(".footer-col-block")
                    .removeClass("open");
                $(".footer-heading-mobile").next().removeAttr("style");
                $(".footer-heading-mobile").data(
                    "accordion-initialized",
                    false
                );
            }
        }
        handleAccordion();
        window.addEventListener("resize", function () {
            handleAccordion();
        });
    };

    /* popupAuto
  -------------------------------------------------------------------------------------*/
    const popupAuto = () => {
        if (!$(".auto-popup").length) return;
        const $popupContainer = $(".auto-popup");
        const $closeBtn = $(".close-btn");
        window.showPopupWithEffect = function (effect) {
            const eff = effect || $popupContainer.data("effect") || "right";
            $popupContainer
                .hide()
                .removeClass(
                    "effect-left effect-right effect-top effect-bottom"
                )
                .attr("data-effect", eff)
                .addClass("effect-" + eff)
                .fadeIn(0);
        };
        $closeBtn.on("click", function () {
            $popupContainer
                .fadeOut(0)
                .removeClass(
                    "effect-left effect-right effect-top effect-bottom"
                );
        });
        const delay = parseInt($popupContainer.data("delay"), 10) || 0;
        setTimeout(() => showPopupWithEffect(), delay);
    };

    /* handleSidebar
  -------------------------------------------------------------------------------------*/
    const handleSidebar = () => {
        if (!$(".show-sidebar").length) return;
        $(".show-sidebar").on("click", () => {
            if ($(window).width() <= 991) {
                $(".left-bar, .overlay-blog").addClass("show");
                $("body").addClass("no-scroll");
            }
        });

        $(".close-filter, .overlay-blog").on("click", () => {
            $(".left-bar, .overlay-blog").removeClass("show");
            $("body").removeClass("no-scroll");
        });
    };

    /* goTop
  -------------------------------------------------------------------------------------*/
    const goTop = () => {
        if ($("div").hasClass("progress-wrap")) {
            var progressPath = document.querySelector(".progress-wrap path");
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition =
                progressPath.style.WebkitTransition = "none";
            progressPath.style.strokeDasharray = pathLength + " " + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition =
                progressPath.style.WebkitTransition =
                    "stroke-dashoffset 10ms linear";
            var updateprogress = function () {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength) / height;
                progressPath.style.strokeDashoffset = progress;
            };
            updateprogress();
            $(window).scroll(updateprogress);
            var offset = 200;
            var duration = 0;
            jQuery(window).on("scroll", function () {
                if (jQuery(this).scrollTop() > offset) {
                    jQuery(".progress-wrap").addClass("active-progress");
                } else {
                    jQuery(".progress-wrap").removeClass("active-progress");
                }
            });
            jQuery(".progress-wrap").on("click", function (event) {
                event.preventDefault();
                jQuery("html, body").animate({ scrollTop: 0 }, duration);
                return false;
            });
        }
    };

    /* hoverMenuOverlay
  -------------------------------------------------------------------------------------*/
    const hoverMenuOverlay = () => {
        if (!$(".main-menu").length) return;
        const MowBody = $("body");
        $(".main-menu .has-child")
            .on("mouseenter", function () {
                MowBody.addClass("menu-overlay-enabled");
            })
            .on("mouseleave", function () {
                MowBody.removeClass("menu-overlay-enabled");
            });
    };

    /* handleVideo
  -------------------------------------------------------------------------------------*/
    const handleVideo = () => {
        if (!$(".tf-video").length) return;

        $(".video_btn_play").on("click", function () {
            const $btn = $(this);
            const $container = $btn.closest(".img-style");
            const $videoWrap = $container.find(".tf-video");
            const $videoPlayer = $videoWrap.find(".fn__video_youtube");
            const $img = $container.find("img");
            if (!$videoPlayer.hasClass("ytp-inited")) {
                $videoPlayer.addClass("ytp-inited");
                $videoPlayer.one("YTPReady", function () {
                    $videoPlayer.YTPPlay();
                });
                $videoPlayer.YTPlayer();
                $img.addClass("hide");
                $videoWrap.show();
                $btn.addClass("active");
            } else {
                if ($btn.hasClass("active")) {
                    $videoPlayer.YTPPause();
                    $btn.removeClass("active");
                    $videoWrap.hide();
                    $img.removeClass("hide");
                } else {
                    $videoPlayer.YTPPlay();
                    $img.addClass("hide");
                    $videoWrap.show();
                    $btn.addClass("active");
                }
            }
        });
    };

    /* oneNavOnePage
  -------------------------------------------------------------------------------------*/
    const oneNavOnePage = () => {
        if (!$(".section-onepage").length) return;
        const $navLinks = $(".nav_link");
        const $sections = $(".section");
        $navLinks.on("click", function (e) {
            e.preventDefault();
            const target = $(this).attr("href");
            $("html, body").animate({ scrollTop: $(target).offset().top }, 0);
            $(".left-bar, #overlay-blog").removeClass("show");
            $("body").removeClass("no-scroll");
        });
        const updateActiveMenu = () => {
            const scrollTop = $(window).scrollTop();
            let current = "";
            $sections.each(function () {
                const $section = $(this);
                const top = $section.offset().top - 200;
                const bottom = top + $section.outerHeight();
                if (scrollTop >= top && scrollTop < bottom)
                    current = $section.attr("id");
            });
            $navLinks
                .removeClass("active")
                .filter(`[href="#${current}"]`)
                .addClass("active");
        };
        $(window).on("scroll", updateActiveMenu);
        updateActiveMenu();
    };

    // Dom Ready
    $(function () {
        headerFixed();
        preventDefault();
        switchMode();
        spliting();
        handleFooter();
        popupAuto();
        handleSidebar();
        goTop();
        hoverMenuOverlay();
        handleVideo();
        oneNavOnePage();
    });
})(jQuery);
