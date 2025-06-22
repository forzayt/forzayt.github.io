(function ($) {
    "use strict";
	/**
 	 * @param $scope The Widget wrapper element as a jQuery element
	 * @param $ The jQuery alias
	 */


	function mybe_note_undefined($selector, $data_atts) {
		return ($selector.data($data_atts) !== undefined) ? $selector.data($data_atts) : '';
	}


	/**
     * Swiper activation
     * @param $scope
     * @param $
    */
	var WidgetSliderHandler = function($scope, $) {
	    var slider_el = $scope.find(".tp-demo-active").eq(0);
	    if (slider_el.length === 0)
	        return; 
	    var settings            = slider_el.data('settings');
		var arrows              = settings['arrows'];
	    var dots                = settings['dots'];
	    var autoplay            = settings['autoplay'];
	    var autoplay_speed      = parseInt(settings['autoplay_speed']) || 2500;
	    var infinite      = settings['infinite'];
	    var for_xl_desktop      = settings['for_xl_desktop'];
	    var slidesToShow      = settings['slidesToShow'];
	    var for_laptop      = settings['for_laptop'];
	    var for_tablet      = settings['for_tablet'];
	    var for_mobile      = settings['for_mobile'];
	    var for_xs_mobile      = settings['for_xs_mobile'];

	    var tpslider = new Swiper('.tp-demo-active', {
			slidesPerView: for_xl_desktop,
			spaceBetween: 30,
			// direction: 'vertical',
			loop: infinite,
			autoplay: {
				delay: autoplay_speed,
			},
			// If we need pagination
			pagination: {
			  el: '.swiper-pagination',
			  clickable: true,
			},
		  
			// Navigation arrows
			navigation: {
			  nextEl: '.swiper-button-next',
			  prevEl: '.swiper-button-prev',
			},
		  
			// And if we need scrollbar
			// scrollbar: {
			//   el: '.swiper-scrollbar',
			// },
			breakpoints: {
				0: {
				  slidesPerView: for_xs_mobile,
				},
				550: {
				  slidesPerView: for_mobile,
				},
				768: {
				  slidesPerView: for_tablet,
				},
				992: {
				  slidesPerView: for_laptop,
				},
				1200: {
				  slidesPerView: slidesToShow,
				},
				1599: {
				  slidesPerView: for_xl_desktop,
				},
			}
	    });

		if (true !== autoplay) {
			tpslider.autoplay.stop();
		}

	};
	
	// // Make sure you run this code under Elementor.
	$( window ).on( 'elementor/frontend/init', function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/portfolio.default', WidgetSliderHandler );
	} );



}(jQuery));
