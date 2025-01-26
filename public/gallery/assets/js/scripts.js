
$(function () {

    "use strict";


    if (window.innerWidth > 991) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".main-container .left-side",
                start: "top",
                endTrigger: ".main-container",
                end: "bottom bottom",
                pin: true, 
                pinSpacing: false
            }
        });
    } 

    var awards = new Swiper(".header-ca .awards-swiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 1500,
        autoplay: {
            delay: 5000,
        },
        loop: true,
        pagination: {
            el: ".header-ca .swiper-pagination",
            clickable: true,
        },

        navigation: {
            nextEl: ".header-ca .swiper-button-next",
            prevEl: ".header-ca .swiper-button-prev",
        },
    });

    var team = new Swiper(".about-ca .team-swiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 1500,
        autoplay: {
            delay: 5000,
        },
        loop: true,
        pagination: {
            el: ".about-ca .swiper-pagination",
            clickable: true,
        },

        navigation: {
            nextEl: ".about-ca .swiper-button-next",
            prevEl: ".about-ca .swiper-button-prev",
        },
    });

    $(function () {

        var equalWidth = $(".works-ca .img.square").outerWidth();

        $(".works-ca .img.square").css({
            "height": equalWidth
        });

    });

    $('.accordion .accordion-item').on('click', function() {
        $(this).addClass("active").siblings().removeClass("active");
    });


});