const e = require("connect-flash");
const Dessert = require("../model/dessert");

module.exports.showAllDesserts = async (req, res) => {
  const data = await Dessert.find({});
  return res.render("desserts/index", { data, title: "Desserts" });
};
module.exports.showNewDessertForm = (req, res) => {
  if (req.user) {
    res.render("desserts/new", { title: "Add a new dessert" });
  } else {
    req.flash("error", "You must be logged in:");
    res.redirect("/users/login");
  }
};
module.exports.postNewDessert = async (req, res, next) => {
  const newDessert = new Dessert(req.body);
  newDessert.imgs=req.files.map(f=>({url: f.path,filename:f.filename}))
  console.log(newDessert)
  await newDessert.save();
  req.flash("success", "Successfully added a new dessert"); 
  res.redirect(`/desserts/${newDessert._id}`);
};
module.exports.showOneDessert = async (req, res, next) => {
  const { id } = req.params;
  const data = await Dessert.findById(id).populate("reviews");
  if (!data) {
    req.flash("error", "Dessert not found");
    return res.redirect("/desserts");
  }
  res.render("desserts/show", { data, title: `${data.name}` });
};
module.exports.editOneDessertForm = async (req, res) => {
  const { id } = req.params;
  const data = await Dessert.findById(id);
  if (!data) {
    req.flash("error", "Dessert not found");
    res.redirect("/desserts");
  }
  res.render("desserts/edit", { data, title: `edit: ${data.name}` });
};
module.exports.putOneDessert = async (req, res, next) => {
  const { id } = req.params;
//   console.log(req.body)
//   const imgsToDelete=req.body.toDelete;
//   if(imgsToDelete){
//     const deleted=await Dessert.findOneAndUpdate({_id:id}, {$pull: { imgs: {filename: { $in: [ ...imgsToDelete ] } }}})
//     console.log('-------------DELETED in PUT dessets route: ', id,deleted)
//   }
//   const imgs=[];
//   if(typeof Array.isArray(req.body.imgs)){
//     imgs.push(...req.files.map(f=>({url: f.path,filename:f.filename})))
//     console.log('in TRUE')
//   }else{
//     imgs.push(req.files.map(f=>({url: f.path,filename:f.filename})))
//     console.log('in FALSE')
//   }
//  req.body.imgs=imgs;
//   await Dessert.findByIdAndUpdate(id, req.body, { runValidators: true });
  req.flash("success", "successfully edited a dessert");
  res.redirect(`/desserts/${id}`);
};
module.exports.deleteOneDessert = async (req, res) => {
  const { id } = req.params;
  await Dessert.findByIdAndDelete(id);
  req.flash("success", "successfully deleted a dessert");
  res.redirect(`/desserts`);
};
