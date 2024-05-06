CREATE USER 'bidblast_owner'@'localhost' IDENTIFIED BY 'MySQL_bidblast01';
GRANT ALL PRIVILEGES ON bid_blast_database.* TO 'bidblast_owner'@'localhost';
FLUSH PRIVILEGES;