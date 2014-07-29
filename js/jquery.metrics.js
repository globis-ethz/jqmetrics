/**************************************************************************/
/* jQMetrics v1.0                                                         */
/* Copyright (C) 2010-2014 Michael Nebeling <nebeling@inf.ethz.ch>        */
/**************************************************************************/
(function ($) {

    var metricsUtils = {
        dim: function (elements) {
            var result = {
                width: 0,
                height: 0
            };

            elements.each(function (index, element) {
                result.width = Math.max(result.width, $(element).width());
                result.height = Math.max(result.height, $(element).height());
            });

            return result;
        },
        area: function (elements) {
            var result = 0;

            elements.each(function (index, element) {
                result += $(element).width() * $(element).height();
            });

            return result;
        },
        visibleArea: function (elements) {
            var result = 0;

            elements.each(function (index, element) {
                if (metricsUtils.visible(element)) {
                    result += $(element).width() * $(element).height();
                }
            });

            return result;
        },
        visibleCount: function (elements) {
            var result = new Object();
            result.displayed = 0;
            result.visible = 0;

            elements.each(function (index, element) {
                var width = $(element).width();
                var height = $(element).height();

                if (metricsUtils.displayed(element)) {
                    result.displayed++;

                    if (metricsUtils.visible(element)) {
                        result.visible++;
                    }
                }
            });

            result.ratio = 0;
            if (result.displayed != 0) {
                result.ratio = result.visible / result.displayed;
            }
            return result;
        },

        displayed: function (element) {
            return ($(element).css('visibility') != 'hidden' && $(element).css('display') != 'none' && $(element).width() > 0 && $(element).height() > 0);
        },
        visible: function (element) {
            if (metricsUtils.displayed(element)) {
                var offset = $(element).offset();
                var scrollTop = $(window).scrollTop();
                var scrollLeft = $(window).scrollLeft();

                return (scrollLeft <= offset.left + $(element).width() && scrollLeft + $(window).width() >= offset.left && scrollTop <= offset.top + $(element).height() && scrollTop + $(window).height() >= offset.top);
            }
            return false;
        },

        resize: function (width, height) {
            if (window.innerWidth) {
                window.innerWidth = width;
                window.innerHeight = height;
            } else {
                document.body.clientWidth = width;
                document.body.clientHeight = height;
            }
        },

        createTextElementWithProperties: function (txt, element) {
            var el = document.createElement('span');
            $(el).text(txt);
            $(el).css({
                'font-family': $(element).css('font-family'),
                'font-size': $(element).css('font-size'),
                'font-style': $(element).css('font-style'),
                'font-weight': $(element).css('font-weight'),
                'text-decoration': $(element).css('text-decoration'),
                'vertical-align': $(element).css('vertical-align'),
                'line-height': $(element).css('line-height')
            });
            return el;
        },

        doubleToText: function (d) {
            return Math.round(d * 100) / 100;
        }
    }

    $.metrics = {

        content: [],
        /* holds all elements attributed to the content area */
        text: [],
        /* holds all elements attributed to the text area */
        media: [],
        /* holds all elements attributed to the media area */
        links: [],
        /* holds all links */

        measurements: [],
        /* used to store measurements for different viewing sizes */

        settings: [ /* contains a number of preset viewing sizes */
            {
                width: 1024,
                height: 768
            },
            {
                width: 1280,
                height: 800
            },
            {
                width: 1440,
                height: 900
            },
            {
                width: 1680,
                height: 1050
            },
            {
                width: 1050,
                height: 1680
            }
  ],

        metrics: { /* contains all metrics for which we want to perform the measurements */
            documentWindowRatio: {
                id: 'docWndRatio',
                name: 'Document-window ratio',

                performMeasurement: function () {
                    return _docArea / _wndArea;
                },
                assessMeasurement: function (measurement) {
                    if (measurement >= 0.85 && measurement <= 1.15) return 'green';
                    if (measurement < 0.60 || measurement > 1.5) return 'red';
                    return 'yellow';
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            vsFactor: {
                id: 'vsFactor',
                name: 'Vertical scroll factor',

                performMeasurement: function () {
                    return $(document).height() / $(window).height();
                },
                assessMeasurement: function (measurement) {
                    if (measurement >= 0.85 && measurement <= 1.15) return 'green';
                    if (measurement < 0.60 || measurement > 1.5) return 'red';
                    return 'yellow';
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            hsFactor: {
                id: 'hsFactor',
                name: 'Horizontal scroll factor',

                performMeasurement: function () {
                    return $(document).width() / $(window).width();
                },
                assessMeasurement: function (measurement) {
                    if (measurement >= 0.85 && measurement <= 1.15) return 'green';
                    if (measurement < 0.60 || measurement > 1.5) return 'red';
                    return 'yellow';
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            contentWindowRatio: {
                id: 'cntWndRatio',
                name: 'Content-window ratio',

                performMeasurement: function () {
                    return _cntArea / _wndArea;
                },
                assessMeasurement: function (measurement) {
                    if (measurement >= 0.85 && measurement <= 1.15) return 'green';
                    if (measurement < 0.60 || measurement > 1.5) return 'red';
                    return 'yellow';
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            wideTextRatio: {
                id: 'wideTxtRatio',
                name: 'Wide text ratio',

                performMeasurement: function () {
                    var hasWideText = function (element) {
                        var threshold = 70; // we say that text with more than 70 characters per line is too wide
                        try {
                            var txt = '';
                            for (var i = 0; i < threshold; i++) { // let's use the character m for measurements
                                txt += 'm';
                            }
                            var el = metricsUtils.createTextElementWithProperties(txt, element);
                            document.body.appendChild(el);
                            var width = $(el).width();
                        } finally {
                            document.body.removeChild(el);
                        }

                        if (width && $(element).width() > width) {
                            if ($(element).width() - width > width / threshold * 10) { // highlight critical text elements
                                $(element).addClass('red');
                            } else {
                                $(element).addClass('yellow');
                            }
                            return true;
                        }
                        return false;
                    };

                    var wideTextArea = 0;
                    text.each(function (index, element) {
                        if (hasWideText(element)) {
                            wideTextArea += $(element).width() * $(element).height() - metricsUtils.area($('img,object,video', element));
                        }
                    });
                    return (_txtArea ? wideTextArea / _txtArea : 0);
                },
                assessMeasurement: function (measurement) {
                    if (measurement <= 0.15) return "green";
                    if (measurement <= 0.25) return "yellow";
                    return "red";
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            smallTextRatio: {
                id: 'smallTxtRatio',
                name: 'Small text ratio',

                performMeasurement: function () {
                    var hasSmallText = function (element) {
                        var threshold = 0.4; // we say that text smaller than 0.4cm is too small
                        try {
                            var txt = 'qÂ';
                            var el = metricsUtils.createTextElementWithProperties(txt, element);
                            document.body.appendChild(el);
                            var height = $(el).height();
                        } finally {
                            document.body.removeChild(el);
                        }

                        var height2cm = height / pixelsPerInch * 2.54;
                        if (height2cm < threshold) {
                            if (threshold - height2cm > 0.1) { // highlight critical text elements
                                $(element).addClass('redText');
                            } else {
                                $(element).addClass('yellowText');
                            }
                            return true;
                        }
                        return false;
                    };

                    var smallTextArea = 0;
                    text.each(function (index, element) {
                        if (hasSmallText(element)) {
                            smallTextArea += $(element).width() * $(element).height() - metricsUtils.area($('img,object,video', element));
                        }
                    });
                    return (_txtArea ? smallTextArea / _txtArea : 0);
                },
                assessMeasurement: function (measurement) {
                    if (measurement <= 0.15) return "green";
                    if (measurement <= 0.25) return "yellow";
                    return "red";
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            visibleTextRatio: {
                id: 'visibleTxtRatio',
                name: 'Visible text ratio',

                performMeasurement: function () {
                    return (_txtArea ? metricsUtils.visibleArea(text) / _txtArea : 0);
                },
                assessMeasurement: function (measurement) {
                    if (measurement > 0.85) return "green";
                    if (measurement > 0.5) return "yellow";
                    return "red";
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            },
            visibleLinkRatio: {
                id: 'visibleLnkRatio',
                name: 'Visible link ratio',

                performMeasurement: function () {
                    return metricsUtils.visibleCount(links);
                },
                assessMeasurement: function (measurement) {
                    if (measurement.ratio < 0.3) return "red";
                    if (measurement.ratio < 0.5) return "yellow";
                    return "green";
                },
                printMeasurement: function (measurement) {
                    return measurement.visible + '/' + measurement.displayed + ' (' + metricsUtils.doubleToText(measurement.ratio) + ')';
                }
            },
            mediaContentRatio: {
                id: 'mediaCntRatio',
                name: 'Media-content ratio',

                performMeasurement: function () {
                    var visibleContent = metricsUtils.visibleArea(content);
                    if (visibleContent) {
                        return metricsUtils.visibleArea(media) / visibleContent;
                    } else {
                        return 0;
                    }
                },
                assessMeasurement: function (measurement) {
                    if (measurement > 0.50) return "green";
                    if (measurement > 0.25) return "yellow";
                    return "red";
                },
                printMeasurement: function (measurement) {
                    return metricsUtils.doubleToText(measurement);
                }
            }
        },

        performMeasurements: function () {
            var values = {
                width: $(window).width(),
                height: $(window).height()
            }

            $.each($.metrics.metrics, function (index, metric) {
                values[index] = $.metrics.metrics[index].performMeasurement();
            });

            return values;
        },

        install: function () {
            var e = document.createElement('div');
            $(e).attr('id', 'jQMetrics');
            $(e).html('Measurements<hr/><div id="measurements"></div><br/><a href="javascript:$.metrics.capture()">Capture</a><br/><br/><div id="setting"></div><div id="settings"></div><br/><div id="metrics"></div>');
            $('body').append(e);

            var settings = [];
            $.each($.metrics.settings, function (index, setting) {
                settings.push('<a href="javascript:metricsUtils.resize(' + setting.width + ', ' + setting.height + ')">' + setting.width + 'x' + setting.height + '</a>');
            });
            $('#settings').html(settings.join(' '));

            var metrics = [];
            $.each($.metrics.metrics, function (index, metric) {
                metrics.push(metric.name + ': <span id="' + metric.id + '"></span>');
            });
            $('#jQMetrics').html(metrics.join('<br/>'));
        },
        init: function () {
            content = $('.markAsContent');
            text = $('.markAsContent h1,.markAsContent h2,.markAsContent h3,.markAsContent h4,.markAsContent h5,.markAsContent h6,.markAsContent p');
            media = $('.markAsContent img,.markAsContent object,.markAsContent video');
            links = $('.markAsContent a');
        },
        update: function () {
            _wndArea = metricsUtils.area($(window));
            _docArea = metricsUtils.area($(document));
            _cntArea = (content.length > 0 ? metricsUtils.area(content) : 0);
            _txtArea = (text.length > 0 ? metricsUtils.area(text) : 0);
            _mediaArea = (media.length > 0 ? metricsUtils.area(media) : 0);

            $('#setting').html($(window).width() + 'x' + $(window).height());

            var values = $.metrics.performMeasurements();
            $.each($.metrics.metrics, function (index, metric) {
                var element = $('#' + metric.id);
                element.html(metric.printMeasurement(values[index]));
                element.removeClass("green yellow red").addClass(metric.assessMeasurement(values[index]));
            });
        },

        capture: function () {
            var values = $.metrics.performMeasurements();
            $.metrics.measurements[values.width + 'x' + values.height] = values;

            var measurements = [];
            for (var setting in $.metrics.measurements) {
                var values = $.metrics.measurements[setting];
                if (!values.documentWindowRatio) {
                    continue; // current workaround as some websites produce weird results
                }
                var delta = (values.contentWindowRatio ? metricsUtils.doubleToText(values.documentWindowRatio - values.contentWindowRatio) : 0);
                if (delta > 0) {
                    delta = '+' + delta;
                } // make sure there's a + in front of positive deltas
                measurements.push('<a href="javascript:$.metrics.restore(\'' + setting + '\')">' + values.width + 'x' + values.height + '</a> <span class="' + $.metrics.metrics['documentWindowRatio'].assessMeasurement(values.documentWindowRatio) + '">' + metricsUtils.doubleToText(values.documentWindowRatio) + '</span> (' + delta + ')');
            }
            $("#measurements").html(measurements.join('<br/>'));
        },
        restore: function (i) {
            var values = $.metrics.measurements[i];
            metricsUtils.resize(values.width, values.height);
        },

        _wndArea: 0,
        /* cache areas for re-use by different metrics */
        _docArea: 0,
        _cntArea: 0,
        _mediaArea: 0,
        _txtArea: 0
    }


    // calibration ////////////////////////////////////////////////////////////////

    var pixelsPerInch = 96;
    var inD = prompt('Enter screen diagonal in inches:', 30);
    var mmD = inD * 2.54;
    var formatW = screen.width;
    var formatH = screen.height;
    var mmW = Math.sqrt((Math.pow(mmD, 2) * Math.pow(formatW, 2)) / (Math.pow(formatW, 2) + Math.pow(formatH, 2)));
    var mmH = Math.sqrt(Math.pow(mmD, 2) - Math.pow(mmW, 2));
    var inW = mmW / 2.54;
    pixelsPerInch = formatW / inW;

    // installation ///////////////////////////////////////////////////////////////

    $(function () {
        $(window).bind('scroll', $.metrics.update);
        $(window).bind('resize', $.metrics.update);

        $('*', 'body').on('dblclick', function (event) {
            var element = event.target;
            if ($(element).attr('id') == 'jQMetrics' || $(element).parents('#jQMetrics').length > 0) {
                return false;
            }
            if (event.type == 'dblclick') {
                if ($(element).hasClass('markAsContent')) {
                    $(element).removeClass('markAsContent');
                } else {
                    $(element).addClass('markAsContent');
                }
                $.metrics.init();
                $.metrics.update();
            }
        })
            .hover(function () {
                    var name = $(this).attr('id') ? $(this).attr('id') : ($(this).attr('name') ? $(this).attr('name') : $(this).prop("tagName").toLowerCase()),
                        msg = 'Double click to mark ' + name + ' as content...';
                    if ($(this).hasClass('markAsContent')) {
                        msg = 'Double click to undo';
                    }
                    if (!$(this).data('oldBackground')) {
                        $(this).data('oldBackground', $(this).css('background'));
                    }
                    $(this).css('background', 'highlight');
                    $(this).attr('title', [msg].join(' '));
                },
                function () {
                    $(this).css('background', $(this).data('oldBackground'));
                });

        $.metrics.init();
        $.metrics.install();
        $.metrics.update();
    });

})(jQuery);
