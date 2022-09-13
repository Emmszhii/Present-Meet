const mongoPw = process.env.MONGOPW;
const mongoUsername = process.env.MONGOUSERNAME;

module.exports = {
  MongoURI: `mongodb+srv://${mongoUsername}:${mongoPw}@cluster0.tzumcdo.mongodb.net/PresentMeet?retryWrites=true&w=majority`,
};

// mongoose.connect('mongodb://127.0.0.1:27017/userDB', { useNewUrlParser: true });
