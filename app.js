//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const _=require ("lodash");


const app = express();

mongoose.set('strictQuery', true);
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-aaron:Test123@cluster0.aj8rwzt.mongodb.net/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const itemsSchema = {

  name: String

};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({

  name: "welcome to the to do list"
});

const item2 = new Item({

  name: "press the + button to add more items"
});

const item3 = new Item({

  name: "just eliminate the items"
});

const defaultItems = [item1, item2, item3];

const listSchema = {

  name: String,
  items: [itemsSchema]

};

const List = mongoose.model("List", listSchema);





app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {

        if (err) {

          console.log(err);
        } else {
          console.log("Succesfully save items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  if (customListName == "Favicon.ico") return;
     console.log(customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({

          name: customListName,
          items: defaultItems

        });
        list.save();
        res.redirect("/" + customListName);
      } else {

        //show an existing list

        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }


  });


});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;

  const listName = req.body.list;

  const item = new Item({

    name: itemName
  });

  if (listName === "today") {

    item.save(function(){

res.redirect("/");

    });


  }else {

    List.findOne({name: listName}, function(err, foundList){

      foundList.items.push(item);
      foundList.save(function(){

res.redirect("/" + listName);

      });

    });
  }
});

app.post("/delete", function(req, res) {

  const checkItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "today"){

    Item.findByIdAndRemove(checkItemId, function(err) {

      if (err) {
console.log(err);

      }else{

        console.log("succesfully delete check item");
        res.redirect("/");
      }
    });

  }else{

    List.findOne({name:listName}, function(err, foundList){
              foundList.items.pull({ _id: checkItemId });
              foundList.save(function(){

                  res.redirect("/" + listName);
              });
            });
      }



});







 



app.get("/about", function(req, res) {
  res.render("about");
});





app.listen(3000, function() {
  console.log("Server has started succesfully");
});
