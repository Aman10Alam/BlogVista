import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import cors from "cors";
import serviceAccountKey from "./blogvista-45c3a-firebase-adminsdk-ukew7-fbdcc90f2d.json" assert { type: "json" };
import { getAuth } from "firebase-admin/auth";
import aws from "aws-sdk";

import User from "./Schema/User.js";
import admin from "firebase-admin";
import Blog from "./Schema/Blog.js";

const server = express();
let PORT = 3000;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password
server.use(cors()); // this enables server to accept data from any port

server.use(express.json()); // basically it enables json type of data being shared btw frontend and backend

mongoose.connect(process.env.DB_LOCATION, {
  autoIndex: true,
});

//setting up aws s3 bucket
const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const generateUploadURL = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise("putObject", {
    // accessing the aws bucket to get image link hence await as it takes some time
    Bucket: "blogvista1",
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  });
};

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //["Bearer","access_token"]

  if (token == null) {
    return res.status(401).json({ error: "No access token" });
  }

  jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Access token is invalid" });
    }

    req.user = user.id;
    next();
  });
};

const formatDatatoSend = (user) => {
  const access_token = jwt.sign(
    { id: user._id },
    process.env.SECRET_ACCESS_KEY
  );

  return {
    access_token: access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
  };
};

const generateUserName = async (email) => {
  let username = email.split("@")[0];

  let isUserNameExists = await User.exists({
    "personal_info.username": username,
  }).then((result) => result);

  isUserNameExists ? (username += nanoid().substring(0, 5)) : "";

  return username;
};

server.get("/get-upload-url", (req, res) => {
  generateUploadURL()
    .then((url) => res.status(200).json({ uploadURL: url }))
    .catch((err) => {
      console.log(err.message);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/signup", (req, res) => {
  let { fullname, email, password } = req.body;

  if (fullname.length < 3) {
    return res
      .status(403)
      .json({ error: "Fullname must be at least 3 letters long" });
  }
  if (!email.length) {
    return res.status(403).json({ error: "Email is required" });
  }

  if (!emailRegex.test(email)) {
    // cheecking whether email follows a acertain pattern or not
    return res.status(403).json({ error: "Invalid Email Address" });
  }

  if (!passwordRegex.test(password)) {
    return res.status(403).json({
      error:
        "Password should be 6 to 20 characters long with 1 numeric,1 lowercase and 1 uppercase letters",
    });
  }

  bcrypt.hash(password, 10, async (err, hashed_password) => {
    let username = await generateUserName(email);

    let user = new User({
      personal_info: { fullname, email, password: hashed_password, username },
    });

    //console.log(user);
    user
      .save()
      .then((u) => {
        return res.status(200).json(formatDatatoSend(u));
      })
      .catch((err) => {
        if (err.code == 11000) {
          return res.status(403).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: err.message });
      });
  });
});

server.post("/signin", (req, res) => {
  let { email, password } = req.body;

  User.findOne({ "personal_info.email": email })
    .then((user) => {
      if (!user) {
        return res.status(403).json({ error: "email does not exist" });
      }

      if (!user.google_auth) {
        bcrypt.compare(password, user.personal_info.password, (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ error: "Error has occured please login again" });
          }

          if (!result) {
            return res.status(403).json({ error: "Incorrect password" });
          } else {
            return res.status(200).json(formatDatatoSend(user));
          }
        });
      } else {
        return res.status(403).json({
          error:
            "Account was logged in through google.Try logging in with google",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: err.message });
    });
});

server.post("/google-auth", async (req, res) => {
  let { access_token } = req.body;

  getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser) => {
      let { email, name, picture } = decodedUser;

      picture = picture.replace("s96-c", "s384-c"); // to get high resolution profile image

      let user = await User.findOne({ "personal_info.email": email })
        .select(
          "personal_info.fullname personal_info.username personal_info.profile_img google_auth"
        )
        .then((u) => {
          return u || null;
        })
        .catch((err) => {
          return res.status(500).json({ error: err.message });
        });

      if (user) {
        if (!user.google_auth) {
          return res.status(403).json({
            error:
              "This email was signed up without google.Please log in with password to access the account",
          });
        }
      } else {
        let username = await generateUserName(email);
        user = new User({
          personal_info: { fullname: name, email, username },
          google_auth: true,
        });

        await user
          .save()
          .then((u) => {
            user = u;
          })
          .catch((err) => {
            return res.status(500).json({ error: err.message });
          });
      }

      return res.status(200).json(formatDatatoSend(user));
    })
    .catch((err) => {
      return res.status(500).json({
        error:
          "Failed to authenticate you with google.Try with some other google account",
      });
    });
});

// here verifyJWT act as a middleware which is performed before going to that route
server.post("/create-blog", verifyJWT, (req, res) => {
  let authorId = req.user;

  let { title, des, banner, tags, content, draft } = req.body;

  if (!title.length) {
    return res
      .status(403)
      .json({ error: "You must provide a title to publish the blog" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters",
      });
    }

    if (!banner.length) {
      return res
        .status(403)
        .json({ error: "You must provide blog banner to publish it" });
    }

    if (!content.blocks.length) {
      return res
        .status(403)
        .json({ error: "There must be some blog connect to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res
        .status(403)
        .json({
          error: "Provide tags in order to publish the blog , Maximum 10",
        });
    }
  }

  tags = tags.map((tag) => tag.toLowerCase());

  let blogId =
    title
      .replace(/[^a-zA-Z)-9]/g, " ")
      .replace(/\s+/g, "-")
      .trim() + nanoid();
  // the 1st replace function will replace spec. char. from blog-title with ' ', 2nd replace will replace ' ' with '-' and trim
  // to remove extra ' ' . nanoid to addd extra text to make it unique

  let blog = new Blog({
    title,
    des,
    banner,
    content,
    tags,
    author: authorId,
    blog_id: blogId,
    draft: Boolean(draft),
  });

  blog
    .save()
    .then((blog) => {
      let incrementVal = draft ? 0 : 1;

      //mongoose func to find and update at same time
      User.findOneAndUpdate(
        { _id: authorId },
        {
          $inc: { "account_info.total_posts": incrementVal },
          $push: { blogs: blog._id },
        }
      )
        .then((user) => {
          return res.status(200).json({ id: blog.blog_id });
        })
        .catch((err) => {
          return res
            .status(500)
            .json({ error: "Failed to update total posts number" });
        });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

//using get as no kind of validation required
server.get("/latest-blogs", (req, res) => {
  let maxLimit = 5;

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    //used to populate reference fields in a document of a certain collection with documents from another collection
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .limit(maxLimit)
    .then((blogs) => {
      return res.status(200).json({ blogs });
    })
    .catch((err) => {
      return res.status(500).json({ error: err.message });
    });
});

server.get("/trending-blogs",(req,res)=>{

   Blog.find({draft: false})
   .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
   .sort({"activity.total_read": -1 , "activity.total_likes":-1 , "publishedAt":-1})
   .select("blog_id title publishedAt -_id")
   .limit(6)
   .then((blogs)=>{
        return res.status(200).json({ blogs});
   }) 
   .catch(err=>{
      return res.status(500).json({error: err.message});
   })
   
})

server.listen(PORT, () => {
  console.log("listening on port ->" + PORT);
});
