# next-myft-client [![Build Status](https://travis-ci.org/Financial-Times/next-myft-client.svg?branch=no-unecessary-writes)](https://travis-ci.org/Financial-Times/next-myft-client)
Isomorphic client component for communicating with the myFT api

Communicates with
[next-myft-api](http://github.com/Financial-Times/next-myft-api)
to store preferences Details are stored against users' eRightsID.

Also contains client side polling of User Notifications.

## Relationships and subjects

Relationships (between actors and subjects) can be accessed in the API and are emitted as events. By default, the
following relationships are loaded

* preferred
* enabled

## Actors

If `actor` is `'user'` and `actorId` is `null`, then the user's ID is retrieved using [next-session-client](https://github.com/Financial-Times/next-session-client)

## API

*Note - there are other undocumented methods but these should not be used externally*

### .init([additionalRelationships])

Initialise the client, loading the relationships requested by default and as specified in the additionalRelationships
parameter

```
init(['saved', 'created'])
```

### .add(actor, actorId, relationship, type, subject, meta)

Add an entry to the actors relationships
```
add('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=')

// for the current user
add('user', null, 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=')

add('list', 'contained', 'content', '6a7ad9ba-8d44-11e5-8be4-3506bf20cc2b')
```

### .remove(actor, actorId, relationship, type, subject) {

Remove an entry from the actor's relationships
```
remove('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=')

// for the current user
remove('user', null, 'saved', 'content', '51b53a4e-df64-11e4-a6c4-00144feab7de')

remove('list', '8d1fd038-fea1-4848-acb5-87e1f54bfa79', 'contained', 'content', '51b53a4e-df64-11e4-a6c4-00144feab7de')
```

### .get(actor, actorId, relationship, type, subject) {

Gets matches when the actor has a relationship with a specfic subject

```
get('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=').then(function(topic){ //gets the entry for the topic followed  })

get('user', null, 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=').then(function(topic){ //gets the entry for the topic followed  })

get('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'saved', 'concept', 'd4feb2e2-628e-11e5-9846-de406ccb37f2').then(function(topic){ //gets the entry for the saved article })
```

### .getAll(actor, actorId, relationship, type) {

Gets all nodes for which the user has this relationship
```
getAll('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'created', 'list').then(function(createdLists){ //gets all lists the user has created })

getAll('user', null, 'created', 'list').then(function(createdLists){ //gets all lists the current user has created })
```

### .has(actor, actorId, relationship, subject) {

Assert whether an actor has a relationship with a specific subject
```
has('user', 'null', 'saved', 'content','d4feb2e2-628e-11e5-9846-de406ccb37f2').then(function(hasRelationship){ //use hasRelationship boolean  })
```


### .notifications.clear(uuids, force)

Remove an array of notifications from the user's myFT. If force is falsy a check will be run to make sure the notification exists before sending the request to clear it

### .notifications.markAsSeen(uuids)

Mark an array of notifications as seen


## Events

These are all fired on `document.body`

### load

Fired when all data for a given user relationship has been loaded e.g. `followed:load`. `event.detail` is an object:
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
