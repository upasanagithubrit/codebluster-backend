const Course=require("../models/course")
const Tag=require("../models/tag")
const User=require("../models/user")
const {uploadImageToCloudinary}=require("../utils/imageUploader")


exports.createCourse=async(req,res)=>{
    try{

        //fetchdata
        const{courseName, courseDescription,whatYouWillLearn,price,tag}=req.body;

        //get thumbnail
        const thumbnail=req.files.thumbnailImage;

        if(!courseName||! courseDescription||!whatYouWillLearn||!price||!tag)
        {
            return res.status(400).json({
                success:true,
                messge:"all fields are required",
            })
        }

        //check for instructor
        const userId=req.user.id;
        const instructorDetails=await User.findById(userId);
        console.log("instructor details",instructorDetails)

        if(!instructorDetails)
        {
            return res.status(404).json({
                success:false,
                messge:"instructor details not found",
            })

        }

        //tag is valid or not(given tag)
        const tagDetails=await Tag.findById(tag);
        if(!tagDetails)
        {
            return res.status(404).json({
                success:false,
                message:"tag details not found",
            })

        }

        //upload to cloudinary
        const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

  //create an entry fofr new course
  const newCourse=await Course.create({
    courseName,
    courseDescription,
    instructor:instructorDetails._id,
    whatYouWillLearn,
    price,
    tag:tagDetails._id,
    thumbnail:thumbnailImage.secure_url,
  })

  //add new course to user schemaof instructor
  await User.findByIdAndUpdate(
    {_id:instructorDetails._id},
    {
        $push:{
        courses:newCourse._id,
    }
},
    {
        new:true,
    }
  )


  //update the tag ka schema
  //todo

  //return response
  return res.status(200).json({
    success:true,
    message:"Course created successfully",
    data:newCourse,
  })





    }catch(error){
        return res.status(200).json({
            success:false,
            message:"failed course creation",
            error:error.message,
          })

    }
}

//get all courses
exports.showAllCourses=async(req,res)=>{
    try{
        //todo--change the below stTMENT INCREMENTALLY
        const allCourses=await Course.find({},{
            courseName:true,
            courseDescription:true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true,
        }).populate("instructor").exec();

           return res.status(200).json({
            success:true,
            message:"all course returned successfully",
            allCourses,
        })

    }catch{
        return res.status(500).json({
            success:false,
            message:"can not fetch course data",
            error:error.message,
        })

    }
}