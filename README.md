# next-myft-client [![Build Status](https://travis-ci.org/Financial-Times/next-myft-client.svg?branch=no-unecessary-writes)](https://travis-ci.org/Financial-Times/next-myft-client)
Isomorphic client component for communicating with the myFT api

Communicates with
[next-myft-api](http://github.com/Financial-Times/next-myft-api)
to store preferences Details are stored against users' eRightsID.

Also contains client side polling of User Notifications.

## Relationships and subjects

The following relationships (between actors and subjects) can be accessed in the API and are emitted as events

* followed (topic id)
* prefer (preference id)
* forlater (article uuid)
* recommended (article uuid)
* articleFromFollow (article uuid)

## API

*Note - there are other undocumented methods but these should not be used externally*

### .add(relationship, subject, meta)

Add an entry to the user's preferences e.g. `add('followed', 'sections:"World"', {})`, `add('forlater', '51b53a4e-df64-11e4-a6c4-00144feab7de', {})`

### .remove(relationship, subject) {

Remove an entry from the user's preferences e.g. `remove('followed', 'sections:"World"')`, `remove('forlater', '51b53a4e-df64-11e4-a6c4-00144feab7de')`

### .get(relationship, subject) {

Gets matches when a user has an entry for a specfic topic e.g. `get('followed', 'sections:"World"').then(function(topic){ //gets the entry for the World topic followed  })`


### .has(relationship, subject) {

Assert whether a user has an entry for a specfic topic e.g. `has('followed', 'sections:"World"').then(function(hasFollowed){ //use hasFollowed boolean  })`


### .notifications.clear(uuids, force)

Remove an array of notifications from the user's myft. If force is falsy a check will be run to make sure the notification exists before sending the rquest to clear it

### .notifications.markAsSeen(uuids)

Mark an array of notifications as seen


## Events

These are all fired on `document.body`

### load

Fired when all data for a given relationship has been loaded e.g. `followed:load`. `event.detail` is an object:
```
{
	Count: // number of items returned,
	Items: // the items,
}
```

For `articleFromFollow` notifications event.detail is an object with 3 properties `all`, `unseen` and `new`, all of which have the above structure

### add

Fired when a successful response is received from the server for addition/editing of a record. `event.detail` varies depending on the type of relationship, but will always contain a property `subject`, which contains the subject's id.

### remove

Fired when a successful response is received from the server for deletion of a record. `event.detail` varies depending on the type of relationship, but will always contain a property `subject`, which contains the subject's id.

### Testing

Run `make test` to run Karma/Mocha tests.
