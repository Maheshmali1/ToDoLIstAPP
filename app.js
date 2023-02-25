const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();


app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-Mahesh:"+process.env.PASSWORD+"@clustertodolist.wsbeefz.mongodb.net/todolistDB");
// mongoose.connect("mongodb://localhost:27017/todolistDB");

const itemSchema = mongoose.Schema({
    taskName : String
})


const listSchema = mongoose.Schema({
    listName : String,
    items : [itemSchema]
})



const Item = mongoose.model("item",itemSchema);
const List = mongoose.model("list",listSchema);



const item1 = new Item({
    taskName : "Welcome to your todo List!"
})
const item2 = new Item({
    taskName : "Hit the + button to add a new item."
})
const item3 = new Item({
    taskName : "<-- hit this to delete an item."
})

const defaultItems = [item1,item2,item3];


// default route

app.get("/",(req,res)=>{


    let listTitle = "Today";
   
    Item.find((err,items)=>{
        if(err){
            console.log(err);
        }
        else{

            if(items.length === 0){
                Item.insertMany(defaultItems,(err)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Inserted three items successfully.");
                    }
                })

                res.redirect("/");
            }
            else{
                res.render("list",{ListTitle:listTitle,newItems:items});
            }
        }
    })

})


// custom lists : 

app.get("/:customListName",(req,res)=>{
    const customListName = lodash.capitalize(req.params.customListName);
    

    List.findOne({listName : customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                const list1 = new List({
                    listName : customListName,
                    items : defaultItems
                })
            
                list1.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{ListTitle:foundList.listName,newItems:foundList.items});
            }
        }
    })
})


//  post route

app.post("/",(req,res)=>{
    const itemName = req.body.newItem;
    const listName = req.body.list;


    const newItem = new Item({
        taskName : itemName
    })

    if(listName === "Today"){
        newItem.save();
       
        res.redirect("/");
    }
    else{
        List.findOne({listName : listName},(err,foundList)=>{
            if(!err){
                foundList.items.push(newItem);
                foundList.save();
                res.redirect("/"+listName);
            }
        });
    }

})

// delete route

app.post("/delete",(req,res)=>{
    const checkedItemid = req.body.checkbox;
    const checkedItemList = req.body.listName;
    

    if(checkedItemList === "Today"){
            Item.findByIdAndDelete(checkedItemid,(err)=>{
                if(err){
                    console.log(err);
                }
            })
        
            res.redirect("/");
    }
    else{
        List.findOneAndUpdate({listName: checkedItemList},{$pull:{items:{_id:checkedItemid}}},(err,foundList)=>{
            if(!err){
                res.redirect("/"+checkedItemList);
            }
        })
    }
})

app.listen(process.env.PORT,()=>{
    console.log("server listening on port 3000.. ");
})
