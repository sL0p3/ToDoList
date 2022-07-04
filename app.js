
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const _ = require('lodash')
const date = require(__dirname + "/date.js")

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect("mongodb+srv://admin-shlok:******@cluster0.ldb9bt1.mongodb.net/todolistDB");

// const items =[];
// Creating Schema
const itemsSchema = {
    name : String,
}
// Creating a mongoose model
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name :"Welcome to your todolist!",
})
const item2 = new Item({
    name :"Hit the + button to add a new item",
})
const item3 = new Item({
    name :"<-- Hit this to delete an item.",
})

const defaultItems = [item1, item2, item3];
// const defaultItems = [];

const listSchema  = {
    name :String , 
    items : [itemsSchema],
}

const List = mongoose.model("List", listSchema)

app.get("/", (req,res)=>{

    // let today = new Date();
    // let options = {
    //     weekday: "long",
    //     day: "numeric",
    //     month: "long"
    // };

    // let day = today.toLocaleDateString("en-US", options);

    Item.find({},function(err, foundItems){

        if(foundItems.length === 0 ){
            Item.insertMany(defaultItems, (err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("Items successfully added")
                }
            })
            res.redirect("/");
        }else{
        res.render("list", {
            listTitle: date.getDate(),
            newListItems : foundItems,
        })
        }
    })
})

app.get("/:customListName", (req,res) => {
    const customListName = _.capitalize(req.params.customListName) ;
    List.findOne({name :customListName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                const list = new List ({
                    name : customListName, 
                    items: defaultItems,
                })
                list.save();
                res.redirect("/" + customListName)
            }else{
                res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
            }
        }
    })
    
})

app.post("/",(req,res)=>{
    let itemName = req.body.newItem;
    let listName = req.body.list;

    const newItem = new Item({
        name : itemName ,
    })

    if(listName === date.getDate()){
        newItem.save()
        res.redirect("/")
    }else{
        List.findOne({name: listName}, (err, foundList)=>{
            foundList.items.push(newItem);
            foundList.save();
            res.redirect("/" + listName);
        })
    } 
})

app.post("/delete",(req,res) =>{
    const checkedItemItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === date.getDate()){
    Item.findByIdAndRemove(checkedItemItemId , (err)=>{
        if(err){
            console.log(err);
        }else{
            console.log("Successfully deleted")
            res.redirect("/")
        }
    })
}else{
    List.findOneAndUpdate({name : listName},{$pull :{items: {_id: checkedItemItemId}}},(err, foundList)=>{
        if(!err){
            res.redirect("/" + listName)
        }
    })
}
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 4000;
}

app.listen(port,()=>{
    console.log("Server has started successfully")
});