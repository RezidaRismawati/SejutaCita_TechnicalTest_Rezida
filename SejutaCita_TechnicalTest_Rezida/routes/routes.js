const express = require('express')
const { loginUser
    , getToken
    , getAuthentication
    , getUserDatas
    , saveUserData 
    , updateUserData
    , resetPassword
    , getLoginDatas
    , updatedPassword
    , deletedUser
    , getLogout
    , display
    , saveInitUser
    , index
    }  = require('../controller/controller.js')

const router = express.Router();
router.use(express.json())

// Login
router.get('/login', loginUser);
router.get('/token', getToken);
router.get('/auth', getAuthentication);
router.delete('/logout', getLogout);

// Data user
router.get('/', index);
router.get('/initDisplay', display);
router.post('/init', saveInitUser);
router.get('/displayData', getUserDatas);
router.post('/admin', saveUserData);
router.patch('/admin', updateUserData);
router.patch('/resetPass', resetPassword);
router.get('/getId', getLoginDatas);
router.patch('/chagePass/:id', updatedPassword);
router.delete('/delete', deletedUser);

module.exports = router;