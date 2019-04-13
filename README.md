# Dota 2 games to Google Calendar
> I know I have an addiction, I just want to know how bad it is.

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Downloads Stats][npm-downloads]][npm-url]

This node project reads your recent DotA 2 games and inserts them as calendar events.

![](header.png)

## Installation

OS X & Linux:

```sh
npm install my-crazy-module --save
```

Windows:

```sh
edit autoexec.bat
```

## Usage example

A few motivating and useful examples of how your product can be used. Spice this up with code blocks and potentially more screenshots.

_For more examples and usage, please refer to the [Wiki][wiki]._

## Development setup

Describe how to install all development dependencies and how to run an automated test-suite of some kind. Potentially do this for multiple platforms.

```sh
make install
npm test
```

## Release History

* 0.0.1
    * Initial release. Can now load data from open dota api and create calendar events without creating duplicate events.

## Meta

Reach me on the following portals:

**Twitter:** [@darrensapalo](https://twitter.com/darrensapalo) 

Distributed under the MIT license. See ``LICENSE`` for more information.

## Contributing

1. Fork it (<https://github.com/yourname/yourproject/fork>)
2. Create your feature branch (`git checkout -b feature/fooBar`)
3. Commit your changes (`git commit -am 'Add some fooBar'`)
4. Push to the branch (`git push origin feature/fooBar`)
5. Create a new Pull Request

<!-- Markdown link & img dfn's -->
[npm-image]: https://img.shields.io/npm/v/datadog-metrics.svg?style=flat-square
[npm-url]: https://npmjs.org/package/datadog-metrics
[npm-downloads]: https://img.shields.io/npm/dm/datadog-metrics.svg?style=flat-square
[travis-image]: https://img.shields.io/travis/dbader/node-datadog-metrics/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/dbader/node-datadog-metrics
[wiki]: https://github.com/yourname/yourproject/wiki

## Libraries used

1. [OpenDota API](https://docs.opendota.com/#section/Introduction) for fetching dota games.
2. [Google Calendar API for Node.js](https://developers.google.com/calendar/quickstart/nodejs) for inserting calendar events.
3. [RxJS](https://github.com/ReactiveX/rxjs) for handling streams of data.
4. [moment.js](https://momentjs.com/) for handling time related data.

## Credits

1. Hero list retrieved from [kronusme](https://github.com/kronusme/dota2-api/blob/master/data/heroes.json).