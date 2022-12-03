const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocoder = mbxGeocoding({ accessToken: process.env.MAP_TOKEN });
const seeds = require('./seeds')
const Dessert = require('../model/dessert')

module.exports = async (req, res, next) => {
    if (req.user) {
        const data = seeds;
        for (let d of data) {
            const geoData = await geocoder.forwardGeocode({
                query: d.country,
                limit: 1
            })
                .send()
            d.author = req.user._id;
            d.author_name = "igdev116";
            d.geometry = geoData.body.features[0].geometry;
        }
        console.log(`Updated ${data.length} desserts from seeds file!`)
        await Dessert.insertMany(seeds).then(console.log("Data successfully saved in DB")).catch(e => { throw new ExpressError(e) })
        res.send('GIT')
    } else {
        res.send('You must be logged in!')
    }
}