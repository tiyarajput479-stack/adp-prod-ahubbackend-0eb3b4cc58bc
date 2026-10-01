const { ReadStream } = require("fs-extra");
const CostTrackerModel = require("../models/CostTrackerModel");
const { NewResourceTrackerModel } = require("../models/NewResourceTrackerModel");
const { ResourceAuditModel } = require("../models/ResourceAuditModel");
const { getActor, diffResource, recordAudit } = require("../helpers/resourceAudit");


const addResource = async (req, res) => {
    try {
        const resourcetoAdd = req.body;
        console.log(resourcetoAdd)
        const isResourceAlreayExists = await NewResourceTrackerModel.find({ Name: resourcetoAdd.Name });
        console.log(isResourceAlreayExists)
        if (isResourceAlreayExists.length >0) {
            return res.status(201).send({ data: isResourceAlreayExists, message: 'user Already exists', status: 'Failure' })
        }
        const res1 = await NewResourceTrackerModel(resourcetoAdd);
        const response = await res1.save()
        await recordAudit({
            action: 'create',
            resourceId: String(response?._id || ''),
            resourceName: String(response?.Name || resourcetoAdd?.Name || ''),
            projectProduct: String(response?.['Project/Product'] || resourcetoAdd?.['Project/Product'] || ''),
            actor: getActor(req),
            snapshot: resourcetoAdd,
            correlationId: req.correlationId || '',
        });
        res.status(200).send({ data: response, message: 'User added successfully', status: 'success' });
    }
    catch (err) {
        res.status(500).send({ data: null, message: err.message, status: 'Failure' })
    }
}

const addMultipleResources = async (req, res) => {
    try {
        const resourcesToAdd = req.body;
        if (!Array.isArray(resourcesToAdd)) {
            return res.status(400).send({data: null, message: 'Invalid payload: expected an array', status: 'error'});
        }
        
        if(resourcesToAdd.length ==0){
            return res.status(200).send({data:null, message: 'Empty payload', status: 'success'})
        }
        const existingResources = await NewResourceTrackerModel.find({}).exec();
        const placeholderNames = ['VACANT', 'OFFERED', 'NA', ''];
        let found = false
        for(const existing of existingResources){
            for(let i=0; i<resourcesToAdd.length; i++){
                const newName = resourcesToAdd[i]?.Name?.toString()?.trim()?.toUpperCase();
                if(placeholderNames.includes(newName)) continue;
                if(existing?.Name?.toString()?.trim()?.toUpperCase() === newName && existing?.['Project/Product'] === resourcesToAdd[i]?.['Project/Product'] ){
                    found = true;
                    return res.status(400).send({data: null , message: 'Resource already exists', status: 'Failure'});
                }
            }
            
        }
        if(!found){
        const response = await NewResourceTrackerModel.insertMany(resourcesToAdd);
        const actor = getActor(req);
        await recordAudit(
            (Array.isArray(response) ? response : []).map((doc) => ({
                action: 'create',
                resourceId: String(doc?._id || ''),
                resourceName: String(doc?.Name || ''),
                projectProduct: String(doc?.['Project/Product'] || ''),
                actor,
                snapshot: typeof doc?.toObject === 'function' ? doc.toObject() : doc,
                correlationId: req.correlationId || '',
            }))
        );
        res.status(200).send({ data: response, message: 'Users added successfully', status: 'success' });
        }
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ data: null, message: err.message, status: 'Failure' })
    }
}

const deleteResources = async (req, res) => {
    try {

        const body = req.body;
        if (!Array.isArray(body)) {
            return res.status(400).send({data: null, message: 'Invalid payload: expected an array', status: 'error'});
        }
        if(body.length ===0){
            return res.status(200).send({data:null, message: 'Empty payload', status: 'success'})
        }
        const bulkOperations = body.map(request => ({
            deleteOne:
            {
                filter: { _id: request._id },

            }
        }))
        console.log(JSON.stringify(bulkOperations))

        const response = await NewResourceTrackerModel.bulkWrite(bulkOperations);
        if(response.matchedCount === body.length && response.deletedCount !== body.length) {
           return res.status(400).send({ data: response, message: ` Deleted ${response.deletedCount} of ${body.length} rows`, status: 'Failure' })
        }
            const actor = getActor(req);
            await recordAudit(
                body.map((row) => ({
                    action: 'delete',
                    resourceId: String(row?._id || ''),
                    resourceName: String(row?.Name || ''),
                    projectProduct: String(row?.['Project/Product'] || ''),
                    actor,
                    snapshot: row,
                    correlationId: req.correlationId || '',
                }))
            );
            res.status(200).send({ data: response, message: "Updated Successfully!", status: 'Success' })
        

    } catch (err) {
        console.log(err)
        res.status(500).send({ data: null, message: err.message, status: 'Failure' })
    }
}

const allResources = async (req, res) => {
    try {
        const allResources = await NewResourceTrackerModel.find({}).exec();
        if (allResources.length === 0) {
            return res.status(204).send({ data: null, message: 'No Resources found', status: 'Success' })
        }
        res.status(200).send({ data: allResources, message: 'All Resources were fetched', status: 'Success' });
    }
    catch (err) {
        res.status(500).send({ data: null, message: err.message, status: 'Failure' })
    }
}

