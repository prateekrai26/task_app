const express=require("express")
const router=express.Router();
const Task=require("../models/task")
const User=require("../models/user")
const auth=require("../middleware/auth")


router.get("/tasks", auth,async (req,res)=>
{
    const match={}
    const sort={}
    if(req.query.completed)
    {
        match.completed= req.query.completed==="true"
    }

    if(req.query.sortBy) 
    {
        const parts=req.query.sortBy.split(":")
        sort[parts[0]]=parts[1]==="desc" ? -1 :1
    }
    try{
      
      await req.user.populate({
          path:"tasks",
          match,
          options:
          {
              limit:parseInt(req.query.limit),
              skip:parseInt(req.query.skip),
              sort
          }
      }).execPopulate()
    
              res.send(req.user.tasks)
    }
    catch(e)
    {
        console.log(e);
    }
})

router.get("/tasks/:id",auth,async (req,res)=>
{
  try{
   const _id=req.params.id;  
  const task=await Task.findOne({_id,owner:req.user._id});
  if(task)
  res.send(task);
  else 
  {
      res.send("No task")
  }
  }
  catch(e)
  {
      console.log(e)
  }
})

router.delete ("/tasks/delete/:id",auth,async (req,res)=>
{
  try{
    const _id=req.params.id; 
     
    const task=await Task.findOneAndRemove({_id:_id,owner:req.user._id});
    if(!task)
     return res.send({error:"No Such Task is Present"})
    console.log("Deleted task");
    res.send(task);
    }
  catch(e)
  {
      console.log(e)
  }
})



router.post("/tasks/create",auth,async(req,res)=>
{
    const task =await new Task(
        {
            ...req.body,
            owner:req.user._id
        }
    );
    try{
    task.save();
    res.redirect("/tasks");
    }
    catch(e)
    {
        console.log(e);
        return;
    }

})

router.patch("/tasks/update/:id",auth,async (req,res)=>
{  
    const updates= Object.keys(req.body);
    const allow=["description","completed"]
    const valid=updates.every((update)=>allow.includes(update));
    if(!valid)
    {
        return res.send({error:"Invalid Updates"});
    }
    try{
        const task=await Task.findOne({_id:req.params.id,owner:req.user._id});
        updates.forEach((update)=>
        {
          task[update]=req.body[update];
        })
      await task.save();
     //const task = await Task.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
      res.send(task);
    }
    catch(e)
    {
        console.log(e);
        return;
    }

})

module.exports=router;