const r=require("express").Router(),{authenticate,verifiedVoterOnly}=require("../middleware/auth.middleware"),{success}=require("../utils/response");
r.use(authenticate,verifiedVoterOnly);
r.get("/mine",(req,res)=>success(res,{given:[],received:[]}));
r.post("/",(req,res)=>success(res,{},"Created",201));
r.post("/vote",(req,res)=>success(res,{},"Voted"));
module.exports=r;