const express = require("express");
const mongoose = require("mongoose")
const _ = require("lodash");
const date = require(__dirname + "/date.js")

const app = express();
mongoose.set('useFindAndModify', false);

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://admin-rahul:mongo321@cluster0.ztgsg.mongodb.net/todolistDB",
    { useNewUrlParser: true, useUnifiedTopology: true }, { useFindAndModify: false });

// create a schema
const itemsSchema = new mongoose.Schema({
    name: {
        type: String,
    }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your todolist!"
  });
  
  const item2 = new Item({
    name: "Hit the + button to add a new item."
  });
  
  const item3 = new Item({
    name: "<-- Hit this to delete an item."
  });

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema ({
    name : String,
    items : [itemsSchema]
});

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
    const day = date.getDate();

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                if (err) console.log(err);
                else console.log("Successfully saved all defaultItems");
            }); 
            res.redirect("/");
        } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems});}
    });

});

app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne( {name: customListName}, function(err, foundList){
        if(!err){
            if(!foundList){
            // create a new list
            const list = new List({
                name:customListName,
                items: defaultItems
            });
            list.save();
            res.redirect("/"+ customListName);
        } 
        else { // show an existing list
            res.render("list", { listTitle: foundList.name, newListItems:foundList.items });
        }
    }
    
});
});
app.post("/", function (req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });
    if(listName === "Today"){
    item.save();
    res.redirect("/");}
    else {
        List.findOne({name:listName}, function(err, foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        });
    }
});

app.post("/delete", function (req, res) {
   const checkedItemID =req.body.check;
const listName = req.body.listName;
    
    if(listName === "Today"){
        Item.findByIdAndRemove( checkedItemID, function (err) {
            if(!err) {
                console.log("Successfully deleted checked item. ");
            // deleted at most one Item document
            res.redirect("/");
        }
     });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function(err, foundList){
            if (!err){
              res.redirect("/" + listName);
            }
          });
        }
      

});

     

app.listen(5000, function () {
    console.log("Server is runnig at port:5000");
});