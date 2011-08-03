(function(window,MooTools) {
    if(!MooTools) {
        throw new Error('HotMilk browser-mootools-version requires MooTools (http://mootools.net/) to run');
    }

    $hotmilk.bare.js$

    MooTools.HotMilk = HotMilk;

    // grab templates
    window.addEvent('domready', function() {
        var ss = document.getElementsByTagName('script');
        for(var i = 0; i < ss.length; i++) {
            var s = ss[i], paths;
            if(s.type === 'text/x-mustache-template' && (paths = s.getAttribute('data-hotmilk-path'))) {
                var pathsArr = paths.split(':');
                for(var j = 0; j < pathsArr.length; j++) {
                    HotMilk.$addTemplate(pathsArr[j], s.text);
                }
            }
        };
    });
})(window,MooTools);
