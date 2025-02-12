/*----------------------------------------------
*
* [Main Scripts]
*
* Theme    : Brilio
* Version  : 1.0
* Author   : Themeland
* Support  : hridoy1272@gmail.com
* 
----------------------------------------------*/

/*----------------------------------------------

[ALL CONTENTS]

1. Preloader
2. Cursor
3. Smooth Scroll
4. Responsive Menu
5. Navigation
6. Navbar Toggler
7. Magnetic Button
8. Slides
9. Rounded Div
10. Reveal Text
11. Reveal Image
12. Animated Image
13. Filter Items
14. Progress Bar
15. Transition
16. Contact Form

/*----------------------------------------------
1. Preloader
----------------------------------------------*/
(function ($) {
    'use strict';

	$(window).on('load', function () {
		const svg = document.getElementById("loader");
		const tl = gsap.timeline();

		const startShape = "M0 502S175 272 500 272s500 230 500 230V0H0Z";
		const endShape = "M0 2S175 1 500 1s500 1 500 1V0H0Z";

		// Animation for text fading out
		tl.to(".loader-container .loaded", {
			delay: 1.2,
			y: -50,
			opacity: 0,
			duration: 0.6,
		});

		// Animate the SVG morphing from start shape to end shape
		tl.to(svg, {
			duration: 0.6,
			attr: { d: startShape },
			ease: "power1.easeIn",
		}).to(svg, {
			duration: 0.6,
			attr: { d: endShape },
			ease: "power1.easeOut",
		});

		// Move and hide the preloader
		tl.to(".preloader", {
			y: -1000,
			duration: 0.8,
		}).to(".preloader", {
			zIndex: -1,
			display: "none",
		});
	});

}(jQuery));

/*----------------------------------------------
2. Cursor
----------------------------------------------*/
(function ($) {
    'use strict';

    const cursor = document.getElementById('cursor');
    const hoverElements = document.querySelectorAll('a');

    // Helper function to animate the cursor with GSAP
    const animateCursor = (props) => {
        if (cursor) {
            gsap.to(cursor, {
                ...props,
                duration: 0.3,
                ease: props.ease || 'power2.out'
            });
        }
    };

    // Update cursor position on mouse move
    document.addEventListener('mousemove', (e) => {
        animateCursor({ x: e.clientX, y: e.clientY, opacity: 1 });
    });

    // Add hover effects for specified elements
    const addHoverEffects = (element) => {
        element.addEventListener('mouseenter', () => {
            cursor?.classList.add('hovered');
            animateCursor({ scale: 2, opacity: 0, ease: 0.1 });
        });

        element.addEventListener('mouseleave', () => {
            cursor?.classList.remove('hovered');
            animateCursor({ scale: 1, opacity: 1 });
        });
    };

    // Apply hover effects to all elements in hoverElements
    hoverElements.forEach(addHoverEffects);

}(jQuery));

/*----------------------------------------------
3. Smooth Scroll
----------------------------------------------*/
(function ($) {

    'use strict';

	const lenis = new Lenis();
	lenis.on('scroll', ScrollTrigger.update);

	gsap.ticker.add((time) => {
		lenis.raf(time * 1000)
	});

	gsap.ticker.lagSmoothing(0);

}(jQuery));

/*----------------------------------------------
4. Responsive Menu
----------------------------------------------*/
(function ($) {

    'use strict';

    function navResponsive() {

        let navbar = $('.navbar .items');
        let menu = $('#menu .items');

        menu.html('');
        navbar.clone().appendTo(menu);

        $('.menu .icon-arrow-right').removeClass('icon-arrow-right').addClass('icon-arrow-down');
    }

    navResponsive();

    $(window).on('resize', function () {
        navResponsive();
    })

    $('.menu .dropdown-menu').each(function() {

        var children = $(this).children('.dropdown').length;
        $(this).addClass('children-'+children);
    })

    
    $('.menu .nav-item.dropdown').each(function() {

        var children = $(this).children('.nav-link');
        children.addClass('prevent');
    })

    $(document).on('click', '#menu .nav-item .nav-link', function (event) {

        if($(this).hasClass('prevent')) {
            event.preventDefault();
        }

        var nav_link = $(this);

        nav_link.next().toggleClass('show');

        if(nav_link.hasClass('smooth-anchor')) {
            $('#menu').modal('hide');
        }
    })
}(jQuery));

