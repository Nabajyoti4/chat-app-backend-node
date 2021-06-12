const User = require("../model/user");
//hashing
const bcrypt = require("bcryptjs");

/**
 *
 * @param {*} req
 * @param {*} res
 * Signin user
 */
exports.signin = async (req, res) => {
  //check user

  try {
    const userExists = await User.findOne({ email: req.body.email });

    if (!userExists) {
      return res.status(400).send("Invalid Credentials");
    }

    //passord check
    const checkPassword = await bcrypt.compare(
      req.body.password,
      userExists.password
    );

    if (!checkPassword) {
      return res.status(400).send("Passowrd wrong");
    }

    //jwt token
    const token = await userExists.generateToken();

    console.log(process.env.URL);
    //cookie
    res.cookie("jwtToken", token, {
      expires: new Date(Date.now() + 2589200000),
      domain: process.env.URL,
      secure: true,
      sameSite: "none",
    });

    res.status(200).json({
      message: "user signed in",
    });

    // res.header("auth-token", token).send(token);
  } catch (err) {
    console.log(err);
  }
};

/**
 * Signup new user
 * @param {*} req
 * @param {*} res
 */
exports.signup = async (req, res) => {
  //check if user already exists in db or not

  try {
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      return res.send({
        error: "User already exsist",
      });
    }

    //passord hash
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    console.log(req.file.filename);
    //create user object
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      avatar: req.file.filename,
      password: hashPassword,
    });

    //save new user in database

    const result = await user.save();
    res.send(result);
  } catch (err) {
    console.log(err);
  }
};

exports.chat = async (req, res) => {
  res.status(200).json({
    id: req.authUser._id,
    name: req.authUser.name,
    phone: req.authUser.phone,
    email: req.authUser.email,
    avatar: req.authUser.avatar,
  });
};
