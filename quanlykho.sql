CREATE DATABASE  IF NOT EXISTS `quanlykhodone` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `quanlykhodone`;
-- MySQL dump 10.13  Distrib 8.0.36, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: quanlykhodone
-- ------------------------------------------------------
-- Server version	8.0.35

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'CPUs','Central Processing Units',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(2,'Motherboards','Computer Motherboards',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(3,'Memory','RAM and Memory Modules',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(4,'Storage','Hard Drives and SSDs',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(5,'Graphics Cards','Video and Graphics Cards',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(6,'Power Supplies','Power Supply Units',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(7,'Cases','Computer Cases and Chassis',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(8,'Cooling','Fans and Cooling Solutions',1,'2025-05-21 16:52:09','2025-05-21 16:52:09');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorycheckitems`
--

LOCK TABLES `inventorycheckitems` WRITE;
/*!40000 ALTER TABLE `inventorycheckitems` DISABLE KEYS */;
INSERT INTO `inventorycheckitems` VALUES (1,7,7,0,'checked','','2025-05-22 03:24:57','2025-05-22 03:25:34',1,10,4),(2,100,NULL,NULL,'pending',NULL,'2025-05-23 15:41:12','2025-05-23 15:41:12',2,10,NULL),(3,20,NULL,NULL,'pending',NULL,'2025-05-23 15:49:59','2025-05-23 15:49:59',3,2,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorychecks`
--

LOCK TABLES `inventorychecks` WRITE;
/*!40000 ALTER TABLE `inventorychecks` DISABLE KEYS */;
INSERT INTO `inventorychecks` VALUES (1,'IC250522-001','completed','2025-05-22 03:25:27','2025-05-22 03:25:37','Kiểm hàng cpu','2025-05-22 03:24:57','2025-05-22 03:25:37',4,4),(2,'IC250523-001','completed','2025-05-23 15:41:18','2025-05-23 15:41:24','kiểm tra số lượng','2025-05-23 15:41:12','2025-05-23 15:41:24',4,4),(3,'IC250523-002','completed','2025-05-23 15:50:35','2025-05-23 15:54:58','Kiểm tra sản phẩm','2025-05-23 15:49:59','2025-05-23 15:54:58',4,4);
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventorytransactions`
--

LOCK TABLES `inventorytransactions` WRITE;
/*!40000 ALTER TABLE `inventorytransactions` DISABLE KEYS */;
INSERT INTO `inventorytransactions` VALUES (1,'in',100,7,107,'Bổ sung thêm sản phẩm','','approved','','2025-05-22 03:58:26','2025-05-22 03:58:26',10,4,4),(2,'in',100,107,207,'Bổ sung thêm sản phẩm','','approved','','2025-05-22 03:58:45','2025-05-22 03:58:45',10,4,4),(3,'out',206,207,1,'Xuất cho công ty','','approved','','2025-05-22 04:24:49','2025-05-22 04:24:49',10,1,1),(4,'out',0,0,0,'Order','ORD250523-001','approved',NULL,'2025-05-23 15:39:15','2025-05-23 15:39:15',10,7,7),(5,'in',100,0,100,'Nhập kho hết hàng','','approved','','2025-05-23 15:40:40','2025-05-23 15:40:40',10,4,4),(6,'out',99,100,1,'Xuất cho công ty','','approved','','2025-05-23 15:44:22','2025-05-23 15:44:22',10,4,4);
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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orderitems`
--

LOCK TABLES `orderitems` WRITE;
/*!40000 ALTER TABLE `orderitems` DISABLE KEYS */;
INSERT INTO `orderitems` VALUES (1,1,379.99,379.99,'2025-05-22 03:03:28','2025-05-22 03:03:28',1,1),(2,1,399.99,399.99,'2025-05-22 03:03:28','2025-05-22 03:03:28',1,2),(3,1,379.99,379.99,'2025-05-22 03:07:30','2025-05-22 03:07:30',2,1),(4,1,399.99,399.99,'2025-05-22 03:07:30','2025-05-22 03:07:30',2,2),(5,2,129.99,259.98,'2025-05-22 03:14:28','2025-05-22 03:14:28',3,11),(6,2,399.99,799.98,'2025-05-22 03:14:28','2025-05-22 03:14:28',3,2),(7,1,399.99,399.99,'2025-05-22 03:17:58','2025-05-22 03:17:58',4,2),(8,1,179.99,179.99,'2025-05-22 03:17:58','2025-05-22 03:17:58',4,3),(9,1,649.99,649.99,'2025-05-22 03:17:58','2025-05-22 03:17:58',4,10),(10,1,649.99,649.99,'2025-05-23 15:39:15','2025-05-23 15:39:15',5,10);
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (1,'ORD250522-001',779.98,'pending','Viet Nam\nViet Nam, Ha Noi','Standard','cod','pending','','2025-05-22 03:03:28','2025-05-22 03:03:28',4,NULL),(2,'ORD250522-002',779.98,'pending','Viet Nam\nViet Nam, Ha Noi','Standard','cod','pending','','2025-05-22 03:07:30','2025-05-22 03:07:30',4,NULL),(3,'ORD250522-003',1059.96,'pending','Viet Nam\nViet Nam, Ha Noi','Standard','cod','pending','','2025-05-22 03:14:28','2025-05-22 03:14:28',4,NULL),(4,'ORD250522-004',1229.97,'delivered','Viet Nam\nViet Nam, Ha Noi','Standard','cod','paid','','2025-05-22 03:17:58','2025-05-22 03:23:38',4,4),(5,'ORD250523-001',649.99,'delivered','Viet Nam, Ha Noi','Standard','cod','paid','','2025-05-23 15:39:15','2025-05-23 15:41:42',7,4);
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `categoryId` (`categoryId`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Intel Core i7-12700K','CPU-I7-12700K','Intel Core i7-12700K Desktop Processor 12 Cores (8P+4E) with integrated graphics',379.99,320.00,25,5,'uploads/product-1747882731008.jpg','Shelf A1',1,'2025-05-21 16:52:09','2025-05-22 02:58:51',1),(2,'AMD Ryzen 9 5900X','CPU-R9-5900X','AMD Ryzen 9 5900X 12-core, 24-Thread Unlocked Desktop Processor',399.99,340.00,20,5,'uploads/product-1747850557517.avif','Shelf A2',1,'2025-05-21 16:52:09','2025-05-23 15:44:02',1),(3,'ASUS ROG Strix B550-F Gaming','MB-ASUS-B550F','ASUS ROG Strix B550-F Gaming AMD AM4 Zen 3 Ryzen 5000 & 3rd Gen Ryzen ATX Gaming Motherboard',179.99,150.00,15,3,'uploads/product-1747882698893.jpg','Shelf B1',1,'2025-05-21 16:52:09','2025-05-23 15:44:05',2),(4,'MSI MPG Z690 Gaming Edge','MB-MSI-Z690','MSI MPG Z690 Gaming Edge WiFi Gaming Motherboard (ATX, 12th Gen Intel Core, LGA 1700 Socket)',289.99,240.00,12,3,'uploads/product-1747882735432.jpg','Shelf B2',1,'2025-05-21 16:52:09','2025-05-22 02:58:55',2),(5,'Corsair Vengeance RGB Pro 32GB','RAM-CORS-32GB','Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4 3600MHz C18 LED Desktop Memory',129.99,100.00,30,8,'uploads/product-1747882716031.jpg','Shelf C1',1,'2025-05-21 16:52:09','2025-05-22 02:58:36',3),(6,'G.SKILL Trident Z Neo 16GB','RAM-GSKILL-16GB','G.SKILL Trident Z Neo Series 16GB (2 x 8GB) 288-Pin SDRAM DDR4 3600MHz',89.99,70.00,35,10,'uploads/product-1747882726554.jpg','Shelf C2',1,'2025-05-21 16:52:09','2025-05-22 02:58:46',3),(7,'Samsung 970 EVO Plus 1TB','SSD-SAM-1TB','Samsung 970 EVO Plus 1TB PCIe NVMe M.2 Internal Solid State Drive',109.99,85.00,40,10,'uploads/product-1747882865769.webp','Shelf D1',1,'2025-05-21 16:52:09','2025-05-22 03:01:05',4),(8,'Western Digital 4TB HDD','HDD-WD-4TB','Western Digital 4TB WD Blue PC Hard Drive - 5400 RPM Class, SATA 6 Gb/s, 64 MB Cache',79.99,60.00,25,5,'uploads/product-1747882869702.jpg','Shelf D2',1,'2025-05-21 16:52:09','2025-05-22 03:01:09',4),(9,'NVIDIA GeForce RTX 3080','GPU-NV-3080','NVIDIA GeForce RTX 3080 10GB GDDR6X Graphics Card',699.99,600.00,8,2,'uploads/product-1747882740667.jpg','Shelf E1',1,'2025-05-21 16:52:09','2025-05-22 02:59:00',5),(10,'AMD Radeon RX 6800 XT','GPU-AMD-6800XT','AMD Radeon RX 6800 XT 16GB GDDR6 Graphics Card',649.99,550.00,1,5,'uploads/product-1747850550647.jpg','Shelf E2',1,'2025-05-21 16:52:09','2025-05-23 15:44:40',5),(11,'Corsair RM850x Power Supply','PSU-CORS-850W','Corsair RM850x 850 Watt 80 PLUS Gold Certified Fully Modular Power Supply',129.99,100.00,20,5,'uploads/product-1747882703750.jpg','Shelf F1',1,'2025-05-21 16:52:09','2025-05-22 02:58:23',6),(12,'NZXT H510 Mid Tower Case','CASE-NZXT-H510','NZXT H510 - Compact ATX Mid-Tower PC Gaming Case',69.99,50.00,15,3,'uploads/product-1747882748662.jpg','Shelf G1',1,'2025-05-21 16:52:09','2025-05-22 02:59:08',7),(14,'Sản phẩm 1','SP001','Mô tả sản phẩm 1',150000.00,100000.00,50,5,NULL,'Kho A',1,'2025-05-23 16:31:19','2025-05-23 16:31:19',1);
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','admin@example.com','$2b$10$RD3fvP88lY.EppHKehRYCuunlg934w8HWYXGXEASf0lEPutomPs5O','Admin User',NULL,NULL,'admin',1,'2025-05-21 16:52:09','2025-05-22 04:23:37'),(2,'staff','staff@example.com','$2b$10$Zf8R/.M3cwiiX7QKN7BNt.bTVCTXXEr5USxzgJ8wKf.3IiB/msIIW','Staff User',NULL,NULL,'staff',1,'2025-05-21 16:52:09','2025-05-21 16:52:09'),(3,'customer','customer@example.com','$2b$10$9wTG8PiR/kTdsYkgnPQskOB9DeAjf6lx8h6/tMdr4pyNCc6r1AMNK','Customer User','1234567890','123 Main St, City, Country','staff',1,'2025-05-21 16:52:09','2025-05-22 04:23:15'),(4,'tranhh','tranhuyhoang@gmail.com','$2b$10$2h/wEiHtp1GoOfo96PwE6.Nkz6LxTqD6d8OmTModvD.1R.GeEZQgK','Trần Huy Hoàng','0367805247','Viet Nam\nViet Nam','admin',1,'2025-05-21 16:58:03','2025-05-21 16:58:03'),(6,'tranhh1','tranhuyhoang1@gmail.com','$2b$10$/MqLw9V7N40VTUcwy1JXCOMh9SzUvsCh78.gTlIBgspQTlW/RSL7y','Trần Huy Hoàng','','','staff',1,'2025-05-23 14:32:11','2025-05-23 14:32:11'),(7,'tranhh2','tranhuyhoang2@gmail.com','$2b$10$piO2i35z1Bqm/k/yeO7I4OijxGvkSmn8V2WKfpDOTbDlJlZ36pf3i','Trần Huy Hoàng','','','customer',1,'2025-05-23 15:39:06','2025-05-23 15:42:12');
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

-- Dump completed on 2025-05-24  0:09:04
