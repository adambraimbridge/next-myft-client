# next-myft-client [![Circle CI](https://circleci.com/gh/Financial-Times/next-myft-client/tree/master.svg?style=svg)](https://circleci.com/gh/Financial-Times/next-myft-client/tree/master)
Isomorphic client component for communicating with the myFT api

Communicates with
[next-myft-api](http://github.com/Financial-Times/next-myft-api)
to store preferences Details are stored against users' eRightsID.

Also contains client side polling of User Notifications.

See the myFT wiki for an explantion of how myFT button clicks make their way to the myFT API: https://github.com/Financial-Times/next-myft-api/wiki/What-happens-when-I-click-a-myFT-button

## Client-side (browser) API

*Note - there are other undocumented methods but these should not be used externally*


Relationships (between actors and subjects) can be accessed in the API and are emitted as events. By default, the
following relationships are loaded

* preferred
* enabled


For some requests, the actor must be specified. Where the actor does not feature in the request parameters, the actor is the current user.

If `actor` is `'user'` and `actorId` is `null`, then it defaults to the user ID retrieved using [next-session-client](https://github.com/Financial-Times/next-session-client)

### .init([additionalRelationships])

Initialise the client, loading the relationships requested by default and as specified in the additionalRelationships
parameter

```
init(['saved', 'created'])
```

### .add(actor, actorId, relationship, type, subject, meta)

Add an entry to the actor's relationships
```
add('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=')

// for the current user
add('user', null, 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=')

add('list', '8d1fd038-fea1-4848-acb5-87e1f54bfa79', 'contained', 'content', '6a7ad9ba-8d44-11e5-8be4-3506bf20cc2b')
```

### .remove(actor, actorId, relationship, type, subject) {

Remove an entry from the actor's relationships
```
remove('user', '378666af-12ce-4d5c-85b4-ba12b419a63c', 'followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=')

// for the current user
remove('user', null, 'saved', 'content', '51b53a4e-df64-11e4-a6c4-00144feab7de')

remove('list', '8d1fd038-fea1-4848-acb5-87e1f54bfa79', 'contained', 'content', '51b53a4e-df64-11e4-a6c4-00144feab7de')
```

### .get(relationship, type, subject) {

Gets matches when the current user has a relationship with a specific subject

```
get('followed', 'concept', 'TnN0ZWluX1BOXzIwMDkwNjIzXzI1Mjc=-UE4=').then(function(topic){ //gets the entry for the topic followed  })

get('saved', 'concept', 'd4feb2e2-628e-11e5-9846-de406ccb37f2').then(function(topic){ //gets the entry for the saved article })
```

### .getAll(relationship, type) {

Gets all nodes of this type with which the current user has this relationship
```
getAll('created', 'list').then(function(createdLists){ //gets all lists the user has created })
```

### .updateRelationship(actor, id, relationship, type, subject, data)

Update the relationship key-value pair found under _rel
```
updateRelationship('user', uuid, 'followed', 'concept', 'someConceptID', {"instant": true})
```
Will update the given user to have _rel.instant set to true for a followed relationship on a concept

### .has(relationship, subject) {

Assert whether the current user has a relationship with a specific subject
```
has('saved', 'content','d4feb2e2-628e-11e5-9846-de406ccb37f2').then(function(hasRelationship){ //use hasRelationship boolean  })
```

### .notifications.clear(uuids, force)

Remove an array of notifications from the user's myFT. If force is falsy a check will be run to make sure the notification exists before sending the request to clear it

### .notifications.markAsSeen(uuids)

Mark an array of notifications as seen


### Events

These are all fired on `document.body`

#### load

Fired when all data for a given user relationship has been loaded e.g. `followed:load`. `event.detail` is an object:
```
{
	Count: // number of items returned,
	Items: // the items,
}
```

For `articleFromFollow` notifications event.detail is an object with 3 properties `all`, `unseen` and `new`, all of which have the above structure

#### add

Fired when a successful response is received from the server for addition/editing of a record. `event.detail` varies depending on the type of relationship, but will always contain a property `subject`, which contains the subject's id.

#### remove

Fired when a successful response is received from the server for deletion of a record. `event.detail` varies depending on the type of relationship, but will always contain a property `subject`, which contains the subject's id.


## Server-side (Node) API

The server side API has lots of functions more-or-less mirroring the client-side API (_todo: document them_). In the absence of documentation, the available function can be seen here: https://github.com/Financial-Times/next-myft-client/blob/master/src/myft-api.js

### .fetchJson(method, path, data, opts)

Useful for making generic calls to the myFT API that aren't covered by convenience functions, e.g. the recommendations and engagement stuff.

e.g.
```
// get popular concepts
fetchJson(
	'GET',
	'next/myft-engagement/eb4d5f8e-ef65-4e0a-be85-e6d402438f7a',
	{ limit: 4 },
	{timeout: 5000}
)
```

Note options are passed into node_fetch so [all these node_fetch options](https://www.npmjs.com/package/node-fetch#options) are valid.

...
