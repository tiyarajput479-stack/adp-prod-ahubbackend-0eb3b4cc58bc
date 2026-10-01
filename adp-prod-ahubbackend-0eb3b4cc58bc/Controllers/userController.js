const { User } = require("../models/usersModel");
const { IntakeAdminResourceModel } = require("../models/IntakeAdminResourceModel");
const { getRoles } = require("./RoleManagementController");
const { generateAccessToken } = require("./TokenControllers");

// Helper: escape regex special characters to prevent injection
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper: build case-insensitive exact match regex
const caseInsensitiveRegex = (value) => ({ $regex: new RegExp(`^${escapeRegex(value)}$`, 'i') });

const adduser = async (req, res) => {
  try {
    const { userName, name, status, email, designation, role } = req.body;

    const exists = await User.findOne({ userName }).exec();
    if (exists) {
      return res.status(201).send({ data: userName, message: 'User already exist' });
    }

    const u = await User.create({ userName, name, status, email, designation, role });
    res.status(200).send({ data: u, message: 'Record Saved Successfully' });

  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const users = async (req, res) => {
  try {
    const [userList, roles] = await Promise.all([
      User.find({}).exec(),
      getRoles()
    ]);

    if (!userList.length) {
      return res.status(200).json({ data: [], msg: 'No users found' });
    }

    res.status(200).json({ data: userList, roles });

  } catch (err) {
    res.status(500).json(err);
  }
};

const getuser = async (req, res) => {
  try {
    const { mail: str = "", esId = "" } = req.query;

    // Resolve the caller against the Intake Administration users table
    // (IntakeAdminResource docs with resource: 'users'), matching either the
    // esId or the email stored on the admin payload.
    const conditions = [
      esId && { "payload.esId": caseInsensitiveRegex(esId) },
      str  && { "payload.email": caseInsensitiveRegex(str) },
    ].filter(Boolean);

    const docs = conditions.length
      ? await IntakeAdminResourceModel.find({ resource: "users", $or: conditions }).lean().exec()
      : [];

    const checkexist = docs.map((doc) => {
      const payload =
        doc && typeof doc.payload === "object" && doc.payload !== null ? doc.payload : {};
      return { ...payload, id: doc.itemId };
    });

    const accessToken = generateAccessToken(esId);
    const status = checkexist.length > 0 ? 200 : 201;

    res.status(status).send({ data: checkexist, accessToken });

  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const update = async (req, res) => {
  try {
    const { userName, name, status, email, designation, role } = req.body;

    const exists = await User.findOne({ userName }).exec();
    if (!exists) {
      return res.status(200).send({ data: null, message: 'User not found' });
    }

    const doc = await User.findOneAndUpdate(
      { userName },
      { userName, name, status, email, designation, role },
      { new: true }
    );

    res.status(200).send({ data: doc, message: 'Record updated successfully' });

  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

const deleteuser = async (req, res) => {
  try {
    const doc = await User.deleteOne({ userName: req.query.userName }).exec();
    res.status(200).send({ data: doc, message: 'Record deleted successfully' });

  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
};

module.exports = { adduser, getuser, users, update, deleteuser };