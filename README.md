# Multer-Sharp-Storage

***

Multer-Sharp-Storage is a multer storage engine that allows you to transform the image and store it on the disk.

This project is mostly an integration piece for existing code samples from Multer [storage engine documentation](https://github.com/expressjs/multer/blob/master/StorageEngine.md). With add-ons include  [sharp](https://github.com/lovell/sharp)


# Installation

npm:

	npm install --save multer-sharp-storage

yarn:

	yarn add multer-sharp-storage

# Tests

```
npm test
```

# Usage

```javascript
const express = require('express');
const multer = require('multer');
const sharpStorage = require('multer-sharp-storage');

const app = express();

const storage = sharpStorage({
	output: 'png',
	quality: 90,
	destination: function (req, file, cb) {
		cb(null, 'storage/uploads')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var limits = {
	files: 10,
	fileSize: 1024 * 1024 * 10,
};

const upload = multer({ 
    storage,
    limits
});

app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file); // Print upload details
    res.send('Successfully uploaded!');
});

```

for more example you can see [here](https://github.com/kguevara/multer-sharp-storage)

# Options
```javascript
const storage = sharpStorage(options);
```

#### Multer-Sharp options
| option | default |  |
| ------ | ------- | ---- |
| output | jpg | your output format |
| quality | 70 | your output quality |
| destination | `storage/uploads` | your output destination |
| filename | randomString | your output filename |

***

## License
[MIT](http://opensource.org/licenses/MIT)
Copyright (c) 2019 - forever [Kelwin Guevara](https://github.com/kguevara)