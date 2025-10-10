-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: reunioes_renan
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'2014_10_12_000000_create_users_table',1),(2,'2014_10_12_100000_create_password_reset_tokens_table',1),(3,'2019_08_19_000000_create_failed_jobs_table',1),(4,'2019_12_14_000001_create_personal_access_tokens_table',1),(5,'2025_09_17_200807_create_reunioes_table',1),(6,'2025_09_17_201027_create_reuniao_user_table',1),(7,'2025_09_19_181532_fix_fk_reunioes_user_to_pessoas_dados',1),(8,'2025_09_22_172422_rename_nome_to_name_in_users_table',1),(9,'2025_09_22_173727_rename_senha_to_password_in_users_table',1),(10,'2025_09_23_174636_add_avatar_to_users_table',1),(11,'2025_09_26_163314_add_role_to_users',1),(12,'2025_09_26_163348_add_cpf_to_reuniao_participantes',1),(13,'2025_10_02_141254_add_telefone_to_reuniao_participantes',1);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
INSERT INTO `password_reset_tokens` VALUES ('renan.arida@gazin.com.br','$2y$12$skfr2r7ewK8lQPCcrzDFfOgjgNCeaSd1Q7VFAfbSueRO1IoccaGkK','2025-10-07 15:34:35');
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (5,'App\\Models\\User',1,'app-token','da0ae6832ea4d088ba8e5114c98ac3f39d1d753b36098e2fbb2565ebdfce1bfe','[\"*\"]','2025-10-02 17:41:00',NULL,'2025-10-02 16:38:32','2025-10-02 17:41:00'),(6,'App\\Models\\User',1,'app-token','d829bce40465d9331a81f86cf46adf149bedc0b351b9bb39fbc5ce6ce10470a2','[\"*\"]','2025-10-02 18:02:46',NULL,'2025-10-02 17:41:15','2025-10-02 18:02:46'),(12,'App\\Models\\User',1,'app-token','5c6cde47a6f05ee73fa54273f70648c9c300bd9b01da8bf2f5980c0ccb68ba49','[\"*\"]','2025-10-03 17:17:24',NULL,'2025-10-03 17:16:23','2025-10-03 17:17:24'),(13,'App\\Models\\User',1,'app-token','a5922a273b74c71a428b75e9084e5c74a88d5471fc097c2111d85949f3b04ba5','[\"*\"]','2025-10-03 17:57:37',NULL,'2025-10-03 17:17:33','2025-10-03 17:57:37'),(14,'App\\Models\\User',2,'app-token','1be6abf9e1851ea31c94c85d30e41bbb70d824ec81d63f856496138975481514','[\"*\"]','2025-10-03 17:59:32',NULL,'2025-10-03 17:59:21','2025-10-03 17:59:32'),(18,'App\\Models\\User',1,'app-token','c7ab57a07446a4e46d1a0b7dcd417b65a49293a2fe38459d0ca8ff0163e365f9','[\"*\"]','2025-10-06 17:37:37',NULL,'2025-10-06 16:53:42','2025-10-06 17:37:37'),(21,'App\\Models\\User',1,'app-token','7971154030fa15f7ba2dfc7690ecd874f6f818ff72705b993868be0e6a474848','[\"*\"]','2025-10-07 15:00:53',NULL,'2025-10-07 14:09:45','2025-10-07 15:00:53'),(26,'App\\Models\\User',1,'app-token','4c5f5a85f7932a3a7fc96ea7f725a54a92e408916f0c413cb2526e13ddcb6879','[\"*\"]','2025-10-08 14:03:40',NULL,'2025-10-07 18:23:23','2025-10-08 14:03:40'),(31,'App\\Models\\User',1,'app-token','c35128e1669fc7a232a15f3737a0acd6deefdefcd7f9a6efd51dcc8e3eceb65e','[\"*\"]','2025-10-09 14:09:04',NULL,'2025-10-08 17:53:03','2025-10-09 14:09:04'),(32,'App\\Models\\User',1,'app-token','ae2edd3b1cf5a08767ecc65531c8596630b8b100e5bd5122be2218cfba85bce4','[\"*\"]','2025-10-09 18:27:36',NULL,'2025-10-09 14:10:02','2025-10-09 18:27:36'),(33,'App\\Models\\User',1,'app-token','0c9a7f4e65813036122e7ab0d0b885511b02189f308ec78f1d66b838fa5f3a58','[\"*\"]','2025-10-09 18:44:43',NULL,'2025-10-09 18:27:56','2025-10-09 18:44:43'),(34,'App\\Models\\User',1,'app-token','8db2f483028efc5beefea485b162c9aa566cdb3548744b8625a23c4c074f005c','[\"*\"]','2025-10-09 18:43:24',NULL,'2025-10-09 18:31:17','2025-10-09 18:43:24'),(35,'App\\Models\\User',1,'app-token','7a5ad7db3e2f9d04b17885c3a86b806c481b5e3c343f39dfb94f6a4af60c4929','[\"*\"]','2025-10-09 18:44:21',NULL,'2025-10-09 18:44:16','2025-10-09 18:44:21'),(36,'App\\Models\\User',1,'app-token','06b68d77be7e339a4427d29a4db0ca52b92757baa5ebf5d36d47e4cdb3543fb0','[\"*\"]','2025-10-09 18:45:30',NULL,'2025-10-09 18:44:47','2025-10-09 18:45:30');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reuniao_participantes`
--

DROP TABLE IF EXISTS `reuniao_participantes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reuniao_participantes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reuniao_id` bigint unsigned NOT NULL,
  `nome` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cpf` char(11) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `papel` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `rp_unique_reuniao_cpf` (`reuniao_id`,`cpf`),
  KEY `reuniao_participantes_email_index` (`email`),
  KEY `rp_cpf_idx` (`cpf`),
  CONSTRAINT `reuniao_participantes_reuniao_id_foreign` FOREIGN KEY (`reuniao_id`) REFERENCES `reunioes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reuniao_participantes`
