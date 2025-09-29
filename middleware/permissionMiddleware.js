//
// const permissionMiddleware = (requiredPermission) => {

//   return (req, res, next) => {
//     const token = req.header("Authorization")?.replace("Bearer ", "");
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "No token, authorization denied" });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const permissions = decoded.permissions;

//       if (!permissions[requiredPermission]) {
//         return res.status(403).json({ message: "Access denied" });
//       }

//       next();
//     } catch (err) {
//       res.status(401).json({ message: "Invalid token" });
//     }
//   };
// };

// module.exports = permissionMiddleware;

// const permissionMiddleware = (requiredPermission) => {
//   console.log("requiredPermission", requiredPermission);
//   return (req, res, next) => {
//     const token = req.header("Authorization")?.replace("Bearer ", "");

//     console.log("token", token);
//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "No token, authorization denied" });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);

//       // Check if the waiter has the required permission
//       if (!decoded.permissions[requiredPermission]) {
//         return res
//           .status(403)
//           .json({ message: "Forbidden: Insufficient permissions" });
//       }

//       req.waiterId = decoded.id; // Attach waiter ID to the request
//       next();
//     } catch (err) {
//       console.error("Invalid token:", err.message);
//       res.status(401).json({ message: "Invalid token" });
//     }
//   };
// };

// module.exports = permissionMiddleware;

const jwt = require("jsonwebtoken"); // Import jsonwebtoken

const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("Token:", token); // Debugging: Log the token
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("Decoded Token:", decoded); // Debugging: Log the decoded token

      // Check if the token contains the permissions object
      if (!decoded.permissions) {
        return res
          .status(403)
          .json({ message: "Forbidden: No permissions found in token" });
      }

      // Check if the waiter has the required permission
      if (!decoded.permissions[requiredPermission]) {
        return res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
      }

      // Attach waiter ID to the request
      req.waiterId = decoded.id;
      next();
    } catch (err) {
      console.error("Invalid token:", err.message); // Debugging: Log the error
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

module.exports = permissionMiddleware;
