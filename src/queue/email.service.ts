import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

//Conectar Nodemailer com GMAIL
@Injectable()
export class EmailService {
  private readonly transporter: any;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const apiUrl = this.configService.get<string>('API_URL');

    const verificationUrl = `${apiUrl}/auth/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.configService.get<string>('EMAIL_USER'),
      to,
      subject: `NestJS API - Verify your email ${Date.now()}`,
      html: `<html>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; background: #121212; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <h2 style="color: #fff; text-align: center; font-family: 'Trebuchet MS', Arial, sans-serif;">Welcome to my Project!</h2>
            <img src="https://i.imgur.com/0E9WLeU.png" alt="logo" style="max-width: 100%; height: auto; border-radius: 10px">
            <p style="font-size: 16px; color: #666666; text-align: center;">
              Thank you for registering with us! To complete the registration process and activate your email account, please click the button below.
            </p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                Verify email ✉️</i>
              </a>
              
            </div>
            <p style="font-size: 14px; color: #999999; text-align: center; margin-top: 30px;">
              <strong>If you haven't registered with us, please, ignore this email.</strong>
            </p>
          </div>
        </body>
      </html>`,
    });
  }
}
