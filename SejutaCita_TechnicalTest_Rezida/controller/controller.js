const UserData = require('../models/userDatas.js')
const LoginData = require('../models/loginDatas.js')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const res = require('express/lib/response')
const e = require('express')
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

let refresTokens = []

module.exports.index = async (req, res) => {
    res.json("Welcome");
}

module.exports.display = async (req, res) => {
    try {
        const userDatas = await UserData.find();
        const loginData = await LoginData.find();
        res.json({userDatas, loginData});
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports.saveInitUser = async (req, res) => {
    // Has param
    const saltRounds = 10;

    // Get user data
    const nameUser      = req.body.Name;
    const genderUser    = req.body.Gender;
    const birthDateUser = req.body.BirthDate;
    const usernameUser  = req.body.Username;
    const passwordUser  = req.body.Password;
    const userTypeUser  = req.body.UserType;  

    // Validate that there is none duplicate username
    try {
        const usernameExists = await UserData.findOne({Username: usernameUser});
        
        if (usernameExists) return res.send({"message": "Username is already in use"})    

        // Encrypt the pass
        const hashPassword = bcrypt.hashSync(passwordUser, saltRounds);
    
        //Set into table
        const userData = new UserData({
            Name: nameUser
            , Gender    : genderUser
            , BirthDate : birthDateUser
            , Username  : usernameUser 
        });
    
        const loginData = new LoginData({
            Username    : usernameUser
            , Password  : hashPassword
            , UserType  : userTypeUser
        })
    
        try {
            const savedUserData = await userData.save();
            const savedLoginData = await loginData.save();
            // res.status(201).json(savedUserData);
            res.send({"message": "Data was saved"})
        } catch (error) {
            res.status(400).json({message: error.message});
        }     
    } catch (error) {
        res.status(404).json({message: error.message});
    }  
}

module.exports.loginUser = async (req, res) => {
    // Get param
    const usernameUser  = req.body.Username;
    const passwordUser  = req.body.Password;
    
    try {
        const usernameExists = await UserData.findOne({Username: usernameUser});
        const userLoginExists = await LoginData.findOne({Username: usernameUser});
        
        if (!usernameExists) return res.send({"message": "Username is not registered"})    

        // Check the pass
        if(await bcrypt.compare(passwordUser, userLoginExists.Password)){
            const accessToken = generateAccessToken(usernameUser)
            const refresToken = jwt.sign(usernameUser, process.env.REFRESH_TOKEN_SECRET)
            refresTokens.push(refresToken)
            // refresTokens2.push({token: refresToken, username: usernameUser})
            res.json({accessToken: accessToken, refresToken: refresToken, username: usernameUser})
            // res.json(refresTokens2)
        } else {
            res.send('Not Allowed')
        }
    } catch (error) {
        res.status(404).json({message: error.message});
    }   
}

module.exports.getToken = async (req, res) => {
    const refresToken = req.body.token

    if(refresToken == null) return res.sendStatus(401)

    if(!refresTokens.includes(refresToken)) return res.sendStatus(403)
    jwt.verify(refresToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({username: user.data})
        res.json({accessToken})
    })
} 

function generateAccessToken(user) {
    // Expires in 15s, can't use expiresin cause error payload
    return jwt.sign({exp: Math.floor(Date.now()/1000) + (1 * 15), data: user}, process.env.ACCESS_TOKEN_SECRET);
}

module.exports.getAuthentication = async (req, res) => {
    const token = req.body.Token;

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        res.json({accessToken: user})
    })
}

