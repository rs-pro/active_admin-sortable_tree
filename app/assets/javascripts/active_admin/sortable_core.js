//= require jquery.mjs.nestedSortable

window.ActiveAdminSortableEvent = (function() {
  var eventToListeners;
  eventToListeners = {};
  return {
    add: function(event, callback) {
      if (!eventToListeners.hasOwnProperty(event)) {
        eventToListeners[event] = [];
      }
      eventToListeners[event].push(callback);
    },
    trigger: function(event, args) {
      var callback, e, i, len, ref, results;
      if (eventToListeners.hasOwnProperty(event)) {
        ref = eventToListeners[event];
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          callback = ref[i];
          try {
            results.push(callback.call(null, args));
          } catch (_error) {
            e = _error;
            if (console && console.error) {
              results.push(console.error(e));
            } else {
              results.push(void 0);
            }
          }
        }
        return results;
      }
    }
  };
})();

$(function() {
  $('.disclose').bind('click', function(event) {
    $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
  });
  $(".index_as_sortable [data-sortable-type]").each(function() {
    var $this, max_levels, tab_hack, getData;
    $this = $(this);


    if ($this.data('sortable-type') === "tree") {
      max_levels = $this.data('max-levels');
      tab_hack = 20;
      getData = function(item) {
        return {
          id: item.data("id"),
          parent_id: item.parent().parent().data("id"),
          prev_id: item.prev().data("id"),
          next_id: item.next().data("id")
        }
      }
    } else {
      max_levels = 1;
      tab_hack = 99999;

      getData = function(item) {
        return $this.nestedSortable("serialize")
      }
    }

    $this.nestedSortable({
      forcePlaceholderSize: true,
      forceHelperSizeType: true,
      errorClass: 'cantdoit',
      disableNesting: 'cantdoit',
      handle: '> .item',
      listType: 'ol',
      items: 'li',
      opacity: .6,
      placeholder: 'placeholder',
      revert: 250,
      maxLevels: max_levels,
      tabSize: tab_hack,
      protectRoot: $this.data('protect-root'),
      tolerance: 'pointer',
      toleranceElement: '> div',
      isTree: true,
      startCollapsed: $this.data("start-collapsed"),
      update: function(event, ui) {
        $this.nestedSortable("disable");
        $.ajax({
          url: $this.data("sortable-url"),
          type: "post",
          data: getData(ui.item)
        }).always(function() {
          $this.find('.item').each(function(index) {
            if (index % 2) {
              $(this).removeClass('odd').addClass('even');
            } else {
              $(this).removeClass('even').addClass('odd');
            }
          });
          $this.nestedSortable("enable");
          ActiveAdminSortableEvent.trigger('ajaxAlways');
        }).done(function() {
          ActiveAdminSortableEvent.trigger('ajaxDone');
        }).fail(function() {
          ActiveAdminSortableEvent.trigger('ajaxFail');
        });
      }
    });
  });
});

