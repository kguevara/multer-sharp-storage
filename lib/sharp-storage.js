'use strict';
// Load dependencies
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const crypto = require('crypto');
const concat = require('concat-stream');
const mkdirp = require('mkdirp');
const debug = require('debug')('multer-sharp-storage');

debug.log = console.log.bind(console);


// create a multer storage engine
var ImageStorage = function (options) {

	function ImageStorage(opts) {
		debug('ImageStorage constructor');

		var defaultOptions = {
			output: 'jpg',
			quality: 70,
		};

		this.options = _.extend(defaultOptions, opts);

		if ( typeof opts.filename === 'function') {
			this._getFilename = opts.filename 
		}

		if (typeof opts.destination === 'string') {
			mkdirp.sync(opts.destination)
			this._getDestination = function ($0, $1, cb) { cb(null, opts.destination) }
		} else if ( opts.destination ) {
			this._getDestination = opts.destination
		}

		debug('options: ', this.options);
	}

	ImageStorage.prototype._getFilename = function (req, file, cb) {
		debug('_generateRandomFilename');
		var that = this;
		crypto.pseudoRandomBytes(16, function (err, raw) {
			cb(err, err ? undefined : raw.toString('hex') + '.' + that.options.output)
		})
	};

	ImageStorage.prototype._getDestination = function (req, file, cb) {
		cb(null, 'storage/uploads')
	}

	ImageStorage.prototype._transformStream= function (req, file, cb) {
		debug('transformStream');
		var that = this;
		var filepath = path.join(file.destination, file.filename);

		return concat(function (data) {
			var sharpData = sharp(data);

			if (typeof that.options.sharpMiddleware == "function") {
				sharpData = that.options.sharpMiddleware(sharpData)
			}

			sharpData.toFormat(that.options.output, {
				quality: that.options.quality,
			})
			.toFile(filepath)
			.then(info => {
				debug(filepath);
				if ( req.abort ) {
					that._removeFile(req, file, cb);
				}
				cb(null, {})
			})
			.catch(err => { 
				debug(err);
				if (err){ 
					that._removeFile(req, file, cb);
					return cb(err);
				}
				if ( info.size <= 0 ) {
					that._removeFile(req, file, cb);
					return cb( new Error('Empty file') );
				}
			 });
		});
	};

	ImageStorage.prototype._handleFile = function (req, file, cb) {
		debug('_handleFile');

		var that = this;
		that._getDestination(req, file, function (err, destination) {
			if (err) return cb(err)
			that._getFilename(req, file, function (err, filename) {
				if (err) return cb(err)

				file.filename = filename;
				file.destination = destination;
				file.timestamp = Date.now();

				var transformStream = that._transformStream(req, file, cb)

				file.stream.pipe(transformStream);
			});
		});
	};

	ImageStorage.prototype._removeFile = function (req, file, cb) {
		debug('_removeFile');
		debug(file);

		req.abort = true;
		var filename = file.filename;
		var destination = file.destination;

		// delete the file properties
		delete file.filename;
		delete file.destination;
		delete file.timestamp;

		if (filename) {

			var filepath = path.join(destination, filename);
			fs.access(filepath, function(err) {
				if (!err) { 
					fs.unlink(filepath, cb)
				} else {
					cb(null, true)
				}
			});
		} else {
			cb(null, true)
		}

	};
	
	return new ImageStorage(options);

};

module.exports = ImageStorage;