const express = require('express')
const app = express()
const path = require('path')


const ApiRouter = require('./Router/ApiRouter')


const PORT = 3000

app.use('/', express.static('public'))


app.use('/api', ApiRouter)


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.listen(PORT, () => console.log(`Example app listening on PORT ${PORT}!`))