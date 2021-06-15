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
      return res.status(404).json("Invalid Credentials");
    }

    //passord check
    const checkPassword = await bcrypt.compare(
      req.body.password,
      userExists.password
    );

    if (!checkPassword) {
      return res.status(404).json("Invalid Credentials");
    }

    //jwt token
    const token = await userExists.generateToken();

    res.status(200).json({
      message: "Login Succesfull",
      token: token,
    });

    // res.header("auth-token", token).send(token);
  } catch (err) {
    res.status(400).json({
      message: "Something Went Wrong Try again",
    });
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

    res.status(201).json({
      message: "Your account is being Created succesfully",
    });
  } catch (err) {
    res.status(400).json({
      message: "Something Went Wrong Try again",
    });
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
