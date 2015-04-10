# next-user-preferences-client
Client side component for communicating with the user-preferences api

Communicates with
[next-user-preferences-api](http://github.com/Financial-Times/next-user-preferences-api-v2)
to store preferences Details are stored against users' eRightsID.

Also contains client side polling of User Notifications.

## Verbs and subjects

The following verbs (acting on subjects) can be used in the API and are emitted as events

* followed (topic id)
* forlater (article uuid)
* recommended (article uuid)
* notified (article uuid)

## API

*Note - there are other undocumented methods but these should not be used externally*

### .add(verb, subject, meta)

Add an entry to the user's preferences e.g. `add('followed', 'sections:"World"', {})`, `add('forlater', '51b53a4e-df64-11e4-a6c4-00144feab7de', {})`

### .remove(verb, subject) {

Remove an entry from the user's preferences e.g. `remove('followed', 'sections:"World"')`, `remove('forlater', '51b53a4e-df64-11e4-a6c4-00144feab7de')`

### .notifications.clear(uuid)

Remove a notification from the user's myft

### .notifications.seen(uuid)

Mark a notification as seen


## Events

These are all fired on `document.body`

### load

Fired when all data for a given verb has been loaded e.g. `followed:load`. `event.detail` is an array of the returned results

add

remove

new

### Testing

Run `make test` to run Karma/Mocha tests.
