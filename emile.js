// emile.js (c) 2009 Thomas Fuchs
// Licensed under the terms of the MIT license.

(function(name, parent) {

    var defaultDuration = 0.48, // default duration, ms
        elements = {}, // hash for stopping ALL animation
        mark = 'emile' + (+new Date), // unique string (per page load) to track animated elements
        proxy = document.createElement('div'), // off-page element for CSS parsing
        props = ('backgroundColor borderBottomColor borderBottomWidth borderLeftColor borderLeftWidth borderRightColor borderRightWidth borderSpacing borderTopColor borderTopWidth bottom color fontSize ontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' ');

    function defaultEase(position) { return (-Math.cos(position * Math.PI) / 2) + 0.5; }

    function letterAt(str, index) { return str.substr(index, 1); }

    // determines numerical value according to position (0 means begining and 1 end of animation)
    function interpNumber(source, target, position) {
        var objToReturn = source + (target - source) * position;
        return isNaN(objToReturn) ? objToReturn : objToReturn.toFixed(3);
    }

    // determines color value according to position
    function interpColor(source, target, position) {
        var i=3,
            tmp,
            values = [];

        source = parseColor(source);
        target = parseColor(target);

        while(i--) {
            // ~~ is faster version of Math.floor for positive numbers
            tmp = ~~(source[i] + (target[i] - source[i]) * position);
            values.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp); // validate each value
        }

        return 'rgb(' + values.join(',') + ')';
    }

    // determine whether a property is numerical or color based by examining its value
    function parse(val) {
        var p = parseFloat(val),
            q = ('' + val).replace(/^[\-\d\.]+/,'');

        return (isNaN(p) ? {
            value: q,
            func: interpColor,
            unit: ''
        } : {
            value: p,
            func: interpNumber,
            unit: q
        });
    }

    // parse color to array holding each basic color independently in decimal number
    function parseColor(color) {
        var values = [],
            j = 3;

        if(letterAt(color,0) == 'r') { // rgb format
            color = color.match(/\d+/g);
            while(j--) {
                values.push(~~color[j]);
            }
        } else { // hex format
            // if needed expand short hex (#FFF -> #FFFFFF)
            if(color.length == 4) {
                color = '#' + letterAt(color,1) + letterAt(color,1) + letterAt(color,2) + letterAt(color,2) + letterAt(color,3) + letterAt(color,3);
            }

            // convert hexadecimal to decimal values
            while(j--) {
                values.push(parseInt(color.substr(1 + j*2, 2), 16));
            }
        }

        return values;
    }

    // parses given css style string to js equivalents using browser engine
    function normalize(style) {
        var css,
            rules = {},
            i = props.length,
            value;

        proxy.innerHTML = '<div style="' + style + '"></div>';
        css = proxy.childNodes[0].style;
        while(i--) {
            if((value = css[props[i]])) {
                rules[props[i]] = parse(value);
            }
        }

        return rules;
    }

    function emile(elem, style, opts) {
        opts = opts || {};
        opts.duration = parseFloat(opts.duration, 10);

        var target = normalize(style),
            current = {},
            start = +new Date,
            dur = isNaN(opts.duration) ? defaultDuration : (opts.duration * 1000).toFixed(0),
            easing = opts.easing || defaultEase,
            finish = start + dur,
            curValue;

        // parse css properties
        for(var prop in target) {
            current[prop] = parse(Jelo.CSS.getStyle(elem, prop));
        }

        // stop previous animation
        if (elem[mark]) {
            stopAnimation(elem);
        }

        opts.before && opts.before.call(opts.me, opts);

        // mark element as being animated and start main animation loop
        elem[mark] = setInterval(function() {
            var time = +new Date,
                done = time > finish,
                position = done ? 1 : (time - start) / dur;

            // update element values
            for(var prop in target) {
                curValue = target[prop].func(current[prop].value, target[prop].value, easing(position)) + target[prop].unit;
                Jelo.CSS.setStyle(elem, prop, curValue);
            }

            opts.percent = position;
            opts.during && opts.during.call(opts.me, opts);

            // check for animation end
            if(done) {
                stopAnimation(elem);
                opts.after && opts.after.call(opts.me, opts);
            }
        }, 6);
        elements[elem[mark]] = elem;
    }

    function stopAnimation(elem) {
        if (elem[mark]) {
            if (elements[elem[mark]]) {
                delete elements[elem[mark]];
            }
            clearInterval(elem[mark]);
            elem[mark] = null;
        }
    }

    // declare externs
    emile.stopAnimation = stopAnimation;
    emile.stopAll = function() {
        for (var i in elements) {
            if (elements.hasOwnProperty(i)) {
                stopAnimation(elements[i]);
            }
        }
    };
    emile.animating = function(el) {
        for (var i in elements) {
            if (elements.hasOwnProperty(i) && (!el || (elements[i] == el))) {
                return true;
            }
        }
        return false;
    };
    parent[name] = emile;

}('emile', Jelo.Anim));
