const express = require('express')
const app = express()
const port = 3001

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use(express.json());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute);
