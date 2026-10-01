

const CostTrackerModel = require('../models/CostTrackerModel');
const { ResourceDetailsModel } = require('../models/ResourceDetails')

const CreateModel = async (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        const objectForm = { "resourceData": data }
        const Request = await new ResourceDetailsModel(objectForm);
        const response = await Request.save();
        console.log(response);
        res.status(200).json(response)

    } catch (err) {
        res.status(500).send({error : err.message});
    }
};

const allModels = async (req, res) => {
    try {
        const data = await ResourceDetailsModel.find({});
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json(err)
    }

};
const addProject = async (req, res) => {
    try {
        let body = req.body;
        console.log(body["Name"]);
        let errorStatus = ""
        const response = await ResourceDetailsModel.find({});
        const data = (response[0]["resourceData"].map((val, index) => {

            if (body["Name"] === val.Name) {
                body.Role = val.Role
                console.log(body["Name"]);
                let found = false;
                Object.keys(val).forEach((key) => {
                    if (key === 'ProjectDetails') {
                        found = true;
                    }
                })
                if (found) {

                    val['ProjectDetails'].push(body);
                    console.log(val['ProjectDetails'], found)
                }
                else {
                    val['ProjectDetails'] = [body];
                }
                return val;
            }
            else
                return val;
        }))
        const replaceData = await ResourceDetailsModel.replaceOne({}, { "resourceData": data })
        res.status(200).json(replaceData);
    } catch (err) {
        res.status(500).json(err);
    }
}



const UpdateResourceDetailsAndCostTrackerDetails = async (req, res) => {
    try {
        const data = req.body;
        console.log(new Date().getMonth());
        const objectForm = { "resourceData": data }
        const response = await ResourceDetailsModel.replaceOne({}, objectForm)

        if (response) {
            const obj = await updatePlanHeadCountMonthWise();
            console.log(obj)
            if (obj)

                res.status(200).json("updated successfully");
            else {
                res.status(201).json('error in updating costTracker')
            }
        }
        else {
            res.status(201).json('error in updating resource Tracker')
        }
    } catch (err) {
        res.status(500).json({})
    }
}
const updatePlanHeadCountMonthWise = async () => {
    try {
        console.log('entered updatedpH');
        const getResourceDetails = await ResourceDetailsModel.find({});
        const ct = await CostTrackerModel.find({});
        const data = getResourceDetails[0].resourceData;
        let answer = {}
        data.forEach((obj, index) => {
            console.log(index, "index...................................")
            if (!obj["Programme"]) {
                return
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
                let found = false;
                if (p !== 'RateCard' && ct[0]["costTrackerDetails"]["Actual"][obj["Programme"]][p]["edited"]) {
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
            })

        })
        console.log(answer);
        const updateCostTracker = await CostTrackerModel.replaceOne({}, {
            'costTrackerDetails': {
                "Actual": answer,
                "Plan": ct[0].costTrackerDetails?.["Plan"]
            }
        });

        return updateCostTracker;
    } catch (err) {
        console.error(err, index)
    }

}


module.exports = {
    CreateModel,
    allModels,
    UpdateResourceDetailsAndCostTrackerDetails,
    addProject,


}

