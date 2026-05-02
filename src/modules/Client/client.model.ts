import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    clientId: {
      type: String,
      default: () => crypto.randomUUID(), // similar to defaultRandom()
      index:true
    },
    clientSecret: {
      type: String, 
    },
    companyName:{
      type:String,
      maxlength: 70,
      required:true
    },
    redirectUrl:{
      type:String,
      required:true
    }
},
{
  timestamps:true
})

const Client = mongoose.model("Client", clientSchema)
export default Client