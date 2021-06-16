const router = require('express').Router();
const userController = require('./../controller/userController');
const authController = require('./../controller/authController');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router
  .route('/')
  .get(userController.getAllUsers)
  .all(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