const updateMultipleResources = async (req, res) => {
    try {
        const body = req.body;
        if (!Array.isArray(body)) {
            return res.status(400).send({data: null, message: 'Invalid payload: expected an array', status: 'error'});
        }
        if(body.length ===0){
            return res.status(200).send({data:null, message: 'Empty payload', status: 'success'})
        }
       
        const resourcesToEdit = body.map(resource => {
            if (!resource.Name || !resource._id) {
                throw new Error('Invalid resource format: Name and _id are required');
            }
            return {
                ...resource,
                Name: resource.Name.toString().trim()
            };
        });
        const existingResources = await NewResourceTrackerModel.find({}).exec();
        const placeholderNames = ['VACANT', 'OFFERED', 'NA', ''];

        let found = false
        if(Array.isArray(existingResources) && existingResources.length>0) {
        for(const existing of existingResources){
            for(let i=0; i<resourcesToEdit.length; i++){
                const editName = resourcesToEdit[i]?.Name?.toString()?.trim()?.toUpperCase();
                if(placeholderNames.includes(editName)) continue;
                if(existing?.Name?.toString()?.trim()?.toUpperCase() === editName && existing?.['Project/Product'] === resourcesToEdit[i]?.['Project/Product'] && existing._id != resourcesToEdit[i]?._id  ){
                    console.log('found')
                    found = true;
                    return res.status(400).send({data: null , message: 'Resource already exists', status: 'Failure'});
                }
            }
        }  
    }
    const bulkOperations = resourcesToEdit.map(request => ({
        updateOne: {
            filter: { _id: request._id },
            update: { $set: request } // Use $set to update only the provided fields
        }
    }));
        // const bulkOperations = body.map(request => ({
        //     updateOne:
        //     {
        //         filter: { _id: request._id },
        //         "update": request
        //     }
        // }))
        const response = await NewResourceTrackerModel.bulkWrite(bulkOperations);
        if (response.modifiedCount === body.length)
            res.status(200).send({ data: response, message: "Updated Successfully!", status: 'Success' })
        else {
            res.status(400).send({ data: response, message: ` update ${response.modifiedCount} of ${body.length} rows`, status: 'Failure' })
        }
        // Audit: record the field-level changes for each edited resource using
        // the snapshot of existing docs fetched above.
        const existingById = new Map(
            (Array.isArray(existingResources) ? existingResources : []).map((doc) => [String(doc._id), doc])
        );
        const actor = getActor(req);
        const auditEntries = resourcesToEdit
            .map((next) => {
                const prev = existingById.get(String(next._id));
                const changes = diffResource(prev, next);
                if (!changes.length) return null;
                return {
                    action: 'update',
                    resourceId: String(next._id || ''),
                    resourceName: String(next?.Name || prev?.Name || ''),
                    projectProduct: String(next?.['Project/Product'] || prev?.['Project/Product'] || ''),
                    actor,
                    changes,
                    correlationId: req.correlationId || '',
                };
            })
            .filter(Boolean);
        await recordAudit(auditEntries);
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ data: null, message: err.message, status: 'Failure' })
    }
}

const updateCostTrackerHeadCount = async (req,res) => {
    try {
        console.log('entered updatedpH');
        const allResources = await NewResourceTrackerModel.find({}).exec();
        const ct = await CostTrackerModel.find({});
        let answer = {}
        allResources.forEach((obj, index) => {
           // console.log(index, "index...................................")
            if (!obj["Programme"]) {
                return; 
            }
            if (!Object.keys(answer).includes(obj["Programme"])) {
                answer[obj["Programme"]] = {
                    "Jul": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Aug": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Sep": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Oct": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Nov": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Dec": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Jan": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Feb": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Mar": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Apr": { count: 0, edited: false, value: 0, RCard: 0 },
                    "May": { count: 0, edited: false, value: 0, RCard: 0 },
                    "Jun": { count: 0, edited: false, value: 0, RCard: 0 },
                    "RateCard": 0,
                }
            }
            Object.keys(answer[obj["Programme"]]).forEach((p) => {

                if(p !== 'RateCard'){
                    let found = false;
                    if ( ct[0]["costTrackerDetails"]["Actual"][obj["Programme"]][p]["edited"]) {
                        found = true;
                        console.log(found)
                    }
                    if (obj["Programme"] !== undefined && (Number(obj[p]) === 1)) {
    
                        answer[obj["Programme"]][p]['count']++;
                        console.log(answer[obj["Programme"]][p]['count'])
                        console.log(answer[obj["Programme"]][p]['count'])
                        if (found) {
                            console.log(found);
                            answer[obj["Programme"]][p]['edited'] = true;
                            answer[obj["Programme"]][p]['value'] = ct[0].costTrackerDetails?.["Actual"][obj["Programme"]][p]["value"]
                        }
                        else {
                            answer[obj["Programme"]][p]['value'] = answer[obj["Programme"]][p]['count'] * ct[0].costTrackerDetails["Actual"][obj["Programme"]]["RateCard"];
                            answer[obj["Programme"]]["RateCard"] = ct[0].costTrackerDetails?.["Actual"][obj["Programme"]]["RateCard"]
                        }
                    }
                }
               
            })

        })
       // console.log(answer);
        const updateCostTracker = await CostTrackerModel.replaceOne({}, {
            'costTrackerDetails': {
                "Actual": answer,
                "Plan": ct[0].costTrackerDetails?.["Plan"]
            }
        });
      if(updateCostTracker){
        res.status(200).send({data: updateCostTracker, message: 'Updated successfully!' , status: 'Success'});
      }
      else{
        res.status(400).send({data: null, message: 'Error in updating Cost Tracker details', status: 'Failure'})
      }
    } catch (err) {
        console.error(err)
        res.status(500).send({data: null, message: err.message, status: 'Failure'})
    }

}