/*----------------------------------------------
5. Navigation
----------------------------------------------*/
(function ($) {

    'use strict';

    var position = $(window).scrollTop();
    var navbar = $('.navbar');
    var topThreshold = 50; // Adjust this value to control when the navbar reappears

    $(document).ready(function() {
        if (position > topThreshold) {
            navbar.hide(); // Hide navbar if not near the top on page load
        }
    });

    $(window).scroll(function () {

        let scroll = $(window).scrollTop();
        let navbar = $('.navbar');

        if (!navbar.hasClass('relative')) {

            if (scroll > topThreshold) { // Scrolling down or up, but not near the top
                navbar.fadeOut('fast'); // Hide the navbar
            } else { // Near the top of the page
                navbar.slideDown('fast'); // Show the navbar
            }

            position = scroll; // Update the position for the next scroll event
		}
    });

    $('.nav-link').each(function() {
        let href = $(this).attr('href');
        if (href.length > 1 && href.indexOf('#') != -1) {
            $(this).addClass('smooth-anchor');
        }
    });

    $(document).on('click', '.smooth-anchor', function (event) {
        event.preventDefault();

        $('html, body').animate({
            scrollTop: $($.attr(this, 'href')).offset().top
        }, 500);
    });

    $(document).on('click', 'a[href="#"]', function (event) {
        event.preventDefault();
    });

    $('.dropdown-menu').each(function () {
        let dropdown = $(this);

        dropdown.hover(function () {
            dropdown.parent().find('.nav-link').first().addClass('active');
        }, function () {
            dropdown.parent().find('.nav-link').first().removeClass('active');
        });
    });

}(jQuery));

/*----------------------------------------------
6. Navbar Toggler
----------------------------------------------*/
(function ($) {

    'use strict';

	$(document).ready(function() {
		$('.navbar-toggler').on('click', function() {
			var offcanvas = $('#offcanvasRight');
			if (offcanvas.hasClass('show')) {
				$(this).removeClass('active');
			} else {
				$(this).addClass('active');
			}
		});

		// Ensure the active class is correctly updated when the offcanvas is closed via other means
		$('#offcanvasRight').on('hidden.bs.offcanvas', function() {
			$('.navbar-toggler').removeClass('active');
		});

		// Immediately remove active class when backdrop is clicked
		$(document).on('click', '.offcanvas-backdrop', function() {
			$('.navbar-toggler').removeClass('active');
		});

		// Add class to navbar-toggler when scroll position is 100px
		$(window).on('scroll resize', function () {
			var scrollPosition = $(window).scrollTop();
			var isMobile = window.innerWidth < 768; // Adjust this value based on your mobile breakpoint
		
			// On resize to mobile, add 'scrolled' class
			if (isMobile) {
				if (scrollPosition < 50) {
					$('.navbar .navbar-toggler').addClass('scrolled');
				}
			}
		
			// Scroll behavior
			if (scrollPosition >= 300) {
				$('.navbar-toggler').addClass('scrolled');
			} else if (scrollPosition >= 50) {
				$('.navbar-toggler').removeClass('scrolled');
			} else if (!isMobile) { // Ensure class is removed on larger screens when scrolling back to the top
				$('.navbar-toggler').removeClass('scrolled');
			}
		});

		// Close the offcanvas when smooth anchor is clicked
		$(document).ready(function() {
			// Detect click event on 'smooth-anchor' links inside the offcanvas
			$('.offcanvas-body').on('click', '.nav-link.smooth-anchor', function() {
				// Hide the offcanvas (just like clicking the toggler to close)
				var offcanvasElement = $('#offcanvasRight');
				var bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement[0]); // Get the offcanvas instance
				bsOffcanvas.hide(); // Close the offcanvas
			});
		});
	});

}(jQuery));

