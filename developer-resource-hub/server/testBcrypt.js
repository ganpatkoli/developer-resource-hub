import jwt from  'jsonwebtoken';

// Aapka data
const adminId = "68a6c5dfe1befd8813548cac";
const SECRET_KEY = "supersecretkey";

// Token generate karein (Aap ismein expiry bhi add kar sakte hain)
const token = jwt.sign(
    { id: adminId }, 
    SECRET_KEY, 
    { expiresIn: '24h' } 
);

console.log("Generated JWT Token:", token);