const addProject = async (req, res) => {
    try {
        let body = req.body;
       
       
        const Resource = await NewResourceTrackerModel.find({ Name: body["Name"] }).exec();
        console.log(await Resource?.[0]?.["Name"])
     
      
        const arr = await Resource?.[0]?.["ProjectDetails"] ?? []
      
        arr.push(body);
        console.log(arr);
        const update = { $set : {"ProjectDetails" : arr}}
        const updatedData = await NewResourceTrackerModel.updateOne({ Name: body["Name"] }, update)
     
       res.status(200).send({data:updatedData, message:'Project added successfully!', status: 'Success'})
    } catch (err) {
        console.log(err)
        res.status(500).send({data:null, message: err.message, status: 'Failure'})
    }
}

const getProjectDetails = async (req, res) => {
    try {
        const projectDetailsArray = []
        const ResourceDetailsArray = [];
        let roleitems =[]
        let roleunique = []
        let filtered = [];
        const filters = req?.body ?? {};
        const allResources= await NewResourceTrackerModel.find({});
        allResources.forEach((val) => {
            ResourceDetailsArray.push({label: val?.Name, value: val?.Name});
             if(!roleunique.includes(val.Role)){
             roleunique.push(val.Role)
             roleitems.push({label:val.Role, value: val.Role})
             }
            let found = false;
            Object.keys(val).forEach((key) => {
                if (key === 'ProjectDetails') {
                    found = true;
                }
            })
            if (found) {
                val['ProjectDetails'].forEach((projectDetails) => {
                    projectDetails.Role = val.Role
                    projectDetailsArray.push(projectDetails);

                })
            }
        })
         filtered = projectDetailsArray;
       
        Object.keys(filters).forEach((key) => {

            if ((key !=='StartDate'&& key!== 'EndDate') &&filters?.[key].length !== 0) {
              console.log(key);
              filtered = filtered.filter(item => {
                let payloadFilterKey = Array.isArray(filters?.[key]) ? filters?.[key] : [];
                let payloadFilterKeyLength = payloadFilterKey.length;
                for (let i = 0; i <payloadFilterKeyLength; i++) {

                  if (  (item?.[key].toUpperCase() === payloadFilterKey?.[i]?.value.toUpperCase())) {
                    return item;
                  }
                }
              })
            }
          })

          if(filtered.length !==0){

            if(filters?.['StartDate']  && filters?.['EndDate']){
             console.log('both')
             filtered = filtered.filter(item => (item?.StartDate === filters?.['StartDate'] && item?.EndDate === filters?.['EndDate']) )
            }
            else if(filters?.['StartDate']){
             console.log('only one')
             filtered = filtered.filter(item => item?.StartDate === filters?.['StartDate'])
            }
            else if(filters?.['EndDate']){
             filtered = filtered.filter(item => item?.EndDate === filters?.['EndDate'])
            }
         }

        const result = {
            Resources : ResourceDetailsArray,
            Projects  : filtered,
            Role : roleitems
        }

        res.status(200).send({data:result, message:'All Projects are fetched successfully', status: 'Success'})

    } catch (err) {
        console.log(err)
        res.status(500).send({data: null, message: err.message, status: 'Failure'});
    }
}

// Returns the Resource Tracker change history (newest first). Supports optional
// filters: `resourceId`, `action` (create|update|delete), and `limit`.
const getResourceAudit = async (req, res) => {
    try {
        const { resourceId, action } = req.query || {};
        const limit = Math.min(Number(req.query?.limit) || 200, 1000);
        const query = {};
        if (resourceId) query.resourceId = String(resourceId);
        if (action) query.action = String(action).toLowerCase();
        const entries = await ResourceAuditModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .lean()
            .exec();
        res.status(200).send({ data: entries, message: 'Audit history fetched', status: 'Success' });
    } catch (err) {
        console.log(err)
        res.status(500).send({ data: null, message: err.message, status: 'Failure' });
    }
}


module.exports = {
    allResources,
    addResource,
    addMultipleResources,
    updateMultipleResources,
    addProject,
    deleteResources,
    updateCostTrackerHeadCount,
    getProjectDetails,
    getResourceAudit
}