const userDb = require('../models/userModel');

module.exports = {

    userManageGet : async (req,res) => {

        try {
            const user = await userDb.find();
            res.render('admin/userManage',{user});
        } catch(error){

            res.status(500).json({error:"Error Fetching User"});
            
        }
       
    },
    updateAccess : async (req,res) => {

        try {   
            const id = req.params.id;
            const blockUser = await userDb.findById(id);
            let newAccess;
            if(blockUser.access === 'status-active'){
                const blocked = await userDb.updateOne({_id : id},{$set : { access : "status-deactive" }})
                newAccess = "status-deactive";
            }else{
                const unBlocked = await userDb.updateOne({ _id : id} ,{ $set : {access : "status-active" }})
                newAccess = "status-active";
            }
            res.json({ success: true, newAccess })
        } catch (error) {
            console.log("blocking error ",error);
            res.json({ success: false, message: "Update failed" });
        }
    }
}