module.exports.getUserDatas = async (req, res) => {   
    const userName = req.body.Username

    const loginData     = await LoginData.findOne({Username: userName, UserType: 'admin'});
    const loginDataUser = await LoginData.findOne({Username: userName, UserType: 'user'});

    if(loginData) {
        try {
            const userDatas = await UserData.find();
            res.json(userDatas);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    } else if (loginDataUser) {
        try {
            const usernameExists = await UserData.findOne({Username: userName});
            res.json(usernameExists);
        } catch (error) {
            res.status(500).json({message: error.message});
        }
    }
    else{
        return res.sendStatus(403)
    }
}

module.exports.saveUserData = async (req, res) => {
    // Has param
    const saltRounds = 10;

    // Get user data
    const nameUser      = req.body.Name;
    const genderUser    = req.body.Gender;
    const birthDateUser = req.body.BirthDate;
    const usernameUser  = req.body.Username;
    const passwordUser  = req.body.Password;
    const userTypeUser  = req.body.UserType;   
    const createdBy     = req.body.CreatedBy;

    const loginDataAdmin    = await LoginData.findOne({Username: createdBy, UserType: 'admin'});

    // validate by user type
    if(loginDataAdmin) {    
        // Validate that there is none duplicate username
        try {
            const usernameExists = await UserData.findOne({Username: usernameUser});
            
            if (usernameExists) return res.send({"message": "Username is already in use"})    

            // Encrypt the pass
            const hashPassword = bcrypt.hashSync(passwordUser, saltRounds);
        
            //Set into table
            const userData = new UserData({
                Name: nameUser
                , Gender    : genderUser
                , BirthDate : birthDateUser
                , Username  : usernameUser 
            });
        
            const loginData = new LoginData({
                Username    : usernameUser
                , Password  : hashPassword
                , UserType  : userTypeUser
            })
        
            try {
                const savedUserData = await userData.save();
                const savedLoginData = await loginData.save();
                // res.status(201).json(savedUserData);
                res.send({"message": "Data was saved"})
            } catch (error) {
                res.status(400).json({message: error.message});
            }     
        } catch (error) {
            res.status(404).json({message: error.message});
        }   
    } else {
        return res.sendStatus(403)
    }
}

module.exports.updateUserData = async (req, res) => {
    // Get user data
    const nameUser      = req.body.Name;
    const genderUser    = req.body.Gender;
    const birthDateUser = req.body.BirthDate;
    const usernameUser  = req.body.Username;
    const userTypeUser  = req.body.UserType;   
    const createdBy     = req.body.CreatedBy;

    const loginDataAdmin    = await LoginData.findOne({Username: createdBy, UserType: 'admin'});

    // validate by user type
    if(loginDataAdmin) {      
        try {
            const updatedUserData = await UserData.updateOne({Username: usernameUser}, {$set: {Name: nameUser, Gender: genderUser, BirthDate: birthDateUser}});
            const updatedLoginData = await LoginData.updateOne({Username: usernameUser}, {$set: {UserType: userTypeUser}});
            // res.status(200).json(updatedUserData);
            res.send({"message": "Data was updated"})
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    } else {
        return res.sendStatus(403)
    }
}

module.exports.resetPassword = async (req, res) => {
    // Get param
    const usernameUser  = req.body.Username;
    const passwordUser  = "admin";   
    const createdBy     = req.body.CreatedBy; 

    const loginDataAdmin    = await LoginData.findOne({Username: createdBy, UserType: 'admin'});

    // validate by user type
    if(loginDataAdmin) {    
        // Has param
        const saltRounds = 10; 

        // Encrypt the pass
        const hashPassword = bcrypt.hashSync(passwordUser, saltRounds);

        try {
            const updatedLoginData = await LoginData.updateOne({Username: usernameUser}, {$set: {Password: hashPassword}});
            // res.status(201).json(updatedLoginData);
            res.send({"message": "Password was reset, default password: admin"})
        } catch (error) {
            res.status(400).json({message: error.message});
        }   
    } else {
        return res.sendStatus(403)
    }
}

module.exports.getLoginDatas = async (req, res) => {
    // Get param
    const createdBy     = req.body.CreatedBy;

    if(createdBy == null) return res.sendStatus(401)

    try {
        const loginDatas = await LoginData.findOne({Username: createdBy});
        res.json(loginDatas._id);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}

module.exports.updatedPassword = async (req, res) => {
    // Get param
    const id            = req.params.id
    const usernameUser  = req.body.Username;
    const passwordUser  = req.body.Password;
    const createdBy     = req.body.CreatedBy;

    const validateId    = await LoginData.findById(id);
    
    if(usernameUser !== createdBy) return res.sendStatus(403)

    // Validate that change password by password's user
    if(validateId){
        // Has param
        const saltRounds = 10; 
    
        // Encrypt the pass
        const hashPassword = bcrypt.hashSync(passwordUser, saltRounds);
    
        try {
            const updatedLoginData = await LoginData.updateOne({Username: usernameUser}, {$set: {Password: hashPassword}});
            // res.status(201).json(updatedLoginData);
            res.send({"message": "Data was updated"})
        } catch (error) {
            res.status(400).json({message: error.message});
        }
    } else {
        return res.sendStatus(403)
    }         
}

module.exports.deletedUser = async (req, res) => {
    // Get param
    const usernameUser  = req.body.Username;
    const createdBy     = req.body.CreatedBy;

    const loginDataAdmin    = await LoginData.findOne({Username: createdBy, UserType: 'admin'});

    // validate by user type
    if(loginDataAdmin) {          
        try {
            const deletedUserData   = await UserData.deleteMany({Username: usernameUser});
            const deletedLoginData  = await LoginData.deleteMany({Username: usernameUser});
            // res.status(200).json(deletedUserData);
            res.send({"message": "Data was deleted"})
        } catch (error) {
            res.status(400).json({message: error.message});
        }   
    } else {
        return res.sendStatus(403)
    } 
}

module.exports.getLogout = async (req, res) => {
    // param token = token yang digunakan untuk refresh token (getAuthentication)
    refresTokens = refresTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
}