USE bid_blast_database;

DELETE FROM accounts_roles WHERE id_account_rol >= 1;
DELETE FROM roles WHERE id_rol >= 1;
DELETE FROM accounts WHERE id_account >= 1;
DELETE FROM profiles WHERE id_profile >= 1;

INSERT INTO roles(name) VALUES ("CUSTOMER");
SELECT @customer_role_id := LAST_INSERT_ID(); 

INSERT INTO roles(name) VALUES ("AUCTIONEER");
SELECT @auctioneer_role_id := LAST_INSERT_ID(); 

INSERT INTO roles(name) VALUES ("MODERATOR");
SELECT @moderator_role_id := LAST_INSERT_ID();

INSERT INTO profiles(full_name, phone_number, avatar)
VALUES ('Juan Pérez Aguirre', '2281645447', null);
SELECT @first_profile_id := LAST_INSERT_ID();

INSERT INTO accounts(email, password, id_profile) 
VALUES('juan@gmail.com', 
	'$2b$10$cyP9ZIPiwVyT09zrDblZy.EEUQjIb8rdm6cPMPvBaJO4qXRcjHojm', @first_profile_id);
SELECT @moderator_account_id := LAST_INSERT_ID();

INSERT INTO profiles(full_name, phone_number, avatar)
VALUES ('Penélope Camacho Castro', null, null);
SELECT @second_profile_id := LAST_INSERT_ID();

INSERT INTO accounts(email, password, id_profile) 
VALUES('penelope@gmail.com', 
	'$2b$10$cyP9ZIPiwVyT09zrDblZy.EEUQjIb8rdm6cPMPvBaJO4qXRcjHojm', @second_profile_id);
SELECT @auctioneer_account_id := LAST_INSERT_ID();

INSERT INTO accounts_roles(id_account, id_rol) 
VALUES (@auctioneer_account_id, @customer_role_id),
	(@auctioneer_account_id, @auctioneer_role_id),
    (@moderator_account_id, @moderator_role_id);