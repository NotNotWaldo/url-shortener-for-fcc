require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const validUrl = require('valid-url')
const bodyParser = require('body-parser');
const app = express();

const mySecret = process.env['MONGO_URI']


mongoose.connect(
  mySecret,
  { useNewUrlParser: true }
)

let urlSchema = mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: Number, required: true },
})

let Urls = mongoose.model('Urls', urlSchema)
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.route('/api/shorturl/:url').get(async (req, res) => {
  try {
    let { url } = req.params
    let fullUrl = await Urls.findOne({ short_url: url })
    res.redirect(fullUrl.original_url)
  } catch (error) {
    console.log(error)
    res.send(error)
  }
})

app.route('/api/shorturl')
  .post(async (req, res) => {
    try {
      console.log(req.body)
      let { url } = req.body

      let last = await Urls.find().sort({ short_url: -1 }).limit(1)

      console.log(last)

      let lastShrtUrl = last[0].short_url

      console.log(lastShrtUrl)

      let reg = /^(https?:)?\/*([\w\-]+\.)+\w+/

      if (reg.test(url)) {
        console.log('This is an URL')
        Urls.create(
          {
            original_url: url,
            short_url: lastShrtUrl + 1,
          },
          (err, data) => {
            if (err) return console.log(err)
            console.log(data)
            res.json({
              original_url: url,
              short_url: lastShrtUrl + 1,
            })
          }
        )
      } else {
        res.json({
          error: 'invalid url',
        })
      }
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  })
app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
