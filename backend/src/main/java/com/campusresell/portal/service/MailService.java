package com.campusresell.portal.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class MailService {

    private static final Logger logger = LoggerFactory.getLogger(MailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOtp(String toEmail, String otp) {
        String subject = "Campus Resell Portal - Email Verification OTP";
        String body = "Welcome to Campus Resell Portal!\n\n" +
                "Your verification OTP is: " + otp + "\n" +
                "This code will expire in 10 minutes.\n\n" +
                "If you did not request this, please ignore this email.";

        logger.info("====================================================");
        logger.info("  CAMPUS RESELL PORTAL VERIFICATION OTP  ");
        logger.info("  Email: {} ", toEmail);
        logger.info("  OTP Code: {} ", otp);
        logger.info("====================================================");

        if (mailSender != null && fromEmail != null && !fromEmail.isBlank()) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(fromEmail);
                message.setTo(toEmail);
                message.setSubject(subject);
                message.setText(body);
                mailSender.send(message);
                logger.info("Verification email successfully sent to {}", toEmail);
            } catch (Exception e) {
                logger.warn("Could not send email via SMTP (check credentials in .env). Fallback OTP logged above. Error: {}", e.getMessage());
            }
        } else {
            logger.info("No active SMTP credentials detected in environment. Using console logging fallback.");
        }
    }
}
