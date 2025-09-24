const User = require ('../models/Users');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');

//REGISTER
exports.register = async(req , res) => {
    try {
        const {fullName, userName, email ,password , role} = req.body;
        if (!fullName || !userName || !email || !password || !role)
        return res.status(400).json({ message: 'All fields required' });

        const existingUser = await User.findOne({$or: [{ email }, { userName }] })
        if(existingUser) {
          return res.status(400).json({message: 'User already exist'});
        }

        // const user = await User.create("")

        // const token = jwt.sign(
        //   { id: user._id, role: user.role },
        //   process.env.JWT_SECRET,
        //   { expiresIn: '1h' }
        // );

     

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({fullName, userName, email ,password: hashedPassword , role})

        res.status(201).json({ 
          id: user._id, 
          fullName: user.fullName, 
          userName: user.userName, 
          email: user.email ,
          role:user.role
        });

        token;

    } catch (err) {
      res.status(500).json({ message: err.message });
    }
}

//LOGIN
exports.login = async (req, res) => {
  try {
    const {userName, email, password} = req.body;
    //if (!userName && !email || !password)
    if ((!userName && !email) || !password)
    return res.status(400).json({ message: 'username or email and password are required' });

    const user = await User.findOne({$or: [{ email }, { userName }] })
    if (!user){
      return res.status(400).json({message: 'Invalid credentials'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect password. Try again!!' });

    // Access token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Refresh token  
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );
    res.json({ token, refreshToken });

    res.status(200).json({ message: "User logged in" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }


};

//PROFILE
exports.profile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user)
    res.status(200).json({ message: "User profile Fetch" });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};