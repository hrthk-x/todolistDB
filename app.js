//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose=require("mongoose");
mongoose.set('strictQuery',false);
const mongoDB="mongodb+srv://admin-hrthk:gj10rYrT1RxxFXiI@cluster0.amysqav.mongodb.net/todolistDB";

const itemsSchema=new mongoose.Schema({
  name:String
});
const listSchema=new mongoose.Schema({
  name:String,
  item:[itemsSchema]
});
const List=mongoose.model("List",listSchema);
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to do list."
});
const item2=new Item({
  name:"All ok here."
});
const item3=new Item({
  name:"Wanna change something."
});
const defaultItems=[item1,item2,item3];
main().catch(err=>console.log(err));

async function main(){
  await mongoose.connect(mongoDB);
  console.log("Connected to db");
  
  // mongoose.connection.close();
};

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(e){
    if(e) console.log(e);
    else console.log("Inserted complete array");
  });
  res.redirect("/");
  }
    else res.render("list", {listTitle: "Today", newListItems: foundItems});
  });  

});

app.post("/delete",function(req,res){
  const d=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndDelete(d,function(e){
      if(e) console.log(e);
      else console.log("Deleted successfully.");
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{item:{_id:d}}},function(err,foundList){
      console.log(listName);
      if(!err) {res.redirect("/"+listName);}
    });  
  }
  
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const newItem=new Item({
    name:itemName
  });

  if(listName==="Today"){
  newItem.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.item.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
    
});

app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList) {
        //create
      const list= new List({
      name:customListName,
      item:defaultItems
      });
      list.save();
      res.redirect("/"+customListName);
      }
      else {
        res.render("list",{listTitle:foundList.name,newListItems:foundList.item});
      }
    }
  });
});
app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
