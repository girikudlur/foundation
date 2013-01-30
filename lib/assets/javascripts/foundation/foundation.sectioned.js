/*jslint unparam: true, browser: true, indent: 2 */

;(function ($, window, document, undefined) {
  'use strict';

  Foundation.libs = Foundation.libs || {};

  Foundation.libs.sectioned = {
    name: 'sectioned',

    version : '4.0.0.alpha',

    settings : {
      deep_linking: true,
      one_up: false,
      callback: function (){}
    },

    init : function (scope, method, options) {
      this.scope = this.scope || scope;
      Foundation.inherit(this, 'throttle data_options');

      if (typeof method === 'object') {
        $.extend(true, this.settings, method);
      }

      if (typeof method != 'string') {
        this.set_active_from_hash();
        if (!this.settings.init) this.events();

        return this.settings.init;
      } else {
        // fire method
        return this[method].call(this, options);
      }
    },

    events : function () {
      var self = this;
      $(this.scope).on('click.fndtn.sectioned', '.sectioned .title', function (e) {
        console.log(self.data_options($(this).closest('.sectioned')))
        $.extend(true, self.settings, self.data_options($(this).closest('.sectioned')));
        self.toggle_active.call(this, e, self);
      });

      $(window).on('resize.fndtn.sectioned', self.throttle(function () {
        self.resize.call(this);
      }, 100)).trigger('resize');
      
      this.settings.init = true;
    },

    toggle_active : function (e, self) {
      var $this = $(this),
          section = $this.closest('section, .section');

      if (!self.settings.deep_linking) e.preventDefault();

      if (section.hasClass('active')) {
        if ($(window).width() < 769) {
          section.removeClass('active');
        }
      } else {
        if ($(window).width() > 768 || self.settings.one_up) {
          $('.sectioned').find('section, .section').removeClass('active');
        }
        section.addClass('active');
      }
      
      self.settings.callback();
    },

    resize : function () {
      var sections = $('.sectioned');

      if ($(this).width() > 768) {
        sections.each(function() {
          var active_section = $(this).find('section.active, .section.active');
          if (active_section.length > 1) {
            active_section.not(':first').removeClass('active');
          } else if (active_section.length < 1) {
            $(this).find('section, .section').first().addClass('active');
          }
          Foundation.libs.sectioned.position_titles($(this));
        });
      } else {
        sections.each(function() {
          Foundation.libs.sectioned.position_titles($(this), false);
        });
      }
    },

    set_active_from_hash : function () {
      var hash = window.location.hash.substring(1);

      if (hash.length > 0 && this.settings.deep_linking) {
        $(this.scope)
          .find('.sectioned')
          .find('.content[data-slug=' + hash + ']')
          .closest('section, .section')
          .addClass('active');
      }
    },

    position_titles : function (section, off) {
      var titles = section.find('.title'),
          previous_width = 0;

      if (typeof off === 'boolean') {
        titles.attr('style', '');
      } else {
        titles.each(function () {
          $(this).css('left', previous_width);
          previous_width += $(this).width();
        });
      }
    },

    unbind : function () {
      $(this.scope).off('.fndtn.sectioned');
      $(window).off('.fndtn.sectioned');
    }
  };
}(Foundation.zj, this, this.document));