import { NextFunction, Request, Response } from "express"

export function errorHandler(error:any, req:Request, res:Response, next:NextFunction) {
  // Your code here
  if(error.name === "ValidationError"){
    res.status(400).json({error:{message:error.message}})
    next()
  }
  else if(error.code === 11000){
     res.status(409).json({error:{message:"Email already exists"}})
    next()
  }
  else{
    res.status(500).json({error:{message:error.message}})
    next()
  }
}
