# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2020-05-04
### Fixed
- Parsed `.env` file correctly, to provide dota account and google calendar id.

## [1.0.0] - 2020-04-30
### Fixed
- Encryption for cleaned up credentials under google cloud function.

### Changed
- README file updated. Instructions on how to use the app was updated.
- Refcatored some code to improve readability. 

### Added
- Added a CHANGELOG.md entry.
- Added a CONTRIBUGING.md entry.  
- Created a `.env` file for simple configuration of the dota user and the 
    google calendar to use.
- Set up `nodemon` for easier development.


## [0.0.1] - 2019
### Added
- Initial release. Can now load data from OpenDotA API and create calendar 
    events without creating duplicate events.
