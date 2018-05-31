(function(factory) {
  // UMD export
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
      define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = function(root, jQuery) {
      var w; 
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
            jQuery = require('jquery');
            w = window;
        }
        else {
            jQuery = require('jquery')(root);
            w = root;
        }
      }
      factory(jQuery, w);
      return jQuery;
    };
  } else {
    factory(jQuery, window);
  }
}(function($, window, undefined) {

  var Loading = function(element, options) {
    this.element = element;
    this.settings = $.extend({}, Loading.defaults, options);
    this.settings.fullPage = this.element.is('body');

    this.init();

    if (this.settings.start) {
      this.start();
    }
  };

  Loading.defaults = {

    overlay: undefined,

    zIndex: undefined,

    message: 'Loading...',

    theme: 'light',

    shownClass: 'loading-shown',

    hiddenClass: 'loading-hidden',

    stoppable: false,

    start: true,

    onStart: function(loading) {
      loading.overlay.fadeIn(150);
    },

    onStop: function(loading) {
      loading.overlay.fadeOut(150);
    },

    onClick: function() {}
  };

  Loading.setDefaults = function(options) {
    Loading.defaults = $.extend({}, Loading.defaults, options);
  };

  $.extend(Loading.prototype, {

    init: function() {
      this.isActive = false;
      this.overlay = this.settings.overlay || this.createOverlay();
      this.resize();
      this.attachMethodsToExternalEvents();
      this.attachOptionsHandlers();
    },

    createOverlay: function() {
      var overlay = $('<div class="loading-overlay loading-theme-' + this.settings.theme + '"><div class="loading-overlay-content">' + this.settings.message + '</div></div>')
        .addClass(this.settings.hiddenClass)
        .hide()
        .appendTo('body');

      var elementID = this.element.attr('id');
      if (elementID) {
        overlay.attr('id', elementID + '_loading-overlay');
      }

      return overlay;
    },

    attachMethodsToExternalEvents: function() {
      var self = this;

      self.element.on('loading.start', function() {
        self.overlay
          .removeClass(self.settings.hiddenClass)
          .addClass(self.settings.shownClass);
      });

      self.element.on('loading.stop', function() {
        self.overlay
          .removeClass(self.settings.shownClass)
          .addClass(self.settings.hiddenClass);
      });

      if (self.settings.stoppable) {
        self.overlay.on('click', function() {
          self.stop();
        });
      }

      self.overlay.on('click', function() {
        self.element.trigger('loading.click', self);
      });

      $(window).on('resize', function() {
        self.resize();
      });

      $(function() {
        self.resize();
      });
    },

    attachOptionsHandlers: function() {
      var self = this;

      self.element.on('loading.start', function(event, loading) {
        self.settings.onStart(loading);
      });

      self.element.on('loading.stop', function(event, loading) {
        self.settings.onStop(loading);
      });

      self.element.on('loading.click', function(event, loading) {
        self.settings.onClick(loading);
      });
    },

    calcZIndex: function() {
      if (this.settings.zIndex !== undefined) {
        return this.settings.zIndex;
      } else {
        return (parseInt(this.element.css('z-index')) || 0) + 1 + this.settings.fullPage;
      }
    },

    resize: function() {
      var self = this;

      var element = self.element,
          totalWidth = element.outerWidth(),
          totalHeight = element.outerHeight();

      if (this.settings.fullPage) {
        totalHeight = '100%';
        totalWidth = '100%';
      }

      this.overlay.css({
        position: self.settings.fullPage ? 'fixed' : 'absolute',
        zIndex: self.calcZIndex(),
        top: element.offset().top,
        left: element.offset().left,
        width: totalWidth,
        height: totalHeight
      });
    },

    start: function() {
      this.isActive = true;
      this.resize();
      this.element.trigger('loading.start', this);
    },

    stop: function() {
      this.isActive = false;
      this.element.trigger('loading.stop', this);
    },

    active: function() {
      return this.isActive;
    },

    toggle: function() {
      if (this.active()) {
        this.stop();
      } else {
        this.start();
      }
    },

    destroy: function() {
        this.overlay.remove();
    }

  });

  var dataAttr = 'jquery-loading';

  $.fn.loading = function (options) {
    return this.each(function() {
      var loading = $.data(this, dataAttr);

      if (!loading) {
        if (options === undefined || typeof options === 'object' ||
            options === 'start' || options === 'toggle') {
          $.data(this, dataAttr, new Loading($(this), options));
        }
      } else {
        if (options === undefined) {
          loading.start();
        } else if (typeof options === 'string') {
          loading[options].apply(loading);
        } else {
          $.data(this, dataAttr, new Loading($(this), options));
        }
      }
    });
  };

  $.fn.Loading = function(options) {
    var loading = $(this).data(dataAttr);

    if (!loading || options !== undefined) {
      $(this).data(dataAttr, (loading = new Loading($(this), options)));
    }

    return loading;
  };
  $.expr[':'].loading = function(element) {
    var loadingObj = $.data(element, dataAttr);

    if (!loadingObj) {
      return false;
    }

    return loadingObj.active();
  };

  $.Loading = Loading;

}));