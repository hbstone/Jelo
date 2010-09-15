/** @ignore */
Jelo.mold('Console', function() {
    
    return {
        time : function(fn) {
            // TODO: refactor when the console is not dependant on firebug
            if ('console' in window) {
                var id = 'jelo-console-time-' + Jelo.uID();
                console.time(id);
                fn();
                console.timeEnd(id);
            } else {
                var then = new Date();
                fn();
                alert('Time: ' + ((new Date()) - then) + 'ms');
            }
        }
    };
    
}());
