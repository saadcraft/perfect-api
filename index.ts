import express from "express";

const port = 3001;

const app = express();

app.get('/', (req, res) => {
    res.send("hello world")
})

app.listen(port , () => {
    console.log(`API lanched in ${port}`)
})
