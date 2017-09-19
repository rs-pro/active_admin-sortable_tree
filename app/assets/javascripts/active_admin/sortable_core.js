//= require jquery.mjs.nestedSortable

window.ActiveAdminSortableEvent = (function() {
  var eventToListeners;
  eventToListeners = {};
  return {
    add: function(event, callback) {
      if (!eventToListeners.hasOwnProperty(event)) {
        eventToListeners[event] = [];
      }
      return eventToListeners[event].push(callback);
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
    return $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
  });
  return $(".index_as_sortable [data-sortable-type]").each(function() {
    var $this, max_levels, tab_hack;
    $this = $(this);
    if ($this.data('sortable-type') === "tree") {
      max_levels = $this.data('max-levels');
      tab_hack = 20;
    } else {
      max_levels = 1;
      tab_hack = 99999;
    }
    return $this.nestedSortable({
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
      update: function() {
        $this.nestedSortable("disable");
        return $.ajax({
          url: $this.data("sortable-url"),
          type: "post",
          data: $this.nestedSortable("serialize")
        }).always(function() {
          $this.find('.item').each(function(index) {
            if (index % 2) {
              return $(this).removeClass('odd').addClass('even');
            } else {
              return $(this).removeClass('even').addClass('odd');
            }
          });
          $this.nestedSortable("enable");
          return ActiveAdminSortableEvent.trigger('ajaxAlways');
        }).done(function() {
          return ActiveAdminSortableEvent.trigger('ajaxDone');
        }).fail(function() {
          return ActiveAdminSortableEvent.trigger('ajaxFail');
        });
      }
    });
  });
});

