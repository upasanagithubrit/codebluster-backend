const Tag=require('../models/tag')


//create tag
exports.createCategory=async(req,res)=>{
    try{
        const {name,description}=req.body;
        if(!name || !description)
        {
            res.status(400).json({
                success:false,
                message:"all fields are required",
            })
        }
        // create entry in db
        const tagDetails=await Tag.create({
            name:name,

            description:description,
        })
        console.log(tagDetails);
        //return respense
        return res.status(200).json({
            success:true,
            message:"tag created successfully",
        })


    }catch{
        return res.status(500).json({
            success:true,
            message:error.message,
        })

    }
}

//get all tags
exports.showAllCategory=async(req,res)=>{
    try{
        const allTags=await Tag.find({},{name:true,description:true})

           return res.status(200).json({
            success:true,
            message:"all tag returnedsuccessfully",
            allTags,
        })

    }catch{
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}