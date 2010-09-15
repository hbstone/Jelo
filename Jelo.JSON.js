/**
 * @namespace Provides JavaScript Object Notation services.
 * @name Jelo.JSON
 */
Jelo.mold('JSON', function() {
    /** @private */
    var crockford = /[^,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]/,
        replace = /"(\\.|[^"\\])*"/g;
    
    /** @private */
    function validate(s) {
        return !(crockford.test(s.replace(replace, '')));
    }
    
    /** @private */
    function decode(s) {
        try {
            return validate(s) ? eval('(' + s + ')') : {};
        } catch (e) {
            return {};
        }
    }
    
    /** @private */
    function encode(o) {
        if (!o) {
            return '';
        }
        if (typeof o.toSource == 'function') {
            return o.toSource();
        }
        var buf = [];
        switch (o.constructor) {
            case String :
                return '"' + o + '"';
            case Number :
                return o.toString();
            case Array :
                Jelo.each(o, function(item) {
                    buf.push(encode(item));
                });
                return '[' + buf.join(', ') + ']';
            case Object :
                Jelo.each(o, function(item) {
                    buf.push(encode(item));
                });
                return '{' + buf.join(', ') + '}';
            default :
                return 'null';
        }
    }
    
    /** @scope Jelo.JSON */
    return {
        /**
         * @function
         * @param {String} str A valid JSON-encoded String.
         * @return {Object} The JavaScript object represented by the supplied String.
         */
        decode   : decode,
        /**
         * @function
         * @param {Mixed} obj Any value (String, Object, Array, Number, etc.)
         * @return {String} The JSON representation of the supplied value.
         */
        encode   : encode,
        /**
         * @function
         * @param {String} str A JSON-encoded string.
         * @return {Boolean} True if the supplied string is valid JSON, false if it is unable to be parsed.
         */
        validate : validate
    };
    
}());
