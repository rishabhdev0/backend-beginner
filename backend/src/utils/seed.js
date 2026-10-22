require("dotenv").config();
const{PrismaClient}=require("@prisma/client");
const bcrypt=require("bcryptjs");
const{ethers}=require("ethers");
const prisma=new PrismaClient();

function wallet(i){return new ethers.Wallet(ethers.keccak256(ethers.toUtf8Bytes(`cv-demo-${i}`))).address;}

async function seed(){
  console.log("\n🌱 Seeding CipherVote demo data...\n");
  const h=await bcrypt.hash("Admin@123456",10);
  const vh=await bcrypt.hash("Voter@12345",10);
  await prisma.vote.deleteMany();await prisma.fraudLog.deleteMany();await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();await prisma.candidate.deleteMany();
  await prisma.election.deleteMany();await prisma.voter.deleteMany();await prisma.user.deleteMany();
  console.log("✅ Cleaned");

  await prisma.user.create({data:{email:"admin@ciphervote.io",passwordHash:h,role:"SUPER_ADMIN",walletAddress:wallet(0),isEmailVerified:true}});
  await prisma.user.create({data:{email:"ec@ciphervote.io",passwordHash:await bcrypt.hash("EC@123456",10),role:"ELECTION_COMMISSION",walletAddress:wallet(1),isEmailVerified:true}});
  await prisma.user.create({data:{email:"auditor@ciphervote.io",passwordHash:await bcrypt.hash("Audit@123456",10),role:"AUDITOR",walletAddress:wallet(2),isEmailVerified:true}});
  console.log("✅ Admin accounts created");

  const vd=[{f:"Rahul",l:"Kumar",a:28,c:"Delhi-01",g:"MALE"},{f:"Priya",l:"Singh",a:24,c:"Delhi-01",g:"FEMALE"},{f:"Amit",l:"Sharma",a:35,c:"Delhi-01",g:"MALE"},{f:"Divya",l:"Joshi",a:27,c:"Mumbai-01",g:"FEMALE"},{f:"Arjun",l:"Malhotra",a:33,c:"Mumbai-01",g:"MALE"},{f:"Kavitha",l:"Reddy",a:29,c:"Bangalore-01",g:"FEMALE"},{f:"Suresh",l:"Nair",a:45,c:"Bangalore-01",g:"MALE"},{f:"Neha",l:"Agarwal",a:38,c:"Chennai-01",g:"FEMALE"}];
  for(let i=0;i<vd.length;i++){
    const v=vd[i];const dob=new Date();dob.setFullYear(dob.getFullYear()-v.a);
    const u=await prisma.user.create({data:{email:`${v.f.toLowerCase()}@demo.ciphervote.io`,passwordHash:vh,role:"VOTER",walletAddress:wallet(10+i),isEmailVerified:true}});
    await prisma.voter.create({data:{userId:u.id,firstName:v.f,lastName:v.l,dateOfBirth:dob,age:v.a,gender:v.g,constituency:v.c,voterIdNumber:`VID${String(i+1).padStart(6,"0")}`,walletAddress:u.walletAddress,status:"VERIFIED",faceVerified:true,idVerified:true,livenessVerified:true,riskScore:Math.floor(Math.random()*15),nftTier:i%3===0?"GOLD":"BRONZE",nftTokenId:String(i+1)}});
    process.stdout.write(".");
  }
  const pu=await prisma.user.create({data:{email:"pending@demo.ciphervote.io",passwordHash:vh,role:"VOTER",walletAddress:wallet(99),isEmailVerified:true}});
  await prisma.voter.create({data:{userId:pu.id,firstName:"Pending",lastName:"User",dateOfBirth:new Date("1995-01-01"),age:30,gender:"MALE",constituency:"Delhi-01",voterIdNumber:"PENDING001",walletAddress:pu.walletAddress,status:"PENDING"}});
  console.log("\n✅ Voters created");

  const now=new Date();
  const el1=await prisma.election.create({data:{title:"Delhi General Election 2025",description:"Annual election for Delhi.",constituency:"Delhi-01",status:"ACTIVE",blockchainId:1,startTime:new Date(now.getTime()-86400000),endTime:new Date(now.getTime()+3*86400000),totalRegistered:3}});
  const el2=await prisma.election.create({data:{title:"Mumbai Mayoral Election 2025",description:"Mayoral election for Mumbai.",constituency:"Mumbai-01",status:"ACTIVE",blockchainId:2,startTime:new Date(now.getTime()-3600000),endTime:new Date(now.getTime()+5*86400000),totalRegistered:2}});
  const el3=await prisma.election.create({data:{title:"Bangalore Tech Constituency 2025",description:"Tech constituency election.",constituency:"Bangalore-01",status:"RESULTS_DECLARED",blockchainId:3,startTime:new Date(now.getTime()-10*86400000),endTime:new Date(now.getTime()-8*86400000),totalRegistered:2,totalVotesCast:73}});

  await prisma.candidate.createMany({data:[
    {electionId:el1.id,name:"Amit Kumar Singh",party:"National Development Party",constituency:"Delhi-01",blockchainId:1,isActive:true,voteCount:0},
    {electionId:el1.id,name:"Priya Sharma",party:"Progressive Alliance",constituency:"Delhi-01",blockchainId:2,isActive:true,voteCount:0},
    {electionId:el1.id,name:"Rajesh Gupta",party:"People's Front",constituency:"Delhi-01",blockchainId:3,isActive:true,voteCount:0},
    {electionId:el2.id,name:"Vikram Mehta",party:"Shiv Sena Alliance",constituency:"Mumbai-01",blockchainId:1,isActive:true,voteCount:0},
    {electionId:el2.id,name:"Divya Joshi",party:"Congress Progressive",constituency:"Mumbai-01",blockchainId:2,isActive:true,voteCount:0},
    {electionId:el3.id,name:"Kavitha Reddy",party:"Tech Forward",constituency:"Bangalore-01",blockchainId:1,isActive:true,voteCount:45},
    {electionId:el3.id,name:"Suresh Nair",party:"Workers Union",constituency:"Bangalore-01",blockchainId:2,isActive:true,voteCount:28},
  ]});

  await prisma.fraudLog.createMany({data:[
    {fraudType:"RAPID_VOTING",description:"5 votes from same IP in 2 minutes",severity:"HIGH",riskScore:85,electionId:el1.id},
    {fraudType:"BOT_DETECTION",description:"Automated tool detected in request headers",severity:"MEDIUM",riskScore:62},
    {fraudType:"DUPLICATE_DEVICE",description:"Same device fingerprint used by 3 voter accounts",severity:"CRITICAL",riskScore:92,electionId:el1.id},
    {fraudType:"SUSPICIOUS_TIMING",description:"Vote cast at 3:47 AM statistical anomaly",severity:"LOW",riskScore:38,isResolved:true},
  ]});
  await prisma.auditLog.createMany({data:[
    {action:"SYSTEM_STARTED",description:"CipherVote platform started",severity:"INFO"},
    {action:"ELECTION_ACTIVATED",description:"Delhi General Election 2025 activated",severity:"INFO"},
    {action:"ZKP_PROOF_VERIFIED",description:"Zero-knowledge proof verified on-chain",severity:"SUCCESS"},
    {action:"FRAUD_ALERT",description:"High-risk pattern detected and logged",severity:"WARN"},
  ]});

  console.log("✅ Elections + candidates + fraud logs created");
  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║         ✅ SEED COMPLETE                  ║");
  console.log("╠══════════════════════════════════════════╣");
  console.log("║  admin@ciphervote.io    / Admin@123456   ║");
  console.log("║  ec@ciphervote.io       / EC@123456      ║");
  console.log("║  auditor@ciphervote.io  / Audit@123456   ║");
  console.log("║  rahul@demo.ciphervote.io / Voter@12345  ║");
  console.log("╚══════════════════════════════════════════╝\n");
}

seed().then(()=>prisma.$disconnect()).catch(e=>{console.error("Seed failed:",e);prisma.$disconnect();process.exit(1)});