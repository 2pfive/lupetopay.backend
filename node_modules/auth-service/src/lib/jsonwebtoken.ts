import jwt from "jsonwebtoken"
import crypto from "crypto"
import { config } from "../config/config"

export const generateToken = async (payload: any) => {

    const passphrase = process.env.PASSPHRASE
    console.log(passphrase);

    const encryptedKey = config.admin_private_key
    // console.log(encryptedKey);

    const privateKey = crypto.createPrivateKey({
        key: encryptedKey,
        format: 'pem',
        passphrase: config.jwt_secret_key
    })

    const token = jwt.sign({ payload }, privateKey, { algorithm: 'RS256', expiresIn: '15m' })

    return token
}

export const generateRefreshToken = () => {
    const token = crypto.randomBytes(64).toString("hex");

    const tokenHash = hashToken(token)

    return {
        token,       // à envoyer au client
        tokenHash    // à stocker en DB
    };
};

export const hashToken = (token: string): string => {
    if (!token) {
        throw new Error("token requis");
    }

    return crypto
        .createHmac("sha256", config.refresh_secret!)
        .update(token)
        .digest("hex");
};