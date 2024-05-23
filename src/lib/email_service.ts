import { Transporter, createTransport } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { IAuctionData } from "@ts/data";
import { SMTPException } from "@exceptions/services";

class EmailService {
    private transporter: Transporter<SMTPTransport.SentMessageInfo>

    constructor() {
        this.transporter = createTransport({
            host: process.env.SMTP_SERVER_HOST,
            port: Number(process.env.SMTP_SERVER_PORT),
            auth: {
                user: process.env.SMTP_SERVER_USER,
                pass: process.env.SMTP_SERVER_PASSWORD
            }
        });
    }

    public async notifySaleToAuctioneer(auctionInfo: IAuctionData) {
        const mailOptions = {
            from: "support@bidblast.com",
            to: "adjcg15@gmail.com",
            subject: "Producto en subasta vendido",
            html: 
                "<html><body style='font-family: sans-serif, arial;'>"
                + "<h1 style='background-color: #00086A; padding: 24px 32px; color: white;'>¡Producto en subasta vendido!</h1>"
                + "<div style='padding: 32px; line-height: 160%; max-width: 400px; margin: 0 auto;'>" 
                    + "<p>"
                        + `El producto <strong>${auctionInfo.title}</strong> que te encontrabas subastado ha finalizado `
                        + `su periodo de ventas y has recibido una oferta de `
                        + `<strong style='color: #FF5C00;'>\$${auctionInfo.lastOffer?.amount}</strong> por él. `
                        + "Ponte en contacto con el comprador para concretar la compra."
                    + "</p>"
                    + "<h2 style='margin-top: 24px; margin-bottom: 8px'>Información del comprador</h2>"
                    + `<p><strong>Nombre: </strong> ${auctionInfo.lastOffer?.customer?.fullName}</p>`
                    + `<p><strong>Correo electrónico: </strong> ${auctionInfo.lastOffer?.customer?.email}</p>`
                    + (
                        auctionInfo.lastOffer?.customer?.phoneNumber 
                        ? `<p><strong>Teléfono: </strong> ${auctionInfo.lastOffer?.customer?.phoneNumber}</p>`
                        : ""
                    )
                + "</div>"
                + "</body></html>"
        };

        return new Promise((resolve, reject) => {
            this.transporter.sendMail(mailOptions, function(error:any, info) {
                if(error) {
                    const errorCodeMessage = error.code ? `ErrorCode: ${error.code}` : "";
                    reject(new SMTPException(
                        error.message
                        ? `${error.message}. ${errorCodeMessage}`
                        : `It was not possible to send the notification to auctioneer about sale. ${errorCodeMessage}`
                    ));
                    return;
                }
                
                resolve(info);
            });
        });
    }

    public async notifySaleToCustomer(auctionInfo: IAuctionData) {

    }
}

export default EmailService;