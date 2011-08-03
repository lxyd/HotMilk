(function($) {
    if(!$) {
        throw new Error('HotMilk browser-jquery-version requires jQuery (http://jquery.com/) to run');
    }

    $hotmilk.bare.js$

    $.fn.HotMilk = HotMilk;

    // grab templates
    $(function() {
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
})(jQuery);
