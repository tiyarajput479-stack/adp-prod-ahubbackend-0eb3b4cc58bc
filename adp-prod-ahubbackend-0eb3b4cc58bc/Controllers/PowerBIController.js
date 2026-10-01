const { stat } = require("fs-extra");
const RequestModel = require("../models/RequestModel");
const { ResourceDetailsModel } = require("../models/ResourceDetails");
const { generateAccessToken } = require("./TokenControllers");
const { User } = require("../models/usersModel");
const { NewResourceTrackerModel } = require("../models/NewResourceTrackerModel");

// const DigiTechResoureAllocation = async (req, res) => {
//   try {
//     const projectDetailsArray = [];
//     const ResourceDetailsArray = [];
//     let RequestType = {
//       BAU: 0,
//       "ADPR Migration": 0,
//       "Ops Plan": 0,
//       GenAI: 0,
//       Grandesco: 0,
//       "Special Leave": 0,
//     };

//     const resource = await ResourceDetailsModel.find({});
//     resource[0]["resourceData"].forEach((val) => {
//       if (val?.["ProjectDetails"]) {
//         val?.["ProjectDetails"].forEach((AssignedProject) => {
//           let currDate = new Date();
//           console.log(currDate);
//           let Date = new Date(AssignedProject?.StartDate);

//           if (
//             Date.getFullYear() === currDate.getFullYear() &&
//             Date.getMonth() === currDate.getMonth()
//           ) {
//             if (AssignedProject?.["RequestType"] === "Ops Plan") {
//               RequestType["Ops Plan"] = RequestType["Ops Plan"] + 1;
//             } else if (AssignedProject?.["RequestType"] === "ADPR Migration") {
//               RequestType["ADPR Migration"] = RequestType["ADPR Migration"] + 1;
//             } else if (AssignedProject?.["RequestType"] === "Grandesco") {
//               RequestType["Grandesco"] = RequestType["Grandesco"] + 1;
//             } else if (AssignedProject?.["RequestType"] === "GenAI") {
//               RequestType["GenAI"] = RequestType["GenAI"] + 1;
//             } else if (
//               AssignedProject?.["RequestType"] === "Enhancement" ||
//               AssignedProject?.["RequestType"] === "Internal" ||
//               AssignedProject?.["RequestType"] === "Legal" ||
//               AssignedProject?.["RequestType"] === "New Project" ||
//               AssignedProject?.["RequestType"] === "System Upgrade" ||
//               AssignedProject?.["RequestType"] === "Security"
//             ) {
//               RequestType["BAU"] = RequestType["BAU"] + 1;
//             }
//           }
//         });
//       }

//       //console.log(RequestType)
//     });
//     res.status(200).json({ data: RequestType, msg: "Sucess" });
//   } catch (err) {
//     res.status(500).send({ data: null, msg: err });
//   }
// };

function dateVariables(str) {
  let Year = new Date(str).getFullYear();
  let Month = new Date(str).getMonth();
  let Day = new Date(str).getDate();
  return new Date(Date.UTC(Year, Month, Day));
}

function getWeeks(start, end) {
  console.log(start, end);
  let curr = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  );
  console.log(curr);
  let temp = {
    Jul: "",
    Aug: "",
    Sep: "",
    Oct: "",
    Nov: "",
    Dec: "",
    Jan: "",
    Feb: "",
    Mar: "",
    Apr: "",
    May: "",
    Jun: "",
  };
  let arr = [];

  // while (curr.getUTCDay() !== 1 && curr <= end) {
  //   curr.setUTCDate(curr.getUTCDate() + 1);
  // }
  // if(end-curr < 7){
  //     end= end.setUTCDate(end.getUTCDate +7)
  // }
  while (curr <= end) {
    let weekEnd = new Date(curr);
    //   weekEnd.setUTCDate(curr.getUTCDate() + 6);
    let d = new Date(curr).toDateString().substring(4, 7);
    temp[d] = "Allocated";
    //   arr.push({
    //     start: new Date(curr),
    //     end: new Date(weekEnd),
    //     status: '',
    //     DeveloperCount: 0,

    //   });

    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  //console.log(arr)
  // return arr;
  return temp;
}

const monthlyResourceAllocation = async (req, res) => {
  try {
    let status = "success";
    const TechonlogyWiseAllocatedPRojects = [];
    const Projects = [];
    const ResourceDetails = await NewResourceTrackerModel.find({}).exec();
    ResourceDetails.forEach((Resource, index) => {
      if (Resource?.ProjectDetails) {
        Resource?.ProjectDetails?.forEach((project) => {
          let month = getWeeks(
            dateVariables(project.StartDate),
            dateVariables(project.EndDate)
          );
          project["Technology"] = Resource.Technology;
          project["month"] = month;
          Projects.push(project);
        });
      }
    });

    res.status(200).json({ data: Projects, msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ data: null, msg: "Failure", error: err.message });
  }
};

