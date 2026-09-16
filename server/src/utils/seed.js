import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { GuardProfile } from "../models/GuardProfile.js";
import { ClientProfile } from "../models/ClientProfile.js";
import { Site } from "../models/Site.js";
import mongoose from "mongoose";

async function upsertUser({ name, email, phone, role, password }) {
  let user = await User.findOne({ email });
  if (user) return user;
  const passwordHash = await bcrypt.hash(password, 10);
  user = await User.create({ name, email, phone, role, passwordHash });
  return user;
}

async function main() {
  await connectDB();

  const admin = await upsertUser({
    name: "HQ Admin",
    email: "admin@abhedya.local",
    phone: "9999999999",
    role: "admin",
    password: "Admin@12345",
  });
  console.log("Admin ready:", admin.email);

  const guardUser = await upsertUser({
    name: "Ramesh Kumar",
    email: "guard@abhedya.local",
    phone: "9888888888",
    role: "guard",
    password: "Guard@12345",
  });
  let guardProfile = await GuardProfile.findOne({ user: guardUser._id });
  if (!guardProfile) {
    guardProfile = await GuardProfile.create({ user: guardUser._id, hourlyRate: 150 });
  }
  console.log("Guard ready:", guardUser.email);

  const clientUser = await upsertUser({
    name: "Priya Sharma",
    email: "client@abhedya.local",
    phone: "9777777777",
    role: "client",
    password: "Client@12345",
  });
  let clientProfile = await ClientProfile.findOne({ user: clientUser._id });
  if (!clientProfile) {
    clientProfile = await ClientProfile.create({
      user: clientUser._id,
      organizationName: "Sharma Textiles Pvt Ltd",
      subscriptionPlan: "standard",
      maxGuards: 15,
    });
  }
  console.log("Client ready:", clientUser.email);

  let site = await Site.findOne({ client: clientProfile._id });
  if (!site) {
    site = await Site.create({
      client: clientProfile._id,
      name: "Sharma Textiles - Main Warehouse",
      address: "Plot 42, MIDC Industrial Area, Pune",
      location: { lat: 18.5204, lng: 73.8567 },
      geofenceRadiusMeters: 250,
    });
  }
  console.log("Site ready:", site.name);

  if (!guardProfile.assignedSite) {
    guardProfile.assignedSite = site._id;
    await guardProfile.save();
  }

  console.log("\nSeed complete. Test accounts:");
  console.log("  Admin  -> admin@abhedya.local / Admin@12345");
  console.log("  Guard  -> guard@abhedya.local / Guard@12345");
  console.log("  Client -> client@abhedya.local / Client@12345");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
