// //Array Functions in JavaScript

// // ForEach
// arr=[1,2,3,4,5,6,7,8,9,10]
// arr.forEach(elemen => {
//     console.log(elemen);
    
// });
// //Map
// ans=arr.map(elem=> {
//    return elem*34;
// })

// console.log(ans);
// //Filter
// res=arr.filter(elem=>{
//     return elem>3;
// })
// console.log(res);
// //find
// abs=arr.find(elem=>{
//     return elem>3;
// })
// console.log(abs);
// //indexof
// index=arr.indexOf(3);
// console.log("index of " +index);


// some code for node js to deal with fsread
// const fs = require('fs');
// fs.readFile('nodescript.js', 'utf8', (err, data) => {
//     if (err) {
//         console.error(err);
//         return;
//     }
//     console.log(data);
// });

const express = require('express');
const path=require('path');
const app = express();

//routes
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('view engine','ejs');
// app.use((res,req,next)=>{
//     console.log("Middleware called");   
// next();
// });
// app.use((res,req,next)=>{
//     console.log("middlWare called by me ");
//     next();
// });

app.get("/",(req,res)=>{res.render("index")});
app.get("/profile/:username",(req,res)=>{
    // req.params.username
    res.send(`welcome ${req.params.username}`)});


    app.get("/profile/:username/:age",(req,res)=>{
    // req.params.username
    res.send(`welcome ${req.params.username} of age ${req.params.age}`)});
app.get("/about",(req,res)=>{res.render("index")});
app.use(express.static(path.join(__dirname,'public')));
// app.get("/contact",(req,res)=>{res.send("Hello Contact")});
// app.get("/help",(req,res,next)=>{
//     return next(new Error("This is an error"));
// });
    
//error handling
// app.use((err,req, res, next) => {
//     console.error(err.stack);
//     res.status(404).send("Page not found");
// });
app.listen(3000)