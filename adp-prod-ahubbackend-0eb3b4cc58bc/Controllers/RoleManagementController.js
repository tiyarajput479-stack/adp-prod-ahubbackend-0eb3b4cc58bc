const { Role } = require("../models/RoleModel");

const canonicalizeAccessPages = (rawAccessPages) => {
  const accessPages = String(rawAccessPages || "")
    .split(",")
    .map((page) => page.trim())
    .filter(Boolean)
    .map((page) => (page.toUpperCase() === "ADMIN" ? "Administration" : page));

  return accessPages.filter((page, index) => {
    return accessPages.findIndex((candidate) => candidate.toUpperCase() === page.toUpperCase()) === index;
  }).join(",");
};



const addRole = async (req, res) => {
  try {
    console.log(req.body)
    const checkexist = await Role.find({ role: req.body.role }).exec()
    console.log(checkexist)
    if (checkexist.length == 0) {
      const u = new Role();
      u.role = req.body.role;
      u.status = req.body.status;
      u.accessPages = canonicalizeAccessPages(req.body.accessPages);
      u.createdBy = req.body.createdBy;
      u.time = new Date().toString();
      await u.save();
      res.status(200).send({ data: u, message: 'Record Saved Successfully' });
      return;
    }
    else {
      res.status(201).send({ data: req.body.username, message: 'role already exist' })
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    res.status(500).json(e);
  }
}

const getallRoles = async (req, res) => {
  try {
    const allroles = await Role.find({}).lean().exec();
    if (allroles.length > 0) {
      const normalizedRoles = allroles.map((role) => ({
        ...role,
        accessPages: canonicalizeAccessPages(role.accessPages),
      }));
      res.status(200).json(normalizedRoles)
      return
    }
    res.status(201).json({ data: err, msg: 'No users found' })
  } catch (err) {
    res.status(500).json(err)
  }
}

const getRoleInfo = async (req, res) => {
  try {
    console.log('getinfo')
    const checkexist = await Role.find({ role: req.query.role }, { _id: 0 }).lean().exec()
    if (checkexist.length > 0) {
      const normalized = checkexist.map((role) => ({
        ...role,
        accessPages: canonicalizeAccessPages(role.accessPages),
      }));
      res.status(200).send({data : normalized, message: "Success"});
      return;
    }
    res.status(201).send({ data: null, message: 'No Role Info Found' });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    res.status(500).json(e);
  }
}

const updateRoleInfo = async (req, res) => {
  try {

   
    const checkexist = await Role.find({ role: req.body.role }).exec()

    if (checkexist.length === 1) {
      const data = {
        role : req.body.role,
        status : req.body.status,
        accessPages : canonicalizeAccessPages(req.body.accessPages),
                createdBy : req.body.createdBy,
        time : new Date().toString(),

      };
      const doc = await Role.findOneAndUpdate({ role: req.body.role }, data, {});
      res.status(200).send({ data: doc, message: 'Record updated successfully' });
      return;
    }
    res.status(201).send({ data: null, message: 'role was not found' });

  }

  catch (e) {

    console.log(e);
    res.status(500).json(e);
  }
}

const deleteRole = async (req, res) => {
  try {
    console.log(req)
    const doc = await Role.deleteOne({ _id: req.query._id }).exec();
    console.log(doc)
    res.status(200).send({ data: doc, message: 'Record deleted successfully' });

  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }
}

const getRoles = async() =>{
  try{
       const roles = await Role.find({}).select('role')
      
       if(roles.length >0)
        return roles.map(val => {return {label:val.role, value: val.role} })
      return []
  }
  catch(err){
    return err;
  }
}

module.exports = { addRole, getRoleInfo, getallRoles, updateRoleInfo, deleteRole, getRoles }