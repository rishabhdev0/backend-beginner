require("dotenv").config();
const app=require("./src/app");
const http=require("http");
const{Server}=require("socket.io");
const{PrismaClient}=require("@prisma/client");
const logger=require("./src/config/logger");
const{loadContractAddresses}=require("./src/config/contracts");
const PORT=process.env.PORT||5000;
const prisma=new PrismaClient();
loadContractAddresses();
const server=http.createServer(app);
const io=new Server(server,{cors:{origin:"*",methods:["GET","POST","PUT","DELETE"]}});
require("./src/sockets/socketManager").init(io);
server.listen(PORT,async()=>{
  try{await prisma.$connect();logger.info("✅ Database connected");}catch(e){logger.error("DB failed:",e.message);}
  logger.info(`✅ CipherVote backend on port ${PORT}`);
  logger.info(`🌐 API: http://localhost:${PORT}/api`);
});
process.on("SIGTERM",async()=>{await prisma.$disconnect();server.close();});
module.exports={server,io};