const monthlyResourceAllocationnew = async (req, res) => {
  try {
    let status = "success";
    const TechonlogyWiseAllocatedPRojects = [];
    const Projects = [];
    const ResourceDetails = await NewResourceTrackerModel.find({}).exec();
    ResourceDetails.forEach((Resource, index) => {
      if (Resource?.ProjectDetails) {
        Resource?.ProjectDetails?.forEach((project) => {
          let month = getWeeks(
            dateVariables(project.StartDate),
            dateVariables(project.EndDate)
          );
          console.log(month);
          Object.keys(month).forEach((monthkey) => {
            if (month[monthkey] === "Allocated") {
              console.log(monthkey);
              let temp = {};
              Object.keys(project).forEach((key) => {
                temp[key] = project[key];
              });
              temp["month"] = monthkey;
              temp["Technology"] = Resource.Technology;
              console.log(temp);
              Projects.push(temp);
            }
          });
          // project["Technology"]= Resource.Technology;
          // project["month"] = month;
          // Projects.push(project)
        });
      }
    });

    res.status(200).json({ data: Projects, msg: "success" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ data: null, msg: "Failure", error: err.message });
  }
};

const AllRequestsforBI = async (req, res) => {
  try {
    const filteredRequestsData = [];
    const allRequests = await RequestModel.find({}).exec();
    allRequests.forEach((request) => {
      let temp = {
        _id: "",
        AssignedPO: "",
        BRDStartDate: "",
        BRDEndDate: "",
        BU: "",
        BusinessProblemSummary: "",
        DevelopmentTime: "",
        DevelopmentStartDate: "",
        DevelopmentEndDate: "",
        FteSaving: "",
        FteRealizationMonth: "",
        GoLiveDateExp: "",
        GoLiveDateAct: "",
        ProjectName: "",
        PilotStartDate: "",
        PilotEndDate: "",
        ProjectUpdates: "",
        RequestType: "",
        RequirementsStartDate: "",
        RequiremntsEndDate: "",
        Status: "",
        TargetQuarter: "",
        Technology: [],
        TestingStartDate: "",
        TestingEndDate: "",
        totalPriorityScore: "",
      };
      if (request.BRDStartDate && request.DevelopmentStartDate) {
        Object.keys(temp).forEach((key) => {
          temp[key] = request[key];
        });
        filteredRequestsData.push(temp);
      }
    });
    res.status(200).json({ data: filteredRequestsData, msg: "Success" });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const AllRequestsforBInew = async (req, res) => {
  try {
    let Year = new Date().getFullYear();
    let Month = new Date().getMonth();
    let Day = new Date().getDate();
    let curr = new Date(Date.UTC(Year, Month, Day));
    const filteredRequestsData = [];
    const allRequests = await RequestModel.find({}).exec();
    allRequests.forEach((request) => {
     
      if (request.BRDStartDate && request.DevelopmentStartDate) {
        request.Technology.forEach((tech) => {
          let datesObj = {
          
            DevelopmentStartDate: "",
            DevelopmentEndDate: "",
            PilotStartDate: "",
            PilotEndDate: "",
            TestingStartDate: "",
            TestingEndDate: "",
            GoLiveDateExp: "",
            GoLiveDateAct: "",
          };
          let temp = {
            _id: "",
            AssignedPO: "",
            BU: "",
            BRDStartDate: "",
            BRDEndDate: "",
            BusinessProblemSummary: "",
            DevelopmentTime: "",
            FteSaving: "",
            FteRealizationMonth: "",
            ProjectName: "",
            RequestType: "",
            Status: "",
            TargetQuarter: "",
            Technology: "",
            totalPriorityScore: "",
          };
         
          temp["Technology"] = tech.value;
            Object.keys(temp).forEach((key) => {
                console.log(key)
                if (key !== "Technology" ) 
              
                temp[key] = request[key];
              });
          Object.keys(datesObj).forEach((statusdates) => {
            let value = tech.value.toString();
            temp[statusdates] = request?.[statusdates]?.[value];
          });
         
            
              filteredRequestsData.push(temp);
        });
        
      }
    });
    res.status(200).json({ data: filteredRequestsData, msg: "Success" });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
};

const ResourceAllocationAPI = async (req, res) => {
  try {
    let status = "success";
    const TechonlogyWiseAllocatedPRojects = [];

    const ResourceDetails = await NewResourceTrackerModel.find({}).exec()
    ResourceDetails.forEach((Resource, index) => {
      let temp = {};
      temp["Name"] = Resource.Name;
      temp["Manager"] = Resource.Manager;
      temp["Technology"] = Resource.Technology;
      temp["Role"] = Resource.Role;
      temp["Status"] = Resource.Status;
      temp["Level"] = Resource.Level;
      temp["ProjectDetails"] = Resource?.ProjectDetails ?? [];
      TechonlogyWiseAllocatedPRojects.push(temp);
    });
    if (TechonlogyWiseAllocatedPRojects.length === 0) {
      status = "No data is available";
    }
    res
      .status(200)
      .json({ data: TechonlogyWiseAllocatedPRojects, msg: status });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

const TimeLineData = (projects) => {
  let newArray = [];

  projects.forEach((Request) => {
    let lSDate = "";
    let hEDate = "";
    let ActualDate = "";
    let BRDStart = Request?.BRDStartDate;
    Object.keys(Request?.DevelopmentStartDate).forEach((val, index) => {
      console.log(val);

      let start = Request?.DevelopmentStartDate?.[val];
      let end = Request?.GoLiveDateExp?.[val];
      let liveend = Request?.GoLiveDateAct?.[val];
      console.log(start, end);
      if (index === 0) {
        lSDate = start;
        hEDate = end;
        ActualDate = liveend;
      }
      if (start < lSDate) lSDate = start;
      if (end > hEDate) hEDate = end;
      if (liveend > ActualDate) ActualDate = liveend;
    });
    if (Request?.DevelopmentStartDate) {
      let temp = {};
      temp["BU"] = Request.BU;
      temp["Status"] = Request.Status;
      temp["FteSaving"] = Request?.FteSaving ?? 0;
      temp["ProjectName"] = Request.ProjectName,
        temp["RequestType"] = Request.RequestType;
      temp["BRDStartDate"] = Request?.BRDStartDate;
      temp["DevelopmentStartDate"] = lSDate;
      temp["GoLiveDateExp"] = hEDate;
      temp["GoLiveDateAct"] = ActualDate;
      newArray.push(temp);
    }
  });
  return newArray;
};

const ExecutiveSummaryAPI = async (req, res) => {
  try {
    let status = "success";
    console.log("entered in to getDelivery Tracker Details", req.body);
    const filters = req.body || {};
    let filtered = [];
    const Requests = await RequestModel.find({});
    Requests.forEach((request) => {
      if (request.RequestType === "Ops Plan") {
        if (request?.BRDStartDate && request?.DevelopmentStartDate) {
          filtered.push(request);
        }
      } else {
        console.log("entered");
        if (
          request.Status === "Development" ||
          request.Status === "UAT" ||
          request.Status === "Pilot"
        ) {
          if (request?.BRDStartDate && request?.DevelopmentStartDate) {
            console.log(request);
            filtered.push(request);
          }
        }
      }
    });
    const response = TimeLineData(filtered);

    if (response.length === 0) {
      status = "No data is available";
    }

    res.status(200).json({ data: response, msg: status });
  } catch (err) {
    res.status(500).json(err);
  }
};

const InitiativewiseResourcePI = async (req, res) => {
  let status = "success";
  try {
    const allRequests = await RequestModel.find({}).exec();
    const projects = [];
    allRequests.forEach((request) => {
      let temp = {};
      temp["BU"] = request?.BU;
      temp["id"] = request?._id.toString().substring(19, 24).toUpperCase();
      temp["Req"] = request?.ProjectName;
      temp["FTE"] = request?.FteSaving;
      temp["GoLiveAct"] = request?.GoLiveDateAct;
      projects.push(temp);
    });
    if (projects.length === 0) {
      status = "Failure";
    }
    res.status(200).json({ data: projects, status: status });
  } catch (err) {
    console.log(err);
    res.status(500).send({ status: "Failure", err: err.message });
  }
};

const verifyUser = async (req, res) => {
  try {
    const checkexist = await User.find(
      { userName: req.query.esId },
      { _id: 0 }
    ).exec();
    if (checkexist.length > 0) {
      const accessToken = generateAccessToken(req.query.esId);
      res.status(200).send({ accessToken: accessToken });
      return;
    } else {
      res.status(400).json({
        status: "failed",
        message: `Not Authorized`,
        accessToken: null,
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({data: null, error: e.message});
  }
};

module.exports = {
  InitiativewiseResourcePI,

  monthlyResourceAllocation,
  AllRequestsforBI,
  ResourceAllocationAPI,
  ExecutiveSummaryAPI,
  verifyUser,
  monthlyResourceAllocationnew,
  AllRequestsforBInew,
};
