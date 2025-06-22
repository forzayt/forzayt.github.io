

$(function () {

    "use strict";

    if (window.innerWidth > 991) {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: ".about-ma .bg-img",
                start: "top",
                endTrigger: ".about-ma",
                end: "bottom bottom",
                pin: true, 
                pinSpacing: false
            }
        });
    }

    var testim = new Swiper(".testimonials-ds .testim-swiper", {
        slidesPerView: 1,
        spaceBetween: 30,
        speed: 1500,
        autoplay: {
            delay: 5000,
        },
        loop: true,
        pagination: {
            el: ".swiper-pagination",
            clickable: true,
        },
    });

    $(function () {
        let cards = gsap.utils.toArray(".cards .card-item");

        let stickDistance = 0;

        let firstCardST = ScrollTrigger.create({
            trigger: cards[0],
            start: "center center"
        });

        let lastCardST = ScrollTrigger.create({
            trigger: cards[cards.length - 1],
            start: "bottom bottom"
        });

        cards.forEach((card, index) => {
            var scale = 1 - (cards.length - index) * 0.025;
            let scaleDown = gsap.to(card, { scale: scale, 'transform-origin': '"50% ' + (lastCardST.start + stickDistance) + '"' });

            ScrollTrigger.create({
                trigger: card,
                start: "center center",
                end: () => lastCardST.start + stickDistance,
                pin: true,
                pinSpacing: false,
                ease: "none",
                animation: scaleDown,
                toggleActions: "restart none none reverse"
            });
        });
    });

    $('.accordion .accordion-item').on('click', function() {
        $(this).addClass("active").siblings().removeClass("active");
    });

});
