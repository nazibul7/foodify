import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.model";
import { errorHandler } from "../middleweres/errorHandler";
import {
  ValidatUserRequest,
  ValidatUserRequestType,
} from "../utils/zod.validation";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { auth0Id } = req.body;
    const existingUser = await User.findOne({ auth0Id });
    if (existingUser) {
      return res.status(200).json(existingUser)
    }
    const newUser = await User.create(req.body);
    await newUser.save();
    console.log("create user called");

    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const updateCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = ValidatUserRequest.safeParse(req.body);
    if (!result.success) {
      const data = result.error.flatten().fieldErrors;
      return res.status(400).json(data);
    }
    const { name, addressLine1, city, country }: ValidatUserRequestType =
      ValidatUserRequest.parse(req.body);
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = name;
    user.addressLine1 = addressLine1;
    user.city = city;
    user.country = country;

    await user.save();
    console.log("update user called");
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { auth0Id } = req;
    const user = await User.findOne({ auth0Id });
    if (!user) {
      throw new Error("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
