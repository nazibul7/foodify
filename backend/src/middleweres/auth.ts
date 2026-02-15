import { NextFunction, Request, Response } from "express";
import { auth } from "express-oauth2-jwt-bearer";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model";

const jwtCheck = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUE_BASED_URL,
  tokenSigningAlg: "RS256",
});

export { jwtCheck };

export const jwtParse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      return res.status(401).json("Unauthorized");
    }
    const accessToken = token.split(" ")[1];
    const decode = jwt.decode(accessToken);

    if (!decode || typeof decode != "object") {
      return res.status(401).json("Invalid token");
    }

    const auth0Id = decode.sub;

    if (typeof auth0Id !== "string") {
      return res.status(401).json("Invalid subject");
    }

    // Check if it's a M2M token (client credentials)
    if (auth0Id.endsWith('@clients')) {
      const testUser = await User.findOne({
        email: "baseline.user@test.io"
      });

      if (!testUser) {
        return res.status(401).json("Test user not found");
      }
      req.auth0Id = testUser.auth0Id;
      req.userId = testUser._id.toString();
      // console.log(testUser);
      
      return next();
    }

    // Regular user token flow
    const user = await User.findOne({ auth0Id })
    if (!user) {
      return res.status(401).json("Incorrect token");
    }

    req.auth0Id = auth0Id as string;
    req.userId = user._id.toString();
    next();
  } catch (error) {
    next(error);
  }
};
