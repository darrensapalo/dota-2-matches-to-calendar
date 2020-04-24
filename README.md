# Dota 2 games to Google Calendar
> I know I have an addiction, I just want to know how bad it is.

[![Build Status][travis-image]][travis-url]

Automatically fetches your recent DotA 2 games from OpenDota API and inserts them into your Google Calendar as events.

## Example

![Imgur](https://i.imgur.com/wEmKCdF.png)

## Installation

OS X & Linux:

_Unwritten_

Windows:

_Unwritten_

## Usage example

_Unwritten_

## Development setup

```sh
npm install
npm run dev
```

## To do

1. Fix encryption

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
[travis-image]: https://travis-ci.com/darrensapalo/dota-2-matches-to-calendar.svg?branch=master
[travis-url]: https://travis-ci.com/darrensapalo/dota-2-matches-to-calendar
[wiki]: https://github.com/yourname/yourproject/wiki

## Libraries used

1. [OpenDota API](https://docs.opendota.com/#section/Introduction) for fetching dota games.
2. [Google Calendar API for Node.js](https://developers.google.com/calendar/quickstart/nodejs) for inserting calendar events.
3. [RxJS](https://github.com/ReactiveX/rxjs) for handling streams of data.
4. [moment.js](https://momentjs.com/) for handling time related data.

## Credits

1. Hero list retrieved from [Glebsky/dota2-api](https://github.com/Glebsky/dota2-api/blob/feature/data/heroes.json) a fork of [kronusme](https://github.com/kronusme/dota2-api/blob/master/data/heroes.json).
