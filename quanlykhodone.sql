-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: quanlykhodone
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'CPUs','Central Processing Units',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(2,'Tên danh mục mới','Mô tả mới',1,'2025-05-21 16:52:09','2025-05-24 13:57:09'),(3,'Memory','RAM and Memory Modules',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(4,'Storage','Hard Drives and SSDs',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(5,'Graphics Cards','Video and Graphics Cards',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(6,'Power Supplies','Power Supply Units',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(7,'Cases','Computer Cases and Chassis',1,'2025-05-21 16:52:09','2025-05-24 15:39:27'),(8,'Cooling','Fans and Cooling Solutions',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(9,'Card pro vip','Các loại card prov vip cao cấp',1,'2025-05-24 11:25:10','2025-05-25 23:35:05');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorycheckitems`
--

DROP TABLE IF EXISTS `inventorycheckitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorycheckitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `systemQuantity` int NOT NULL,
  `actualQuantity` int DEFAULT NULL,
  `difference` int DEFAULT NULL,
  `status` enum('pending','checked','adjusted') DEFAULT 'pending',
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `checkId` int DEFAULT NULL,
  `productId` int DEFAULT NULL,
  `checkedBy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `checkId` (`checkId`),
  KEY `productId` (`productId`),
  KEY `checkedBy` (`checkedBy`),
  CONSTRAINT `inventorycheckitems_ibfk_1` FOREIGN KEY (`checkId`) REFERENCES `inventorychecks` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventorycheckitems_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventorycheckitems_ibfk_3` FOREIGN KEY (`checkedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=125 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorycheckitems`
--

LOCK TABLES `inventorycheckitems` WRITE;
/*!40000 ALTER TABLE `inventorycheckitems` DISABLE KEYS */;
INSERT INTO `inventorycheckitems` VALUES (1,7,7,0,'checked','','2025-05-22 03:24:57','2025-05-22 03:25:34',1,NULL,NULL),(2,100,NULL,NULL,'pending',NULL,'2025-05-23 15:41:12','2025-05-23 15:41:12',2,NULL,NULL),(3,20,NULL,NULL,'pending',NULL,'2025-05-23 15:49:59','2025-05-23 15:49:59',3,NULL,NULL),(4,20,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,1,NULL),(5,20,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,NULL,NULL),(6,15,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,3,NULL),(7,12,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,4,NULL),(8,30,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,5,NULL),(9,35,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,6,NULL),(10,40,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,7,NULL),(11,25,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,8,NULL),(12,8,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,9,NULL),(13,1,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,NULL,NULL),(14,20,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,11,NULL),(15,15,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,12,NULL),(16,0,NULL,NULL,'pending',NULL,'2025-05-24 11:45:35','2025-05-24 11:45:35',4,NULL,NULL),(17,20,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,1,NULL),(18,20,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,NULL,NULL),(19,15,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,3,NULL),(20,12,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,4,NULL),(21,30,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,5,NULL),(22,35,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,6,NULL),(23,40,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,7,NULL),(24,25,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,8,NULL),(25,8,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,9,NULL),(26,1,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,NULL,NULL),(27,20,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,11,NULL),(28,15,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,12,NULL),(29,0,NULL,NULL,'pending',NULL,'2025-05-24 11:45:41','2025-05-24 11:45:41',5,NULL,NULL),(30,20,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,1,NULL),(31,20,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,NULL,NULL),(32,15,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,3,NULL),(33,12,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,4,NULL),(34,30,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,5,NULL),(35,35,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,6,NULL),(36,40,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,7,NULL),(37,25,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,8,NULL),(38,8,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,9,NULL),(39,1,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,NULL,NULL),(40,20,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,11,NULL),(41,15,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,12,NULL),(42,0,NULL,NULL,'pending',NULL,'2025-05-24 11:46:10','2025-05-24 11:46:10',6,NULL,NULL),(43,20,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,1,NULL),(44,20,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,NULL,NULL),(45,15,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,3,NULL),(46,12,8,-4,'checked','Tìm thấy 8 sản phẩm, thiếu 2 so với hệ thống','2025-05-24 11:46:25','2025-05-26 00:10:29',7,4,10),(47,30,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,5,NULL),(48,35,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,6,NULL),(49,40,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,7,NULL),(50,25,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,8,NULL),(51,8,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,9,NULL),(52,1,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,NULL,NULL),(53,20,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,11,NULL),(54,15,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,12,NULL),(55,0,NULL,NULL,'pending',NULL,'2025-05-24 11:46:25','2025-05-24 11:46:25',7,NULL,NULL),(56,18,18,0,'checked','','2025-05-24 15:57:41','2025-05-25 06:36:56',8,1,10),(57,14,14,0,'checked','','2025-05-24 15:57:41','2025-05-25 10:19:51',8,3,10),(58,12,12,0,'checked','','2025-05-24 15:57:41','2025-05-25 10:19:54',8,4,10),(59,30,30,0,'checked','','2025-05-24 15:57:41','2025-05-25 10:19:58',8,5,10),(60,35,8,-27,'adjusted','Tìm thấy 8 sản phẩm, thiếu 2 so với hệ thống','2025-05-24 15:57:41','2025-05-25 10:41:37',8,6,10),(61,40,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,7,NULL),(62,25,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,8,NULL),(63,8,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,9,NULL),(64,6,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,NULL,NULL),(65,20,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,11,NULL),(66,15,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,12,NULL),(67,5,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,NULL,NULL),(68,0,NULL,NULL,'pending',NULL,'2025-05-24 15:57:41','2025-05-24 15:57:41',8,NULL,NULL),(69,7,NULL,NULL,'pending',NULL,'2025-05-25 06:17:49','2025-05-25 06:17:49',9,NULL,NULL),(70,14,14,0,'checked','','2025-05-25 06:30:13','2025-05-25 06:36:32',10,3,10),(71,5,5,0,'checked','','2025-05-25 06:30:13','2025-05-25 06:36:37',10,NULL,10),(72,20,20,0,'checked','','2025-05-25 06:30:13','2025-05-25 06:36:40',10,11,10),(73,10,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,1,NULL),(74,12,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,3,NULL),(75,12,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,4,NULL),(76,31,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,5,NULL),(77,35,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,6,NULL),(78,40,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,7,NULL),(79,25,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,8,NULL),(80,8,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,9,NULL),(81,10,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,NULL,NULL),(82,22,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,11,NULL),(83,15,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,12,NULL),(84,8,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,NULL,NULL),(85,0,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,NULL,NULL),(86,98,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,18,NULL),(87,16,NULL,NULL,'pending',NULL,'2025-05-25 09:54:25','2025-05-25 09:54:25',11,NULL,NULL),(88,9,9,0,'checked','','2025-05-25 23:45:07','2026-01-19 01:43:41',12,1,10),(89,12,12,0,'checked','','2025-05-25 23:45:07','2026-01-19 02:12:54',12,3,10),(90,12,12,0,'checked','','2025-05-25 23:45:07','2026-01-19 02:12:57',12,4,10),(91,31,31,0,'checked','','2025-05-25 23:45:07','2026-01-19 02:13:03',12,5,10),(92,8,8,0,'checked','','2025-05-25 23:45:07','2026-01-19 02:13:05',12,6,10),(93,40,40,0,'checked','','2025-05-25 23:45:07','2026-01-19 02:13:07',12,7,10),(94,25,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,8,NULL),(95,8,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,9,NULL),(96,22,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,11,NULL),(97,7,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,12,NULL),(98,8,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,NULL,NULL),(99,98,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,18,NULL),(100,16,8,-8,'checked','Tìm thấy 8 sản phẩm, thiếu 2 so với hệ thống','2025-05-25 23:45:07','2025-05-26 00:12:53',12,NULL,10),(101,12,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,NULL,NULL),(102,10,NULL,NULL,'pending',NULL,'2025-05-25 23:45:07','2025-05-25 23:45:07',12,22,NULL),(103,9,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,1,NULL),(104,12,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,3,NULL),(105,12,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,4,NULL),(106,31,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,5,NULL),(107,8,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,6,NULL),(108,40,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,7,NULL),(109,25,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,8,NULL),(110,8,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,9,NULL),(111,22,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,11,NULL),(112,7,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,12,NULL),(113,8,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,NULL,NULL),(114,98,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,18,NULL),(115,16,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,NULL,NULL),(116,12,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,NULL,NULL),(117,10,NULL,NULL,'pending',NULL,'2025-05-25 23:45:53','2025-05-25 23:45:53',13,22,NULL),(118,40,40,0,'checked','','2026-01-19 01:53:01','2026-01-19 02:07:13',14,3,19),(119,30,30,0,'checked','','2026-01-19 01:53:01','2026-01-19 02:07:29',14,5,19),(120,0,0,0,'checked','','2026-01-19 01:53:01','2026-01-19 02:07:36',14,23,19),(121,40,40,0,'checked','','2026-01-19 02:13:15','2026-01-19 02:17:04',15,3,19),(122,30,30,0,'checked','','2026-01-19 02:13:15','2026-01-19 02:17:06',15,5,19),(123,20,20,0,'checked','','2026-01-19 02:13:15','2026-01-19 02:17:09',15,11,19),(124,20,21,1,'adjusted','','2026-01-19 02:17:41','2026-01-19 02:18:12',16,11,19);
/*!40000 ALTER TABLE `inventorycheckitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorychecks`
--

DROP TABLE IF EXISTS `inventorychecks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorychecks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `checkNumber` varchar(255) NOT NULL,
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `startDate` datetime DEFAULT NULL,
  `endDate` datetime DEFAULT NULL,
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `createdBy` int DEFAULT NULL,
  `completedBy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `checkNumber` (`checkNumber`),
  KEY `createdBy` (`createdBy`),
  KEY `completedBy` (`completedBy`),
  CONSTRAINT `inventorychecks_ibfk_1` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventorychecks_ibfk_2` FOREIGN KEY (`completedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorychecks`
--

LOCK TABLES `inventorychecks` WRITE;
/*!40000 ALTER TABLE `inventorychecks` DISABLE KEYS */;
INSERT INTO `inventorychecks` VALUES (1,'IC250522-001','completed','2025-05-22 03:25:27','2025-05-22 03:25:37','Kiểm hàng cpu','2025-05-22 03:24:57','2025-05-22 03:25:37',NULL,NULL),(2,'IC250523-001','completed','2025-05-23 15:41:18','2025-05-23 15:41:24','kiểm tra số lượng','2025-05-23 15:41:12','2025-05-23 15:41:24',NULL,NULL),(3,'IC250523-002','completed','2025-05-23 15:50:35','2025-05-23 15:54:58','Kiểm tra sản phẩm','2025-05-23 15:49:59','2025-05-23 15:54:58',NULL,NULL),(4,'IC250524-001','completed','2025-05-24 15:57:17','2025-05-24 15:57:21',NULL,'2025-05-24 11:45:35','2025-05-24 15:57:21',10,10),(5,'IC250524-002','completed','2025-05-25 03:58:12','2025-05-25 03:59:06',NULL,'2025-05-24 11:45:41','2025-05-25 03:59:06',10,10),(6,'IC250524-003','pending',NULL,NULL,'Kiểm kê định kỳ','2025-05-24 11:46:10','2025-05-24 11:46:10',10,NULL),(7,'IC250524-004','in_progress','2025-05-25 19:25:23',NULL,'Kiểm kê định kỳ','2025-05-24 11:46:25','2025-05-25 19:25:23',10,NULL),(8,'IC250524-005','completed','2025-05-25 10:36:07','2025-05-25 10:41:30','','2025-05-24 15:57:41','2025-05-25 10:41:30',10,10),(9,'IC250525-001','completed','2025-05-25 06:17:52','2025-05-25 06:17:55','njkj','2025-05-25 06:17:49','2025-05-25 06:17:55',10,10),(10,'IC250525-002','completed','2025-05-25 06:30:15','2025-05-25 06:36:42','','2025-05-25 06:30:13','2025-05-25 06:36:42',10,10),(11,'IC250525-003','completed','2025-05-25 09:56:28','2025-05-25 10:13:49','Kiểm kê định kỳ','2025-05-25 09:54:25','2025-05-25 10:13:49',10,10),(12,'IC250526-001','in_progress','2025-05-25 23:46:50',NULL,'Kiểm kê định kỳ','2025-05-25 23:45:07','2025-05-25 23:46:50',10,NULL),(13,'IC250526-002','completed','2025-05-25 23:54:06','2026-01-19 01:43:34','Kiểm kê định kỳ','2025-05-25 23:45:53','2026-01-19 01:43:34',10,10),(14,'IC260119-001','completed','2026-01-19 01:53:11','2026-01-19 02:07:46','nhvn','2026-01-19 01:53:01','2026-01-19 02:07:46',10,10),(15,'IC260119-002','completed','2026-01-19 02:16:44','2026-01-19 02:17:23','','2026-01-19 02:13:15','2026-01-19 02:17:23',10,10),(16,'IC260119-003','completed','2026-01-19 02:17:43','2026-01-19 02:18:11','','2026-01-19 02:17:41','2026-01-19 02:18:11',10,10);
/*!40000 ALTER TABLE `inventorychecks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventorytransactions`
--

DROP TABLE IF EXISTS `inventorytransactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventorytransactions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type` enum('in','out','adjustment') NOT NULL,
  `quantity` int NOT NULL,
  `previousQuantity` int NOT NULL,
  `newQuantity` int NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productId` int DEFAULT NULL,
  `createdBy` int DEFAULT NULL,
  `approvedBy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `productId` (`productId`),
  KEY `createdBy` (`createdBy`),
  KEY `approvedBy` (`approvedBy`),
  CONSTRAINT `inventorytransactions_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventorytransactions_ibfk_2` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `inventorytransactions_ibfk_3` FOREIGN KEY (`approvedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorytransactions`
--

LOCK TABLES `inventorytransactions` WRITE;
/*!40000 ALTER TABLE `inventorytransactions` DISABLE KEYS */;
INSERT INTO `inventorytransactions` VALUES (1,'in',100,7,107,'Bổ sung thêm sản phẩm','','approved','','2025-05-22 03:58:26','2025-05-22 03:58:26',NULL,NULL,NULL),(2,'in',100,107,207,'Bổ sung thêm sản phẩm','','approved','','2025-05-22 03:58:45','2025-05-22 03:58:45',NULL,NULL,NULL),(3,'out',206,207,1,'Xuất cho công ty','','approved','','2025-05-22 04:24:49','2025-05-22 04:24:49',NULL,NULL,NULL),(4,'out',0,0,0,'Order','ORD250523-001','approved',NULL,'2025-05-23 15:39:15','2025-05-23 15:39:15',NULL,7,7),(5,'in',100,0,100,'Nhập kho hết hàng','','approved','','2025-05-23 15:40:40','2025-05-23 15:40:40',NULL,NULL,NULL),(6,'out',99,100,1,'Xuất cho công ty','','approved','','2025-05-23 15:44:22','2025-05-23 15:44:22',NULL,NULL,NULL),(7,'in',10,25,35,'Nhập hàng mới',NULL,'pending','Ghi chú nhập kho','2025-05-24 11:43:37','2025-05-24 11:43:37',1,11,NULL),(8,'out',5,25,20,'Xuất hàng',NULL,'approved','Ghi chú xuất kho','2025-05-24 11:43:54','2025-05-24 11:45:13',1,11,10),(9,'out',0,18,18,'Order','ORD250524-001','approved',NULL,'2025-05-24 11:59:55','2025-05-24 11:59:55',1,9,9),(10,'out',0,14,14,'Order','ORD250524-001','approved',NULL,'2025-05-24 11:59:55','2025-05-24 11:59:55',3,9,9),(11,'in',5,4,9,'Mua hàng mới','','approved','','2025-05-24 15:40:18','2025-05-24 15:40:18',NULL,10,10),(12,'in',5,0,5,'Mua hàng mới','','approved','','2025-05-24 15:40:39','2025-05-24 15:40:39',NULL,10,10),(13,'out',5,9,4,'Xuất kho','','approved','','2025-05-24 15:42:17','2025-05-24 15:42:17',NULL,10,10),(14,'in',2,4,6,'Cần nhập kho','','approved','','2025-05-24 15:49:14','2025-05-24 15:49:14',NULL,10,10),(15,'in',10,6,16,'restock',NULL,'approved','','2025-05-25 03:39:42','2025-05-25 03:40:15',NULL,11,10),(16,'in',100,18,118,'restock',NULL,'pending','','2025-05-25 03:44:37','2025-05-25 03:44:37',1,11,NULL),(17,'out',2,7,5,'order',NULL,'approved','','2025-05-25 03:51:55','2025-05-25 06:28:35',NULL,11,10),(18,'out',0,99,99,'Order','ORD250525-001','approved',NULL,'2025-05-25 04:17:24','2025-05-25 04:17:24',18,9,9),(19,'out',1,99,98,'order','ORD250525-001','approved','Xuất kho cho đơn hàng #ORD250525-001','2025-05-25 04:22:43','2025-05-25 04:23:15',18,11,10),(20,'in',3,5,8,'ẽdssd','','approved','','2025-05-25 06:20:40','2025-05-25 06:20:40',NULL,10,10),(21,'in',10,5,15,'restock',NULL,'approved','','2025-05-25 07:21:56','2025-05-25 07:22:07',NULL,11,10),(22,'out',5,15,10,'adjustment',NULL,'approved','','2025-05-25 07:22:39','2025-05-25 07:22:50',NULL,11,10),(23,'out',0,11,11,'Order','ORD250525-002','approved',NULL,'2025-05-25 07:23:34','2025-05-25 07:23:34',4,9,9),(24,'out',0,19,19,'Order','ORD250525-002','approved',NULL,'2025-05-25 07:23:34','2025-05-25 07:23:34',11,9,9),(25,'in',1,12,13,'Order cancelled','ORD250525-002','approved',NULL,'2025-05-25 07:35:37','2025-05-25 07:35:37',4,9,9),(26,'in',1,20,21,'Order cancelled','ORD250525-002','approved',NULL,'2025-05-25 07:35:37','2025-05-25 07:35:37',11,9,9),(27,'out',0,13,13,'Order','ORD250525-003','approved',NULL,'2025-05-25 07:55:31','2025-05-25 07:55:31',3,9,9),(28,'out',1,13,12,'order','ORD250525-003','approved','Xuất kho cho đơn hàng #ORD250525-003','2025-05-25 07:55:47','2025-05-25 07:55:57',3,11,10),(29,'in',2,20,22,'Mua hàng mới','','approved','','2025-05-25 09:26:03','2025-05-25 09:26:03',11,10,10),(30,'in',1,30,31,'Bổ sung hàng tồn kho',NULL,'approved','Nhập thêm hàng từ nhà cung cấp XYZ','2025-05-25 09:49:41','2025-05-25 09:53:22',5,11,10),(31,'in',10,10,20,'restock',NULL,'pending','','2025-05-25 09:52:17','2025-05-25 09:52:17',NULL,11,NULL),(32,'adjustment',8,35,8,'Inventory check adjustment','IC250524-005','approved','Adjustment from inventory check IC250524-005','2025-05-25 10:41:37','2025-05-25 10:41:37',6,10,10),(33,'in',5,10,15,'Bổ sung hàng tồn kho',NULL,'pending','Nhập thêm hàng từ nhà cung cấp XYZ','2025-05-25 11:14:55','2025-05-25 11:14:55',1,11,NULL),(34,'out',1,10,9,'order','ORD250522-002','approved','Xuất kho cho đơn hàng #ORD250522-002','2025-05-25 19:57:59','2025-05-25 23:44:03',1,11,10),(35,'out',1,10,9,'order','ORD250522-002','pending','Xuất kho cho đơn hàng #ORD250522-002','2025-05-25 19:58:21','2025-05-25 19:58:21',1,11,NULL),(37,'out',0,7,7,'Order','ORD250526-001','approved',NULL,'2025-05-25 20:01:26','2025-05-25 20:01:26',12,9,9),(38,'in',5,10,15,'Bổ sung hàng tồn kho',NULL,'approved','Nhập thêm hàng từ nhà cung cấp XYZ','2025-05-25 23:40:24','2025-05-25 23:40:24',1,10,10),(39,'in',5,15,20,'Bổ sung hàng tồn kho',NULL,'approved','Nhập thêm hàng từ nhà cung cấp XYZ','2025-05-25 23:43:03','2025-05-25 23:43:03',1,10,10),(40,'out',0,7,7,'Order','ORD250526-002','approved',NULL,'2025-05-26 00:05:08','2025-05-26 00:05:08',1,9,9),(41,'out',0,11,11,'Order','ORD250526-002','approved',NULL,'2025-05-26 00:05:08','2025-05-26 00:05:08',3,9,9),(42,'out',0,10,10,'Order','ORD250526-004','approved',NULL,'2025-05-26 03:45:50','2025-05-26 03:45:50',3,9,9),(43,'out',0,30,30,'Order','ORD250526-004','approved',NULL,'2025-05-26 03:45:50','2025-05-26 03:45:50',5,9,9),(44,'out',0,21,21,'Order','ORD250526-004','approved',NULL,'2025-05-26 03:45:50','2025-05-26 03:45:50',11,9,9),(45,'out',0,9,9,'Order','ORD250526-005','approved',NULL,'2025-05-26 06:58:50','2025-05-26 06:58:50',3,9,9),(46,'out',0,20,20,'Order','ORD250526-005','approved',NULL,'2025-05-26 06:58:50','2025-05-26 06:58:50',11,9,9),(47,'out',0,4,4,'Order','ORD260119-001','approved',NULL,'2026-01-19 01:04:20','2026-01-19 01:04:20',3,9,9),(48,'adjustment',21,20,21,'Inventory check adjustment','IC260119-003','approved','Adjustment from inventory check IC260119-003','2026-01-19 02:18:12','2026-01-19 02:18:12',11,10,10);
/*!40000 ALTER TABLE `inventorytransactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orderitems`
--

DROP TABLE IF EXISTS `orderitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orderitems` (
  `id` int NOT NULL AUTO_INCREMENT,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderId` int DEFAULT NULL,
  `productId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orderId` (`orderId`),
  KEY `productId` (`productId`),
  CONSTRAINT `orderitems_ibfk_1` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orderitems_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitems`
--

LOCK TABLES `orderitems` WRITE;
/*!40000 ALTER TABLE `orderitems` DISABLE KEYS */;
INSERT INTO `orderitems` VALUES (1,1,379.99,379.99,'2025-05-22 03:03:28','2025-05-22 03:03:28',1,1),(2,1,399.99,399.99,'2025-05-22 03:03:28','2025-05-22 03:03:28',1,NULL),(3,1,379.99,379.99,'2025-05-22 03:07:30','2025-05-22 03:07:30',NULL,1),(4,1,399.99,399.99,'2025-05-22 03:07:30','2025-05-22 03:07:30',NULL,NULL),(5,2,129.99,259.98,'2025-05-22 03:14:28','2025-05-22 03:14:28',3,11),(6,2,399.99,799.98,'2025-05-22 03:14:28','2025-05-22 03:14:28',3,NULL),(7,1,399.99,399.99,'2025-05-22 03:17:58','2025-05-22 03:17:58',4,NULL),(8,1,179.99,179.99,'2025-05-22 03:17:58','2025-05-22 03:17:58',4,3),(9,1,649.99,649.99,'2025-05-22 03:17:58','2025-05-22 03:17:58',4,NULL),(10,1,649.99,649.99,'2025-05-23 15:39:15','2025-05-23 15:39:15',5,NULL),(11,2,380000.00,760000.00,'2025-05-24 11:59:55','2025-05-24 11:59:55',6,1),(12,1,180000.00,180000.00,'2025-05-24 11:59:55','2025-05-24 11:59:55',6,3),(13,1,10000000.00,10000000.00,'2025-05-25 04:17:24','2025-05-25 04:17:24',7,18),(14,1,290000.00,290000.00,'2025-05-25 07:23:34','2025-05-25 07:23:34',8,4),(15,1,130000.00,130000.00,'2025-05-25 07:23:34','2025-05-25 07:23:34',8,11),(16,1,180000.00,180000.00,'2025-05-25 07:55:31','2025-05-25 07:55:31',9,3),(17,8,70000.00,560000.00,'2025-05-25 20:01:26','2025-05-25 20:01:26',10,12),(18,2,10000.00,20000.00,'2025-05-26 00:05:08','2025-05-26 00:05:08',11,1),(19,1,180000.00,180000.00,'2025-05-26 00:05:08','2025-05-26 00:05:08',11,3),(20,2,10000.00,20000.00,'2025-05-26 00:06:12','2025-05-26 00:06:12',12,1),(21,1,180000.00,180000.00,'2025-05-26 00:06:12','2025-05-26 00:06:12',12,3),(22,1,180000.00,180000.00,'2025-05-26 03:45:50','2025-05-26 03:45:50',13,3),(23,1,120000.00,120000.00,'2025-05-26 03:45:50','2025-05-26 03:45:50',13,5),(24,1,130000.00,130000.00,'2025-05-26 03:45:50','2025-05-26 03:45:50',13,11),(25,1,180000.00,180000.00,'2025-05-26 06:58:50','2025-05-26 06:58:50',14,3),(26,1,130000.00,130000.00,'2025-05-26 06:58:50','2025-05-26 06:58:50',14,11),(27,5,180000.00,972000.00,'2026-01-19 01:04:20','2026-01-19 01:04:20',15,3);
/*!40000 ALTER TABLE `orderitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `orderNumber` varchar(255) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') DEFAULT 'pending',
  `shippingAddress` text NOT NULL,
  `shippingMethod` varchar(255) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT NULL,
  `paymentStatus` enum('pending','paid','failed') DEFAULT 'pending',
  `notes` text,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `customerId` int DEFAULT NULL,
  `processedBy` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `orderNumber` (`orderNumber`),
  KEY `customerId` (`customerId`),
  KEY `processedBy` (`processedBy`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`processedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD250522-001',779.98,'processing','Viet Nam\nViet Nam, Ha Noi','Standard','cod','paid','','2025-05-22 03:03:28','2025-05-25 10:44:08',NULL,10),(3,'ORD250522-003',1059.96,'delivered','Viet Nam\nViet Nam, Ha Noi','Standard','cod','paid','','2025-05-22 03:14:28','2025-05-25 06:18:13',NULL,10),(4,'ORD250522-004',1229.97,'delivered','Viet Nam\nViet Nam, Ha Noi','Standard','cod','paid','','2025-05-22 03:17:58','2025-05-22 03:23:38',NULL,NULL),(5,'ORD250523-001',649.99,'delivered','Viet Nam, Ha Noi','Standard','cod','paid','','2025-05-23 15:39:15','2025-05-23 15:41:42',7,NULL),(6,'ORD250524-001',940000.00,'delivered','123 Đường Test, Quận 1, TP.HCM',NULL,NULL,'paid',NULL,'2025-05-24 11:59:55','2025-05-24 15:58:52',9,10),(7,'ORD250525-001',10000000.00,'delivered','Hà Nội, Hà Nội','Standard','credit-card','paid','','2025-05-25 04:17:24','2025-05-25 06:21:54',9,11),(8,'ORD250525-002',420000.00,'cancelled','Xa ABC - Huyện XYZ, Hà Nội','Standard','cod','pending','','2025-05-25 07:23:34','2025-05-25 07:35:37',9,9),(9,'ORD250525-003',180000.00,'delivered','Xa ABC - Huyện XYZ, Hà Nội','Standard','cod','paid','','2025-05-25 07:55:31','2025-05-25 07:56:35',9,11),(10,'ORD250526-001',560000.00,'delivered','Xa ABC - Huyện XYZ, Hà Nội','Standard','cod','paid','','2025-05-25 20:01:26','2025-05-25 20:02:38',9,10),(11,'ORD250526-002',200000.00,'pending','123 Đường ABC, Quận 1, TP.HCM',NULL,'cod','pending','Giao giờ hành chính','2025-05-26 00:05:08','2025-05-26 00:05:08',9,NULL),(12,'ORD250526-003',200000.00,'delivered','123 Đường ABC, Quận 1, TP.HCM',NULL,'cod','paid','Giao giờ hành chính','2025-05-26 00:06:12','2025-05-26 03:29:28',10,10),(13,'ORD250526-004',430000.00,'pending','Xa ABC - Huyện XYZ, Hà Nội','Standard','cod','pending','','2025-05-26 03:45:50','2025-05-26 03:45:50',9,NULL),(14,'ORD250526-005',310000.00,'delivered','Xa ABC - Huyện XYZ, Hà Nội','Standard','cod','paid','','2025-05-26 06:58:50','2026-01-19 00:17:48',9,10),(15,'ORD260119-001',972000.00,'pending','Xa ABC - Huyện XYZ, hj','Standard','cod','paid','','2026-01-19 01:04:20','2026-01-19 01:06:42',9,NULL);
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sku` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `costPrice` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `minQuantity` int NOT NULL DEFAULT '10',
  `image` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `categoryId` int DEFAULT NULL,
  `tax` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'NVIDIA RTX 4090','SP-0021','Mô tả sản phẩm test RTX 4090',10000.00,15000.00,7,2,'uploads/product-1747882731008.jpg','Kệ A',1,'2025-05-21 16:52:09','2025-05-26 00:05:08',1,NULL),(3,'ASUS ROG Strix B550-F Gaming','MB-ASUS-B550F','ASUS ROG Strix B550-F Gaming AMD AM4 Zen 3 Ryzen 5000 & 3rd Gen Ryzen ATX Gaming Motherboard',180000.00,150000.00,40,3,'uploads/product-1747882698893.jpg','Shelf B1',1,'2025-05-21 16:52:09','2026-01-19 01:15:24',2,8),(4,'MSI MPG Z690 Gaming Edge','MB-MSI-Z690','MSI MPG Z690 Gaming Edge WiFi Gaming Motherboard (ATX, 12th Gen Intel Core, LGA 1700 Socket)',290000.00,240000.00,12,3,'uploads/product-1747882735432.jpg','Shelf B2',1,'2025-05-21 16:52:09','2025-05-25 07:35:37',2,NULL),(5,'Corsair Vengeance RGB Pro 32GB','RAM-CORS-32GB','Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3600MHz C18 LED Desktop Memory',120000.00,100000.00,30,8,'uploads/product-1747882716031.jpg','Shelf C1',1,'2025-05-21 16:52:09','2025-05-26 03:45:50',3,NULL),(6,'G.SKILL Trident Z Neo 16GB','RAM-GSKILL-16GB','G.SKILL Trident Z Neo Series 16GB (2 x 8GB) 288-Pin SDRAM DDR4 3600MHz',90000.00,70000.00,8,10,'uploads/product-1747882726554.jpg','Shelf C2',1,'2025-05-21 16:52:09','2025-05-25 10:41:37',3,NULL),(7,'Samsung 970 EVO Plus 1TB','SSD-SAM-1TB','Samsung 970 EVO Plus 1TB PCIe NVMe M.2 Internal Solid State Drive',110000.00,85000.00,40,10,'uploads/product-1747882865769.webp','Shelf D1',1,'2025-05-21 16:52:09','2025-05-22 03:01:05',4,NULL),(8,'Western Digital 4TB HDD','HDD-WD-4TB','Western Digital 4TB WD Blue PC Hard Drive - 5400 RPM Class, SATA 6 Gb/s, 64 MB Cache',80000.00,60000.00,25,5,'uploads/product-1747882869702.jpg','Shelf D2',1,'2025-05-21 16:52:09','2025-05-22 03:01:09',4,NULL),(9,'NVIDIA GeForce RTX 3080','GPU-NV-3080','NVIDIA GeForce RTX 3080 10GB GDDR6X Graphics Card',700000.00,600000.00,8,2,'uploads/product-1747882740667.jpg','Shelf E1',1,'2025-05-21 16:52:09','2025-05-22 02:59:00',5,NULL),(11,'Corsair RM850x Power Supply','PSU-CORS-850W','Corsair RM850x 850 Watt 80 PLUS Gold Certified Fully Modular Power Supply',130000.00,100000.00,21,5,'uploads/product-1747882703750.jpg','Shelf F1',1,'2025-05-21 16:52:09','2026-01-19 02:18:12',6,NULL),(12,'NZXT H510 Mid Tower Case','CASE-NZXT-H510','NZXT H510 - Compact ATX Mid-Tower PC Gaming Case',70000.00,50000.00,7,3,'uploads/product-1747882748662.jpg','Shelf G1',1,'2025-05-21 16:52:09','2025-05-25 20:01:26',7,NULL),(18,'RTX 5090','SP-TEST-003','êsd',10000000.00,100000.00,98,10,NULL,'',1,'2025-05-24 16:29:50','2025-05-25 04:23:15',7,NULL),(22,'RTX 4090','SP-001','Mô tả sản phẩm test RTX 4090',10000.00,15000.00,10,2,NULL,'Kệ A',1,'2025-05-25 23:36:22','2025-05-25 23:36:22',1,NULL),(23,'dédsfcsd','SP-TEST-005','',1000000.00,100000.00,0,10,NULL,'',1,'2025-05-26 03:29:18','2026-01-19 00:13:36',9,NULL),(24,'RTX 4090','SP-00000001','Mô tả sản phẩm test RTX 4090',10000.00,15000.00,10,2,NULL,'Kệ A',1,'2025-05-26 03:32:47','2025-05-26 03:32:47',1,NULL);
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text,
  `role` enum('admin','staff','customer') DEFAULT 'customer',
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'staff','staff@example.com','$2b$10$Zf8R/.M3cwiiX7QKN7BNt.bTVCTXXEr5USxzgJ8wKf.3IiB/msIIW','Tên Mới','0987654321','Địa chỉ mới','staff',1,'2025-05-21 16:52:09','2025-05-24 11:22:30'),(3,'customer','customer@example.com','$2b$10$9wTG8PiR/kTdsYkgnPQskOB9DeAjf6lx8h6/tMdr4pyNCc6r1AMNK','Customer User','1234567890','123 Main St, City, Country','staff',1,'2025-05-21 16:52:09','2025-05-22 04:23:15'),(6,'tranhh1','tranhuyhoang1@gmail.com','$2b$10$/MqLw9V7N40VTUcwy1JXCOMh9SzUvsCh78.gTlIBgspQTlW/RSL7y','Trần Huy Hoàng','','','staff',1,'2025-05-23 14:32:11','2025-05-23 14:32:11'),(7,'tranhh2','tranhuyhoang2@gmail.com','$2b$10$piO2i35z1Bqm/k/yeO7I4OijxGvkSmn8V2WKfpDOTbDlJlZ36pf3i','Trần Huy Hoàng','','','customer',1,'2025-05-23 15:39:06','2025-05-23 15:42:12'),(9,'test','test@example.com','$2b$10$.gWUBgjg0tS9P4mSnc3QE.Es4pm5eHVV/5uEIV71gwz2QAh25OnUe','Người Dùng Test','1234665655','Xa ABC - Huyện XYZ','customer',1,'2025-05-24 10:55:11','2025-05-25 04:30:42'),(10,'admin123','admin123@example.com','$2b$10$X91yWWDDNpzEVTUlyUW2juUrjrSOEauOsNjhBLAxQ3ebJ7v7Nrgmu','Admin Test','','Ha Noi','admin',1,'2025-05-24 11:08:14','2025-05-25 03:56:12'),(11,'staff123','staff123@example.com','$2b$10$OxpuBTL6h0a9pbh8txnF5eoBsGPuh2qlLTre2wHg8.DgPWx9LQ2.a','Staff Test','','Bắc Ninh','staff',1,'2025-05-24 11:42:12','2025-05-25 04:01:53'),(12,'newstaff','staff2@example.com','$2b$10$5nLvae/r8pzYG0zn01wjmezlACJilM5lq6tVA0T7THpDugv2ip0ju','Staff Member 2',NULL,NULL,'staff',1,'2025-05-24 14:02:57','2025-05-25 06:19:48'),(15,'customer1','customer1@example.com','$2b$10$8jn3itKmp7tbw/ENmdCTyuqIdCzs5OtJIleaF6VEv6z//OEC8clEq','Khách Hàng 1','0987654321','123 Đường ABC, Quận 1, TPHCM','customer',1,'2025-05-25 11:20:48','2025-05-25 11:20:48'),(16,'customer2','customer2@example.com','$2b$10$Ik6VA9PTjCbp8w/7pAyXcuvYfb8GMN.C5dFfRNLyfS2rY97UT1WR6','Khách Hàng 2','0987654321','123 Đường ABC, Quận 1, TPHCM','customer',1,'2025-05-25 23:28:30','2025-05-25 23:28:30'),(18,'customer3','customer3@example.com','$2b$10$8fFxt347Fx8kPV7/QMB6a.QOmcqaIBpGkgj7ivtoFr1DBuVeuxycW','Khách Hàng 3','0987654321','123 Đường ABC, Quận 1, TPHCM','customer',1,'2025-05-26 00:02:20','2025-05-26 00:02:20'),(19,'nhanvien','nhanvien@gmail.com','$2b$10$9I2Rn5VXDvePTZhz6iG9P.qVmeIJzzLCouosmsm.7/lG/3jDG/.ha','Test','','','staff',1,'2026-01-19 00:16:16','2026-01-19 00:16:16');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-19  9:30:27
