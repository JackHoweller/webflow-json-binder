# JSON Object binder - designed for Webflow
## Install via CDN
Simply add the following script tag to your Webflow before ```</body>``` custom code entry:
```
<script src="https://cdn.jsdelivr.net/gh/jackhoweller/webflow-json-binder@latest/package.js"></script>
```

## Usage
To bind an object to the page (for example after an API request), use:
```
bindData(jsonObject, "tableName", "rootAttribute", "arrayChildAttribute")
```
Once bound, any elements using root or child sttributes specified will automatically be updated based on the JSON root named against the attribute, e.g. ```myRootAttribute="name"```.

If you make edits within the object, e.g. ```window.myTable.name = "NewName"```, the bound elements will refresh to stay up-to-date.
### Fields
**jsonObject:** Add your object here, e.g:
```
{
  "name": "John",
  "age": 30,
  "hobbies": ["reading", "running", "painting"],
  "friends": [
    {
      "name": "Sarah",
      "age": 28
    },
    {
      "name": "Michael",
      "age": 32
    }
  ]
}
```
**tableName:** binding data creates an object attached to the page window to enable access across any functions in the page. The name you supply here will be the object name, e.g. ```window.myNameHere```
**rootAttribute:** a name for the attribute you'll give to your elements to specify that they should be bound to a root from within your object, e.g.
```
<p myRootAttribute="name">
<p myRootAttribute="age">
<p myRootAttribute="hobbies">
```
**arrayChildAttribute:** if you have an array of objects in your data, use this to handle parent/child relationships with elements. You might use this for a table, list or grid component, e.g.
```
<div myRootAttribute="friends">
  <p myChildAttribute="name">
  <p myChildAttribute="age">
</div>
```
## Notes/limitations
- JSON roots can be as complex as you like, e.g. ```data.name.root``` would work so long as your JSON object has a value at that root.
- If a JSON root is not found, the bound element will display a notice to say this.
- Accessing properties via ```data.name["string"]``` is not supported at present.
- You cannot nest arrays within arrays, only objects within arrays.
- When replacing the entire object (e.g. starting over), call the regular bind function rather than setting the window property. This library uses proxies to understand when to update, which are part of the created window object. If you destroy the entire object, the proxies will also be destroyed, and won't know to perform an update.
- Despite the above, you can replace large portions of the object and it will continue to update.
