﻿import { Router } from 'express';
import { adminController } from '../controllers/AdminController';
import { authMiddleware as authMiddlewareAdmin, isAdmin as isAdminAdmin } from '../middlewares/auth';
import { mediaUpload } from '../middlewares/uploadMiddleware';

const adminRoutes = Router();

adminRoutes.post('/login', adminController.login);

adminRoutes.use(authMiddlewareAdmin, isAdminAdmin);

adminRoutes.get('/users', adminController.getAllUsers);
adminRoutes.delete('/users/:id', adminController.deleteUser);

adminRoutes.get('/clients', adminController.getAllClients);
adminRoutes.put('/clients/:id', adminController.updateClient);

adminRoutes.get('/brokers', adminController.getAllBrokers);
adminRoutes.get('/brokers/pending', adminController.listPendingBrokers);
adminRoutes.patch('/brokers/:id/approve', adminController.approveBroker);
adminRoutes.patch('/brokers/:id/reject', adminController.rejectBroker);
adminRoutes.put('/brokers/:id', adminController.updateBroker);
adminRoutes.delete('/brokers/:id', adminController.deleteBroker);

adminRoutes.get('/properties-with-brokers', adminController.listPropertiesWithBrokers);
adminRoutes.put('/properties/:id', adminController.updateProperty);
adminRoutes.delete('/properties/:id', adminController.deleteProperty);
adminRoutes.patch('/properties/:id/approve', adminController.approveProperty);
adminRoutes.patch('/properties/:id/reject', adminController.rejectProperty);
adminRoutes.post(
  '/properties/:id/images',
  mediaUpload.array('images', 20),
  adminController.addPropertyImage
);
adminRoutes.delete('/properties/images/:imageId', adminController.deletePropertyImage);

adminRoutes.get('/dashboard/stats', adminController.getDashboardStats);

export default adminRoutes;
