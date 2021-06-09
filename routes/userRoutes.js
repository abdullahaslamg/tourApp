const router = require('express').Router();
const userController = require('./../controller/userController');

router
  .route('/api/v1/users')
  .get(userController.getAllUsers)
  .all(userController.createUser);
router
  .route('/api/v1/users/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
