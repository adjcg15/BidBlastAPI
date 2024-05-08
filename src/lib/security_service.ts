import bcrypt from "bcrypt";

class SecurityService {
    public hashPassword(plainPassword: string) {
        const SALT_ROUNDS = 10;

        const salt = bcrypt.genSaltSync(SALT_ROUNDS);
        const hashedPassword = bcrypt.hashSync(plainPassword, salt);
        
        return hashedPassword;
    }

    public async comparePassword(plainPassword: string, hashedPassword: string) {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

        return isMatch;
    }
}

export default SecurityService;