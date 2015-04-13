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
* articleFromFollow (article uuid)

## API

*Note - there are other undocumented methods but these should not be used externally*

### .add(verb, subject, meta)

Add an entry to the user's preferences e.g. `add('followed', 'sections:"World"', {})`, `add('forlater', '51b53a4e-df64-11e4-a6c4-00144feab7de', {})`

### .remove(verb, subject) {

Remove an entry from the user's preferences e.g. `remove('followed', 'sections:"World"')`, `remove('forlater', '51b53a4e-df64-11e4-a6c4-00144feab7de')`

### .notifications.clear(uuids)

Remove an array of notifications from the user's myft

### .notifications.markAsSeen(uuids)

Mark an array of notifications as seen


## Events

These are all fired on `document.body`

### load

Fired when all data for a given verb has been loaded e.g. `followed:load`. `event.detail` is an object:
```
{
	Count: // number of items returned,
	Items: // the items,
}
```

For `articleFromFollow` notifications event.detail is an object with 3 properties `all`, `unseen` and `new`, all of which have the above structure

### add

Fired when a successful response is received from the server for addition/editing of a record. `event.detail` varies depending on the type of verb, but will always contain a property `subject`, which contains the subject's id.

### remove

Fired when a successful response is received from the server for deletion of a record. `event.detail` varies depending on the type of verb, but will always contain a property `subject`, which contains the subject's id.

### Testing

Run `make test` to run Karma/Mocha tests.
