if ($(".sw-layout").length > 0) {
    $(".sw-layout").each(function () {
        var tfSwCategories = $(this);
        var swiperContainer = tfSwCategories.find(".swiper");
        if (swiperContainer.length === 0) return;
        var preview = swiperContainer.data("preview");
        preview = preview === "auto" ? "auto" : parseInt(preview) || 1;
        var screenXl = swiperContainer.data("screen-xl");
        screenXl = screenXl === "auto" ? "auto" : parseInt(screenXl) || preview;
        var tablet = swiperContainer.data("tablet") || 1;
        var mobile = swiperContainer.data("mobile") || 1;
        var mobileSm = swiperContainer.data("mobile-sm") || mobile;
        var spacingLg = swiperContainer.data("space-lg") || 0;
        var spacingXl = swiperContainer.data("space-xl") || spacingLg;
        var spacingMd = swiperContainer.data("space-md") || 0;
        var spacing = swiperContainer.data("space") || 0;
        var perGroup = swiperContainer.data("pagination") || 1;
        var perGroupMd = swiperContainer.data("pagination-md") || 1;
        var perGroupLg = swiperContainer.data("pagination-lg") || 1;
        var center = swiperContainer.data("slide-center") || false;
        var intitSlide = swiperContainer.data("init-slide") || 0;
        var autoplay = true;
        var paginationType =
            swiperContainer.data("pagination-type") || "bullets";
        var loop =
            swiperContainer.data("loop") !== undefined
                ? swiperContainer.data("loop")
                : false;
        var nextBtn = tfSwCategories.find(".nav-next-layout")[0] || null;
        var prevBtn = tfSwCategories.find(".nav-prev-layout")[0] || null;
        var progressbar =
            tfSwCategories.find(".sw-pagination-layout")[0] ||
            tfSwCategories.find(".sw-progress-layout")[0] ||
            null;
        var swiper = new Swiper(swiperContainer[0], {
            slidesPerView: mobile,
            spaceBetween: spacing,
            speed: 1000,
            centeredSlides: center,
            initialSlide: intitSlide,
            pagination: progressbar
                ? {
                      el: progressbar,
                      clickable: true,
                      type: paginationType,
                  }
                : false,
            observer: true,
            observeParents: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            navigation: {
                clickable: true,
                nextEl: nextBtn,
                prevEl: prevBtn,
            },
            loop: loop,
            breakpoints: {
                575: {
                    slidesPerView: mobileSm,
                    spaceBetween: spacing,
                    slidesPerGroup: perGroup,
                },
                768: {
                    slidesPerView: tablet,
                    spaceBetween: spacingMd,
                    slidesPerGroup: perGroupMd,
                },
                992: {
                    slidesPerView: preview,
                    spaceBetween: spacingLg,
                    slidesPerGroup: perGroupLg,
                },
                1200: {
                    slidesPerView: screenXl,
                    spaceBetween: spacingXl,
                    slidesPerGroup: perGroupLg,
                },
            },
        });
    });
}

if ($(".sw-single").length > 0) {
    $(".sw-single").each(function (index) {
        var tfSwCategories = $(this);
        var effect = tfSwCategories.data("effect");
        var loop = tfSwCategories.data("loop") || false;

        function setParallaxAttributes(element, duration) {
            element.setAttribute("data-swiper-parallax-x", "-400");
            element.setAttribute("data-swiper-parallax-duration", duration);
        }

        var postContentContainer = ".cs-entry__content";
        var sliders = document.querySelectorAll(".animation-sl");

        sliders.forEach(function (slider) {
            var parallaxValue = slider.getAttribute("data-cs-parallax");
            var parallax = !!parallaxValue ? true : false;
            if (parallax) {
                var postContents =
                    tfSwCategories[0].querySelectorAll(postContentContainer);
                if (postContents.length > 0) {
                    postContents.forEach(function (postContent) {
                        setParallaxAttributes(postContent, "800");
                    });
                }
            }
        });

        var postContents =
            tfSwCategories[0].querySelectorAll(postContentContainer);

        var swiperSlider = {
            slidesPerView: 1,
            spaceBetween: 30,
            speed: 1000,
            loop: loop,
            parallax: true,
            navigation: {
                clickable: true,
                nextEl: `.sw-single-next-${index}`,
                prevEl: `.sw-single-prev-${index}`,
            },
            pagination: {
                el: `.sw-pagination-single-${index}`,
                clickable: true,
            },
            on: {
                init: function init() {
                    var _this = this;
                    setTimeout(function () {
                        var initialSlide = _this.slides[_this.activeIndex];
                        if (initialSlide) {
                            var initialContent =
                                initialSlide.querySelector(
                                    postContentContainer
                                );
                            if (initialContent) {
                                initialContent.style.transform = "none";
                            }
                        }
                    }, 100);
                },
                slideChange: function slideChange() {
                    var currentSlide = this.slides[this.activeIndex];
                    postContents.forEach(function (postContent) {
                        if (
                            postContent ===
                            currentSlide.querySelector(postContentContainer)
                        ) {
                            postContent.style.transform = "none";
                        }
                    });
                },
            },
        };

        if (effect === "fade") {
            swiperSlider.effect = "fade";
            swiperSlider.fadeEffect = {
                crossFade: true,
            };
        }
        if (effect === "creative") {
            swiperSlider.effect = "creative";
            swiperSlider.creativeEffect = {
                prev: {
                    shadow: true,
                    translate: [0, 0, -400],
                },
                next: {
                    translate: ["100%", 0, 0],
                },
            };
        }

        tfSwCategories
            .find(".sw-single-next")
            .addClass(`sw-single-next-${index}`);
        tfSwCategories
            .find(".sw-single-prev")
            .addClass(`sw-single-prev-${index}`);
        tfSwCategories
            .find(".sw-pagination-single")
            .addClass(`sw-pagination-single-${index}`);

        new Swiper(tfSwCategories[0], swiperSlider);
    });
}
