# ray-by-day-js

Demonstration of ray-tracing CGI techniques using the JavaScript language, 
presented in an incremental "day by day" approach where each day's coding 
example builds on the work demonstrated and discussed on previous days.

*(Note that this repository and its companion site are both still a **work-in-progress** as of now (May 2025).  However, most or all graphics functionality in both is working.  Completion of the corresponding narrative content is expected to be completed around the end of June 2025.)*


## Table of Contents

- [Description](#description)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Design and Implementation](#design-and-implementation)
- [License](#license)

# Description

This is the code repository which supports the web site "Ray by Day JS" which can
be found at [stevreut.github.io/ray-by-day-js](https://stevreut.github.io/ray-by-day-js/).  Both that site and this repository are designed to introduce the *ray tracing* technique 
of computerized graphics production, using JavaScript as the language of choice for 
demonstrating the techniques associated with ray tracing.  That being said, it is 
ray tracing which is the core topic of that site and this repository, but the intended 
audience consists of software developers familiar with the JavaScript - or becoming
familiar with it.  The use of JavaScript is arbitrary and the techniques described 
could be implemented in most programming languages.  For that reason, although
JavaScript is used, relatively few advanced features of that language are used and this
is a deliberate choice.

One of the objectives of this repository and its companion web site is to demonstrate
that ray tracing techniques can be implemented without the need for external libraries
or plug-ins.  For that reason, a deliberate choice has been made to use *no* external
resources or libraries and to limit the implementation in this site to only the core
three languages used in web development: HTML, CSS, and JavaScript.

# Technologies

As noted above, this repository contains code in the following languages:

- JavaScript
- CSS
- HTML

In addition, with regard to JavaScript, it should be noted that fairly extensive use is made of these aspects of the language:

- SVG formatting : [Scalable Network Graphics](https://developer.mozilla.org/en-US/docs/Web/SVG)
- the JavaScript Canvas API : [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

# Installation

As this is deliberately a strictly front-end implementation, no installation is necessary.  However, if so desired, portions of the code can be copied (at ones own risk) from this repository and incorporated into other projects provided this is done in accordance with the terms of the license noted herein.

# Usage

This code has been deployed to site [stevreut.github.io/ray-by-day-js](https://stevreut.github.io/ray-by-day-js/) where it can be viewed and used with any up-to-date canvas-enabled web browser.  (The code was tested on Version 136.0.7103.114 of the Chrome browser for mac.)

# Design and Implementation

Given the demonstrative/educational nature of both this repository and its companion web site, the design and implementation is an "open book" in the form of the site itself.  In much of that site, specific segments of code will be pointed out to readers/users, but visitors are also encouraged to peruse the repository or to 
simply view the source code of the web pages in the site.

# License.

https://opensource.org/license/mit/ 

(See also the [LICENSE](https://github.com/stevreut/ray-by-day-js/blob/main/README.md) file in this repository.)

# Author

Steve Reuterskiold: steve.reuterskiold@gmail.com