/*----------------------------------------------
7. Magnetic Button
----------------------------------------------*/
(function ($) {

    'use strict';

	$('.magnetic-button')
	.on('mouseenter', function(e) {
		var parentOffset = $(this).offset(),
			relX = e.pageX - parentOffset.left,
			relY = e.pageY - parentOffset.top;
		$(this).find('span').css({top:relY, left:relX})
	})
	.on('mouseout', function(e) {
		var parentOffset = $(this).offset(),
			relX = e.pageX - parentOffset.left,
			relY = e.pageY - parentOffset.top;
		$(this).find('span').css({top:relY, left:relX})
	});

}(jQuery));

/*----------------------------------------------
8. Slides
----------------------------------------------*/
(function ($) {

    'use strict';

    setTimeout(function() {

        $('.no-slider .left').addClass('init');

    }, 1200)

    var animation = function(slider) {

        let image = $(slider + ' .swiper-slide-active img');
        let title = $(slider + ' .title');
        let description = $(slider + ' .description');
        let btn = $(slider + ' .btn');
        let nav = $(slider + ' nav');

        image.toggleClass('aos-animate');
        title.toggleClass('aos-animate');
        description.toggleClass('aos-animate');
        btn.toggleClass('aos-animate');
        nav.toggleClass('aos-animate');

        setTimeout(function() {

            image.toggleClass('aos-animate');
            title.toggleClass('aos-animate');
            description.toggleClass('aos-animate');
            btn.toggleClass('aos-animate');
            nav.toggleClass('aos-animate');

            AOS.refresh();

        }, 100)

        if ($('.full-slider').hasClass('animation')) {

            $('.full-slider .left').addClass('off');
            $('.full-slider .left').removeClass('init');

            setTimeout(function() {

                $('.full-slider .left').removeClass('off');

            }, 200)

            setTimeout(function() {

                $('.full-slider .left').addClass('init');

            }, 1000)

        } else {

            $('.full-slider .left').addClass('init');
        }
    }

    var fullSlider = new Swiper('.full-slider', {

        autoplay: {
            delay: 10000,
        },
        loop: true,
        slidesPerView: 1,
        spaceBetween: 0,
        pagination: {
            el: '.swiper-pagination'
        },
        navigation: false,
        pagination: {
            el: '.swiper-pagination',
            clickable: true
        },
        keyboard: {
            enabled: true,
            onlyInViewport: false
        },
        on: {
            init: function() {

                animation('.full-slider')

                let pagination = $('.full-slider .swiper-pagination');

                pagination.hide();

                setTimeout(function() {

                    pagination.show();

                }, 2000)

            },
            slideChange: function() {

                animation('.full-slider')
            }
        }
    })

    var midSlider = new Swiper('.slider-mid', {

        autoplay: true,
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
		breakpoints: {
            767: {
                slidesPerView: 2,
                spaceBetween: 30
            },
            1023: {
                slidesPerView: 3,
                spaceBetween: 30
            }
        },
        pagination: {
            el: '.swiper-pagination',
            type: "fraction",
        }
    })

	var minSlider = new Swiper(".slider-min", {
		autoplay: true,
        loop: true,
		effect: "creative",
		creativeEffect: {
			prev: {
				shadow: true,
				translate: ["-120%", 0, -500],
			},
			next: {
				shadow: true,
				translate: ["120%", 0, -500],
			},
		},
		pagination: {
            el: '.swiper-pagination',
			type: "fraction",
        },
	});

	minSlider.on('slideChangeTransitionStart', function () {
		$('.testimonial-thumb img').removeClass('animated zoomIn').css('opacity', '0');
	});

	minSlider.on('slideChangeTransitionEnd', function () {
		$('.testimonial-thumb img').addClass('animated zoomIn').css('opacity', '1');
	});

    var sliderDisabled = new Swiper('.no-slider', {

        autoplay: false,
        loop: false,
        keyboard: false,
        grabCursor: false,
        allowTouchMove: false,
        on: {
            init: function() {
                animation('.no-slider')
            }
        }
    })
}(jQuery));

