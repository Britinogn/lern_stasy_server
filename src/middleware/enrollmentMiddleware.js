// module.exports = (req,res, next) =>{
//     if (!req.user || !req.userRole) {
//         return res.status(401).json({message: 'Authentication required'});
//     }

//     if (req.userRole !== 'student') {
//         return res.status(403).json({
//             message: 'Access denied. Only instructors can create courses.'
//         });
//     }   next();
// }