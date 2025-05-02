import nodemailer from "nodemailer";
import "dotenv/config";
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

export const sendEmail = async (to, subject, text, notification) => {
  console.log("sendEmail", to, subject, text, notification);
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Poppins', Arial, sans-serif;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
          line-height: 1.6;
        }
        
        .container {
          width: 100%;
          max-width: 650px;
          margin: 30px auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 5px 25px rgba(0, 0, 0, 0.08);
        }
        
        .header {
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          padding: 30px 20px;
          text-align: center;
        }
        
        .header img {
          max-width: 180px;
          height: auto;
        }
        
        .brand-name {
          font-size: 28px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.5px;
          margin-top: 10px;
        }
        
        .content {
          padding: 40px 30px;
          background-color: #fff;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 15px;
        }
        
        .message {
          color: #4a5568;
          font-size: 16px;
          margin-bottom: 25px;
          line-height: 1.7;
        }
        
        .notification-box {
          background-color: #f7fafc;
          border-left: 4px solid #6366F1;
          padding: 20px;
          border-radius: 5px;
          margin: 25px 0;
        }
        
        .notification-title {
          color: #4a5568;
          font-weight: 600;
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .notification-content {
          color: #2d3748;
          font-weight: 500;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          margin: 30px 0 20px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
          transition: all 0.3s ease;
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(99, 102, 241, 0.4);
        }
        
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 30px 0;
        }
        
        .footer {
          background-color: #f8fafc;
          padding: 25px 30px;
          text-align: center;
        }
        
        .social-links {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .social-link {
          display: inline-block;
          background-color: #e2e8f0;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          margin: 0 8px;
          text-align: center;
          line-height: 36px;
          color: #4a5568;
          text-decoration: none;
          font-size: 18px;
          transition: all 0.3s ease;
        }
        
        .social-link:hover {
          background-color: #6366F1;
          color: #ffffff;
          transform: scale(1.1);
        }
        
        .copyright {
          color: #718096;
          font-size: 14px;
          margin-top: 15px;
        }
        
        .contact-info {
          color: #718096;
          font-size: 14px;
          margin-top: 5px;
        }
        
        @media screen and (max-width: 600px) {
          .container {
            margin: 10px;
            width: auto;
          }
          
          .content, .footer {
            padding: 25px 20px;
          }
          
          .greeting {
            font-size: 22px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand-name">Pixel App</div>
        </div>
        
        <div class="content">
          <h1 class="greeting">Hello there!</h1>
          <p class="message">Thank you for being part of our community. We're excited to have you with us and look forward to providing you with exceptional service.</p>
          
          <div class="notification-box">
            <div class="notification-title">You have a new notification</div>
            <div class="notification-content">${notification}</div>
          </div>
          
          <a href="#" class="cta-button">View Details</a>
          
          <div class="divider"></div>
          
          <p class="message">If you have any questions or need assistance, don't hesitate to contact our support team. We're here to help!</p>
        </div>
        
        <div class="footer">
          <div class="social-links">
            <a href="#" class="social-link">f</a>
            <a href="#" class="social-link">t</a>
            <a href="#" class="social-link">in</a>
            <a href="#" class="social-link">ig</a>
          </div>
          
          <div class="copyright">&copy; ${new Date().getFullYear()} Your Company. All rights reserved.</div>
          <div class="contact-info">123 Business Street, City, Country | support@yourcompany.com</div>
        </div>
      </div>
    </body>
    </html>
  `;

  const message = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(message);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending email");
  }
};
