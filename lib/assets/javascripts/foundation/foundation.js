;(function (window, document, undefined) {
  'use strict';

  window.Foundation = {
    name : 'Foundation',

    // global Foundation cache object
    cache : {},

    init : function (scope, libraries, method, options, response) {
      var library_arr,
          args = [scope, method, options, response],
          responses = [];

      if (libraries && typeof libraries === 'string') {
        library_arr = libraries.split(' ');

        if (library_arr.length > 0) {
          for (var i = library_arr.length; i >= 0; i--) {
            responses.push(this.init_lib(library_arr[i], args));
          }
        }
      } else {
        for (var lib in this.libs) {
          responses.push(this.init_lib(lib, args));
        }
      }

      return this.response_obj(responses, args);
    },

    response_obj : function (response_arr, args) {
      for (var callback in args) {
        if (typeof args[callback] === 'function') {
          return args[callback]({
            // only supported in IE9+
            error: response_arr.filter(function (s) {
              if (typeof s === 'string') return s;
            })
          });
        }
      }

      return response_arr;
    },

    init_lib : function (lib, args) {
      // try {
        if (this.libs.hasOwnProperty(lib)) {
          return this.libs[lib].init.apply(this.libs[lib], args);
        }
      // } catch (e) {
      //   return this.error({name: lib, message: 'could not be initialized', more: e.name + ' ' + e.message});
      // }
    },

    inherit : function (scope, methods) {
      var methods_arr = methods.split(' ');

      for (var i = methods_arr.length; i >= 0; i--) {
        if (this.lib_methods.hasOwnProperty(methods_arr[i])) {
          Foundation.libs[scope.name][methods_arr[i]] = this.lib_methods[methods_arr[i]];
        }
      }
    },

    // methods that can be inherited in libraries

    lib_methods: {
      set_data : function (node, data) {
        // this.name references the name of the library calling this method
        var id = this.name + (+new Date());

        Foundation.cache[id] = data;
        node.attr('data-' + this.name + '-id', id);
      },

      get_data : function (node) {
        return Foundation.cache[node.attr('data-' + this.name + '-id')];
      },

      remove_data : function (node) {
        if (node) {
          delete Foundation.cache[node.attr('data-' + this.name + '-id')];
          node.attr('data-' + this.name + '-id', '');
        } else {
          $('[data-' + this.name + '-id]').each(function () {
            delete Foundation.cache[$(this).attr('data-' + this.name + '-id')];
            $(this).attr('data-' + this.name + '-id', '');
          });
        }
      },

      throttle : function(fn, delay) {
        var timer = null;
        return function () {
          var context = this, args = arguments;
          clearTimeout(timer);
          timer = setTimeout(function () {
            fn.apply(context, args);
          }, delay);
        };
      },

      data_options : function (el) {
        var opts = {}, ii, p,
            opts_arr = (el.attr('data-options') || ':').split(';'),
            opts_len = opts_arr.length;

        function trim(str) {
          if (typeof str === 'string') return $.trim(str);
          return str;
        }

        // parse options
        for (ii = opts_len - 1; ii >= 0; ii--) {
          p = opts_arr[ii].split(':');

          if (/true/i.test(p[1])) p[1] = true;
          if (/false/i.test(p[1])) p[1] = false;

          if (p.length === 2) {
            opts[trim(p[0])] = trim(p[1]);
          }
        }

        return opts;
      }
    },

    error : function (error) {
      return 'Foundation error: ' + error.name + ' ' + error.message + '; ' + error.more;
    },

    zj : function () {
      try {
        return Zepto;
      } catch (e) {
        return jQuery;
      }
    }()
  };

  $.fn.foundation = function () {
    var args = [this].concat(Array.prototype.slice.call(arguments, 0));

    return this.each(function () {
      Foundation.init.apply(Foundation, args);

      return this;
    });
  };

}(this, this.document));