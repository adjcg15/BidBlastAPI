-- MySQL Script generated by MySQL Workbench
-- Tue Apr 30 19:33:19 2024
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema bid_blast_database
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema bid_blast_database
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `bid_blast_database` DEFAULT CHARACTER SET utf8 ;
USE `bid_blast_database` ;

-- -----------------------------------------------------
-- Table `bid_blast_database`.`profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`profiles` (
  `id_profile` INT NOT NULL AUTO_INCREMENT,
  `full_name` NVARCHAR(255) NOT NULL,
  `phone_number` CHAR(10) NULL,
  `avatar` BLOB NULL,
  PRIMARY KEY (`id_profile`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`accounts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`accounts` (
  `id_account` INT NOT NULL AUTO_INCREMENT,
  `email` NVARCHAR(60) NOT NULL,
  `password` CHAR(64) NOT NULL,
  `id_profile` INT NOT NULL,
  PRIMARY KEY (`id_account`),
  UNIQUE INDEX `email_UNIQUE` (`email` ASC) VISIBLE,
  INDEX `fk_accounts_profiles_idx` (`id_profile` ASC) VISIBLE,
  CONSTRAINT `fk_accounts_profiles`
    FOREIGN KEY (`id_profile`)
    REFERENCES `bid_blast_database`.`profiles` (`id_profile`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`roles` (
  `id_rol` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(15) NULL,
  PRIMARY KEY (`id_rol`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`items_conditions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`item_conditions` (
  `id_item_condition` INT NOT NULL AUTO_INCREMENT,
  `name` NVARCHAR(60) NOT NULL,
  PRIMARY KEY (`id_item_condition`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`auction_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`auction_categories` (
  `id_auction_category` INT NOT NULL AUTO_INCREMENT,
  `title` NVARCHAR(60) NOT NULL,
  `keywords` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  PRIMARY KEY (`id_auction_category`),
  UNIQUE INDEX `title_UNIQUE` (`title` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`auctions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`auctions` (
  `id_auction` INT NOT NULL AUTO_INCREMENT,
  `description` NVARCHAR(255) NOT NULL,
  `base_price` DECIMAL NOT NULL,
  `minimum_bid` DECIMAL NULL,
  `approval_date` DATETIME NULL,
  `title` NVARCHAR(60) NOT NULL,
  `days_available` SMALLINT NOT NULL,
  `id_profile` INT NOT NULL,
  `id_item_condition` INT NOT NULL,
  `id_auction_category` INT NOT NULL,
  PRIMARY KEY (`id_auction`),
  INDEX `fk_auctions_profiles_idx` (`id_profile` ASC) VISIBLE,
  INDEX `fk_auctions_item_conditions_idx` (`id_item_condition` ASC) VISIBLE,
  INDEX `fk_auctions_auction_categories_idx` (`id_auction_category` ASC) VISIBLE,
  CONSTRAINT `fk_auctions_profiles`
    FOREIGN KEY (`id_profile`)
    REFERENCES `bid_blast_database`.`profiles` (`id_profile`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auctions_item_conditions`
    FOREIGN KEY (`id_item_condition`)
    REFERENCES `bid_blast_database`.`item_conditions` (`id_item_condition`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auctions_auction_categories1`
    FOREIGN KEY (`id_auction_category`)
    REFERENCES `bid_blast_database`.`auction_categories` (`id_auction_category`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`auction_reviews`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`auction_reviews` (
  `id_auction_review` INT NOT NULL AUTO_INCREMENT,
  `creation_date` DATETIME NOT NULL,
  `comments` TEXT NOT NULL,
  `id_auction` INT NOT NULL,
  `id_profile` INT NOT NULL,
  PRIMARY KEY (`id_auction_review`),
  INDEX `fk_auction_reviews_auctions_idx` (`id_auction` ASC) VISIBLE,
  INDEX `fk_auction_reviews_profiles_idx` (`id_profile` ASC) VISIBLE,
  CONSTRAINT `fk_auction_reviews_auctions`
    FOREIGN KEY (`id_auction`)
    REFERENCES `bid_blast_database`.`auctions` (`id_auction`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auction_reviews_profiles`
    FOREIGN KEY (`id_profile`)
    REFERENCES `bid_blast_database`.`profiles` (`id_profile`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`accounts_roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`accounts_roles` (
  `id_account_rol` INT NOT NULL AUTO_INCREMENT,
  `id_account` INT NOT NULL,
  `id_rol` INT NOT NULL,
  PRIMARY KEY (`id_account_rol`),
  INDEX `fk_accounts_roles_accounts_idx` (`id_account` ASC) VISIBLE,
  INDEX `fk_accounts_roles_roles_idx` (`id_rol` ASC) VISIBLE,
  CONSTRAINT `fk_accounts_roles_accounts`
    FOREIGN KEY (`id_account`)
    REFERENCES `bid_blast_database`.`accounts` (`id_account`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_accounts_roles_roles`
    FOREIGN KEY (`id_rol`)
    REFERENCES `bid_blast_database`.`roles` (`id_rol`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`black_lists`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`black_lists` (
  `id_black_list` INT NOT NULL AUTO_INCREMENT,
  `creation_date` DATETIME NOT NULL,
  `id_profile` INT NOT NULL,
  `id_auction` INT NOT NULL,
  PRIMARY KEY (`id_black_list`),
  INDEX `fk_black_lists_profiles_idx` (`id_profile` ASC) VISIBLE,
  INDEX `fk_black_lists_auctions_idx` (`id_auction` ASC) VISIBLE,
  CONSTRAINT `fk_black_lists_profiles`
    FOREIGN KEY (`id_profile`)
    REFERENCES `bid_blast_database`.`profiles` (`id_profile`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_black_lists_auctions`
    FOREIGN KEY (`id_auction`)
    REFERENCES `bid_blast_database`.`auctions` (`id_auction`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`offers`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`offers` (
  `id_offer` INT NOT NULL AUTO_INCREMENT,
  `amount` DECIMAL NOT NULL,
  `creation_date` DATETIME NOT NULL,
  `id_profile` INT NOT NULL,
  `id_auction` INT NOT NULL,
  PRIMARY KEY (`id_offer`),
  INDEX `fk_offers_profiles_idx` (`id_profile` ASC) VISIBLE,
  INDEX `fk_offers_auctions_idx` (`id_auction` ASC) VISIBLE,
  CONSTRAINT `fk_offers_profiles`
    FOREIGN KEY (`id_profile`)
    REFERENCES `bid_blast_database`.`profiles` (`id_profile`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_offers_auctions`
    FOREIGN KEY (`id_auction`)
    REFERENCES `bid_blast_database`.`auctions` (`id_auction`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`hypermedia_files`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`hypermedia_files` (
  `id_hypermedia_file` INT NOT NULL AUTO_INCREMENT,
  `mime_type` NVARCHAR(45) NOT NULL,
  `name` NVARCHAR(60) NOT NULL,
  `content` BLOB NOT NULL,
  `id_auction` INT NOT NULL,
  PRIMARY KEY (`id_hypermedia_file`),
  INDEX `fk_hypermedia_files_auctions_idx` (`id_auction` ASC) VISIBLE,
  CONSTRAINT `fk_hypermedia_files_auctions`
    FOREIGN KEY (`id_auction`)
    REFERENCES `bid_blast_database`.`auctions` (`id_auction`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`auction_states`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`auction_states` (
  `id_auction_state` INT NOT NULL AUTO_INCREMENT,
  `name` NVARCHAR(45) NOT NULL,
  PRIMARY KEY (`id_auction_state`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `bid_blast_database`.`auctions_states_applications`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bid_blast_database`.`auctions_states_applications` (
  `id_auction_state_application` INT NOT NULL AUTO_INCREMENT,
  `id_auction` INT NOT NULL,
  `id_auction_state` INT NOT NULL,
  `application_date` DATETIME NOT NULL,
  PRIMARY KEY (`id_auction_state_application`),
  INDEX `fk_auctions_states_applications_auctions_idx` (`id_auction` ASC) VISIBLE,
  INDEX `fk_auctions_states_applications_action_states_idx` (`id_auction_state` ASC) VISIBLE,
  CONSTRAINT `fk_auctions_states_applications_auctions`
    FOREIGN KEY (`id_auction`)
    REFERENCES `bid_blast_database`.`auctions` (`id_auction`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auctions_states_applications_auction_states`
    FOREIGN KEY (`id_auction_state`)
    REFERENCES `bid_blast_database`.`auction_states` (`id_auction_state`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
