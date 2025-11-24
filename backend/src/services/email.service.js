import nodemailer from "nodemailer";

// Create transporter based on environment variables
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "mailhog", // Use 'mailhog' service name in Docker
  port: parseInt(process.env.MAIL_PORT || "1025"), // Mailhog default port
  secure: false, // true for 465, false for other ports
  auth: process.env.MAIL_USER ? {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  } : undefined,
  tls: {
    rejectUnauthorized: false // For development
  }
});

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(to, order) {
  try {
    // Generate HTML email
    const html = generateOrderConfirmationHTML(order);

    const mailOptions = {
      from: process.env.MAIL_FROM || '"Ecom Laptop" <noreply@ecomlaptop.com>',
      to,
      subject: `Order Confirmation - #${order._id.toString().slice(-8).toUpperCase()}`,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Order confirmation email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
}

/**
 * Format number as Vietnamese Dong currency
 */
function formatCurrencyVND(amount) {
  if (typeof amount !== 'number') amount = Number(amount) || 0;
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ';
}

/**
 * Generate HTML for order confirmation email
 */
function generateOrderConfirmationHTML(order) {
  const orderNumber = order._id.toString().slice(-8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString('vi-VN');

  let itemsHTML = '';
  order.items.forEach(item => {
    const itemTotal = item.price * item.quantity;
    itemsHTML += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name || 'Product'}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrencyVND(item.price)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrencyVND(itemTotal)}</td>
      </tr>
    `;
  });

  const subtotal = order.pricing?.subtotal || order.totalAmount;
  const discount = order.pricing?.discountValue || 0;
  const total = order.totalAmount;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💻 Ecom Laptop</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Thank you for your order!</p>
      </div>

      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Order Confirmation</h2>
        
        <p>Hi there,</p>
        <p>Your order has been confirmed and will be shipped soon.</p>

        <div style="background: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> #${orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${date}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">${order.status.toUpperCase()}</span></p>
        </div>

        <h3 style="color: #667eea; margin-top: 30px;">Order Details</h3>
        
        <table style="width: 100%; background: white; border-radius: 5px; overflow: hidden; border-collapse: collapse;">
          <thead>
            <tr style="background: #667eea; color: white;">
              <th style="padding: 12px; text-align: left;">Product</th>
              <th style="padding: 12px; text-align: center;">Qty</th>
              <th style="padding: 12px; text-align: right;">Price</th>
              <th style="padding: 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <div style="background: white; padding: 20px; border-radius: 5px; margin-top: 20px;">
          <div style="display: flex; justify-content: space-between; padding: 5px 0;">
            <span>Subtotal:</span>
            <span>${formatCurrencyVND(subtotal)}</span>
          </div>
          ${discount > 0 ? `
          <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #10b981;">
            <span>Discount:</span>
            <span>- ${formatCurrencyVND(discount)}</span>
          </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #667eea; margin-top: 10px; font-size: 18px; font-weight: bold; color: #667eea;">
            <span>Total:</span>
            <span>${formatCurrencyVND(total)}</span>
          </div>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
          <p style="margin: 0; color: #856404;">
            <strong>📦 Shipping Information:</strong><br>
            We'll send you a shipping confirmation email as soon as your order ships.
          </p>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
          <p>Need help? Contact us at <a href="mailto:support@ecomlaptop.com" style="color: #667eea;">support@ecomlaptop.com</a></p>
          <p style="margin-top: 20px;">
            <a href="http://localhost:5173" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Store</a>
          </p>
        </div>
      </div>

      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Ecom Laptop. All rights reserved.</p>
        <p>This is an automated email, please do not reply.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send welcome email with one-time reset password link (for signup)
 */
export async function sendWelcomeEmail(to, resetToken, userName = null) {
  try {
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const greeting = userName ? `Hi ${userName},` : 'Hi there,';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Ecom Laptop</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💻 Ecom Laptop</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Welcome to our store!</p>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Welcome to Ecom Laptop!</h2>
          
          <p>${greeting}</p>
          <p>Thank you for registering with us. Your account has been created successfully!</p>

          <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>🔐 Set Your Password:</strong><br>
              To complete your registration, please set your password by clicking the link below. This is a one-time link that will expire in 24 hours.
            </p>
          </div>

          <p style="margin: 30px 0; text-align: center;">
            <a href="${resetURL}" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Set Your Password</a>
          </p>

          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong>
          </p>
          <ul style="color: #666; font-size: 14px;">
            <li>This link will expire in <strong>24 hours</strong></li>
            <li>This is a <strong>one-time use</strong> link - once you set your password, this link will no longer work</li>
            <li>If the link expires, you can use the "Forgot Password" feature on the login page to receive a new reset link</li>
          </ul>

          <div style="margin-top: 30px; padding: 20px; background: white; border-radius: 5px;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>What's next?</strong><br>
              After setting your password, you'll be able to login and start shopping!
            </p>
          </div>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Need help? Contact us at <a href="mailto:support@ecomlaptop.com" style="color: #667eea;">support@ecomlaptop.com</a></p>
            <p style="margin-top: 20px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Store</a>
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Ecom Laptop. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM || '"Ecom Laptop" <noreply@ecomlaptop.com>',
      to,
      subject: 'Welcome to Ecom Laptop - Set Your Password',
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send welcome email:', err);
    throw err;
  }
}

/**
 * Send password reset email (for forgot password)
 */
export async function sendPasswordResetEmail(to, resetToken) {
  try {
    const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">💻 Ecom Laptop</h1>
        </div>

        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #667eea; margin-top: 0;">Reset Your Password</h2>
          <p>Hi there,</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>

          <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>🔐 Password Reset:</strong><br>
              This is a one-time link that will expire in 1 hour. Once you reset your password, this link will no longer work.
            </p>
          </div>

          <p style="margin: 30px 0; text-align: center;">
            <a href="${resetURL}" style="background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">Reset Password</a>
          </p>

          <p style="color: #666; font-size: 14px;">
            <strong>Important:</strong>
          </p>
          <ul style="color: #666; font-size: 14px;">
            <li>This link will expire in <strong>1 hour</strong></li>
            <li>This is a <strong>one-time use</strong> link</li>
            <li>If you didn't request this, please ignore this email</li>
          </ul>

          <div style="margin-top: 30px; text-align: center; color: #666; font-size: 14px;">
            <p>Need help? Contact us at <a href="mailto:support@ecomlaptop.com" style="color: #667eea;">support@ecomlaptop.com</a></p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© ${new Date().getFullYear()} Ecom Laptop. All rights reserved.</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.MAIL_FROM || '"Ecom Laptop" <noreply@ecomlaptop.com>',
      to,
      subject: 'Reset Your Password - Ecom Laptop',
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send password reset email:', err);
    throw err;
  }
}

export default {
  sendOrderConfirmation,
  sendWelcomeEmail,
  sendPasswordResetEmail
};

