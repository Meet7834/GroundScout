const mongoose = require("mongoose");
const Campground = require('../models/campground');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelper');

mongoose.connect("mongodb://127.0.0.1:27017/YelpCamp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.connection.on('error', console.error.bind(console, "MONGO SERVER ERROR!"));
mongoose.connection.once('open', () => {
    console.log("MONGO SERVER CONNECTED!");
});

const randomElement = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 10; i++) {
        const cityObject = randomElement(cities);
        const price = (Math.floor(Math.random()*2000) + 1000);
        const camp = new Campground({
            title: `${randomElement(places)} ${randomElement(descriptors)}`,
            location: `${cityObject.city}, ${cityObject.state}`,
            image: 'http://source.unsplash.com/collection/484351',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Explicabo quibusdam nihil dignissimos consequatur nisi, eaque amet voluptates tenetur ad! Eveniet repellendus ducimus quia maiores suscipit qui perferendis cumque minus rem.',
            price
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});