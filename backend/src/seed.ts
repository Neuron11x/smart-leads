import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User";
import Lead from "./models/Lead";

dotenv.config();

const seed = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log("✅ MongoDB Connected");

  await User.deleteMany({});
  await Lead.deleteMany({});
  console.log("🗑️  Cleared existing data");

  // Plain text password do — User model ka pre-save hook hash karega
  const admin = await User.create({
    name: "Rahul Admin",
    email: "admin@smartleads.com",
    password: "admin123",
    role: "admin",
  });

  const sales = await User.create({
    name: "Priya Sales",
    email: "sales@smartleads.com",
    password: "sales123",
    role: "sales",
  });

  console.log("👤 Users created");

  const leads = [
    { name: "Rahul Sharma",      email: "rahul.sharma@gmail.com",    status: "New",       source: "Website",   createdBy: admin._id },
    { name: "Rahul Verma",       email: "rahul.verma@gmail.com",     status: "Qualified", source: "Instagram", createdBy: admin._id },
    { name: "Rahul Gupta",       email: "rahul.gupta@yahoo.com",     status: "Contacted", source: "Referral",  createdBy: admin._id },
    { name: "Ankit Mehta",       email: "ankit.mehta@gmail.com",     status: "Lost",      source: "Website",   createdBy: admin._id },
    { name: "Sneha Patel",       email: "sneha.patel@gmail.com",     status: "New",       source: "Instagram", createdBy: admin._id },
    { name: "Vikram Singh",      email: "vikram.singh@outlook.com",  status: "Qualified", source: "Referral",  createdBy: admin._id },
    { name: "Pooja Nair",        email: "pooja.nair@gmail.com",      status: "Contacted", source: "Instagram", createdBy: admin._id },
    { name: "Amit Joshi",        email: "amit.joshi@gmail.com",      status: "New",       source: "Website",   createdBy: admin._id },
    { name: "Kavya Reddy",       email: "kavya.reddy@gmail.com",     status: "Qualified", source: "Instagram", createdBy: admin._id },
    { name: "Arjun Desai",       email: "arjun.desai@yahoo.com",     status: "Lost",      source: "Website",   createdBy: admin._id },
    { name: "Meera Iyer",        email: "meera.iyer@gmail.com",      status: "New",       source: "Referral",  createdBy: admin._id },
    { name: "Rohan Kapoor",      email: "rohan.kapoor@gmail.com",    status: "Contacted", source: "Website",   createdBy: admin._id },
    { name: "Divya Menon",       email: "divya.menon@outlook.com",   status: "Qualified", source: "Instagram", createdBy: admin._id },
    { name: "Suresh Kumar",      email: "suresh.kumar@gmail.com",    status: "New",       source: "Instagram", createdBy: sales._id },
    { name: "Neha Agarwal",      email: "neha.agarwal@gmail.com",    status: "Contacted", source: "Website",   createdBy: sales._id },
    { name: "Karan Malhotra",    email: "karan.malhotra@gmail.com",  status: "Qualified", source: "Referral",  createdBy: sales._id },
    { name: "Ritu Saxena",       email: "ritu.saxena@yahoo.com",     status: "Lost",      source: "Instagram", createdBy: sales._id },
    { name: "Mohit Bansal",      email: "mohit.bansal@gmail.com",    status: "New",       source: "Website",   createdBy: sales._id },
    { name: "Shruti Pandey",     email: "shruti.pandey@gmail.com",   status: "Contacted", source: "Referral",  createdBy: sales._id },
    { name: "Tarun Bhatia",      email: "tarun.bhatia@outlook.com",  status: "Qualified", source: "Instagram", createdBy: sales._id },
    { name: "Anjali Tiwari",     email: "anjali.tiwari@gmail.com",   status: "New",       source: "Website",   createdBy: sales._id },
    { name: "Deepak Yadav",      email: "deepak.yadav@gmail.com",    status: "Contacted", source: "Instagram", createdBy: sales._id },
    { name: "Priyanka Chawla",   email: "priyanka.chawla@gmail.com", status: "Qualified", source: "Referral",  createdBy: sales._id },
    { name: "Nikhil Srivastava", email: "nikhil.sri@gmail.com",      status: "Lost",      source: "Website",   createdBy: sales._id },
    { name: "Simran Kohli",      email: "simran.kohli@yahoo.com",    status: "New",       source: "Instagram", createdBy: sales._id },
  ];

  await Lead.insertMany(leads);
  console.log(`📋 ${leads.length} leads created`);

  console.log("\n=============================");
  console.log("✅ Seed complete!");
  console.log("=============================");
  console.log("🔐 Admin  → admin@smartleads.com / admin123");
  console.log("🔐 Sales  → sales@smartleads.com / sales123");
  console.log("=============================\n");

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});