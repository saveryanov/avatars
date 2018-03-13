# avatars

Pixel avatar (npm-like) generator.

This module using strings as ceed for generator. There are some examples:

*Some random string* (with 3 colors):
![alt Some random string](http://url/to/img.png)

*admin* (with 2 colors):
![alt admin](https://github.com/saveryanov/avatars/blob/master/examples/admin.png)

*username* (with 2 colors):
![alt Some random string](https://github.com/saveryanov/avatars/blob/master/examples/username.png)

## Install

```
npm install --save avatars
```

## Usage

Basic promise usage:

```js
var avatars = require('avatars');
avatars()
    .then(image => {
        image.write("./text.png", (err) => {
            if (err) throw err;
            console.log("Created text.png");
        });
    })
    .catch(e => console.error(e));
```

Basic callback usage:

```js
var avatars = require('avatars');
avatars(null, function(error, image) {
    if (error) throw error;
    
    image.write("./text.png", (err) => {
        if (err) throw err;
        console.log("Created text.png");
    });
});
```

First argument of avatars() is parameters object for image generation. Avatars return image object that is created by Jimp module.

## Parameters

Parameter           | Description
------------------- | -------------
ceed                | Some string that will be used as a ceed for randomizer (default: random string)
width               | Width of the output image in px (default: 256)
height              | Height of the output image in px (default: 256)
pwidth              | Width of the generated pattern in cells (default: 16)
pheight             | Height of the generated pattern in cells (default: 16)
filename            | Filename to write the image (default: null)


### Example

```js
var avatars = require('avatars');

var params = {
    ceed: 'Some Random Name',   // can be username, login, id etc
    width: 500,
    height: 500,
    pwidth: 15,
    pheight: 15,
    filename: './test.png'  // file with this name will be created
};

avatars(params)
    .then(image => {
        console.log("Created text.png");
    })
    .catch(e => console.error(e));
```