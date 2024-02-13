const mongoose = require('mongoose');

const uri = process.env.CONNECTION_LINK;


mongoose.connect(uri).then(() => {
    console.log('MongoDB Connected')
}).catch((e) => {
    console.log(`MongoDB error ${e}`)
})

mongoose.connection.on('connected',() => {
    console.log('successfully connected to DB');
})


mongoose.connection.on('disconnected', () => {
    console.log('Connection to MongoDB closed')
})

process.on('SIGINT', async () => {
    await mongoose.connection.close()
    process.exit(0)
})