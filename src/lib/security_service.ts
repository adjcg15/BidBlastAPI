import bcrypt from "bcrypt";

class SecurityService {
    public async hashPassword(plainPassword: string) {
        const SALT_ROUNDS = 10;

        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        
        return hashedPassword;
    }

    public async comparePassword(plainPassword: string, hashedPassword: string) {
        const isMatch = await bcrypt.compare(plainPassword, hashedPassword);

        return isMatch;
    }
}

export default SecurityService;