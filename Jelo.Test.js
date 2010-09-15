/**
 * Unit test suite for the Jelo JavaScript Library.
<pre>
    Jelo.Test.add('name your test', function() {
        throw new Error('This test will appear in the "bad" list.');
    });
    Jelo.Test.add('success case', function() {
        // test whatever you need to
        var testPassed = (typeof Jelo == 'object');
        if (!testPassed) {
            // This error will not be thrown, the example passed
            throw new Error('This test will appear in the "good" list.');
        }
    });
    Jelo.Test.run();
</pre>
 * @namespace Jelo.Test
 */
Jelo.mold('Test', function() {
    
    var tests = [];
    
    /** @scope Jelo.Test */
    return {
        add: function(name, fn) {
            if (typeof name == 'string' && typeof fn == 'function') {
                tests.push({
                    name: name,
                    fn: fn
                });
            }
        },
        run: function(args) {
            if (!tests.length) {
                return;
            }
            var good = [],
                bad = [];
            args = args || {};
            Jelo.debug('Jelo.Test running ' + tests.length + ' tests.');
            for (var i = 0, l = tests.length; i < l; i++) {
                var time = (+new Date),
                    test = tests[i],
                    arg = args[test.name];
                try { // have to trap each test, can't move this try outside the loop
                    test.fn.apply(test, arg || []);
                    good.push({
                        passed: true,
                        error: '',
                        test: test,
                        args: args[test.name] || 'none',
                        time: (+new Date) - time + 'ms'
                    });
                } catch(err) {
                    bad.push({
                        passed: false,
                        error: err,
                        test: test,
                        args: args[test.name] || 'none',
                        time: (+new Date) - time + 'ms'
                    });
                }
            }
            Jelo.debug('Jelo.Test complete. ' + good.length + ' passed, ' + bad.length + ' failed.');
            Jelo.debug(good);
            Jelo.debug(bad);
        }
    };
}());
