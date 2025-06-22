$(function() {

    "use strict";

    $(function() {

        var equalWidth = $(".works-ca .img.square").outerWidth();

        $(".works-ca .img.square").css({
            "height": equalWidth
        });

    });


    $('.services-mp .serv-title .tab-title').on('mouseenter', function() {
        var tab_id = $(this).attr('data-tab');
        $('.services-mp .serv-title .tab-title').removeClass('current');
        $(this).addClass('current');

        $('.services-mp .content .item').removeClass('current');
        $("#" + tab_id).addClass('current');

        if ($(this).hasClass('current')) {
            return false;
        }
    });


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


    var wind = $(window);

    wind.on('scroll', function() {
        $(".skill-progress .progres").each(function() {
            var bottom_of_object =
                $(this).offset().top + $(this).outerHeight();
            var bottom_of_window =
                $(window).scrollTop() + $(window).height();
            var myVal = $(this).attr('data-value');
            if (bottom_of_window > bottom_of_object) {
                $(this).css({
                    width: myVal
                });
            }
        });
    });


});