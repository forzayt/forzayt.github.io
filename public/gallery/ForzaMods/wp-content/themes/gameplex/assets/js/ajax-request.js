jQuery(document).ready(function ($) {

  // handle_team_request
  $(document).on('click', '.request-to-join-btn', function () {
    let teamId = $(this).data('team-id');

    $.ajax({
      url: ajax_object.ajaxurl,
      type: 'POST',
      data: {
        action: 'handle_team_request',
        team_id: teamId
      },
      success: function (response) {
        if (response.success) {
          alert(response.data);
        } else {
          alert(response.data);
        }
      },
      error: function () {
        alert('An error occurred. Please try again.');
      }
    });
  });


  // Mouse effect
  function initCardMouseEffect() {
    $('.team-card').each(function () {
      $(this).on('mousemove', function (e) {
        var rect = this.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

        this.style.setProperty('--x', `${x}px`);
        this.style.setProperty('--y', `${y}px`);
      });
    });
  }
  initCardMouseEffect();

  // Load More functionality
  $('#load-more-teams').on('click', function (e) {
    e.preventDefault();

    var button = $(this),
      page = button.data('page'),
      maxPages = button.data('max-pages'),
      itemsPerPage = button.data('items-per-page'),
      teamUserShow = button.data('team-user-show'),
      teamTemplateOrder = button.data('team-template-order'),
      ajaxUrl = ajax_object.ajaxurl;

    if (page < maxPages) {
      $.ajax({
        url: ajaxUrl,
        type: 'POST',
        data: {
          action: 'load_more_teams',
          page: page,
          items_per_page: itemsPerPage,
          team_user_show: teamUserShow,
          team_template_order: teamTemplateOrder,
        },
        beforeSend: function () {
          button.text('Loading...');
        },
        success: function (response) {
          if (response) {
            $('.team-cards-container').append(response);

            initCardMouseEffect();

            button.data('page', page + 1);

            button.text('View More');

            if (page + 1 >= maxPages) {
              button.remove();
            }
          } else {
            button.remove();
          }
        },
        error: function () {
          button.text('Failed to load');
        }
      });
    } else {
      button.remove();
    }
  });
});
