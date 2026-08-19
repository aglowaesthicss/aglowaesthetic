import logging
import resend
from config import settings
from db import get_users_col

logger = logging.getLogger("aglow_emails")

# Initialize Resend
if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY
else:
    logger.warning("RESEND_API_KEY not configured. Emails will be logged instead of sent.")

def send_html_email(to_email: str, subject: str, html_content: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.info(f"[MOCK EMAIL] To: {to_email}\nSubject: {subject}\nContent: {html_content[:300]}...")
        return True
        
    try:
        params = {
            "from": settings.RESEND_FROM_EMAIL,
            "to": to_email,
            "subject": subject,
            "html": html_content
        }
        r = resend.Emails.send(params)
        logger.info(f"Email sent successfully to {to_email}. ID: {r.get('id')}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False

def send_welcome_email(client_name: str, client_email: str, temp_password: str, portal_url: str = "http://localhost:3000/login"):
    subject = "Welcome to Aglow Aesthetics - Your Client Portal is Ready"
    html_content = f"""
    <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c5a880; font-family: 'Cormorant Garamond', serif; font-size: 28px; margin: 0;">AGLOW AESTHETICS</h1>
            <p style="font-size: 12px; letter-spacing: 2px; color: #71717a; margin-top: 5px; text-transform: uppercase;">Chennai's Premier Korean Aesthetic Clinic</p>
        </div>
        <div style="color: #27272a; line-height: 1.6;">
            <p>Dear <strong>{client_name}</strong>,</p>
            <p>Welcome to Aglow Aesthetics! Your client portal account has been created successfully. You can now log in to view your upcoming treatment sessions, access invoices, and view exclusive skin offers.</p>
            
            <div style="background-color: #fafafa; border: 1px solid #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Username:</strong> {client_email}</p>
                <p style="margin: 0;"><strong>Temporary Password:</strong> <code style="background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold;">{temp_password}</code> (the last 5 digits of your mobile number)</p>
            </div>
            
            <p style="margin-bottom: 25px;">Please log in and update your password in Settings to secure your account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{portal_url}" style="background-color: #18181b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">Log In to Portal</a>
            </div>
            
            <p style="font-size: 13px; color: #71717a;">If you have any questions or did not request this, please contact us at {settings.RESEND_FROM_EMAIL}.</p>
        </div>
    </div>
    """
    return send_html_email(client_email, subject, html_content)

def notify_new_offer(offer_title: str, discount: str, description: str, promo_code: str, end_date: str, portal_url: str = "http://localhost:3000/offers"):
    users_col = get_users_col()
    clients = list(users_col.find({"role": "client"}))
    if not clients:
        return
        
    subject = f"Exclusive Offer: {discount} on {offer_title} at Aglow Aesthetics"
    
    # Send to each client
    for client in clients:
        client_email = client.get("email")
        if not client_email:
            continue
            
        html_content = f"""
        <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #c5a880; font-family: 'Cormorant Garamond', serif; font-size: 28px; margin: 0;">AGLOW AESTHETICS</h1>
                <p style="font-size: 12px; letter-spacing: 2px; color: #71717a; margin-top: 5px; text-transform: uppercase;">Chennai's Premier Korean Aesthetic Clinic</p>
            </div>
            <div style="color: #27272a; line-height: 1.6; text-align: center;">
                <p style="font-size: 14px; text-transform: uppercase; letter-spacing: 1.5px; color: #c5a880; margin: 0;">New Special Offer</p>
                <h2 style="font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: normal; margin: 10px 0 20px 0; color: #18181b;">{offer_title}</h2>
                <div style="font-size: 36px; color: #c5a880; font-weight: bold; margin-bottom: 20px;">{discount}</div>
                <p style="max-width: 480px; margin: 0 auto 25px auto; color: #71717a; font-size: 15px;">{description}</p>
                
                {f'<div style="border: 1px dashed #c5a880; padding: 10px 20px; display: inline-block; letter-spacing: 2px; font-weight: bold; margin-bottom: 20px;">PROMO CODE: {promo_code}</div>' if promo_code else ''}
                
                <p style="font-size: 13px; color: #a1a1aa; margin-bottom: 25px;">Valid until {end_date}</p>
                
                <div>
                    <a href="{portal_url}" style="background-color: #18181b; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">View and Apply Offer</a>
                </div>
            </div>
        </div>
        """
        send_html_email(client_email, subject, html_content)

def send_session_reminder(client_name: str, client_email: str, service_name: str, date_str: str, time_str: str):
    subject = "Reminder: Your Scheduled Session Today at Aglow Aesthetics"
    html_content = f"""
    <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #c5a880; font-family: 'Cormorant Garamond', serif; font-size: 28px; margin: 0;">AGLOW AESTHETICS</h1>
            <p style="font-size: 12px; letter-spacing: 2px; color: #71717a; margin-top: 5px; text-transform: uppercase;">Chennai's Premier Korean Aesthetic Clinic</p>
        </div>
        <div style="color: #27272a; line-height: 1.6;">
            <p>Hello <strong>{client_name}</strong>,</p>
            <p>This is a gentle reminder that you have a skin session scheduled with us <strong>today</strong>.</p>
            
            <div style="background-color: #fafafa; border: 1px solid #f4f4f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 8px 0;"><strong>Treatment:</strong> {service_name}</p>
                <p style="margin: 0 0 8px 0;"><strong>Date:</strong> {date_str} (Today)</p>
                <p style="margin: 0;"><strong>Time:</strong> {time_str}</p>
            </div>
            
            <p>Please arrive 10 minutes prior to your appointment time. If you need to reschedule, kindly notify us as soon as possible.</p>
            
            <p style="margin-top: 30px;">We look forward to welcoming you for your transformation today!</p>
            
            <hr style="border: 0; border-top: 1px solid #f4f4f5; margin: 20px 0;"/>
            <p style="font-size: 12px; color: #a1a1aa; text-align: center;">Aglow Aesthetics Chennai</p>
        </div>
    </div>
    """
    return send_html_email(client_email, subject, html_content)

def notify_admin_new_enquiry(enquiry_data: dict):
    # Fetch all admins and staff to notify
    users_col = get_users_col()
    recipients = list(users_col.find({"role": {"$in": ["master_admin", "staff"]}}))
    if not recipients:
        return
        
    subject = f"New Client Enquiry Received - {enquiry_data.get('name')}"
    
    html_content = f"""
    <div style="font-family: 'Jost', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #c5a880; font-family: 'Cormorant Garamond', serif; font-size: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; margin-top: 0;">New Client Enquiry Details</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px; border-bottom: 1px solid #f4f4f5;">Client Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">{enquiry_data.get('name')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f4f4f5;">Email Address:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;"><a href="mailto:{enquiry_data.get('email')}">{enquiry_data.get('email')}</a></td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f4f4f5;">Phone Number:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;"><a href="tel:{enquiry_data.get('phone')}">{enquiry_data.get('phone')}</a></td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f4f4f5;">Location:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">{enquiry_data.get('location')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f4f4f5;">Service of Interest:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">{enquiry_data.get('service')}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #f4f4f5;">Submitted At:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">{enquiry_data.get('created_at')}</td>
            </tr>
        </table>
        <p style="margin-top: 30px; font-size: 13px; color: #71717a;">Please follow up with the client within 24 hours.</p>
    </div>
    """
    
    for recipient in recipients:
        email = recipient.get("email")
        if email:
            send_html_email(email, subject, html_content)
