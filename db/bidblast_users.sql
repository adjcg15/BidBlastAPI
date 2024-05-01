CREATE USER 'bidblast_owner'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON bid_blast_database.* TO 'bidblast_owner'@'localhost';
FLUSH PRIVILEGES;