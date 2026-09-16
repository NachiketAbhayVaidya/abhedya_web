import { Complaint } from "../models/Complaint.js";
import { ClientProfile } from "../models/ClientProfile.js";
import { Site } from "../models/Site.js";
import { ApiError, asyncHandler } from "../utils/ApiError.js";

// Client: file a complaint (optionally about a specific site/guard, with attachments)
export const createComplaint = asyncHandler(async (req, res) => {
  const { subject, description, site, guard, priority } = req.body;
  if (!subject || !description) throw new ApiError(400, "subject and description are required");

  const clientProfile = await ClientProfile.findOne({ user: req.user._id });
  if (!clientProfile) throw new ApiError(404, "Client profile not found");

  if (site) {
    const siteDoc = await Site.findOne({ _id: site, client: clientProfile._id });
    if (!siteDoc) throw new ApiError(400, "site does not belong to your account");
  }

  const attachments = (req.files || []).map((f) => `/uploads/complaints/${f.filename}`);

  const complaint = await Complaint.create({
    client: clientProfile._id,
    site: site || null,
    guard: guard || null,
    subject,
    description,
    priority: priority || "medium",
    attachments,
  });

  res.status(201).json(complaint);
});

// Client: list own complaints
export const listMyComplaints = asyncHandler(async (req, res) => {
  const clientProfile = await ClientProfile.findOne({ user: req.user._id });
  if (!clientProfile) throw new ApiError(404, "Client profile not found");

  const complaints = await Complaint.find({ client: clientProfile._id })
    .populate("site")
    .populate({ path: "guard", populate: { path: "user", select: "-passwordHash" } })
    .sort({ createdAt: -1 });
  res.json(complaints);
});

// Admin: list all complaints, optionally filtered by status
export const listComplaints = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const complaints = await Complaint.find(filter)
    .populate({ path: "client", populate: { path: "user", select: "-passwordHash" } })
    .populate("site")
    .populate({ path: "guard", populate: { path: "user", select: "-passwordHash" } })
    .sort({ createdAt: -1 });
  res.json(complaints);
});

export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate({ path: "client", populate: { path: "user", select: "-passwordHash" } })
    .populate("site")
    .populate({ path: "guard", populate: { path: "user", select: "-passwordHash" } });
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (req.user.role === "client" && complaint.client.user._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to view this complaint");
  }

  res.json(complaint);
});

// Admin: update status / add resolution notes
export const updateComplaintStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNotes } = req.body;
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw new ApiError(404, "Complaint not found");

  if (status !== undefined) {
    if (!["open", "in_progress", "resolved"].includes(status)) {
      throw new ApiError(400, "Invalid status");
    }
    complaint.status = status;
  }
  if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;

  await complaint.save();
  res.json(complaint);
});
