USE bid_blast_database;

DELIMITER //
CREATE PROCEDURE recover_user_by_email(
	IN p_email VARCHAR(320)
)
BEGIN
	SELECT profiles.id_profile, avatar, email, 
    password, full_name, phone_number
	FROM accounts NATURAL JOIN profiles 
	WHERE email = p_email
	LIMIT 1;
    
    SELECT r.name
	FROM roles r
	INNER JOIN accounts_roles ar ON r.id_rol = ar.id_rol
	INNER JOIN accounts a ON ar.id_account = a.id_account
	WHERE a.email = p_email;
END //
DELIMITER ;