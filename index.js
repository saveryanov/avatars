var crypto = require('crypto'),
    Jimp = require('jimp'),
    co = require('co'),
    newArray = require('init-array');

function newImage(width, height) {
    return new Promise((resolve, reject) => {
        new Jimp(width, height, function (err, image) {
            if (err) {
                reject(err);
            } else {
                resolve(image);
            }
        });
    });
}

function createImageFromArray(pixels, imgWidth, imgHeight) {
    return co(function *() {
        var image = yield newImage(imgWidth, imgHeight);
        pixels.forEach((row, y) => {
            row.forEach((pixelRGB, x) => {
                var pixelHEX = Jimp.rgbaToInt(pixelRGB[0], pixelRGB[1], pixelRGB[2], 255);
                image.setPixelColor(pixelHEX, x, y);
            });
        });
        return image;
    });
}

function writeImage(fileName, image) {
    return new Promise((resolve, reject) => {
        // write image if necessary
        if (fileName) {
            image.write(fileName, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        } else {
            resolve(false);
        }
    });
}

function generateColors(hash, colorsCounter) {
    var imgColors = [];
    hash.val = crypto.createHash('md5').update(hash.val).digest("hex");
    for (let i = 0; i < colorsCounter; i++) {
        var sliceInd = i % 5; // 32 chars in hash, 6 chars per color
        var offset = sliceInd * 6;
        imgColors.push([
            parseInt(hash.val[offset + 0] + hash.val[offset + 1], 16),    // red
            parseInt(hash.val[offset + 2] + hash.val[offset + 3], 16),    // green
            parseInt(hash.val[offset + 4] + hash.val[offset + 5], 16)     // blue
        ]);
        if (sliceInd == 0 && i != 0) {
            hash.val = crypto.createHash('md5').update(hash.val).digest("hex");
        }
    }
    return imgColors;
}

function generatePatternPixels(hash, imgColors, imgHeight, imgWidth, patternHeight, patternWidth) {
    hash.val = crypto.createHash('md5').update(hash.val).digest("hex");

    var cellWidth = Math.ceil(imgWidth/(2 * patternWidth));
    var cellHeight = Math.ceil(imgHeight/patternHeight);
    var colorsCounter = imgColors.length;

    var pixels = newArray([imgHeight, imgWidth], imgColors[0]);
    for (let epoch = 0; epoch <= patternHeight; epoch += 4) {
        hash.val = crypto.createHash('md5').update(hash.val).digest("hex");
        for (let i = 0; i < hash.val.length; i++) {
            var int = parseInt(hash.val[i], 16);
            
            var x = i % patternWidth;
            var y = epoch + Math.floor(i/patternWidth);

            if (x >= patternWidth || y >= patternHeight)
                break;

            for (let xImg = x * cellWidth; xImg < x * cellWidth + cellWidth; xImg++) {
                if (xImg >= imgWidth) break;
                for (let yImg = y * cellHeight; yImg < y * cellHeight + cellHeight; yImg++) {
                    if (yImg >= imgHeight) break;
                    var cellColor = imgColors[Math.floor(int/16 * colorsCounter)];
                    pixels[yImg][xImg] = cellColor;
                    pixels[yImg][imgWidth - 1 - xImg] = cellColor;
                }
            }
        }
    }
    return pixels;
}

module.exports = function(params = {}, callback = null) {
    return co(function* () {
        // define params
        if (!params)
            params = {};

        var colorsCounter = params.colors?params.colors:2;
        if (colorsCounter < 2) colorsCounter = 2;
    
        var imgWidth = params.width?params.width:256;
        var imgHeight = params.height?params.height:256;
        var patternWidth = params.pwidth?Math.round(params.pwidth/2):8;
        var patternHeight = params.pheight?params.pheight:16;
        var ceed = params.ceed?params.ceed.toString():"test";
        var fileName = params.filename?params.filename:null;
        var hash = { val: crypto.createHash('md5').update(ceed).digest("hex") };
        
        // generate colors
        var imgColors = generateColors(hash, colorsCounter);

        // generate pattern
        var pixels = generatePatternPixels(hash, imgColors, imgHeight, imgWidth, patternHeight, patternWidth);
        
        // create image
        var image = yield createImageFromArray(pixels, imgWidth, imgHeight);
        
        // write image if necessary
        yield writeImage(fileName, image);

        if (callback) {
            callback(null, image);
        }

        return image;
    })
    .catch(e => callback(e, null));
}
