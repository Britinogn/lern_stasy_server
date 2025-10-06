const User = require ('../models/Users');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const transporter = require ('../config/nodemailer')

//REGISTER
exports.register = async(req , res) => {
    try {
        const { fullName, userName, email, password, role = 'student' } = req.body;
        if (!fullName || !userName || !email || !password) {
            return res.status(400).json({ message: 'All fields required' });
        }
        if (!['student', 'instructor'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const existingUser = await User.findOne({$or: [{ email }, { userName }] })
        if(existingUser) {
          return res.status(400).json({message: 'User already exist'});
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({fullName, userName, email ,password: hashedPassword , role});

        try {
          console.log('Attempting to send welcome email to:', email);
          const emailResult = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Lern Stasy Start Your Learning Journey Today! 🚀',
            html: `<p>Hello ${fullName},</p>
            <p>Welcome to <strong>Lern Stasy</strong>! We're excited to have you join our community of learners.</p>
            <p>Your account has been successfully created, and you're ready to start exploring our courses. Here's what you can do next:</p>
            <ul>
            <li>Browse thousands of courses in our catalog</li>
            <li>Set up your learning preferences</li>
            <li>Join course discussions and connect with instructors</li>
            <li>Track your progress with personalized dashboards</li>
            </ul>
            <p>Need help getting started? Visit our <a href="https://www.lernstasy.com/help-center">Help Center</a> or contact our support team.</p>
            <p>Happy learning!</p>
            <p><strong>The Lern Stasy Team</strong></p>`
          });
          console.log("Welcome email sent successfully:", emailResult.messageId);
        } catch (err) {
          console.error("Failed to send welcome email:", err);
        }


        // JWT
        const token = jwt.sign(
          { id: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        );


        res.status(201).json({ 
          id: user._id, 
          fullName: user.fullName, 
          userName: user.userName, 
          email: user.email ,
          role: user.role,
          token,
        });

      
        //token;

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
    
    res.status(200).json({
      message: 'User logged in',
      token,
      refreshToken,
      role: user.role,
      id: user._id,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }

};


// FORGOT PASSWORD
exports.forgetPassword = async (req,res) =>{
  try {
    const {email} = req.body;
    const user = await User.findOne({email})
    if(!user)
      return res.status(400).json({message: 'No user with that email'});

    const resetToken = jwt.sign({id: user._id},
      process.env.JWT_SECRET,{
        expiresIn: '15m',
      })

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Lern Stasy Password',
        html: `<p>Hello ${user.fullName},</p>
        <p>We received a request to reset your Lern Stasy account password.</p>
       <p><a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
        <p>This link will expire in 15 minutes. If you didn't request a password reset, please ignore this email.</p>
        <p><strong>The Lern Stasy Team</strong></p>`
        });
        console.log('Password reset email sent successfully');
      
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError.message);
        // Email failure shouldn't stop the reset process, so we continue
      }

      res.status(200).json({message: 'Password reset email sent successfully'})

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// ReSet PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).send('<h3>Passwords do not match</h3>');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user info for the email
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).send('<h3>User not found</h3>');
    }

    const hashed = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(decoded.id, { password: hashed });

    // Send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Password Reset Successful',
        html: `<p>Hello ${user.fullName},</p>
        <p>Your Lern Stasy account password has been successfully reset.</p>
        <p>If you did not make this change, please contact our support team immediately.</p>
        <p><strong>The Lern Stasy Team</strong></p>`
      });

      res.status(200).json({
        message: 'Password reset successful',
      })
     
    } catch (error) {
      res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Redirect user to login page
    // return res.redirect(`${process.env.CLIENT_URL}/login`);

  } catch (error) {
    return res.status(400).send('<h3>Invalid or expired token</h3>');
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