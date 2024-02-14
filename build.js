const fs = require('fs')
const StyleDictionary = require('style-dictionary')
const Color = require('tinycolor2')
const formats = require('./src/formats');

var lightConfig = './config/light.json'
var darkConfig ='./config/dark.json'
var fontsConfig = './config/fonts.json'

console.log("INFO: Starting build..");

function degreesToRadiant(deg) {
    return (deg * Math.PI) / 180.0;
}

StyleDictionary.registerTransform({
    name: 'app/colors',
    type: 'value',
    matcher: prop => {
        return prop.attributes.category === 'colors'
    },
    transformer: prop => {
        var str = Color(prop.value).toHex8().toUpperCase();
        return `Color(0x${str.slice(6)}${str.slice(0, 6)})`;
    },
})

StyleDictionary.registerTransform({
    name: 'app/gradient',
    type: 'value',
    matcher: prop => {
        return prop.attributes.category === 'gradient'
    },
    transformer: prop => {

        console.log("inside gradient transform");

        var object = prop.value
        var stops = []
        var colors = []

        var rotation = object.rotation;

        const radiant = degreesToRadiant(rotation);

        for (var i = 0; i < object.stops.length; i++) {
            var stop = object.stops[i];
            var position = stop.position;
            stops.push(position);
            var str = Color(stop.color).toHex8().toUpperCase();
            var color = `Color(0x${str.slice(6)}${str.slice(0, 6)})`;
            colors.push(color)
        }


        const obj = `
        LinearGradient(
            begin: Alignment.bottomRight, 
            transform: GradientRotation(${radiant}),
            stops: [${stops}],
             colors: [${colors}]
        )`;

        return obj;
    },
});

StyleDictionary.registerTransform({
    name: 'app/fonts',
    type: 'value',
    matcher: prop => {
        return prop.attributes.category === 'font'
    },
    transformer: prop => {
    
        var object = prop.original.value;
       
        var fontsize = object.fontsize;
        var fontweight = object.fontWeight;
        var fontfamily = object.fontFamily;
        var fontStyle = object.fontStyle;
        var letterSpacing = object.letterSpacing;
        var lineHeight = object.lineHeight;
        var paragraphIndent = object.paragraphIndent;
        var paragraphSpacing = object.paragraphSpacing;
        

        const textStyle = `
        TextStyle(
            fontWeight: FontWeight.w${fontweight},
            fontStyle: FontStyle.${fontStyle},
            fontFamily: '${fontfamily}',
            fontSize: 40,
            letterSpacing: ${letterSpacing},
            height: ${lineHeight},
            )
        `;

        return textStyle;
    },
});

for (const key in formats) {
    const formatter = formats[key];
    StyleDictionary.registerFormat({
        name: key,
        formatter: formatter,
    });
}

if (fs.existsSync(lightConfig)) {
    const baseConfigLight = require(lightConfig)
    const StyleDictionaryExtendedLight = StyleDictionary.extend(baseConfigLight)
    StyleDictionaryExtendedLight.buildAllPlatforms()
}

if (fs.existsSync(darkConfig)) {
    const baseConfigDark = require(darkConfig)
    const StyleDictionaryExtendedDark = StyleDictionary.extend(baseConfigDark)
    StyleDictionaryExtendedDark.buildAllPlatforms()
}

if (fs.existsSync(fontsConfig)) {
    const baseConfigFonts = require(fontsConfig)
    const StyleDictionaryExtendedFonts = StyleDictionary.extend(baseConfigFonts)
    StyleDictionaryExtendedFonts.buildAllPlatforms()
}

console.log("INFO: Build finished.");