--

LOCK TABLES `reuniao_participantes` WRITE;
/*!40000 ALTER TABLE `reuniao_participantes` DISABLE KEYS */;
INSERT INTO `reuniao_participantes` VALUES (3,3,'Yukio','yukio@teste.com',NULL,'20545820006','Dev','2025-10-02 15:27:24','2025-10-02 15:27:24'),(6,4,'lucas teste','lucas@gmail.com',NULL,'82368814078','Dev','2025-10-02 16:23:59','2025-10-02 16:23:59'),(7,4,'Renan Yukio Arida','arida@teste.com',NULL,'89868963036','tec','2025-10-02 16:23:59','2025-10-02 16:23:59'),(8,4,'Pessoas teste','pessoas@gmail.com',NULL,'72369878088','Auxiliar admin','2025-10-02 16:23:59','2025-10-02 16:23:59');
/*!40000 ALTER TABLE `reuniao_participantes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reuniao_user`
--

DROP TABLE IF EXISTS `reuniao_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reuniao_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `reuniao_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reuniao_user_reuniao_id_user_id_unique` (`reuniao_id`,`user_id`),
  KEY `reuniao_user_user_id_foreign` (`user_id`),
  CONSTRAINT `reuniao_user_reuniao_id_foreign` FOREIGN KEY (`reuniao_id`) REFERENCES `reunioes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `reuniao_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reuniao_user`
--

LOCK TABLES `reuniao_user` WRITE;
/*!40000 ALTER TABLE `reuniao_user` DISABLE KEYS */;
/*!40000 ALTER TABLE `reuniao_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reunioes`
--

DROP TABLE IF EXISTS `reunioes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reunioes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned DEFAULT NULL,
  `titulo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci,
  `data` date NOT NULL,
  `hora` time NOT NULL,
  `local` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadados` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reunioes_user_id_foreign` (`user_id`),
  KEY `reunioes_data_index` (`data`),
  KEY `reunioes_hora_index` (`hora`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reunioes`
--

LOCK TABLES `reunioes` WRITE;
/*!40000 ALTER TABLE `reunioes` DISABLE KEYS */;
INSERT INTO `reunioes` VALUES (3,1,'reuniao','reuniao aprendiz 04/10','2025-10-04','15:00:00','online',NULL,'2025-10-02 15:10:24','2025-10-02 15:27:24'),(4,1,'ada','teste','2025-10-02','15:30:00','teste',NULL,'2025-10-02 15:14:19','2025-10-02 16:23:59'),(5,1,'teste reuniao','reuniao concluido','2025-10-02','14:00:00','online',NULL,'2025-10-03 14:21:48','2025-10-03 14:21:48');
/*!40000 ALTER TABLE `reunioes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `avatar_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_role_index` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador','admin@empresa.com',NULL,'$2y$12$vx7zR4FSje5Lp2jxWry9pOciKTgS2eVEEs1DZaa3PfloVCGBZsT6S','admin',NULL,NULL,'2025-10-02 15:05:51','2025-10-07 15:16:07'),(2,'Renan Yukio Arida','renan.arida@gazin.com.br',NULL,'$2y$12$vj3ZaoSeqv069/A6QR2kzueZgEYrM0.76cV/k5bVZD2qG14r6DoYG','user',NULL,NULL,'2025-10-02 16:26:18','2025-10-02 16:26:18');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'reunioes_renan'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-09 19:03:26
