const r=require("express").Router(),prisma=require("../config/database"),{authenticate,adminOnly}=require("../middleware/auth.middleware"),{success}=require("../utils/response");
r.use(authenticate,adminOnly);
r.get("/notifications",async(req,res)=>{const data=await prisma.notification.findMany({where:{userId:req.user.id},orderBy:{createdAt:"desc"},take:20});return success(res,{notifications:data,unread:data.filter(n=>!n.isRead).length})});
r.put("/notifications/read-all",async(req,res)=>{await prisma.notification.updateMany({where:{userId:req.user.id},data:{isRead:true}});return success(res,{})});
r.put("/notifications/:id/read",async(req,res)=>{await prisma.notification.update({where:{id:req.params.id},data:{isRead:true}});return success(res,{})});
r.get("/audit",async(req,res)=>{const{page=1,limit=20}=req.query;const[logs,total]=await Promise.all([prisma.auditLog.findMany({skip:(+page-1)*+limit,take:+limit,orderBy:{createdAt:"desc"}}),prisma.auditLog.count()]);return success(res,{logs,total})});
r.put("/users/:id/role",async(req,res)=>{await prisma.user.update({where:{id:req.params.id},data:{role:req.body.role}});return success(res,{},"Updated")});
module.exports=r;