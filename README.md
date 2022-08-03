# Save your Dota 2 games to your Google Calendar
> I know I have an addiction, I just want to know how bad it is.

[![Build Status](https://travis-ci.org/darrensapalo/dota-2-matches-to-calendar.svg?branch=master)](https://travis-ci.org/darrensapalo/dota-2-matches-to-calendar)

Automatically fetches your DotA 2 games from the OpenDota API and creates new Google Calendar events.

## Example

![Imgur](https://imgur.com/VsFxAmb.png)

## Installation

1. Clone the application.

```bash
git clone https://github.com/darrensapalo/dota-2-matches-to-calendar
```

2. Install the dependencies.

```bash
npm install
```

3. Start the application.

```bash
npm run start
```

4. After running the project for the first time, it will ask you to authenticate yourself via Google. 


This is so that it can access your calendar to create 
calendar events for you.
1. Visit the link it will provide in terminal and follow the instructions in Google.
2. Return to the terminal with your key.
3. It will begin to enter your latest games as calendar events.

## References

### Libraries

1. [OpenDota API][open-dota-api] for fetching dota games.
2. [Google Calendar API for Node.js][gcal-node] for inserting calendar events.
3. [RxJS](https://github.com/ReactiveX/rxjs) for handling streams of data.
4. [moment.js](https://momentjs.com/) for handling time related data.

### Credits

1. Hero list retrieved from [Glebsky/dota2-api][glebsky-dota-api] a fork of 
    [kronusme/dota2-api][kronusme-dota-api].

<!-- References -->
[glebsky-dota-api]: https://github.com/Glebsky/dota2-api/blob/feature/data/heroes.json
[kronusme-dota-api]: https://github.com/kronusme/dota2-api/blob/master/data/heroes.json
[open-dota-api]: https://docs.opendota.com/#section/Introduction
[gcal-node]: https://developers.google.com/calendar/quickstart/nodejs


# Meta

Reach me on the following portals:

- [sapalo.dev](https://sapalo.dev)
- [Twitter](https://twitter.com/darrensapalo) 
- [GitLab](https://gitlab.com/darrensapalo)

_Distributed under the MIT license. See ``LICENSE`` for more information._