/*----------------------------------------------
9. Rounded Div
----------------------------------------------*/
(function ($) {

    'use strict';

	gsap.to(".rounded-div-wrapper", {
		height: "0px", // Target height
		ease: "power1.out", // Smooth easing
		scrollTrigger: {
			trigger: ".content-round",
			start: "top 80%",
			end: "bottom top",
			scrub: true
		}
	});

}(jQuery));

/*----------------------------------------------
10. Reveal Text
----------------------------------------------*/
(function ($) {

    'use strict';

    const splitTypes = document.querySelectorAll(".reveal-text");
    const rootStyles = getComputedStyle(document.documentElement);
    
    // Get initial colors
    let primaryColor = rootStyles.getPropertyValue('--primary-t-color').trim();
    let secondaryColor = rootStyles.getPropertyValue('--primary-t-color-2').trim();

    // Check for 'odd' class in body or parent
    if (document.body.classList.contains('odd')) {
        primaryColor = rootStyles.getPropertyValue('--secondary-t-color').trim();
        secondaryColor = rootStyles.getPropertyValue('--secondary-t-color-2').trim();
    }

    splitTypes.forEach((char) => {
        const text = new SplitType(char, { types: 'words, chars' });

        gsap.fromTo(text.chars,
            { color: secondaryColor }, // Initial color from SCSS variable
            {
                color: primaryColor, // Target color from SCSS variable
                scrollTrigger: {
                    trigger: char,
                    start: 'top 80%',
                    end: 'top 20%',
                    scrub: true,
                    markers: false
                },
                stagger: 0.1,
            }
        );
    });

}(jQuery));

/*----------------------------------------------
11. Reveal Image
----------------------------------------------*/
(function ($) {

	'use strict';

	let itemAnimate = document.querySelectorAll('.reveal-img');

	itemAnimate.forEach(current => {
		let img = current.querySelector('img');

		let tl = gsap.timeline({
			scrollTrigger: {
				trigger: current,
				toggleActions: 'restart none none reset',
			}
		})

		tl.set(current, {autoAlpha: 1});

		tl.from(current, 1.5, {
			xPercent: -100,
			ease: Power2.out,
		})

		tl.from(img, 1.5, {
			xPercent: 100,
			scale: 1.3,
			delay: -1.5, 
			ease: Power2.out,
		})

	})

}(jQuery));

/*----------------------------------------------
12. Animated Image
----------------------------------------------*/
(function ($) {

    'use strict';

	gsap.to(".animated-image", {
		scrollTrigger: {
			trigger: ".animated-image",
			start: "top bottom",
			end: "bottom top",
			scrub: true,
		},
		transform: "translate3d(0px, -19%, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
        ease: "none",
	});

}(jQuery));

/*----------------------------------------------
13. Filter Items
----------------------------------------------*/
(function ($) {

    'use strict';

    if ( $('.filter-items').length ) {

        $('.explore-area').each(function(index) {

            var count = index + 1;
    
            $(this).find('.filter-items').removeClass('filter-items').addClass('filter-items-'+count);
            $(this).find('.filter-item').removeClass('filter-item').addClass('filter-item-'+count);
            $(this).find('.filter-btn').removeClass('filter-btn').addClass('filter-btn-'+count);
            
            var Shuffle = window.Shuffle;
            var Filter  = new Shuffle(document.querySelector('.filter-items-'+count), {
                itemSelector: '.filter-item-'+count,
                buffer: 1,
            })
    
            $('.filter-btn-'+count).on('change', function (e) {
    
                var input = e.currentTarget;
                
                if (input.checked) {
                    Filter.filter(input.value);
                }
            })
        });

    }

}(jQuery));

