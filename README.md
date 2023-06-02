# JSON Object binder - designed for Webflow
## Install via CDN
Simply add the following script tag to your Webflow before ```</body>``` custom code entry:
```
<script src="https://cdn.jsdelivr.net/gh/jackhoweller/webflow-json-binder@latest/package.js"></script>
```

## Usage
To bind an object to the page (for example after an API request), use:
```
bindData(jsonObject, "tableName", "rootAttribute", "arrayChildAttribute", myOptionalCallbackFunction)
```
Once bound, any elements using root or child sttributes specified will automatically be updated based on the JSON root named against the attribute, e.g. ```myRootAttribute="name"```.

If you make edits within the object, e.g. ```myTable.name = "NewName"```, the bound elements will refresh to stay up-to-date.
### Fields
**jsonObject:** Add your object here, e.g:
```
{
  "firstName": "John",
  "lastName": "Doe",
  "age": 30,
  "hobbies": ["reading", "running", "painting"],
  "friends": [
    {
      "name": "Sarah",
      "relation": "Sister",
      "yearsConnected":12
    },
    {
      "name": "Michael",
      "relation": "Friend",
      "yearsConnected":3
    }
  ]
}
```
**tableName:** binding data creates an object attached to the page window to enable access across any functions in the page. The name you supply here will be the object name, e.g. ```window.myNameHere```
**rootAttribute:** a name for the attribute you'll give to your elements to specify that they should be bound to a root from within your object, e.g.
```
<p myRootAttribute="name"></p>
<p myRootAttribute="age"></p>
<p myRootAttribute="hobbies"></p>
```
**arrayChildAttribute:** if you have an array of objects in your data, use this to handle parent/child relationships with elements. You might use this for a table, list or grid component, e.g.
```
<div myRootAttribute="friends">
  <p myChildAttribute="name"></p>
  <p myChildAttribute="relation"></p>
</div>
```
**arrayChildAttribute:** optional, although you can add a callback here to track when changes are made. E.g. to submit updates back to an API.

### Insertion against different types of element:
* **Div/text:** replaces the displayed text.
* **Input:** replaces the input value.
* **Image:** replaces the image source.
* **Link:** replaces the link href, NOT the link text.
* **Other:** attempts to replace text content. For some types, this will simply not display.

## Conditional visibility:
In addition to inserting and updating data, you can specify conditional visibility of elements based on your JSON object by adding ```-visibility``` next to the root table, e.g.
```
<p myRootAttribute="friends" myRootAttribute-visibility="firstName!==John"></p>
```
If we're referencing the JSON object above, this element will not display, since the firstName root is equal to "John".
You can perform the same operations against object arrays, e.g.
```
<div myRootAttribute="friends">
  <div myChildAttribute-visibility="yearsConnected>6">
    <p myChildAttribute="name"></p>
    <p myChildAttribute="relation"></p>
  </div>
</div>
```
In this case, Sarah's details would display, but Michael would not.

Root attributes operate separately from child attributes since we're dealing with an array of objects. Applying visibility conditions to the root object will result in the entire array being shown or not, whereas child attributes will only impact one object in an array.

### Supported operators
Visibility formulae support a subset of comparison operators. They strictly DO NOT use eval(), and do not type match:
* **==** - Equal to
* **!==** - Not equal to
* **<** - Less than
* **>** - More than

## Notes/limitations
- JSON roots can be as complex as you like, e.g. ```data.name.root``` would work so long as your JSON object has a value at that root.
- If a JSON root is not found, the bound element will display a notice to say this.
- Accessing properties via ```data.name["string"]``` is not supported at present.
- You cannot nest arrays within arrays, only objects within arrays.
- When replacing the entire object (e.g. starting over), call the regular bind function rather than setting the window property. This library uses proxies to understand when to update, which are part of the created window object. If you destroy the entire object, the proxies will also be destroyed, and won't know to perform an update.
