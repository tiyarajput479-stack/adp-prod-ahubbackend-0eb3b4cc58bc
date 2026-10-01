/**
 * Seed script for the new Resource Tracker.
 *
 * Loads the resource directory (148 rows) into the `ResourceTracker`
 * collection used by NewResourceTrackerModel.
 *
 * Usage (from the AhubBackend folder):
 *   node scripts/seedNewResourceTracker.js            -> inserts rows (keeps existing docs)
 *   node scripts/seedNewResourceTracker.js --replace  -> clears the collection first, then inserts
 *
 * Requires `connection_url` to be set in the .env file (same as the app).
 */

const mongoose = require('mongoose');
require('dotenv').config();
const { NewResourceTrackerModel } = require('../models/NewResourceTrackerModel');

// Column order for each row tuple below.
const FIELDS = [
  'Associate ID',
  'Name',
  'Reporting Manager',
  'Manager',
  'Type',
  'Stream',
  'Role',
  'Country',
  'Status',
  'Project/Product',
  'Group',
  'Finance Names',
  'iKare Project',
  'Comments',
];

// prettier-ignore
const ROWS = [
  ["NA","Mayank Sharma","Satish Bhor","Vamsi Chitrakavi","Contractor","RPA",".Net Developer","India","Active","RPA","Atlas","GV Atlas","",""],
  ["NA","Dnyaneshwar Suryawanshi","Satish Bhor","Vamsi Chitrakavi","Contractor","RPA",".Net Developer","India","Active","RPA","Atlas","GV Atlas","",""],
  ["NA","Hemant Metkari","Satish Bhor","Vamsi Chitrakavi","Contractor","RPA",".Net Developer","India","Active","RPA","Atlas","GV Atlas","",""],
  ["NA","Rahul Chalindrawar","Satish Bhor","Vamsi Chitrakavi","Contractor","RPA",".Net Developer","India","Active","RPA","Atlas","GV Atlas","",""],
  ["NA","Sanjay Kolekar","Satish Bhor","Vamsi Chitrakavi","Contractor","RPA",".Net Developer","India","Active","RPA","Atlas","GV Atlas","",""],
  ["NA","Yash Jaiswal","Satish Bhor","Vamsi Chitrakavi","Contractor","RPA",".Net Developer","India","Active","RPA","Atlas","GV Atlas","",""],
  ["NA","Ayush Singhal","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Assist/ESI Fusion","Atlas","GV Atlas","",""],
  ["NA","Aakansha Mahajan","Pranay Etikala","Pranay Etikala","Contractor","Application Development","Full Stack Developer","India","Active","AI Assist/ESI Fusion","Atlas","GV Atlas","",""],
  ["NA","Ayushi Omray","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Assist/ESI Fusion","Atlas","GV Atlas","",""],
  ["NA","Sajan Arora","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Assist/ESI Fusion","Atlas","GV Atlas","",""],
  ["Offered","Offered","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Offered","AI Assist/ESI Fusion","Atlas","GV Atlas","",""],
  ["570815","Satish Mekala","Siddharth Thakur","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","AI Assist/ESI Fusion","Atlas","GV Atlas","",""],
  ["NA","Shefali Verma","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["NA","Rahul Sharma","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["NA","Aryan Vijayvergiya","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["NA","Harshita KM","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["NA","Aadarsh Pandey","Pranay Etikala","Pranay Etikala","Contractor","PMO","PMO","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["NA","Harsh Aagarwal","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["Vacant","Vacant","Pranay Etikala","Pranay Etikala","Associate","Infrastructure","DevOPS Engineer","India","Vacant","Infrastructure","Atlas","GV Atlas","","Siddharth Thakur - DevOPS/Infra Engineer"],
  ["Offered","Offered","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Offered","Case Management","Atlas","GV Atlas","",""],
  ["Offered","Offered","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Offered","Case Management","Atlas","GV Atlas","",""],
  ["Offered","Offered","Pranay Etikala","Pranay Etikala","Associate","GenAI","Technical Lead - Atlas","India","Offered","Case Management","Atlas","GV Atlas","",""],
  ["562812","Deepak Singh","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["NA","Mayank Gupta","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["NA","Shivam Mishra","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["NA","Grawish Sachdeva","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["NA","Mahesh Gayakwad","Pranay Etikala","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["NA","Sakar Kardekar","Abhiram Mocharla","Pranay Etikala","Contractor","GenAI","GenAI Developer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["NA","Avigyat Tripathi","Shantanu Singh","Shantanu Singh","Contractor","PO","Product Owner","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["567258","Sateesh Kumar Adala","Sravan Chowdary","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["Offered","Offered","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Offered","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["562814","Prakhar Mishra","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["","Iatan Dragos","Danielli Lucchesi","Danielli Lucchesi","Romania","GenAI","GenAI Developer","Romania","Active","AI Guided Implementation","Atlas","GV Atlas","",""],
  ["NA","Shashank Jha","Sirish Soma","Sirish Soma","Contractor","Power BI","Reporting Developer","India","Active","Data","Atlas","GV Atlas","",""],
  ["NA","Rajesh Kovvuru","Sirish Soma","Sirish Soma","Contractor","GenAI","GenAI Developer","India","Active","Data","Atlas","GV Atlas","",""],
  ["NA","Karan Mathur","Sirish Soma","Sirish Soma","Contractor","Data Engineer","Process Mining Expert","India","Active","Data","Atlas","GV Atlas","",""],
  ["543129","Vandana Garlapati","Shantanu Singh","Shantanu Singh","Associate","PO","Product Owner","India","Active","Data","Atlas","GV Atlas","",""],
  ["567841","Shyantan Ganta","Siddharth Thakur","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","Case Management","Atlas","GV Atlas","",""],
  ["456938","Srilaxmi Koganti","Supriya Tapkir","Sirish Soma","Associate","ETL","ETL Developer - Talend","India","Active","Data","Atlas","GV Atlas","",""],
  ["560874","Gauri Rao","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","Data","Atlas","GV Atlas","",""],
  ["Vacant","Vacant","","Danielli Lucchesi","Romania","Leadership","Leadership","Romania","Vacant","Data Hub","Atlas","GV Atlas","",""],
  ["226034","Pranay Etikala","Ravi Posani","Ravi Posani","Associate","Leadership","Leadership","India","Active","Leader","AI & Strategic Platforms","RPA Team India","",""],
  ["511725","Ajoe Johnson","Pranay Etikala","Pranay Etikala","Associate","Application Development","Full Stack Developer","India","Active","Chatbot, Intake Management Tool","AI & Strategic Platforms","RPA Team India","",""],
  ["297176","Abhiram Mocharla","Pranay Etikala","Pranay Etikala","Associate","GenAI","Technical Lead - GenAI","India","Active","Technical Lead - GenAI","AI & Strategic Platforms","RPA Team India","",""],
  ["556102","Sushma Polasa","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Active","Data Studio","AI & Strategic Platforms","RPA Team India","",""],
  ["473323","Raj Kumar thammisetty","Pranay Etikala","Pranay Etikala","Associate","Application Development","Full Stack Developer","India","On Notice","MyData Capture, Sub Processor Directory","AI & Strategic Platforms","RPA Team India","",""],
  ["392005","Sachin Saraswat","Pranay Etikala","Pranay Etikala","Associate","Application Development","Full Stack Developer","India","Active","Data Studio","AI & Strategic Platforms","RPA Team India","",""],
  ["572301","Eswar Dutta","Pranay Etikala","Pranay Etikala","Associate","Application Development","Full Stack Developer","India","Active","MyData Capture","AI & Strategic Platforms","RPA Team India","",""],
  ["243065","Umesh Agarwal","Pranay Etikala","Pranay Etikala","Associate","Architecture","Architect","India","Active","Data Studio","AI & Strategic Platforms","RPA Team India","",""],
  ["554465","Vikas Upre","Pranay Etikala","Pranay Etikala","Associate","GenAI","GenAI Developer","India","Active","Data Studio","AI & Strategic Platforms","RPA Team India","",""],
  ["563660","Devendra Kumar","Pranay Etikala","Pranay Etikala","Associate","UI/UX","UX Designer","India","Active","UX Designer","AI & Strategic Platforms","RPA Team India","",""],
  ["456404","Aswini Naga Swetha Anumolu","Satya Vara Prasad Neelapu","Sirish Soma","Associate","ETL","ETL Developer - Data Bricks & Talend","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["449924","Deexitha Adavelli","Satya Vara Prasad Neelapu","Sirish Soma","Associate","Power BI","Reporting Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["428306","DileepKumar Tammireddy","Rama Krishna Vemuri","Sirish Soma","Associate","GenAI","Technical Lead - GenAI","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["478756","Harmeeth Singh Sardar","Rama Krishna Vemuri","Sirish Soma","Associate","Application Development","Full Stack Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["420617","Navya Konathala","Satya Vara Prasad Neelapu","Sirish Soma","Associate","Power BI","Reporting Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["292015","Satya Vara Prasad Neelapu","Sirish Soma","Sirish Soma","Associate","ETL","Technical Lead - Data Bricks & Talend","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["448664","Shahul Shaik","Satya Vara Prasad Neelapu","Sirish Soma","Associate","ETL","ETL Developer - Data Bricks & Talend","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["Vacant","Vacant","","Sirish Soma","Associate","Application Development","Full Stack Developer","India","Vacant","Data Hub","Data","BI Team India GBS","",""],
  ["568214","Deepthi Sidda","Supriya Tapkir","Sirish Soma","Associate","ETL","Python Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["521496","Sainath Gade","Supriya Tapkir","Sirish Soma","Associate","ETL","Talend Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["519089","Prathyusha Voola","Supriya Tapkir","Sirish Soma","Associate","ETL","ETL Developer - Talend","India","Active","Data Hub","","","",""],
  ["560807","Karthikeya Chityala","Rama Krishna Vemuri","Sirish Soma","Associate","Infrastructure","DevOPS Engineer","India","Active","Data Hub","","","",""],
  ["472605","Ramya Kumari Tanneeru","Supriya Tapkir","Sirish Soma","Associate","ETL","Talend Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["511758","Sai Srikar Rambhatla","Supriya Tapkir","Sirish Soma","Associate","ETL","Talend Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["463315","Chandra Shekhar Reddy Mada","Supriya Tapkir","Sirish Soma","Associate","ETL","Talend Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["568213","Krishna Murthi Vavilala","Rama Krishna Vemuri","Sirish Soma","Associate","ETL","Python Developer","India","Active","Data Hub","","","",""],
  ["515444","Shaik Imran Basha Gousalazam","Rama Krishna Vemuri","Sirish Soma","Associate","GenAI","GenAI Developer","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["396757","Rama Krishna Vemuri","Sirish Soma","Sirish Soma","Associate","GenAI","Technical Lead - GenAI","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["414619","Supriya Tapkir","Sirish Soma","Sirish Soma","Associate","ETL","Technical Lead - Talend","India","Active","Data Hub","Data","RPA Team India","",""],
  ["518037","Saidulu Bugga","Satya Vara Prasad Neelapu","Sirish Soma","Associate","ETL","ETL Developer - Data Bricks & Talend","India","Active","Data Hub","Data","RPA Team India","",""],
  ["525164","Gopala Krishna Shaik","Satya Vara Prasad Neelapu","Sirish Soma","Associate","Power BI","Reporting Developer","India","Active","Data Hub","Data","RPA Team India","",""],
  ["Vacant","Vacant","","Sirish Soma","Associate","GenAI","GenAI Developer","India","Vacant","Data Hub","Data","BI Team India GBS","",""],
  ["Vacant","Vacant","","Sirish Soma","Associate","ETL","Performance Engineer","India","Vacant","Data Hub","Data","BI Team India GBS","",""],
  ["273952","Sirish Soma","Ravi Posani","Ravi Posani","Associate","Leadership","Leadership","India","Active","Data Hub","Data","BI Team India GBS","",""],
  ["417646","Saurav Mitra","Shantanu Singh","Shantanu Singh","Associate","PO","Product Owner","India","Active","BPMS","Ditigal Engineering","RPA Team India","ESI RPA Core Team",""],
  ["461678","Akshay Kombathula","Sravan Chowdary","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["460539","Mounika Buyyakar","Sravan Chowdary","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","Data Studio","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["477578","Sandeep Doki","Sravan Chowdary","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","MyDataCapture","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["569017","Shiva Kumar Ponnaganti","Siddharth Thakur","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI Digi Tech ATLAS 2",""],
  ["399508","Rupa AR","Sravan Chowdary","Shantanu Singh","Associate","QA","Automation Engineer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["293838","Sravan Chowdary","Shantanu Singh","Shantanu Singh","Associate","QA","Technical Lead - QA","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["406818","Divya Basingala","Mahendra Mylapalli","Mahendra Mylapalli","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["469787","M Prashanth Reddy","Ravindra Inturi","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["456074","Nikhil Nadipena","Mahendra Mylapalli","Mahendra Mylapalli","Associate","Infrastructure","DevOPS Engineer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["477483","Panjala Saichand Goud","Mahendra Mylapalli","Mahendra Mylapalli","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["403061","Ravindra Inturi","Raja Pradeep Botta","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["457365","Roopali Konkati","Ravindra Inturi","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","On Notice","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["533762","Siva Koti Bandi","Ravindra Inturi","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["468752","Sayyad Azhar Sultan","Ravindra Inturi","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["385604","Srikanth Boddu","Mahendra Mylapalli","Mahendra Mylapalli","Associate","BPMS","Full Stack Developer","India","Active","Data Studio","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["466455","Venkatesh Vandanasetti","Raja Pradeep Botta","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","Active","Data Studio","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["520438","Karthik K","Saurav Mitra","Shantanu Singh","Associate","PO","Product Owner","India","Active","Data Studio","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["469664","Navya D","Saurav Mitra","Shantanu Singh","Associate","PO","Product Owner","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["278468","Rajender Kallem","Shantanu Singh","Shantanu Singh","Associate","PO","Product Owner","India","Active","BPMS","ADP Robotics","BPM Team India","ESI BPM",""],
  ["489303","Sri Harsha Vupputuri","Saurav Mitra","Shantanu Singh","Associate","PO","Product Owner","India","Active","MyDataCapture","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["508915","Vivek Suryawanshi","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","BPM Team India","ESI RPA Core Team",""],
  ["280468","Mahendra Mylapalli","Raja Pradeep Botta","Raja Pradeep Botta","Associate","Leadership","Leadership","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["290865","Shantanu Singh","Raja Pradeep Botta","Raja Pradeep Botta","Associate","Leadership","Leadership","India","Active","BPMS","Ditigal Engineering","BPM Team India","ESI BPM",""],
  ["573629","Reethu Sri Devunuri","Mohan Ranga Reddy Gudreddi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["Vacant","Vacant","","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Vacant","RPA","ADP Robotics","BI Team India GBS","","Pratyush Deyashi"],
  ["464038","Satish Bhor","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA","GenAI Developer","India","On Notice","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["231758","Yogesh Deshmukh","Raja Pradeep Botta","Raja Pradeep Botta","Associate","Leadership","Leadership","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["418646","Akash Khose","Yogesh Deshmukh","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","Canada RPA Team",""],
  ["408296","Deepali Pardhe","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["417147","Disha Panwar","Yogesh Deshmukh","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["462909","Dwij Jaroli","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["419098","Komma Sai Devendra Kumar","Sunny Pawar Mamidi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["510045","Mohan Ranga Reddy Gudreddi","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA","Full Stack Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["459331","Pragati Patnaik","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["415196","Rahul Gaikwad","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["405908","Rahul Katukury","Sunny Pawar Mamidi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["420840","Sunil Parupalli","Sunny Pawar Mamidi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["417664","Sunny Pawar Mamidi","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA","Technical Lead - RPA","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["418981","Supriya Khandare","Vamsi Chitrakavi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["573308","Pranay Deep Goud Javvaji","Mohan Ranga Reddy Gudreddi","Raja Pradeep Botta","Associate","RPA",".Net Developer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["511757","Harshitha Poonumalli","Mahendra Mylapalli","Mahendra Mylapalli","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","RPA Team India","ESI RPA Core Team",""],
  ["369951","Vinod Katta","Mahendra Mylapalli","Mahendra Mylapalli","Associate","BPMS","Full Stack Developer","India","Active","BPMS","Ditigal Engineering","RPA Team India","ESI BPM",""],
  ["438339","Aditya Prasad","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["399383","Bhargav Namana","Shantanu Singh","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["516268","Kiranbala Subudhi","Saurav Mitra","Shantanu Singh","Associate","PO","Product Owner","India","Active","Data Studio","Ditigal Engineering","RPA Team India","ESI RPA Core Team",""],
  ["477039","Maroti Rodge","Shantanu Singh","Shantanu Singh","Associate","Support","Technical Lead - Support","India","Active","Support","Ditigal Engineering","RPA Team India","ESI RPA Core Team",""],
  ["419322","Prathmesh Chaskar","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["421839","Rohit Agrawal","Saurav Mitra","Shantanu Singh","Associate","PO","Product Owner","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["309957","Sachin Owal","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["427706","Sai Sivanandh Kaithepalli","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["427701","Supriya Challa","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["427703","Upputuri Aravind Babu","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["515393","Lakshmi Swetha Kayala","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["515373","Abhishek P","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["573877","Vamsi Chitrakavi","Raja Pradeep Botta","Raja Pradeep Botta","Associate","Leadership","Leadership","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["518237","Karunakar Reddy Kayithi","Venkatesh Vandanasetti","Raja Pradeep Botta","Associate","BPMS","Full Stack Developer","India","Active","Data Studio","Ditigal Engineering","RPA Team India","ESI RPA Core Team",""],
  ["559557","Vivek Mahajan","Yogesh Deshmukh","Raja Pradeep Botta","Associate","Infrastructure","DevOPS Engineer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["314964","Mahesh Pillai","Yogesh Deshmukh","Raja Pradeep Botta","Associate","Infrastructure","DevOPS Engineer","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["564124","Ramakrishna Nuthalapati","Raja Pradeep Botta","Raja Pradeep Botta","Associate","PMO","PMO","India","Active","BPMS","Ditigal Engineering","RPA Team India","ESI RPA Core Team",""],
  ["515380","Sampath Bugata","Maroti Rodge","Shantanu Singh","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["571858","Pralay Kasidi","Raja Pradeep Botta","Raja Pradeep Botta","Associate","Support","Production Support","India","Active","RPA","ADP Robotics","RPA Team India","ESI RPA Core Team",""],
  ["NA","Manoj Vaishnav","Vamsi Chitrakavi","Raja Pradeep Botta","Contractor","RPA",".Net Developer","India","Active","ESI Digital RPA","ADP Robotics","Digital initiatives (incl EY contractors)","",""],
  ["NA","Priyanshu Singh","Yogesh Deshmukh","Shantanu Singh","Contractor","Support","Production Support","India","Active","ESI Digital Support","ADP Robotics","Digital initiatives (incl EY contractors)","",""],
  ["NA","Rohit Raut","Abhiram Mocharla","Pranay Etikala","Contractor","Application Development","Full Stack Developer","India","Active","MyData Capture","AI & Strategic Platforms","Digital initiatives (incl EY contractors)","",""],
  ["NA","Bhavesh Patil","Abhiram Mocharla","Pranay Etikala","Contractor","Application Development","Full Stack Developer","India","Active","MyData Capture","AI & Strategic Platforms","Digital initiatives (incl EY contractors)","",""],
  ["NA","Ritesh Pariyali","Pranay Etikala","Pranay Etikala","Contractor","Application Development","Full Stack Developer","India","Active","MyData Capture","AI & Strategic Platforms","Digital initiatives (incl EY contractors)","",""],
  ["NA","Subhashish Kundu","Vamsi Chitrakavi","Raja Pradeep Botta","Contractor","RPA",".Net Developer","India","Active","ESI Digital RPA","ADP Robotics","Digital initiatives (incl EY contractors)","",""],
  ["NA","Sumit Sharma","Vamsi Chitrakavi","Raja Pradeep Botta","Contractor","RPA",".Net Developer","India","Active","ESI Digital RPA","ADP Robotics","Digital initiatives (incl EY contractors)","",""],
  ["NA","Basvaraj Hajep","Mahendra Mylapalli","Mahendra Mylapalli","Contractor","BPMS","Full Stack Developer","India","Active","ESI Digital RPA","BPMS","Digital initiatives (incl EY contractors)","",""],
  ["315312","Raja Pradeep Botta","Ravi Posani","Ravi Posani","Associate","Leadership","Leadership","India","Active","Leader","Ditigal Engineering","","",""],
  ["NA","Sivasakthi Perambalur","Pranay Etikala","Pranay Etikala","Contractor","Chabot","Chabot Developer","India","Active","Chatbot","AI & Strategic Platforms","Digital initiatives (incl EY contractors)","",""],
  ["NA","Vacant","Mahendra Mylapalli","Mahendra Mylapalli","Contractor","BPMS","Full Stack Developer","India","Active","ESI Digital RPA","Data Studio","Digital initiatives (incl EY contractors)","",""],
];

function toDocument(row) {
  const doc = {};
  FIELDS.forEach((field, index) => {
    doc[field] = row[index] !== undefined ? row[index] : '';
  });
  return doc;
}

async function seed() {
  const replace = process.argv.includes('--replace');

  if (!process.env.connection_url) {
    console.error('Missing `connection_url` in environment (.env). Aborting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.connection_url);
    console.info('Connected to database.');

    const documents = ROWS.map(toDocument);

    if (replace) {
      const { deletedCount } = await NewResourceTrackerModel.deleteMany({});
      console.info(`Cleared existing collection (${deletedCount} documents removed).`);
    }

    const inserted = await NewResourceTrackerModel.insertMany(documents, { ordered: false });
    console.info(`Inserted ${inserted.length} resource records.`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.info('Disconnected from database.');
  }
}

seed();