/*----------------------------------------------
14. Progress Bar
----------------------------------------------*/
(function ($) {

    'use strict';

	const progressBars = document.querySelectorAll('.progress-bar');

	function showProgress() {
		progressBars.forEach(progressBar => {
			const value = progressBar.dataset.progress;
			progressBar.style.opacity = 1;
			progressBar.style.width = `${value}%`;
		});
	}

	$(document).ready(function () {
        const skillsSection = document.getElementById('skills');

        if (skillsSection) {
            $(window).on('scroll', function () {
                const sectionPos = skillsSection.getBoundingClientRect().top;
                const screenPos = window.innerHeight;

                if (sectionPos < screenPos) {
                    showProgress();
                }
            });
        }
    });

}(jQuery));

/*----------------------------------------------
15. Transition
----------------------------------------------*/
(function ($) {

	'use strict';

	window.onload = function() {
		// Creating a default timeline
		let tl = gsap.timeline({
			defaults: {
				duration: 1,
				ease: "power2.out",
				opacity: 1,
				transformStyle: "preserve-3d"
			} 
		});

		// Timeline Animation
		tl.fromTo(".animate-hero",
			{
				opacity: 0,
				transform: "translate3d(0px, 100px, 0px) skew(0deg, 7deg)"
			},
			{
				transform: "translate3d(0px, 0px, 0px) skew(0deg, 0deg)"
			}, 0
		)
		.fromTo(".animate-top",
			{
				opacity: 0,
				transform: "translate3d(0px, -100px, 0px)"
			},
			{
				transform: "translate3d(0px, 0px, 0px)"
			}, 0
		)
		.fromTo(".animate-bottom",
			{
				opacity: 0,
				transform: "translate3d(0px, 100px, 0px)"
			},
			{
				transform: "translate3d(0px, 0px, 0px)"
			}, 0
		)
		.fromTo(".animate-line",
			{
				opacity: 0,
				transform: "translate3d(0px, 0px, 0px) scale3d(0, 0, 0)"
			},
			{
				transform: "translate3d(0px, 0px, 0px) scale3d(1, 1, 1)"
			}, 0
		)
		.fromTo(".animate-left",
			{
				opacity: 0,
				transform: "translate3d(100px, 0px, 0px)"
			},
			{
				transform: "translate3d(0px, 0px, 0px)"
			}, 0
		)
		.fromTo(".animate-right",
			{
				opacity: 0,
				transform: "translate3d(-100px, 0px, 0px)"
			},
			{
				transform: "translate3d(0px, 0px, 0px)"
			}, 0
		);
	};

}(jQuery));

/*----------------------------------------------
16. Contact Form
----------------------------------------------*/
(function ($) {

	'use strict';

	var form = $('#contact-form');

	var formMessages = $('.form-message');

	$(form).submit(function (e) {

		e.preventDefault();

		var formData = $(form).serialize();

		$.ajax({
			type: 'POST',
			url: $(form).attr('action'),
			data: formData
		})
		.done(function (response) {

			$(formMessages).removeClass('error');
			$(formMessages).addClass('success');

			$(formMessages).text(response);

			$('#contact-form input,#contact-form textarea').val('');
		})
		.fail(function (data) {

			$(formMessages).removeClass('success');
			$(formMessages).addClass('error');

			if (data.responseText !== '') {
				$(formMessages).text(data.responseText);
			} else {
				$(formMessages).text('Oops! An error occured and your message could not be sent.');
			}
		});
	});

}(jQuery));

function sendmessage(){
    alert('YEEEH!! I got that  message');
    window.location.href = 'index.html'; // Redirect to index.html

}



