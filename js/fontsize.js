(function ($) {
    var defaultInD = '30';
    if (typeof $ === undefined) {
        var s = document.createElement('script');
        s.setAttribute('src', 'http://code.jquery.com/jquery-latest.min.js');
        document.getElementsByTagName('head')[0].appendChild(s);

        var counter = 1;
        while (typeof jQuery === undefined && counter <= 3) {
            alert('Loading jQuery: ' + counter);
            counter++;
        }
        if (counter === 3) {
            alert('Error loading jQuery');
            return;
        }
    }

    var inD = prompt('Enter screen diagonal in inches:', defaultInD);
    var mmD = inD * 2.54;
    var formatW = screen.width;
    var formatH = screen.height;
    var mmW = Math.sqrt((Math.pow(mmD, 2) * Math.pow(formatW, 2)) / (Math.pow(formatW, 2) + Math.pow(formatH, 2)));
    var mmH = Math.sqrt(Math.pow(mmD, 2) - Math.pow(mmW, 2));
    /* alert(mmW + ' x ' + mmH); */
    var inW = mmW / 2.54;
    var ppi = formatW / inW;
    /* alert(ppi); */

    var body = document.getElementsByTagName('body')[0];
    var el = null;
    var elements = $('h1,h2,h3,h4,h5,h6,p,div,li,th,td,span,a');

    elements.live('mouseover', function (event) {
        var element = event.target;
        if (!$(element).css('old-background')) {
            $(element).css('old-background', $(element).css('background'));
        }
        $(element).css('background', 'highlight');

        if (el != null) {
            body.removeChild(el);
            el = null;
        }
        el = document.createElement(element.tagName);
        $(el).html('&nbsp;');
        body.appendChild(el);

        $(el).css({
            'font-family': $(element).css('font-family'),
            'font-size': $(element).css('font-size'),
            'font-style': $(element).css('font-style'),
            'font-variant': $(element).css('font-variant'),
            'font-weight': $(element).css('font-weight'),
            'text-decoration': $(element).css('text-decoration'),
            'vertical-align': $(element).css('vertical-align'),
            'line-height': $(element).css('line-height'),
        });

        var cm = $(el).height() / ppi * 2.54;
        $(element).attr('title', Math.round(cm * 100) / 100 + 'cm (' + [$(element).css('font-size'), element.style.fontSize].join(' ') + ')');
    });

    elements.live('mouseout', function (event) {
        var element = event.target;
        $(element).css('background', $(element).css('old-background'));
    });

})(jQuery);
