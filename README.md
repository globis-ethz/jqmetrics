jQMetrics
=========

jQMetrics is a prototype implementation of an evaluation tool for web developers and designers to perform measurements along the metrics defined in our [CHI 2011 Paper](http://dl.acm.org/citation.cfm?id=1979164). Measurements are based on JavaScript using jQuery for determining the DPI value of your screen and the appropriate font size.

jQMetrics was originally created by [Michael Nebeling](http://www.michael-nebeling.de) in the [Global Information Systems Group](http://www.globis.ethz.ch) at ETH Zurich. It is available as free open-source software distributed under the GPLv3 license. See the file LICENSE for more information.

Should you have any questions or comments, please feel free to [send an email to Michael Nebeling](mailto:michael.nebeling@gmail.com).

**Note: Please cite the [CHI 2011 Paper](http://dl.acm.org/citation.cfm?id=1979164) if you are using jQMetrics in your academic projects.**

## Usage

jQMetrics needs to be included using the following statements:

```html
<!-- include jQuery -->
<script src="http://code.jquery.com/jquery-latest.min.js" type="text/javascript"></script>

<!-- include jQMetrics -->
<script src="js/jquery.metrics.js" type="text/javascript"></script>
<link href="css/jqmetrics.css" type="text/css" rel="stylesheet" />
```

As illustrated below, it will then load the jQMetrics interface and allow elements to be selected and included in the measurements.
All elements of class `markAsContent` will be included.

![jqmetrics](jqmetrics.png)

## Examples

The following examples illustrate the usage of jQMetrics:

* [globis.html](examples/globis.html): Example peb page showing how jQMetrics can be used to perform measurements on web content layout.
* [fontsize.html](examples/fontsize.html): Simple web page with lots of text in different font sizes that was used for informally determining the appropriate font size with respect to different screen settings
* [screensize.html](examples/screensize.html): Simple script included in jQMetrics that is used to determine the DPI value of the screen based on the screen diagonal provided by the user